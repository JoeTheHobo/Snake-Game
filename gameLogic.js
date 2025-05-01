
function server_movePlayers(lobby,socketID) {
    activePlayers = lobby.inGamePlayers; //Players that are only in the game, alive or dead. Players can be in the lobby, but not in the game.
    let currentBoard = lobby.board; //
    let currentGameMode = lobby.gameMode;
    if (lobby.gameEnd) return; //If Round Ended make sure to not move all the players.

    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        if (player.isDead) continue;

        player.timeAlive[player.timeAlive.length-1] = Date.now() - player.timeCameAlive; //Setting their time alive stat
        checkWinningCondition(lobby,"Time Alive",player.timeAlive[player.timeAlive.length-1],player); //Check player time survived winning condition
        
        //Check Players Move Tik, if it's too short skip player.
        if ((player.moveTik) < (player.moveSpeed/currentBoard.map[player.pos.y][player.pos.x].tile.changePlayerSpeed)) {   
            player.moveTik++;
            continue;
        }
        //Reset Move Tik
        player.moveTik = 0
        //Decrease Turbo If Required
        if (player.turboActive == true) {
            player.turboDuration --;
            if (player.turboDuration <= 0) {
                player.turboActive = false;
                removePlayerStatus(lobby,player,"turbo"); //I think this is outdated
                player.moveSpeed = 6;
            }
        }

        //If Snake Is Invincible tell client To render their snake.
        if (simple.type(player.invinsibleBodyEffect) == "number") {
            player.invinsibleBodyEffect++;
            rerenderSnake(lobby,player);
            if (player.invinsibleBodyEffect > 6) player.invinsibleBodyEffect = 0;
        }

        //Save the players old direction and location in case they die on this turn, so we can reset it back.
        let playerOldMoving = player.moving;
        let playerOldPos = { x: player.pos.x, y: player.pos.y };

        helper_movePlayer(lobby,player,currentBoard,activePlayers,currentGameMode);

        //Check Items and Tiles Under Player.
        if (!player.isDead) {
            //Test Item Underplayer
            let mapItem = currentBoard.map[player.pos.y][player.pos.x].item;
            if (mapItem) {
                runItemFunction(lobby,player,mapItem,"onCollision",{x: player.pos.x,y: player.pos.y},undefined,socketID);
                checkWinningCondition(lobby,"Touch Item X",mapItem,player);
            }
        }
        if (!player.isDead) {
            //Test Tile UnderPlayer
            let mapTile = currentBoard.map[player.pos.y][player.pos.x].tile;
            checkWinningCondition(lobby,"Touch Tile X",mapTile,player);
            if (mapTile.onCollision) runItemFunction(lobby,player,mapTile,"onCollision",{x: player.pos.x,y: player.pos.y});

            //Testing While On Tile Properties
            player.allowedToMove = mapTile?.whileOn?.playerCanMove || true; //If the tile prevents the player from being able to move. (I.E. Ice)
        }

        //If Player died then reset player and move to the next.
        if (player.isDead) {
            player.pos = playerOldPos;
            player.moving = playerOldMoving;
            continue;
        }

        //Growing/Moving Tail
        helper_manageTail(lobby,player,playerOldPos,currentBoard);

        //Set Players Zones
        setPlayersZones(lobby,player);
    }
}
function helper_manageTail(lobby,player,playerOldPos,currentBoard) {
    let playerX = playerOldPos.x;
    let playerY = playerOldPos.y;

    if (player.growTail > 0) {
        player.tail.unshift({
            x: playerX,
            y: playerY,
            direction: player.moving,
        });
        player.growTail--;
        for (let i = 0; i < lobby.board.playerGrow_status.length; i++) {
            let status = lobby.board.playerGrow_status[i];
            lobby.updateCells.push({
                x: status.x,
                y: status.y,
                //item: status.item, //Delete If You Notice Nothing Wrong In The Future
            })
        }
        if (player.tail.length > player.longestTail) player.longestTail = player.tail.length;
        if (lobby.condition_size.length > 0) {
            for (let cs = 0; cs < lobby.condition_size.length; cs++) {
                let condition = lobby.condition_size[cs];
                if (condition.pullTeamStats) {
                    let teamSnakeSize = 0;
                    let team = player.team;
                    for (let j = 0; j < activePlayers.length; j++) {
                        if (activePlayers[j].team === team) teamSnakeSize += (activePlayers[j].tail.length + 1);
                    }
                    if (teamSnakeSize >= condition.x) {
                        triggerWinningCondition(lobby,condition,player);
                    }
                } else {
                    if (player.tail.length + 1 >= condition.x) {
                        triggerWinningCondition(lobby,condition,player);
                    }
                }
            }
        }
    } else if (player.tail.length > 0) {
        player.tail.unshift({
            x: playerX,
            y: playerY,
            direction: player.moving,
        });
        lobby.updateSnakeCells.push(lobby.snakeMap[player.tail[player.tail.length-1].y][player.tail[player.tail.length-1].x]);
        

        let tail = player.tail[player.tail.length-1];
        if (currentBoard.map[tail.y][tail.x].item) {
            let mapItem = currentBoard.map[tail.y][tail.x].item;
            if (mapItem.offCollision) runItemFunction(lobby,player,mapItem,"offCollision",{x: tail.x,y: tail.y});
        }
        let mapTile = currentBoard.map[tail.y][tail.x].tile;
        if (mapTile.offCollision) runItemFunction(lobby,player,mapTile,"offCollision",{x: tail.x,y: tail.y});
        
        snakeMapRemove(lobby,player.index,tail.y,tail.x);
        player.tail.pop();
    } else {
        snakeMapRemove(lobby,player.index,playerY,playerX);
        if (currentBoard.map[playerY][playerX].item) {
            let mapItem = currentBoard.map[playerY][playerX].item;
            if (mapItem.offCollision) runItemFunction(lobby,player,mapItem,"offCollision",{x: playerX,y:playerY});
        }
        let mapTile = currentBoard.map[playerY][playerX].tile;
        if (mapTile.offCollision) runItemFunction(lobby,player,mapTile,"offCollision",{x: playerX,y:playerY});
    }
    if (player.tail.length > 0) {
        snakeMapSetType(lobby,player.index,player.tail[0].y,player.tail[0].x,"body");
        snakeMapSetType(lobby,player.index,player.tail[player.tail.length-1].y,player.tail[player.tail.length-1].x,"tail");
        lobby.updateSnakeCells.push(lobby.snakeMap[player.tail[player.tail.length-1].y][player.tail[player.tail.length-1].x]);
    }

    let sibling = player.tail.length > 0 ? [player.tail[0]] : [];
    lobby.snakeMap[player.pos.y][player.pos.x].push({
        index: player.index,
        siblings: sibling,
        type: "head",
        x: player.pos.x,
        y: player.pos.y,
    });
    if (sibling.length == 1) {
        snakeMapAddSibling(lobby,player.index,sibling[0].y,sibling[0].x,player.pos.y,player.pos.x)
    }
    if (player.tail.length == 1) snakeMapSetSibling(lobby,player.index,player.tail[0].y,player.tail[0].x,player.pos.y,player.pos.x);

    lobby.updateSnakeCells.push(lobby.snakeMap[playerY][playerX]);
    lobby.updateSnakeCells.push(lobby.snakeMap[player.pos.y][player.pos.x]);
}
function helper_movePlayer(lobby,player,currentBoard,activePlayers,currentGameMode) {
    //check the movement queue
    if (player.moveQueue.length != 0){
        if(player.moving == "left" && player.moveQueue[0] != "right" || 
            player.moving == "right" && player.moveQueue[0] != "left" || 
            player.moving == "up" && player.moveQueue[0] != "down" || 
            player.moving == "down" && player.moveQueue[0] != "up"){
            player.moving = player.moveQueue[0];
        }
        else if (player.moving === false)
        {
            player.moving = player.moveQueue[0];
        }

        player.moveQueue.shift();
    }
    

    //Move Player and make sure he can't go back on himself
    switch (player.moving) {
        case "left": player.pos.x--; break;
        case "right": player.pos.x++; break;
        case "up": player.pos.y--; break;
        case "down": player.pos.y++; break;
    }            

    //Teleport Player If Needed
    if (simple.type(player.justTeleported) == "object") {
        //cameraQuickZoom = "tunnel"; -Need to add later, for Follow Snake View (FSV)
        player.pos.x = player.justTeleported.x;
        player.pos.y = player.justTeleported.y;
        player.justTeleported = true;
    }

    //Collision Testing
    //Test If Player Hits Edge
    const maxX = currentBoard.map[0].length - 1;
    const maxY = currentBoard.map.length - 1;

    if (player.pos.x > maxX || player.pos.x < 0 || player.pos.y > maxY || player.pos.y < 0) {
        if (player.pos.x > maxX) { cameraQuickZoom = "right"; player.pos.x = 0; }
        else if (player.pos.x < 0) { cameraQuickZoom = "left"; player.pos.x = maxX; }

        if (player.pos.y > maxY) { cameraQuickZoom = "bottom"; player.pos.y = 0; }
        else if (player.pos.y < 0) { cameraQuickZoom = "top"; player.pos.y = maxY; }
    }

    //Check for Player Collisions
    if (currentGameMode.snakeCollision) {
        let occupiedPositions = new Map();
    
        // Step 1: Populate occupiedPositions with all players' tails & positions
        for (let a = 0; a < activePlayers.length; a++) {
            let checkedPlayer = activePlayers[a];
            if (checkedPlayer.isDead && currentGameMode.whenSnakesDie !== "remain") continue;
            if (checkedPlayer.team === player.team && !currentGameMode.teamCollision && player.team !== "white") continue;
    
            for (let b = 0; b < checkedPlayer.tail.length; b++) {
                occupiedPositions.set(`${checkedPlayer.tail[b].x},${checkedPlayer.tail[b].y}`, checkedPlayer);
            }
            if (checkedPlayer.id !== player.id) {
                occupiedPositions.set(`${checkedPlayer.pos.x},${checkedPlayer.pos.y}`, checkedPlayer);
            }
        }
        // Step 2: Check if the player's new position exists in occupiedPositions
        if (occupiedPositions.has(`${player.pos.x},${player.pos.y}`)) {
            let killer = occupiedPositions.get(`${player.pos.x},${player.pos.y}`);
            deletePlayer(lobby, player, killer);
        }
    }
}