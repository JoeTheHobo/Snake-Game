//Load All Item Images
for (let i = 0; i < items.length; i++) {
    if (!items[i].img) continue;

    let img = $(".imageHolder").create("img");
    img.src = "img/" + items[i].img;
    img.id = "item_" + items[i].img.subset(0,".\\before");
}
for (let i = 0; i < tiles.length; i++) {
    if (!tiles[i].img) continue;

    let img = $(".imageHolder").create("img");
    img.src = "img/" + tiles[i].img;
    img.id = "tile_" + tiles[i].name;
}
//End Load All Item Images


function renderGame() {
    renderTiles();
    ctx_items.clearRect(0,0,canvas_items.width,canvas_items.height);
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j].tile == false) continue;
        }
    }
    renderCells();
}
function renderTiles() {
    ctx_tiles.clearRect(0,0,canvas_tiles.width,canvas_tiles.height);
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            let mapTile = map[i][j].tile;
            ctx_tiles.drawImage($("tile_" + mapTile.name),j*gridSize,i*gridSize,gridSize,gridSize);      
        }
    }
}
function renderCells() {
    for (let i = 0; i < updateCells.length; i++) {
        let mapCell = map[updateCells[i].y][updateCells[i].x].item;
        ctx_items.clearRect(updateCells[i].x*gridSize,updateCells[i].y*gridSize,gridSize,gridSize);
        if (mapCell == false) continue;
        ctx_items.drawImage(mapCell.canvas,updateCells[i].x*gridSize,updateCells[i].y*gridSize,gridSize,gridSize);        
    }
    updateCells = [];
}
function deleteSnakeCells() {
    for (let i = 0; i < updateSnakeCells.length; i++) {
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
function renderPlayers() {
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];

        if (player.isDead) {
            if (player.justDied && currentGameMode.snakeVanishOnDeath == false) {
                player.justDied = false;
            } else continue;
        }
        drawRotated(player.canvas.head,player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);
        
        
        if (player.shield == 1){
            let item = getItem("bronzeShield");
            drawImage(item.canvas,player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize,canvas_players);
        }
        if (player.shield == 2){
            let item = getItem("silverShield");
            drawImage(item.canvas,player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize,canvas_players);
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


                if (Math.abs(beforeTail.x - afterTail.x) == 2) {
                    drawRotated(player.canvas.body,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (Math.abs(beforeTail.y - afterTail.y) == 2) {
                    drawRotated(player.canvas.body,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                /* 
                    snakeTurn directions
                    up = Top - Right
                    left = Top - Left
                    right = Right - Bottom
                    down =  Bottom - Left
                */
                
                if (tail.left.active && tail.up.active) if (tail.left.distance == 1 && tail.up.distance == 1)
                    drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.left.active && tail.down.active) if (tail.left.distance == 1 && tail.down.distance == 1)
                    drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.right.active && tail.up.active) if (tail.right.distance == 1 && tail.up.distance == 1)
                    drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.right.active && tail.down.active) if (tail.right.distance == 1 && tail.down.distance == 1)
                    drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);

                if (tail.left.active && tail.up.active) if (tail.left.distance == 1 && tail.up.distance > 1)
                    drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.right.active && tail.up.active) if (tail.right.distance == 1 && tail.up.distance > 1)
                    drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.left.active && tail.down.active) if (tail.left.distance == 1 && tail.down.distance > 1)
                    drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.right.active && tail.down.active) if (tail.right.distance == 1 && tail.down.distance > 1)
                    drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);

                if (tail.left.active && tail.up.active) if (tail.left.distance > 1 && tail.up.distance == 1)
                    drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.right.active && tail.up.active) if (tail.right.distance > 1 && tail.up.distance == 1)
                    drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.left.active && tail.down.active) if (tail.left.distance > 1 && tail.down.distance == 1)
                    drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                if (tail.right.active && tail.down.active) if (tail.right.distance > 1 && tail.down.distance == 1)
                    drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);

                //Going Off Screen
                if (afterTail.x > tailX && beforeTail.x > tailX) {
                    drawRotated(player.canvas.body,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (afterTail.x < tailX && beforeTail.x < tailX) {
                    drawRotated(player.canvas.body,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (afterTail.y > tailY && beforeTail.y > tailY) {
                    drawRotated(player.canvas.body,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (afterTail.y < tailY && beforeTail.y < tailY) {
                    drawRotated(player.canvas.body,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }

            } else {
                drawRotated(player.canvas.body,direction,tailX*gridSize,tailY*gridSize,gridSize,gridSize);
            }
            
        }
        production.renderTail.times.push(performance.now() - production.renderTail.timeStart);
    }
    doColorRender = false;
}
function growPlayer(player,grow) {
    player.growTail = grow;
}


function movePlayers() {
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        if (player.isDead){
            continue;
        }
        if (player.moveTik >= (player.moveSpeed/map[player.pos.y][player.pos.x].tile.changePlayerSpeed))
            {   
                if (player.turboActive == true)
                {
                    player.turboDuration --;
                    if (player.turboDuration <= 0) {
                        player.turboActive = false;
                        removePlayerStatus(player,"turbo");
                        player.moveSpeed = 6;
                    }
                }
                player.moveTik = 0
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
            //Growing/Moving Tail
            if (player.growTail > 0) {
                player.tail.unshift({
                    x: player.pos.x,
                    y: player.pos.y,
                    direction: player.moving,
                });
                player.growTail--;
                if (player.tail.length > player.longestTail) player.longestTail = player.tail.length;
            } else if(player.tail.length > 0) {
                player.tail.unshift({
                    x: player.pos.x,
                    y: player.pos.y,
                    direction: player.moving,
                });
                updateSnakeCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y});
                player.tail.pop();
            }
            if (player.tail.length > 0)
                updateSnakeCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y});

            updateSnakeCells.push({
                x: player.pos.x,
                y: player.pos.y
            })
            //ctx.fillStyle = map[player.pos.y][player.pos.x].color;
            //ctx.fillRect(player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);
            //Move Player and make sure he can't go back on himself
            if (player.moving == "left") player.pos.x--;
            if (player.moving == "right") player.pos.x++;
            if (player.moving == "up") player.pos.y--;
            if (player.moving == "down") player.pos.y++;


            //Collision Testing
            //Test If Player Hits Wall
            if (player.pos.x > gridX-1) {
                if (circleWalls) player.pos.x = 0;
            }
            if (player.pos.x < 0) {
                if (circleWalls) player.pos.x = gridX-1;
            }
            if (player.pos.y > gridY-1) {
                if (circleWalls) player.pos.y = 0;
            }
            if (player.pos.y < 0) {
                if (circleWalls) player.pos.y = gridY-1;
            }

            //Test Item Underplayer
            let mapItem = map[player.pos.y][player.pos.x].item;
            if (mapItem.pickUp) {
                let pickedUpItem = false;
                findingEmptyItemSlot: for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                    if (player.items[k] == "empty") {
                        player.items[k] = mapItem;
                        if (mapItem.onEat_deleteMe == true) {
                            map[player.pos.y][player.pos.x].item = false;
                            updateCells.push({
                                x: player.pos.x,
                                y: player.pos.y,
                            })
                        }
                        drawPlayerBox(player)
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
                    if (mapItem.onEat_deleteMe == true) {
                        map[player.pos.y][player.pos.x].item = false;
                        updateCells.push({
                            x: player.pos.x,
                            y: player.pos.y,
                        })
                    }
                    drawPlayerBox(player)
                }
            } else {
                if (mapItem.canEat == true) {
                    useItemHelper(player,mapItem);
                }
                if (mapItem.onEat_deleteMe == true) {
                    map[player.pos.y][player.pos.x].item = false;
                    updateCells.push({
                        x: player.pos.x,
                        y: player.pos.y,
                    })
                    
                }
            }
            
            //Check for Collisions
            for (let a = 0; a < activePlayers.length; a++){
                let checkedPlayer = activePlayers[a];
                if (checkedPlayer.isDead && currentGameMode.snakeVanishOnDeath == true) continue;
                for(let b = 0; b < checkedPlayer.tail.length; b++){
                    let tailPiece = checkedPlayer.tail[b];
                    if (player.pos.x == tailPiece.x && player.pos.y == tailPiece.y)
                    {
                        deletePlayer(player,checkedPlayer);
                    }
                }
            }



        }
        else{
            player.moveTik ++;
        }        
    }
}
function useItemHelper(player,item) {
    let onEat = item.onEat;
    if (onEat.growPlayer > 0) {
        growPlayer(player,onEat.growPlayer);
    }
    if (onEat.spawn) {
        for (let i = 0; i < onEat.spawn.length; i++) {
            for (let j = 0; j < onEat.spawn[i].count; j++) {
                spawn(onEat.spawn[i].name);
            }
        }
    }
    if (onEat.giveturbo) {
        if (onEat.turbo.duration && onEat.turbo.moveSpeed) {
            player.turboActive = true;
            player.turboDuration = onEat.turbo.duration;
            player.moveSpeed = onEat.turbo.moveSpeed;
        }
    }
    if (onEat.addStatus) {
        for (let i = 0; i < onEat.addStatus.length; i++) {
            addPlayerStatus(player,onEat.addStatus[i])
        }
    }
    if (onEat.removeStatus) {
        for (let i = 0; i < onEat.removeStatus.length; i++) {
            removePlayerStatus(player,onEat.removeStatus[i])
        }
    }
    if (onEat.deletePlayer) {
        deletePlayer(player);
    }
    if (onEat.shield > 0) {
        player.shield = onEat.shield;
    }
    if (onEat.canvasFilter.active == true) {
        ctx_players.filter = onEat.canvasFilter.filter;
        ctx_items.filter = onEat.canvasFilter.filter;
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                let mapTile = map[i][j].tile;
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

            for (let i = 0; i < map.length; i++) {
                for (let j = 0; j < map[0].length; j++) {
                    let mapTile = map[i][j].tile;
                    if (mapTile == false) continue;
                    updateCells.push({
                        x: j,
                        y: i,
                    })
                }
            }
            doColorRender = true;
        },onEat.canvasFilter.duration)
    }
}
function endScreen() {
    gameEnd = true;
    $(".endGamePopup").show("flex");
    let longestTail = activePlayers[0].longestTail;
    let timeSurvived = activePlayers[0].timeSurvived;
    let mostKills = activePlayers[0].playerKills;

    let longestTailPlayer = activePlayers[0];
    let timeSurvivedPlayer = activePlayers[0];
    let mostKillsPlayer = activePlayers[0];
    for (let i = 1; i < activePlayers.length; i++) {
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

    if (activePlayers.length > 0 && mostKills > 0) {
        $("snakeKillsStat").show("flex");
    } else {
        $("snakeKillsStat").hide();
    }
}
function deletePlayer(player,playerWhoKilled){
    if (player.shield == 0){
        if (playerWhoKilled) playerWhoKilled.playerKills++;

        //Delete Tail
        if (currentGameMode.snakeVanishOnDeath) {
            for (let i = 0; i < player.tail.length; i++) {
                updateSnakeCells.push({
                    x: player.tail[i].x,
                    y: player.tail[i].y,
                })
            }
        }
        //Delete Player
        player.isDead = true;
        player.justDied = true;
        player.timeSurvived = timer;
        drawPlayerBox(player)

        let playersDead = 0;
        for (let i = 0; i < activePlayers.length; i++) {
            if (activePlayers[i].isDead) playersDead++;
        }
        if (playersDead == activePlayers.length) {
            endScreen();
        }
    }else{
        player.shield--;
        if (player.shield == 1) {
            removePlayerStatus(player,"silverShield");
            addPlayerStatus(player,"bronzeShield");
        }
        if (player.shield == 0) {
            removePlayerStatus(player,"bronzeShield");
        }
    }
}
function removePlayerStatus(player,itemName) {
    findingStatus: for (let i = 0; i < player.status.length; i++) {
        if (player.status[i] == getItem(itemName).img) {
            player.status.splice(i,1);
            break findingStatus;
        }
    }
    drawPlayerBox(player);
}
function addPlayerStatus(player,itemName) {
    player.status.push(getItem(itemName).img);
    drawPlayerBox(player);
}

function newMap() {
    map = [];
    for (let i = 0; i < gridY; i++) {
        let arr = [];
        for (let j = 0; j < gridX; j++) {
            arr.push({
                tile: getTile("grass"),
                item: false,
            })
        }
        map.push(arr);
    }
}
//adds movement to a queue of max 3 moves
document.body.onkeydown = function(e) {
    if (!isActiveGame) return;
    if (e.key !== "F5")
        e.preventDefault();

    if (e.key == "Escape") {
        if (gamePaused) {
            $(".pauseGamePopup").hide();
            gamePaused = false;
            requestAnimationFrame(gameLoop);
        }
        else pauseGame();
    }

    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
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
            drawPlayerBox(player);
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
            drawPlayerBox(player);
        }
        if (e.key == player.fireItem) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                if (player.items[player.selectingItem]) {
                    useItem(player);
                }
            }
            drawPlayerBox(player);
        }
    }
}
function useItem(player) {
    if (player.status.includes(player.items[player.selectingItem].img)) return;
    
    let item = player.items[player.selectingItem];
    if (item == "empty") return;
    if (item.cantUseIfStatus) {
        for (let i = 0; i < item.cantUseIfStatus.length; i++) {
            let id = getItem(item.cantUseIfStatus[i]).img;
            if (player.status.includes(id)) return;
        }
    }
    
    useItemHelper(player,player.items[player.selectingItem]);
    player.items[player.selectingItem] = "empty";
}

