function renderGame() {
    renderTiles();
    ctx_items.clearRect(0,0,canvas_items.width,canvas_items.height);
    for (let i = 0; i < localAccount.currentBoard.map.length; i++) {
        for (let j = 0; j < localAccount.currentBoard.map[0].length; j++) {
            let cell = localAccount.currentBoard.map[i][j]; 

            if (cell.item === false) continue;

            cell.item = cloneObject(getItem(cell.item.name));
            if (cell.item == undefined) cell.item = false; //Prolly Will Need To Resolve Issue Later
            if (cell.item !== false) {
                if (cell.item.spawnLimit > 0) cell.item.spawnLimit--; 
                localAccount.updateCells.push({
                    x: j,
                    y: i,
                })
            }
        }
    }
}
function renderTiles() {
    ctx_tiles.clearRect(0,0,canvas_tiles.width,canvas_tiles.height);
    for (let i = 0; i < localAccount.currentBoard.map.length; i++) {
        for (let j = 0; j < localAccount.currentBoard.map[0].length; j++) {
            let mapTile = localAccount.currentBoard.map[i][j].tile;
            ctx_tiles.drawImage($("tile_" + mapTile.name),j*gridSize,i*gridSize,gridSize,gridSize);      
        }
    }
}
function renderCells() {
    for (let i = 0; i < localAccount.updateCells.length; i++) {
        let mapCell = localAccount.currentBoard.map[localAccount.updateCells[i].y][localAccount.updateCells[i].x].item;
        ctx_items.clearRect(localAccount.updateCells[i].x*gridSize,localAccount.updateCells[i].y*gridSize,gridSize,gridSize);
        if (!mapCell.visible) continue;
        if (mapCell == false) continue;

        if (mapCell.canvasTag == undefined) mapCell.canvasTag = "";
        ctx_items.drawImage(getItemCanvas(mapCell.name + mapCell.canvasTag),localAccount.updateCells[i].x*gridSize,localAccount.updateCells[i].y*gridSize,gridSize,gridSize);

        if (mapCell.renderStatusPath.length > 0) {
            let name = mapCell;
            for (let j = 0; j < mapCell.renderStatusPath.length; j++) {
                name = name[mapCell.renderStatusPath[j]];
            }
            let change = 1.5;
            if (_type(name).type == "array") name = name[0];
            if (name.subset(0,5) == "player") {
                if (name == "player") continue;
                ctx_items.fillStyle = "black";
                ctx_items.font = "20px Arial";
                name = "P" + name.subset("_\\after","end");
                ctx_items.fillText(name,(localAccount.updateCells[i].x*gridSize) + (gridSize/2) - (gridSize/change/2),localAccount.updateCells[i].y*gridSize + (gridSize/2) - (gridSize/change/2)+(gridSize/2),gridSize/change,gridSize/change);
            } else 
                ctx_items.drawImage(getItemCanvas(name),(localAccount.updateCells[i].x*gridSize) + (gridSize/2) - (gridSize/change/2),localAccount.updateCells[i].y*gridSize + (gridSize/2) - (gridSize/change/2),gridSize/change,gridSize/change);
        }
    }
    localAccount.updateCells = [];
}
function deleteSnakeCells() {
    for (let i = 0; i < localAccount.updateSnakeCells.length; i++) {
        if (localAccount.updateSnakeCells[i].player?.isDead) continue;
        ctx_players.clearRect(localAccount.updateSnakeCells[i].x*gridSize,localAccount.updateSnakeCells[i].y*gridSize,gridSize,gridSize);
    }
    localAccount.updateSnakeCells = [];
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
    for (let i = 0; i < localAccount.playersInServer.length; i++) {
        let player = localAccount.playersInServer[i];

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

        //production.renderTail.timeStart = performance.now();
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

                let image = player.canvas.head;
                let direction = "right";

                let playerIsOnPortal = false;
                if (_type(localAccount.currentBoard.map[tailY][tailX].item.teleport).type == "number") {
                    playerIsOnPortal = true;
                    tail.up = {
                        active: false,
                        distance: 1,
                    };
                    tail.down = {
                        active: true,
                        distance: 1,
                    };
                    if (afterTail.y + 1 == tailY) {
                        tail.up.active = true;
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
                

                if (Math.abs(beforeTail.x - afterTail.x) == 2 && !playerIsOnPortal) {
                    image = player.canvas.body; direction = "right";
                }
                if (Math.abs(beforeTail.y - afterTail.y) == 2 && !playerIsOnPortal) {
                    image = player.canvas.body; direction = "up";
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
        //production.renderTail.times.push(performance.now() - production.renderTail.timeStart);
    }
    doColorRender = false;
}
function endScreen(player = false) {
    gameEnd = true;
    isActiveGame = false;
    $(".endGamePopup").show("flex");

    //Kill Any Non Dead Snakes
    for (let i = 0; i < activePlayers.length; i++) {
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
function removePlayerStatus(player,itemName) {
    findingStatus: for (let i = 0; i < player.status.length; i++) {
        if (player.status[i] == getItem(itemName).name) {
            player.status.splice(i,1);
            break findingStatus;
        }
    }
    drawPlayerBox(player);
}
function addPlayerStatus(player,itemName) {
    player.status.push(getItem(itemName).name);
    drawPlayerBox(player);
}

function removeBoardStatus(status,player) {
    if (status == "player") status = "player_" + player.id;
    checking: for (let i = 0; i < localAccount.currentBoard.boardStatus.length; i++) {
        if (localAccount.currentBoard.boardStatus[i] == status) {
            localAccount.currentBoard.boardStatus.splice(i,1);
            break checking;
        }
    }

    loadBoardStatus();
}
function addBoardStatus(status,player) {
    if (status == "player") status = "player_" + player.id;

    localAccount.currentBoard.boardStatus.push(status);

    loadBoardStatus();
}

//adds movement to a queue of max 3 moves
document.body.onkeydown = function(e) {
    if (!localAccount.isInGame) return;
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

    let player = localAccount.player;
    if (e.key == player.leftKey) {
        socket.emit("movePlayerKey","left");
    }
    if (e.key == player.rightKey) {
        socket.emit("movePlayerKey","right");
    }
    if (e.key == player.upKey) {
        socket.emit("movePlayerKey","up");
    }
    if (e.key == player.downKey) {
        socket.emit("movePlayerKey","down");
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
    
    useItemHelper(player,player.items[player.selectingItem]);
    player.items[player.selectingItem] = "empty";
}

function setUpPlayerCanvas() {
    let html_playerCanvasHolder = $("playerCanvasHolder");
    html_playerCanvasHolder.innerHTML = "";
    for (let i = 0; i < localAccount.playersInServer.length; i++) {
        let player = localAccount.playersInServer[i];

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


let timerInterval;
function startTimer() {
    clearInterval(timerInterval)
    timerInterval = setInterval(function() {
        if (!gamePaused)
            timer++;
    },1000)
}

// let production = {
//     gameLoop: {
//         times: [],
//         average: 0,
//         timeStart: 0,
//         type: "dom",
//     },
//     renderCells: {
//         times: [],
//         average: 0,
//         timeStart: 0,
//         type: "dom",
//     },
//     movePlayers: {
//         times: [],
//         average: 0,
//         timeStart: 0,
//         type: "dom",
//     },
//     deleteSnakeCells: {
//         times: [],
//         average: 0,
//         timeStart: 0,
//         type: "dom",
//     },
//     renderPlayers: {
//         times: [],
//         average: 0,
//         timeStart: 0,
//         type: "dom",
//     },
//     renderTail: {
//         times: [],
//         average: 0,
//         timeStart: 0,
//         type: "sub",
//     },
// }
// function setUpProductionHTML() {
//     let holder = $(".production");
//     holder.innerHTML = "";
//     for (let i = 0; i < Object.entries(production).length; i++) {
//         let entry = Object.entries(production)[i];
//         let div = holder.create("div");
//         div.className = "production_holder";
//         let title = div.create("div");
//         if (entry[1].type == "dom")
//             title.className = "production_title";
//         if (entry[1].type == "sub")
//             title.className = "production_titleSub";
//         title.innerHTML = entry[0];
//         let value = holder.create("div");
//         value.id = "production_" + entry[0];
//         value.className = "production_value";
//         value.innerHTML = entry[1].average.toFixed(2);
//     }
// }
// function updateProduction() {
//     for (let i = 0; i < Object.entries(production).length; i++) {
//         let entry = Object.entries(production)[i];
//         if (production[entry[0]].times.length > 1000) {
//             production[entry[0]].times.shift();
//         }
//         production[entry[0]].average = production[entry[0]].times.avg();
//         $("production_" + entry[0]).innerHTML = production[entry[0]].average.toFixed(4) + "ms";
//     }
// }
function gameLoop(timestamp) {
    deltaTime = (timestamp - lastTimestamp) / perfectFrameTime;
    lastTimestamp = timestamp;

    renderCells();
    movePlayerLocally(); //NOT MADE YET - Should also delete snake cells locally
    movePlayer(localAccount.id);
    deleteSnakeCells();
    renderPlayers();

    if (!gameEnd && !gamePaused) requestAnimationFrame(gameLoop);
}

function specialItemManager()
{
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


function movePlayerLocally() {

}