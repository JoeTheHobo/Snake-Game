function renderGame() {
    renderTiles();
    ctx_items.clearRect(0,0,canvas_items.width,canvas_items.height);
    for (let i = 0; i < currentBoard.map.length; i++) {
        for (let j = 0; j < currentBoard.map[0].length; j++) {
            let cell = currentBoard.map[i][j]; 

            if (cell.item === false) continue;

            cell.item = structuredClone(getItem(cell.item.name));
            if (cell.item == undefined) cell.item = false; //Prolly Will Need To Resolve Issue Later
            if (cell.item !== false) {
                cell.item.pos = {
                    x: j,
                    y: i,
                }

                if (cell.item.spawnLimit > 0 || cell.item.spawnLimit === false) {
                    cell.item.spawnLimit--; 
                    updateCells.push({
                        x: j,
                        y: i,
                    })
                    if (cell.item.pack == "Tunnels") {
                        currentBoard.location_tunnels.push({
                            x: j,
                            y: i,
                            name: cell.item.name,
                        })
                    }
                    if (cell.item.renderStatusPath.length > 0) {
                        currentBoard.location_status.push({
                            x: j,
                            y: i,
                            name: cell.item.name,
                        })
                    }
                    if (cell.item.spawnPlayerHere == true) {
                        currentBoard.location_spawns.push({
                            x: j,
                            y: i,
                            item: cell.item,
                        })
                    }
                }
            }
        }
    }
}
function renderTiles() {
    ctx_tiles.clearRect(0,0,canvas_tiles.width,canvas_tiles.height);
    for (let i = 0; i < currentBoard.map.length; i++) {
        for (let j = 0; j < currentBoard.map[0].length; j++) {
            currentBoard.map[i][j].tile = structuredClone(currentBoard.map[i][j].tile);
            let mapTile = currentBoard.map[i][j].tile;
            mapTile.pos = {
                x: j,
                y: i,
            }
            ctx_tiles.drawImage($("tile_" + mapTile.name),j*gridSize,i*gridSize,gridSize,gridSize);      
        }
    }
}
function renderCells() {
    for (let i = 0; i < updateCells.length; i++) {
        let x = updateCells[i].x;
        let y = updateCells[i].y;

        let mapCell;
        if (updateCells[i].item || updateCells[i].item === false) {
            mapCell = updateCells[i].item;
        } else {
            mapCell = currentBoard.map[y][x].item;
        }
        ctx_items.clearRect(x*gridSize,y*gridSize,gridSize,gridSize);
        if (!mapCell.visible) continue;
        if (mapCell == false) continue;

        let image;
        if (mapCell.baseImg) {
            image = mapCell.name + "_";
            for (let i = 0; i < mapCell.baseImgTags.length; i++) {
                image += getBaseImgFromTag(mapCell,mapCell.baseImgTags[i])
            }
            image = getItemCanvas(image);
        } else {
            image = getItemCanvas(mapCell.name);
        }

        ctx_items.drawImage(image,x*gridSize,y*gridSize,gridSize,gridSize);
    }
    updateCells = [];
}
function updateStatusCells() {
    for (let i = 0; i < currentBoard.location_status.length; i++) {
        updateCells.push({
            x: currentBoard.location_status[i].x,
            y: currentBoard.location_status[i].y,
        });
    }
}
function deleteSnakeCells() {
    for (let i = 0; i < updateSnakeCells.length; i++) {
        //if (updateSnakeCells[i].player.isDead) continue;
        ctx_players.clearRect(updateSnakeCells[i].x*gridSize,updateSnakeCells[i].y*gridSize,gridSize,gridSize);
    }
    updateSnakeCells = [];
}
function drawImage(image, direction, xPos, yPos, width, height,cnvs = canvas_players) {
    if (direction == false) direction = "up";
    let diCtx = cnvs.getContext("2d"); 
    // Save the current canvas state
    diCtx.save();

    // Translate the canvas to the position where the image will be drawn
    diCtx.translate(xPos + width / 2, yPos + height / 2);

    // Determine the rotation angle based on the direction
    let angle = 0;
    switch (direction) {
        case 'up':
            angle = -90; // Counter-clockwise
            break;
        case 'down':
            angle = 90; // Clockwise
            break;
        case 'right':
            angle = 0; // No rotation
            break;
        case 'left':
            angle = 180; // Flip
            break;
        default:
            console.error('Invalid direction. Use "up", "down", "right", or "left".');
            diCtx.restore();
            return;
    }

    // Rotate the canvas
    diCtx.rotate((angle * Math.PI) / 180);

    // Draw the image centered at the translated position
    diCtx.drawImage(image, -width / 2, -height / 2, width, height);

    // Restore the canvas state
    diCtx.restore();
}
function drawRotated(list,direction,xPos, yPos, width, height) {
    if (direction == false) direction = "up";
    let image = list[direction];
    ctx_players.drawImage(image,xPos,yPos,width,height);
}
function server_renderPlayers() {
    for (let i = 0; i < updateSnakeCells.length; i++) {
        let obj = updateSnakeCells[i];
        let player;
        for (let j = 0; j < activePlayers.length; j++) {
            if (activePlayers[j].id === obj.id) {
                player = activePlayers[j];
                break;
            } 
        }

        //Clear Cell
        ctx_players.clearRect(obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);

        if (obj.type == "head") {
            drawRotated(player.canvas.head,player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);
        
            if (player.shield == 1){
                let item = getItem("bronzeShield");
                drawImage(getItemCanvas(item.name),player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize,canvas_players);
            }
            if (player.shield == 2){
                let item = getItem("silverShield");
                drawImage(getItemCanvas(item.name),player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize,canvas_players);
            }
            if (player.shield == 3){
                let item = getItem("goldShield");
                drawImage(getItemCanvas(item.name),player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize,canvas_players);
            }
        }
        if (obj.type == "body" || obj.type == "tail") {
            let active = []
            for (let j = 0; j < obj.siblings.length; j++) {
                let sibling = obj.siblings[j];
                if (sibling.x < obj.x) active.push("left");
                if (sibling.x > obj.x) active.push("right");
                if (sibling.y < obj.y) active.push("top");
                if (sibling.y > obj.y) active.push("bottom");
            }

            //For Tunnels
            if (active.length == 1 && active[0] !== "down" && obj.type == "body") active.push("down");

            /* 
                snakeTurn directions
                up = Top - Right
                left = Top - Left
                right = Right - Bottom
                down =  Bottom - Left
            */

            let direction, image;

            if (obj.type == "tail") image = player.canvas.tail;
            if (active.includes("left") && active.includes("right")) {
                image = player.canvas.body;
                direction = "right";
            }
            if (active.includes("top") && active.includes("bottom")) {
                image = player.canvas.body;
                direction = "up";
            }
            if (!image) {
                image = player.canvas.turn;
                if (active.includes("top") && active.includes("right")) direction = "up";
                if (active.includes("top") && active.includes("left")) direction = "left";
                if (active.includes("right") && active.includes("bottom")) direction = "right";
                if (active.includes("bottom") && active.includes("left")) direction = "down";
            }

            drawRotated(image,direction,tailX*gridSize,tailY*gridSize,gridSize,gridSize);

        }
    }
    updateSnakeCells = [];
}
function renderPlayers() {
    for (let i = 0; i < activePlayers.length; i++) {
        if(activePlayers[i] == false) continue;
        let player = activePlayers[i];

        if (player.isDead) {
            if (player.justDied && currentGameMode.snakeVanishOnDeath == false) {
                player.justDied = false;
            } else continue;
        }
        drawRotated(player.canvas.head,player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);
        
        
        if (player.shield == 1){
            let item = getItem("bronzeShield");
            drawImage(getItemCanvas(item.name),player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize,canvas_players);
        }
        if (player.shield == 2){
            let item = getItem("silverShield");
            drawImage(getItemCanvas(item.name),player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize,canvas_players);
        }
        if (player.shield == 3){
            let item = getItem("goldShield");
            drawImage(getItemCanvas(item.name),player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize,canvas_players);
        }

        production.renderTail.timeStart = performance.now();
        for (let j = 0; j < player.tail.length; j++) {
            if (j !== 0 && j !== player.tail.length-1 && !doColorRender) continue;

            let tailX = player.tail[j].x;
            let tailY = player.tail[j].y;
            let direction = player.tail[j].direction;

            let beforeTail = {
                exist: false,
            }
            if (player.tail[j-1]) {
                beforeTail.exist = true;
                beforeTail.x = player.tail[j-1].x;
                beforeTail.y = player.tail[j-1].y;
            } else if (j == 0) {
                beforeTail.exist = true;
                beforeTail.x = player.pos.x;
                beforeTail.y = player.pos.y;
            }
            let afterTail = {
                exist: false,
            }
            if (player.tail[j+1]) {
                afterTail.exist = true;
                afterTail.x = player.tail[j+1].x;
                afterTail.y = player.tail[j+1].y;
            }

            //Before - Towards Head Of Snake
            //After - Towards Tail Of Snake

            if (j == player.tail.length - 1) {
                drawRotated(player.canvas.tail,direction,tailX*gridSize,tailY*gridSize,gridSize,gridSize);
            } else if (beforeTail.exist && afterTail.exist) {
                let tail = {
                    left: {
                        active: false,
                        distance: 0,
                    },
                    right: {
                        active: false,
                        distance: 0,
                    },
                    up: {
                        active: false,
                        distance: 0,
                    },
                    down: {
                        active: false,
                        distance: 0,
                    },
                }

                if (beforeTail.exist) {
                    if (beforeTail.x < tailX) {
                        tail.left.active = true;
                        tail.left.distance = tailX - beforeTail.x;
                    }
                    if (beforeTail.x > tailX) {
                        tail.right.active = true;
                        tail.right.distance = beforeTail.x - tailX;
                    }
                    if (afterTail.x < tailX) {
                        tail.left.active = true;
                        tail.left.distance = tailX - afterTail.x;
                    }
                    if (afterTail.x > tailX) {
                        tail.right.active = true;
                        tail.right.distance = afterTail.x - tailX;
                    }
                    if (beforeTail.y < tailY) {
                        tail.up.active = true;
                        tail.up.distance = tailY - beforeTail.y;
                    }
                    if (beforeTail.y > tailY) {
                        tail.down.active = true;
                        tail.down.distance = beforeTail.y - tailY;
                    }
                    if (afterTail.y < tailY) {
                        tail.up.active = true;
                        tail.up.distance = tailY - afterTail.y;
                    }
                    if (afterTail.y > tailY) {
                        tail.down.active = true;
                        tail.down.distance = afterTail.y - tailY;
                    }
                }

                let image = player.canvas.head;
                let direction = "right";

                if (_type(currentBoard.map[tailY][tailX].item.teleport).type == "number") {
                    playerIsOnPortal = true;
                    tail.down = {
                        active: true,
                        distance: 1,
                    };
                    if (afterTail.y + 1 == tailY || beforeTail.y + 1 == tailY) {
                        tail.up.active = true;
                        tail.up.distance = 1;
                        tail.left.active = false;
                        tail.right.active = false;
                    }
                }
                
                /* 
                    snakeTurn directions
                    up = Top - Right
                    left = Top - Left
                    right = Right - Bottom
                    down =  Bottom - Left
                */
                if (tail.left.active && tail.up.active) if (tail.left.distance == 1 && tail.up.distance == 1) {
                    image = player.canvas.turn; direction = "left";
                }
                if (tail.left.active && tail.down.active) if (tail.left.distance == 1 && tail.down.distance == 1) {
                    image = player.canvas.turn; direction = "down";
                }
                if (tail.right.active && tail.up.active) if (tail.right.distance == 1 && tail.up.distance == 1) {
                    image = player.canvas.turn; direction = "up";
                }
                if (tail.right.active && tail.down.active) if (tail.right.distance == 1 && tail.down.distance == 1) {
                    image = player.canvas.turn; direction = "right";
                }
                if (tail.left.active && tail.up.active) if (tail.left.distance == 1 && tail.up.distance > 1) {
                    image = player.canvas.turn; direction = "down";
                }
                if (tail.right.active && tail.up.active) if (tail.right.distance == 1 && tail.up.distance > 1) {
                    image = player.canvas.turn; direction = "right";
                }
                if (tail.left.active && tail.down.active) if (tail.left.distance == 1 && tail.down.distance > 1) {
                    image = player.canvas.turn; direction = "left";
                }
                if (tail.right.active && tail.down.active) if (tail.right.distance == 1 && tail.down.distance > 1) {
                    image = player.canvas.turn; direction = "up";
                } 

                if (tail.left.active && tail.up.active) if (tail.left.distance > 1 && tail.up.distance == 1) {
                    image = player.canvas.turn; direction = "up";
                }
                if (tail.right.active && tail.up.active) if (tail.right.distance > 1 && tail.up.distance == 1) {
                    image = player.canvas.turn; direction = "left";
                }
                if (tail.left.active && tail.down.active) if (tail.left.distance > 1 && tail.down.distance == 1) {
                    image = player.canvas.turn; direction = "right";
                }
                if (tail.right.active && tail.down.active) if (tail.right.distance > 1 && tail.down.distance == 1) {
                    image = player.canvas.turn; direction = "down";
                }
                

                if (tail.up.active && tail.down.active) if (tail.up.distance == 1 && tail.down.distance == 1) {
                    image = player.canvas.body; direction = "up";
                }
                if (tail.left.active && tail.right.active) if (tail.right.distance == 1 && tail.left.distance == 1) {
                    image = player.canvas.body; direction = "right";
                }

                //Going Off Screen
                if (afterTail.x > tailX && beforeTail.x > tailX) {
                    image = player.canvas.body; direction = "right";
                }
                if (afterTail.x < tailX && beforeTail.x < tailX) {
                    image = player.canvas.body; direction = "right";
                }
                if (afterTail.y > tailY && beforeTail.y > tailY) {
                    image = player.canvas.body; direction = "up";
                }
                if (afterTail.y < tailY && beforeTail.y < tailY) {
                    image = player.canvas.body; direction = "up";
                }

                drawRotated(image,direction,tailX*gridSize,tailY*gridSize,gridSize,gridSize);

            } else {
                drawRotated(player.canvas.body,direction,tailX*gridSize,tailY*gridSize,gridSize,gridSize);
            }
            
        }
        production.renderTail.times.push(performance.now() - production.renderTail.timeStart);
    }
    doColorRender = false;
}
function growPlayer(player,grow) {
    console.log("called");
    player.growTail += grow;
}
function movePlayers() {
    for (let i = 0; i < activePlayers.length; i++) {
        if(activePlayers[i] == false) continue;
        let player = activePlayers[i];
        
        if (player.isDead) continue;
        
        if ((player.moveTik*deltaTime) >= (player.moveSpeed/currentBoard.map[player.pos.y][player.pos.x].tile.changePlayerSpeed) || gameType == "server") {   
            if (player.turboActive == true) {
                player.turboDuration --;
                if (player.turboDuration <= 0) {
                    player.turboActive = false;
                    removePlayerStatus(player,"turbo");
                    player.moveSpeed = 6;
                }
            }
            player.moveTik = 0

            let playerOldMoving = player.moving;

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
            
            //Moving The Player
            production.setPlayerPos.timeStart = performance.now();
            let playerOldPos = { x: player.pos.x, y: player.pos.y };

            //Move Player and make sure he can't go back on himself
            switch (player.moving) {
                case "left": player.pos.x--; break;
                case "right": player.pos.x++; break;
                case "up": player.pos.y--; break;
                case "down": player.pos.y++; break;
            }            

            //Teleport Player If Needed
            if (_type(player.justTeleported).type == "object") {
                deleteSnakeCells();
                cameraQuickZoom = "tunnel";
                player.pos.x = player.justTeleported.x;
                player.pos.y = player.justTeleported.y;
                player.justTeleported = true;
            }

            //Collision Testing
            //Test If Player Hits Edge
            const maxX = currentBoard.map[0].length - 1;
            const maxY = currentBoard.map.length - 1;

            if (player.pos.x > maxX || player.pos.x < 0 || player.pos.y > maxY || player.pos.y < 0) {
                if (player.pos.x > maxX) { cameraQuickZoom = "right"; if (circleWalls) player.pos.x = 0; }
                else if (player.pos.x < 0) { cameraQuickZoom = "left"; if (circleWalls) player.pos.x = maxX; }

                if (player.pos.y > maxY) { cameraQuickZoom = "bottom"; if (circleWalls) player.pos.y = 0; }
                else if (player.pos.y < 0) { cameraQuickZoom = "top"; if (circleWalls) player.pos.y = maxY; }
            }
            
            //Check If Tunnels are near player
            if (cameraFollowPlayer) {
                let tunnel = false;
                let index = false;
                for (let z = 0; z < currentBoard.location_tunnels.length; z++) {
                    let dis = calculateDistance(currentBoard.location_tunnels[z].x,currentBoard.location_tunnels[z].y,player.pos.x,player.pos.y);
                    if (dis < 10) {
                        tunnel = currentBoard.location_tunnels[z];
                        index = z;
                        break;
                    }
                }
                if (tunnel) {
                    $(".extraCanvas").show();
                    for (let z = 0; z < currentBoard.location_tunnels.length; z++) {
                        let indexTunnel = currentBoard.location_tunnels[z];
                        if (indexTunnel.name === tunnel.name && z !== index) {
                            drawTunnelCanvas($(".extraCanvas"),{
                                x: indexTunnel.x,
                                y: indexTunnel.y,
                            });
                        }
                    }
                } else {
                    $(".extraCanvas").hide();

                }
            }
            production.setPlayerPos.times.push(performance.now() - production.setPlayerPos.timeStart);
            //Finished Moving Player

            //Check for Player Collisions
            production.checkingPlayerCollision.timeStart = performance.now();
            if (currentGameMode.snakeCollision) {
                let occupiedPositions = new Set();
            
                // Step 1: Populate occupiedPositions with all players' tails & positions
                for (let a = 0; a < activePlayers.length; a++) {
                    if(activePlayers[i] == false) continue;
                    let checkedPlayer = activePlayers[a];
                    if (checkedPlayer.isDead && currentGameMode.snakeVanishOnDeath) continue;
                    if (findPlayersTeam(checkedPlayer) === findPlayersTeam(player) && !currentGameMode.teamCollision && findPlayersTeam(player) !== "white") continue;
            
                    for (let b = 0; b < checkedPlayer.tail.length; b++) {
                        occupiedPositions.add(`${checkedPlayer.tail[b].x},${checkedPlayer.tail[b].y}`);
                    }
                    if (checkedPlayer.id !== player.id) {
                        occupiedPositions.add(`${checkedPlayer.pos.x},${checkedPlayer.pos.y}`);
                    }
                }
                // Step 2: Check if the player's new position exists in occupiedPositions
                if (occupiedPositions.has(`${player.pos.x},${player.pos.y}`)) {
                    deletePlayer(player);
                }
            }
            production.checkingPlayerCollision.times.push(performance.now() - production.checkingPlayerCollision.timeStart);
            //Test Item Underplayer
            if (!player.isDead) testItemUnderPlayer(player);

            if (!player.isDead) {
                production.testingItems.timeStart = performance.now();
                //Test Tile UnderPlayer
                let mapTile = currentBoard.map[player.pos.y][player.pos.x].tile;
                if (mapTile.onOver) runItemFunction(player,mapTile,"onOver");
                production.testingItems.times.push(performance.now() - production.testingItems.timeStart);

                production.growingTail.timeStart = performance.now();
                //Growing/Moving Tail
                let playerX = playerOldPos.x;
                let playerY = playerOldPos.y;

                if (player.growTail > 0) {
                    player.tail.unshift({
                        x: playerX,
                        y: playerY,
                        direction: player.moving,
                    });
                    updatePlayerCard(player,"size");
                    player.growTail--;
                    if (player.tail.length > player.longestTail) player.longestTail = player.tail.length;
                } else if(player.tail.length > 0) {
                    player.tail.unshift({
                        x: playerX,
                        y: playerY,
                        direction: player.moving,
                    });
                    updateSnakeCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y,player: player});
                    
    
                    let tail = player.tail[player.tail.length-1];
                    if (currentBoard.map[tail.y][tail.x].item) {
                        let mapItem = currentBoard.map[tail.y][tail.x].item;
                        if (mapItem.canCollide) runItemFunction(player,mapItem,"offCollision");
                    }
                    
                    player.tail.pop();
                } else {
                    if (currentBoard.map[playerY][playerX].item) {
                        let mapItem = currentBoard.map[playerY][playerX].item;
                        if (mapItem.canCollide) runItemFunction(player,mapItem,"offCollision");
                    }
                }
                if (player.tail.length > 0)
                    updateSnakeCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y,player: player});
    
                
    
                updateSnakeCells.push({
                    x: playerX,
                    y: playerY,
                    player: player
                })
                //End Growing Tail
                production.growingTail.times.push(performance.now() - production.growingTail.timeStart);
            } else {
                player.pos = playerOldPos;
                player.moving = playerOldMoving;
            }

        }
        else {
            player.moveTik++;
        }
    }
}
function useItem(player) {
    if (player.status.includes(player.items[player.selectingItem].img)) return;
    
    let item = player.items[player.selectingItem];
    if (item == "empty") return;
    if (item.cantUseIfStatus.length > 0) {
        for (let i = 0; i < item.cantUseIfStatus.length; i++) {
            let id = item.cantUseIfStatus[i];
            if (player.status.includes(id)) return;
        }
    }
    
    runItemFunction(player,player.items[player.selectingItem],"onEat");
    player.items[player.selectingItem] = "empty";
}
function testItemUnderPlayer(player) {
    let mapItem = currentBoard.map[player.pos.y][player.pos.x].item;
    if (!mapItem) return;
    if (mapItem.pickUp) {
        let pickedUpItem = false;
        findingEmptyItemSlot: for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
            if (player.items[k] == "empty") {
                player.items[k] = mapItem;
                updatePlayerCard(player)
                pickedUpItem = true;
                break findingEmptyItemSlot;
            }
        }
        if (!pickedUpItem && currentGameMode.mode_whenInventoryFullWhereDoItemsGo !== "noPickUp") {
            if (currentGameMode.mode_whenInventoryFullWhereDoItemsGo == "select") {
                player.items[player.selectingItem] = mapItem;
            }
            if (currentGameMode.mode_whenInventoryFullWhereDoItemsGo == "recycle") {
                player.items[player.whenInventoryIsFullInsertItemsAt] = mapItem;
                player.whenInventoryIsFullInsertItemsAt++;
                if (player.whenInventoryIsFullInsertItemsAt > player.items.length-1) player.whenInventoryIsFullInsertItemsAt = 0;
            }
            updatePlayerCard(player)
        }
    } else if (mapItem.canEat == true) {
        runItemFunction(player,mapItem,"onEat");
    }

    if (_type(mapItem.teleport).type == "number" && !player.justTeleported) {
        findingPortal: for (let z = 0; z < currentBoard.map.length; z++) {
            for (let h = 0; h < currentBoard.map[z].length; h++) {
                if (!currentBoard.map[z][h].item) continue;
                if (player.pos.x == h && player.pos.y == z) continue;
                if (currentBoard.map[z][h].item.teleport === mapItem.teleport) {
                    player.justTeleported = {
                        x: h,
                        y: z,
                    }
                    break findingPortal;
                } 
            }
        }
    } else {
        player.justTeleported = false;
    }

    if (mapItem.canCollide) {
        let pass = true;
        if (_type(mapItem.requiredSnakeSizeToCollide).type == "number") {
            if ((player.tail.length+1) >= mapItem.requiredSnakeSizeToCollide) pass = true;
            else pass = false;
        }
        if (pass) runItemFunction(player,mapItem,"onCollision");
    }

    let itemIsDelete = false;
    let worldStatusPass = false;
    let boardStatusCount = 0;
    for (let i = 0; i < mapItem.boardDestructible.length; i++) {
        if (mapItem.boardDestructible[i] == "yes")  {
            worldStatusPass = true;
            boardStatusCount++;
            continue;
        }
        if (currentBoard.boardStatus.includes(mapItem.boardDestructible[i])) {
            for (let j = 0; j < currentBoard.boardStatus.length; j++) {
                if (currentBoard.boardStatus[j] === mapItem.boardDestructible[i]) boardStatusCount++;
            }
            continue;
        }
    }
    worldStatusPass = boardStatusCount >= Number(mapItem.boardDestructibleCountRequired);

    //Check Snake Length Pass
    let snakeSizePass = true;
    if (mapItem.snakeSizeRequired) {
        if ((player.tail.length + 1) >= mapItem.snakeSizeRequired) snakeSizePass = true;
        else snakeSizePass = false; 
    }
    //End

    if (worldStatusPass && snakeSizePass) {
        checking: for (let i = 0; i < mapItem.destructible.length; i++) {
            let status = mapItem.destructible[i];
            let deleteMe = false;
            if (status === false) {
                itemIsDelete = true;
                break checking;
            }
            if (status == "yes") deleteMe = true;
            if (player.status.includes(status) || player.status.includes("status_" + status)) deleteMe = true;
    
            if (deleteMe) {
                itemIsDelete = true;
                //Hurt Player
                deletePlayer(player,false,mapItem);
    
                if (mapItem.deleteOnDestruct == false) {
                    break checking;
                }
    
                //Checking On Eat Delete Me Object From Item
                if (mapItem.onDelete) {
                    if (mapItem.onDelete.removeStatus.length > 0) {
                        for (let j = 0; j < mapItem.onDelete.removeStatus.length; j++) {
                            removePlayerStatus(player,mapItem.onDelete.removeStatus[j]);
                        }
                    }    
                }
    
                //Delete Item
                currentBoard.map[player.pos.y][player.pos.x].item = false;
                updateCells.push({
                    x: player.pos.x,
                    y: player.pos.y,
                })
                break checking;
            }
        }
    }
    if (!itemIsDelete) deletePlayer(player);
}
function runItemFunction(player,item,type,itemPos,settings = {playAudio: true}) {
    if (!type) return;

    let collision = item[type];

    if (!collision) return;

    if (item.switchStatus == false || item.switchStatus == undefined) {
        item.switchStatus = true;
    } else {
        item.switchStatus = false;
    }

    if (collision.switchBaseImgTag) {
        item.baseImgTags[collision.switchBaseImgTag.index] = item.baseImgTags[collision.switchBaseImgTag.index] == collision.switchBaseImgTag.switch[0] ? collision.switchBaseImgTag.switch[1] : collision.switchBaseImgTag.switch[0];
        updateCells.push({
            x: player.pos.x,
            y: player.pos.y,
        })
    }
    if (collision.switchBoardStatus) {
        if (item.switchStatus === true) {
            addBoardStatus(collision.switchBoardStatus,player);
        } else {
            removeBoardStatus(collision.switchBoardStatus,player);
        }
    }
    if (collision.addBoardStatus) {
        addBoardStatus(collision.addBoardStatus,player);
    }
    if (collision.removeBoardStatus) {
        removeBoardStatus(collision.removeBoardStatus,player);
    }
    if (collision.setBoardStatus) {
        let status = collision.setBoardStatus;
        if (collision.setBoardStatus == "*P") status = findPlayersTeam(player);
        if (item.sendingBoardStatus === status) return;

        if (item.sendingBoardStatus !== false) {
            removeBoardStatus(item.sendingBoardStatus,player);
        }

        item.sendingBoardStatus = status;
        addBoardStatus(status,player);
    }
    if (collision.setBaseImgTag) {
        let value = collision.setBaseImgTag.value;
        if (value == "*P") value = findPlayersTeam(player);
        item.baseImgTags[collision.setBaseImgTag.index] = value;

        updateCells.push({
            x: player.pos.x,
            y: player.pos.y,
        })
    }
    if (collision.growPlayer > 0) {
        growPlayer(player,collision.growPlayer);
    }
    if (collision.spawn && gameType == "local") {
        for (let i = 0; i < collision.spawn.length; i++) {
            for (let j = 0; j < collision.spawn[i].count; j++) {
                spawn(collision.spawn[i].name);
            }
        }
    }
    if (collision.giveturbo) {
        if (collision.turbo.duration && collision.turbo.moveSpeed) {
            player.turboActive = true;
            player.turboDuration = collision.turbo.duration;
            player.moveSpeed = collision.turbo.moveSpeed;
        }
    }
    if (collision.addStatus) {
        for (let i = 0; i < collision.addStatus.length; i++) {
            addPlayerStatus(player,collision.addStatus[i])
        }
    }
    if (collision.removeStatus) {
        for (let i = 0; i < collision.removeStatus.length; i++) {
            removePlayerStatus(player,collision.removeStatus[i])
        }
    }
    if (collision.deletePlayer) {
        deletePlayer(player,undefined,item);
    }
    if (collision.shield > 0) {
        player.shield = collision.shield;
    }
    if (collision.winGame === true) {
        endScreen(player);
    }
    if (collision.canvasFilter?.active == true) {
        ctx_players.filter = collision.canvasFilter.filter;
        ctx_items.filter = collision.canvasFilter.filter;
        for (let i = 0; i < currentBoard.map.length; i++) {
            for (let j = 0; j < currentBoard.map[0].length; j++) {
                let mapTile = currentBoard.map[i][j].tile;
                if (mapTile == false) continue;
                updateCells.push({
                    x: j,
                    y: i,
                })
            }
        }
        doColorRender = true;
        setTimeout(function() {
            ctx_players.filter = "none";
            ctx_items.filter = "none";

            for (let i = 0; i < currentBoard.map.length; i++) {
                for (let j = 0; j < currentBoard.map[0].length; j++) {
                    let mapTile = currentBoard.map[i][j].tile;
                    if (mapTile == false) continue;
                    updateCells.push({
                        x: j,
                        y: i,
                    })
                }
            }
            doColorRender = true;
        },collision.canvasFilter.duration)
    }
    if (collision.playSound && item.playSounds && settings?.playAudio) {
        let src = "sounds/" + item.soundFolder + "/" + item.soundFolder + "_" + collision.playSound[0] + "_" + rnd(collision.playSound[1]) + ".mp3";
        var audio = new Audio(src);
        if (player && itemPos) {
            let dis = calculateDistance(player.pos.x,player.pos.y,itemPos.x,itemPos.y);
            function getVolume(distance) {
                const k = 3; // Controls how fast sound fades
                return distance < 4 ? 1 : Math.max(0, Math.exp(-(distance - 4) / k));
            }
            audio.volume = getVolume(dis);
            
        }
        audio.play();
    }
}
function endScreen(player = false) {
    $("playerCardsHolder").style.cursor = "";
    gameEnd = true;
    isActiveGame = false;
    $(".endGamePopup").show("flex");

    //Kill Any Non Dead Snakes
    for (let i = 0; i < activePlayers.length; i++) {
        if(activePlayers[i] == false) continue;
        if (!activePlayers[i].isDead) {
            deletePlayer(activePlayers[i],false,false,true);
        }
    }

    let longestTail = activePlayers[0].longestTail;
    let timeSurvived = activePlayers[0].timeSurvived;
    let mostKills = activePlayers[0].playerKills;
    let longestTailPlayer = activePlayers[0];
    let timeSurvivedPlayer = activePlayers[0];
    let mostKillsPlayer = activePlayers[0];
    for (let i = 1; i < activePlayers.length; i++) {
        if(activePlayers[i] == false) continue;
        if (activePlayers[i].longestTail > longestTail) {
            longestTail = activePlayers[i].longestTail;
            longestTailPlayer = activePlayers[i];
        }
        if (activePlayers[i].timeSurvived > timeSurvived) {
            timeSurvived = activePlayers[i].timeSurvived;
            timeSurvivedPlayer = activePlayers[i];
        }
        if (activePlayers[i].playerKills > mostKills) {
            mostKills = activePlayers[i].mostKills;
            mostKillsPlayer = activePlayers[i];
        }
    }

    let minutes = (timeSurvived-(timeSurvived%60))/60;
    let seconds = timeSurvived%60;

    if ((seconds + "").length == 1) seconds = "0" + seconds;


    $(".longestTimePlayerImg").style.filter = `hue-rotate(${timeSurvivedPlayer.color}deg) sepia(${timeSurvivedPlayer.color2}%) contrast(${timeSurvivedPlayer.color3}%)`;
    $(".longestTailPlayerImg").style.filter = `hue-rotate(${longestTailPlayer.color}deg) sepia(${longestTailPlayer.color2}%) contrast(${longestTailPlayer.color3}%)`;
    $(".mostKillsImg").style.filter = `hue-rotate(${mostKillsPlayer.color}deg) sepia(${mostKillsPlayer.color2}%) contrast(${mostKillsPlayer.color3}%)`;
    $(".engGame_playerNameTime").innerHTML = timeSurvivedPlayer.name;
    $(".engGame_playerTime").innerHTML = minutes + ":" + seconds + " Minutes";
    $(".engGame_playerNameLength").innerHTML = longestTailPlayer.name;
    $(".engGame_playerLength").innerHTML = (longestTail+1) + " Length";
    $(".engGame_playerNameKills").innerHTML = mostKillsPlayer.name;
    $(".engGame_playerKills").innerHTML = (mostKills) + " Kill" + (mostKills > 1 ? "s" : "");

    if (activePlayers.length > 1 && mostKills > 0) {
        $("snakeKillsStat").show("flex");
    } else {
        $("snakeKillsStat").hide();
    }

    $("winnerStat").hide();
    if (player) {
        $("winnerStat").show("flex");
        $(".winnerPlayerImg").style.filter = `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`;
        $(".engGame_playerNameWinner").innerHTML = player.name;

    }
}
function deletePlayer(player,playerWhoKilled,item,instaKill = false){
    let damage;
    if (item) damage = item.damage;
    if (playerWhoKilled) damage = playerWhoKilled.bodyArmor;
    if (!item && !playerWhoKilled) damage = (player.shield+1);
    player.shield -= damage;

    if (player.shield < 0 || instaKill){
        if (playerWhoKilled) if (playerWhoKilled.name !== player.name) playerWhoKilled.playerKills++;

        //Delete Tail
        if (currentGameMode.snakeVanishOnDeath) {
            for (let i = 0; i < player.tail.length; i++) {
                updateSnakeCells.push({
                    x: player.tail[i].x,
                    y: player.tail[i].y,
                    player: player
                })
            }
        }

        //Delete Player
        player.isDead = true;
        player.justDied = true;
        updatePlayerCard(player)

        if (!currentGameMode.respawn) {
            player.timeSurvived = timer;
            let playersDead = 0;
            for (let i = 0; i < activePlayers.length; i++) {
                if(activePlayers[i] == false) playersDead++;
                if (activePlayers[i].isDead) playersDead++;
            }
            if (playersDead == activePlayers.length) {
                endScreen();
            }
        } else {
            setTimeout(function() {
                respawnPlayer(player,currentGameMode.respawnGrowth);
            },currentGameMode.respawnTimer * 1000);
        }
        return;
    }

    if (player.shield == 2) {
        removePlayerStatus(player,"silverShield");
        removePlayerStatus(player,"bronzeShield");
        removePlayerStatus(player,"goldShield");

        addPlayerStatus(player,"silverShield");
    }
    if (player.shield == 1) {
        removePlayerStatus(player,"silverShield");
        removePlayerStatus(player,"bronzeShield");
        removePlayerStatus(player,"goldShield");

        addPlayerStatus(player,"bronzeShield");
    }
    if (player.shield == 0) {
        removePlayerStatus(player,"silverShield");
        removePlayerStatus(player,"bronzeShield");
        removePlayerStatus(player,"goldShield");
    }
}
function removePlayerStatus(player,itemName) {
    if (itemName == "teamColor") {
        findingStatus: for (let i = 0; i < player.status.length; i++) {
            if (player.status[i].subset(0,5) == "status") {
                player.status.splice(i,1);
                break findingStatus;
            }
        }
    } else {
        findingStatus: for (let i = 0; i < player.status.length; i++) {
            if (player.status[i] == getItem(itemName).name) {
                player.status.splice(i,1);
                break findingStatus;
            }
        }
    }
    updatePlayerCard(player,"team");
}
function addPlayerStatus(player,itemName) {
    if (itemName.subset(0,5) == "status") {
        removePlayerStatus(player,"teamColor");
        player.status.push(itemName);
    } else {
        player.status.push(getItem(itemName).name);
    }
    updatePlayerCard(player,"team");
}
function removeBoardStatus(status,player) {
    if (status == "*P") status = "P" + player.index;

    checking: for (let i = 0; i < currentBoard.boardStatus.length; i++) {
        if (currentBoard.boardStatus[i] == status) {
            currentBoard.boardStatus.splice(i,1);
            break checking;
        }
    }
    loadBoardStatus();
}
function addBoardStatus(status,player) {
    if (status == "*P") status = "P" + player.index;

    currentBoard.boardStatus.push(status);
    loadBoardStatus();
}