function setUpPlayerCanvas() {
    let html_playerCanvasHolder = $("playerCanvasHolder");
    html_playerCanvasHolder.innerHTML = "";
    for (let i = 0; i < activePlayers.length; i++) {
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
function setUpItemCanvas() {
    let html_itemCanvasHolder = $("itemCanvasHolder");
    html_itemCanvasHolder.innerHTML = "";

    for (let i = 0; i < currentGameMode.items.length; i++) {
        function getCanvas(image) {
            let itemCanvas = html_itemCanvasHolder.create("canvas");
            let itemCtx = itemCanvas.getContext("2d");
            itemCanvas.width = image.width;
            itemCanvas.height = image.height;
            itemCtx.drawImage(image,0,0);
            return itemCanvas;
        }
        if (!$("item_" + currentGameMode.items[i].img.subset(0,".\\before"))) {
            console.warn("Outdated Item/Tile: " + currentGameMode.items[i].name);
            continue;
        }
        currentGameMode.items[i].canvas = getCanvas($("item_" + currentGameMode.items[i].img.subset(0,".\\before")));
    }
}


function startGame() {
    setScene("game");
    newMap();
    $(".endGamePopup").hide();
    gameEnd = false;
    gamePaused = false;
    $(".pauseGamePopup").hide();
    $("playerCardsHolder").innerHTML = "";
    $("playerCardsHolder").css({
        visibility: "visible",
    })
    doColorRender = false;
    //Resetting Players
    activePlayers = [];
    for (let i = 0; i < players.length; i++) {
        if (players[i].active) activePlayers.push(players[i]);
    }
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        //Ressurect Player
        player.isDead = false;
        player.justDied = false;
        //Set Player Selecting Item To 1
        player.selectingItem = 0;
        //Set Player Item Usage
        player.howManyItemsCanIUse = currentGameMode.howManyItemsCanPlayersUse;
        player.whenInventoryIsFullInsertItemsAt = 0;
        player.status = [];
        //Set All Player Items To Empty
        player.items = [];
        for (let j = 0; j < currentGameMode.howManyItemsCanPlayersUse; j++) {
            player.items.push("empty");
        }
        //Draw Player's Card
        drawPlayerBox(player);

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

        //Spawn Players
        spawn(player);
    }

    specialItemIteration = 0;

    setUpPlayerCanvas();
    setUpItemCanvas();

    //Draw On Background canvas
    let backgroundImage = new Image();
    backgroundImage.src = "img/" + currentBackground;
    backgroundImage.onload = function() {
        ctx_background.drawImage(backgroundImage,0,0,canvas_background.width,canvas_background.height);
    }

    adjustCanvasSize();
    renderGame();

    for (let i = 0; i < currentGameMode.items.length; i++) {
        let item = currentGameMode.items[i];
        for (let j = 0; j < Number(item.onStartSpawn); j++) {
            spawn(item.name,false);
        }
    }



    isActiveGame = true;

    //For testing
    if (showPerformance) {
        setUpProductionHTML();
        $(".production").show("flex");
    }

    requestAnimationFrame(gameLoop);
    
    timer = 0;
    
    startTimer();
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
        production[entry[0]].average = production[entry[0]].times.avg();
        $("production_" + entry[0]).innerHTML = production[entry[0]].average.toFixed(4) + "ms";
    }
}
function gameLoop() {
    production.gameLoop.timeStart = performance.now();

    production.renderCells.timeStart = performance.now();
    renderCells();
    production.renderCells.times.push(performance.now() - production.renderCells.timeStart);

    production.movePlayers.timeStart = performance.now();
    movePlayers();
    production.movePlayers.times.push(performance.now() - production.movePlayers.timeStart);
    
    production.deleteSnakeCells.timeStart = performance.now();
    deleteSnakeCells();
    production.deleteSnakeCells.times.push(performance.now() - production.deleteSnakeCells.timeStart);

    production.renderPlayers.timeStart = performance.now();
    renderPlayers();
    production.renderPlayers.times.push(performance.now() - production.renderPlayers.timeStart);

    production.gameLoop.times.push(performance.now() - production.gameLoop.timeStart);

    updateProduction();
    if (!gameEnd && !gamePaused) requestAnimationFrame(gameLoop);
}

function specialItemManager()
{
    if (specialItemIteration >= specialItemActiveChance) {
        specialItemIteration = 0;
        specialItemActiveChance = rnd(specialItemLowChance,specialItemHighChance);
        // Calculate the total weight
        const totalWeight = items.reduce((sum, item) => sum + item.specialSpawnWeight, 0);

        // Generate a random number between 0 and totalWeight
        const randomWeight = Math.random() * totalWeight;

        // Find the item corresponding to the random weight
        let cumulativeWeight = 0;
        findingItem: for (const item of items) {
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

setScene("menu")