document.body.on("click",function() {
    if (!isActiveGame) return;
    if (currentGameMode.mode_usingItemType == "direct") return;
    if (!cameraFollowPlayer) return;

    player = activePlayers[0];

    if (player.items[player.selectingItem]) {
        useItem(player);
    }

    updatePlayerCard(player);
})
document.body.on("wheel",function(e) {
    if (!isActiveGame) return;
    if (currentGameMode.mode_usingItemType == "direct") return;
    if (!cameraFollowPlayer) return;

    let value = 0;

    let wheelingUp = false;
    if (e.wheelDelta) {
        wheelingUp = e.wheelDelta > 0;
    } else {
        wheelingUp = e.deltaY < 0;
    }
    if (wheelingUp) value = -1;
    else value = 1;

    player = activePlayers[0];

    player.selectingItem += value;
    if (player.selectingItem < 0) player.selectingItem = currentGameMode.howManyItemsCanPlayersUse-1;
    if (player.selectingItem > currentGameMode.howManyItemsCanPlayersUse-1) player.selectingItem = 0;
    
    updatePlayerCard(player);
})
document.body.onkeydown = function(e) {
    if (killSwitch) return;
    if (!isActiveGame) return;
    if (e.ctrlKey && e.key === 'q') {
        showPerformance = showPerformance ? false : true;
        
        if (showPerformance) $(".production").show("flex");
        else $(".production").hide();
    }
    if (e.key !== "F5")
        e.preventDefault();

    if (e.key == "Escape" && gameType !== "server") {
        if (gamePaused) {
            $(".pauseGamePopup").hide();
            gamePaused = false;
            requestAnimationFrame(gameLoop);
            $("playerCardsHolder").style.cursor = "none";
        }
        else {
            pauseGame();
            $("playerCardsHolder").style.cursor = "";
        }
    }

    if (cameraFollowPlayer && gameType !== "server") {
        if (e.key == "m") {
            if ($(".firstPersonMap").style.display == "block") {
                $(".firstPersonMap").hide();
            } else {
                $(".firstPersonMap").show();
            }
        }
    }

    if (gameType !== "server") {
        for (let i = 0; i < activePlayers.length; i++) {
            let player = activePlayers[i];
            if (player.isDead) continue;
    
            if (e.key == player.leftKey && player.moveQueue.length < 4) {
                player.moveQueue.push("left");
            }
            if (e.key == player.rightKey && player.moveQueue.length < 4) {
                player.moveQueue.push("right");
            }
            if (e.key == player.upKey && player.moveQueue.length < 4) {
                player.moveQueue.push("up");
            }
            if (e.key == player.downKey && player.moveQueue.length < 4) {
                player.moveQueue.push("down");
            }
            if (e.key == player.useItem1) {
                if (currentGameMode.mode_usingItemType == "scroll") {
                    player.selectingItem--;
                    if (player.selectingItem < 0) player.selectingItem = currentGameMode.howManyItemsCanPlayersUse-1;
                }
                if (currentGameMode.mode_usingItemType == "direct") {
                    player.selectingItem = 0;
                    useItem(player);
                }
                updatePlayerCard(player);
            }
            if (e.key == player.useItem2) {
                if (currentGameMode.mode_usingItemType == "scroll") {
                    player.selectingItem++;
                    if (player.selectingItem > currentGameMode.howManyItemsCanPlayersUse-1) player.selectingItem = 0;
                }
                if (currentGameMode.mode_usingItemType == "direct") {
                    player.selectingItem = 1;
                    useItem(player);
                }
                updatePlayerCard(player);
            }
            if (e.key == player.fireItem) {
                if (currentGameMode.mode_usingItemType == "scroll") {
                    if (player.items[player.selectingItem]) {
                        useItem(player);
                    }
                }
                updatePlayerCard(player);
            }
        }
    }
    if (gameType == "server") {
        let activePlayer;
        for (let i = 0; i < activePlayers.length; i++) {
            if(activePlayers[i] == false) continue;
            if (activePlayers[i].accountID === localAccount.id) activePlayer = activePlayers[i];
        }
        if (!activePlayer) return;
        if (activePlayer.isDead) return;
        if (e.key == activePlayer.leftKey && activePlayer.moveQueue.length < 4) {
            activePlayer.moveQueue.push("left");
            socket.emit("movePlayerKey","left");
        }
        if (e.key == activePlayer.rightKey && activePlayer.moveQueue.length < 4) {
            activePlayer.moveQueue.push("right");
            socket.emit("movePlayerKey","right");
        }
        if (e.key == activePlayer.upKey && activePlayer.moveQueue.length < 4) {
            activePlayer.moveQueue.push("up");
            socket.emit("movePlayerKey","up");
        }
        if (e.key == activePlayer.downKey && activePlayer.moveQueue.length < 4) {
            activePlayer.moveQueue.push("down");
            socket.emit("movePlayerKey","down");
        }
        if (e.key == activePlayer.useItem1) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                activePlayer.selectingItem--;
                if (activePlayer.selectingItem < 0) activePlayer.selectingItem = currentGameMode.howManyItemsCanPlayersUse-1;
                socket.emit("changeItem",-1);
            }
            if (currentGameMode.mode_usingItemType == "direct") {
                activePlayer.selectingItem = 0;
                useItem(activePlayer);
            }
        }
        if (e.key == activePlayer.useItem2) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                activePlayer.selectingItem++;
                if (activePlayer.selectingItem > currentGameMode.howManyItemsCanPlayersUse-1) activePlayer.selectingItem = 0;
                socket.emit("changeItem",1);
            }
            if (currentGameMode.mode_usingItemType == "direct") {
                activePlayer.selectingItem = 1;
                useItem(activePlayer);
            }
        }
        if (e.key == activePlayer.fireItem) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                if (activePlayer.items[activePlayer.selectingItem]) {
                    useItem(activePlayer);
                    socket.emit("fireItem");
                }
            }
        }
    }
    
}


function setUpPlayerCanvas() {
    let html_playerCanvasHolder = $("playerCanvasHolder");
    html_playerCanvasHolder.innerHTML = "";
    for (let i = 0; i < activePlayers.length; i++) {
        if(activePlayers[i] == false) continue;
        let player = activePlayers[i];

        function getCanvas(image,direction) {
            let playerCanvas = html_playerCanvasHolder.create("canvas");
            let playerCtx = playerCanvas.getContext("2d");
            playerCanvas.width = image.width;
            playerCanvas.height = image.height;
            playerCtx.filter = `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`;

            if (direction) {
                drawImage(image,direction,0,0,image.width,image.height,playerCanvas);
            } else {
                playerCtx.drawImage(image,0,0);
            }
            return playerCanvas;
        }

        player.canvas = {
            body: {
                left: getCanvas($("img_snakeBody"),"left"),
                right: getCanvas($("img_snakeBody"),"right"),
                up: getCanvas($("img_snakeBody"),"up"),
                down: getCanvas($("img_snakeBody"),"down"),
            },
            tail: {
                left: getCanvas($("img_snakeTail"),"left"),
                right: getCanvas($("img_snakeTail"),"right"),
                up: getCanvas($("img_snakeTail"),"up"),
                down: getCanvas($("img_snakeTail"),"down"),
            },
            turn: {
                left: getCanvas($("img_snakeTurn"),"left"),
                right: getCanvas($("img_snakeTurn"),"right"),
                up: getCanvas($("img_snakeTurn"),"up"),
                down: getCanvas($("img_snakeTurn"),"down"),
            },
            head: {
                left: getCanvas($("img_snakeHead"),"left"),
                right: getCanvas($("img_snakeHead"),"right"),
                up: getCanvas($("img_snakeHead"),"up"),
                down: getCanvas($("img_snakeHead"),"down"),
            }
        }

    }
}

let cameraFollowPlayer = false;
let cameraQuickZoom;
function startGame(solo = false) {
    setScene("game");
    $(".endGamePopup").hide();
    $(".pauseGamePopup").hide();
    $("playerCardsHolder").innerHTML = "";
    $("playerCardsHolder").style.visibility = "visible";

    $("playerCardsHolder").style.cursor = "none";

    gamePaused = false;
    renderEmotesList = [];

    currentBoard = boards[currentBoardIndex];
    if (activeGameMode !== false) currentGameMode = gameModes[activeGameMode];

    currentGameMode = structuredClone(currentGameMode);

    currentBoard.location_tunnels = [];
    currentBoard.location_status = [];
    currentBoard.location_spawns = [];

    try {
        currentBoard.map = structuredClone(currentBoard.originalMap);
    } catch {
        console.warn(currentBoard.originalMap);
    }
    $(".extraCanvas").hide();

    setResolution(currentBoard.map[0].length,currentBoard.map.length);

    if (cameraFollowPlayer) {
        cameraQuickZoom = false;
        $(".firstPersonCanvas").show();
        $(".firstPersonMap").show();
        
        let miniMapWidth = (currentBoard.map[0].length*gridSize)/8;
        let miniMapHeight = (currentBoard.map.length*gridSize)/8;
        
        $(".firstPersonMap").css({
            width: miniMapWidth,
            height: miniMapHeight,
        })
        $(".firstPersonMap").width = miniMapWidth;
        $(".firstPersonMap").height = miniMapHeight;
    } else {
        $(".firstPersonMap").hide();
        $(".firstPersonCanvas").hide();
    }

    currentBoard.boardStatus = [];
    
    doColorRender = false;
    activePlayers = activePlayerCount;
    if (solo) activePlayers = [activePlayers[0]];
    specialItemIteration = 0;
    isActiveGame = true;

    //Draw On Background canvas
    let backgroundImage = new Image();
    backgroundImage.src = "img/backgrounds/" + currentBoard.background + ".png";
    backgroundImage.onload = function() {
        ctx_background.drawImage(backgroundImage,0,0,canvas_background.width,canvas_background.height);
    }

    //Resetting Players
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        player.isPlayer = true;
        //Ressurect Player
        player.isDead = false;
        player.justDied = false;
        player.bodyArmor = 1;
        //Set Player Selecting Item To 1
        player.selectingItem = 0;
        player.justTeleported = false;
        //Set Player Item Usage
        player.howManyItemsCanIUse = currentGameMode.howManyItemsCanPlayersUse;
        player.whenInventoryIsFullInsertItemsAt = 0;
        player.index = i;
        player.status = ["status_white"];
        //Set All Player Items To Empty
        player.items = [];
        for (let j = 0; j < currentGameMode.howManyItemsCanPlayersUse; j++) {
            player.items.push("empty");
        }

        player.longestTail = 0;
        player.timeSurvived = 0;
        player.moving = false;
        player.growTail = 0;
        player.tail = [];
        player.moveQueue = [];
        player.prevMove = "start";
        player.moveTik = 0;
        player.moveSpeed = 6;
        player.turboDuration = 0;
        player.turboActive = false;
        player.shield = 0;
        
        player.playerKills = 0;

        player.pos = {
            x: false,
            y: false,
        }
        //Draw Player's Card
        updatePlayerCard(player);
        //Spawn Players
    }

    setUpPlayerCanvas();
    renderGame();
    fixItemDifferences(currentBoard.map);
    fixTileDifferences(currentBoard.map);
    renderCells();
    loadBoardStatus();

    for (let i = 0; i < activePlayers.length; i++) {
        spawn(activePlayers[i]);
    }

    for (let i = 0; i < currentGameMode.items.length; i++) {
        let item = currentGameMode.items[i];
        for (let j = 0; j < Number(item.onStartSpawn); j++) {
            spawn(item.name,false,false,false);
        }
    }


    gameEnd = true;
    setTimeout(function() {
        gameEnd = false;

        deltaTime = 0;
        lastTimestamp = 0;
        requestAnimationFrame(gameLoop);
    
        timer = 0;
        
        startTimer();
    },1000/60);
}
let timerInterval;
function startTimer() {
    clearInterval(timerInterval)
    timerInterval = setInterval(function() {
        if (!gamePaused)
            timer++;
    },1000)
}

let production = {
    gameLoop: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "dom",
    },
    renderCells: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "dom",
    },
    movePlayers: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "dom",
    },
    setPlayerPos: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "sub",
    },
    checkingPlayerCollision: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "sub",
    },
    testingItems: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "sub",
    },
    growingTail: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "sub",
    },
    deleteSnakeCells: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "dom",
    },
    renderPlayers: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "dom",
    },
    renderTail: {
        times: [],
        average: 0,
        timeStart: 0,
        type: "sub",
    },
}
function setUpProductionHTML() {
    let holder = $(".production");
    holder.innerHTML = "";
    for (let i = 0; i < Object.entries(production).length; i++) {
        let entry = Object.entries(production)[i];
        let div = holder.create("div");
        div.className = "production_holder";
        let title = div.create("div");
        if (entry[1].type == "dom")
            title.className = "production_title";
        if (entry[1].type == "sub")
            title.className = "production_titleSub";
        title.innerHTML = entry[0];
        let value = holder.create("div");
        value.id = "production_" + entry[0];
        value.className = "production_value";
        value.innerHTML = entry[1].average.toFixed(2);
    }
}
function updateProduction() {
    for (let i = 0; i < Object.entries(production).length; i++) {
        let entry = Object.entries(production)[i];
        if (production[entry[0]].times.length > 1000) {
            production[entry[0]].times.shift();
        }
        if (production[entry[0]].times.length == 0) production[entry[0]].times.push(0);
        production[entry[0]].average = production[entry[0]].times.avg();
        $("production_" + entry[0]).innerHTML = production[entry[0]].average.toFixed(4) + "ms";
    }
}
function gameLoop() {
    let timestamp = Date.now();
    if (!isActiveGame) return;
    deltaTime = (timestamp - lastTimestamp) / perfectFrameTime;
    lastTimestamp = timestamp;

    //First Person View
    if (cameraFollowPlayer) {
        updateCanvasPositionToPlayer(activePlayers[0]);
        
        const rect = $("render_background").getBoundingClientRect();
        const canvasWidth = $("render_background").clientWidth;
        const canvasHeight = $("render_background").clientHeight;
        $(".firstPersonCanvas_tl").css({
            left: (rect.left-canvasWidth) + "px",
            top: (rect.top-canvasHeight) + "px",
        })
        $(".firstPersonCanvas_tm").css({
            left: (rect.left) + "px",
            top: (rect.top-canvasHeight) + "px",
        })
        $(".firstPersonCanvas_tr").css({
            left: (rect.right) + "px",
            top: (rect.top-canvasHeight) + "px",
        })
        $(".firstPersonCanvas_lm").css({
            left: (rect.left-canvasWidth) + "px",
            top: (rect.top) + "px",
        })
        $(".firstPersonCanvas_rm").css({
            left: (rect.right) + "px",
            top: (rect.top) + "px",
        })
        $(".firstPersonCanvas_bl").css({
            left: (rect.left-canvasWidth) + "px",
            top: (rect.bottom) + "px",
        })
        $(".firstPersonCanvas_bm").css({
            left: (rect.left) + "px",
            top: (rect.bottom) + "px",
        })
        $(".firstPersonCanvas_br").css({
            left: (rect.right) + "px",
            top: (rect.bottom) + "px",
        })

        ctx_firstPerson_master.clearRect(0,0,canvasWidth,canvasHeight)
        ctx_firstPerson_master.drawImage($("render_background"),0,0)
        ctx_firstPerson_master.drawImage($("render_tiles"),0,0)
        ctx_firstPerson_master.drawImage($("render_items"),0,0)
        ctx_firstPerson_master.drawImage($("render_players"),0,0)
        ctx_firstPerson_master.drawImage($("render_overhangs"),0,0)

        $(".firstPersonMap").getContext("2d").clearRect(0,0,$(".firstPersonMap").width,$(".firstPersonMap").height);
        $(".firstPersonMap").getContext("2d").drawImage($(".firstPersonCanvas_master"),0,0,$(".firstPersonMap").width,$(".firstPersonMap").height);

        let ctxs = [ctx_firstPerson_tl,ctx_firstPerson_tm,ctx_firstPerson_tr,ctx_firstPerson_lm,ctx_firstPerson_rm,ctx_firstPerson_bl,ctx_firstPerson_bm,ctx_firstPerson_br];
        for (let i = 0; i < ctxs.length; i++) {
            ctxs[i].clearRect(0,0,canvasWidth,canvasHeight);
            ctxs[i].drawImage($(".firstPersonCanvas_master"),0,0)
        }
    }

    production.gameLoop.timeStart = performance.now();

    production.renderCells.timeStart = performance.now();
    renderCells();
    production.renderCells.times.push(performance.now() - production.renderCells.timeStart);

    production.movePlayers.timeStart = performance.now();
    //movePlayers();
    production.movePlayers.times.push(performance.now() - production.movePlayers.timeStart);
    
    production.deleteSnakeCells.timeStart = performance.now();
    deleteSnakeCells();
    production.deleteSnakeCells.times.push(performance.now() - production.deleteSnakeCells.timeStart);

    production.renderPlayers.timeStart = performance.now();
    renderPlayers();
    production.renderPlayers.times.push(performance.now() - production.renderPlayers.timeStart);

    production.gameLoop.times.push(performance.now() - production.gameLoop.timeStart);

    renderEmotes();

    updateProduction();
    if (!gameEnd && !gamePaused && !killSwitch) setTimeout(() => gameLoop(), Math.max(0, (1000/60) - (Date.now() - timestamp)));;//requestAnimationFrame(gameLoop);
}
function serverGameLoop() {
    deltaTime = 1;
    if (!isActiveGame) return;
    renderCells();
    console.log("Rendering")
    //movePlayers();
    //deleteSnakeCells();
    //renderPlayers();
    

    if (!gameEnd && !killSwitch) setTimeout(() => serverGameLoop(), 120);//requestAnimationFrame(gameLoop);
}
function specialItemManager() {
    if (gameType == "server") return;
    if (specialItemIteration >= specialItemActiveChance) {
        specialItemIteration = 0;
        specialItemActiveChance = rnd(specialItemLowChance,specialItemHighChance);
        // Calculate the total weight
        let totalWeight = 0;
        for (let i = 0; i < currentGameMode.items.length; i++) {
            if (currentGameMode.items[i].spawnLimit < 1 && _type(currentGameMode.items[i].spawnLimit).type == "number") continue;
            totalWeight += currentGameMode.items[i].specialSpawnWeight;
        }

        // Generate a random number between 0 and totalWeight
        const randomWeight = Math.random() * totalWeight;

        // Find the item corresponding to the random weight
        let cumulativeWeight = 0;
        findingItem: for (const item of currentGameMode.items) {
            if (item.spawnLimit < 1 && _type(item.spawnLimit).type == "number") continue;

            cumulativeWeight += item.specialSpawnWeight;
            if (randomWeight < cumulativeWeight) {
                spawn(item.name);
                break findingItem;
            }
        }

    } else {
        specialItemIteration ++;
    }
}


setScene("newMenu")

//For testing
setUpProductionHTML();
