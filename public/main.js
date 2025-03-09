function renderGame() {
    renderTiles();
    ctx_items.clearRect(0,0,canvas_items.width,canvas_items.height);
    for (let i = 0; i < currentBoard.map.length; i++) {
        for (let j = 0; j < currentBoard.map[0].length; j++) {
            let cell = currentBoard.map[i][j]; 

            if (cell.item === false) continue;

            cell.item = structuredClone(cell.item);
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
        if (mapCell.hideWhen) {
            let pass = false;
            for (let j = 0; j < mapCell.hideWhen.length; j++) {
                let value = getBaseImgFromTag(mapCell,mapCell.hideWhen[j].value);
                let subtract = 0;
                let equals = mapCell.hideWhen[j].equals;
                if (mapCell.hideWhen[j].subtract) {
                    if (mapCell.hideWhen[j].subtract[0] === "boardStatusCount") {
                        subtract += localAccount.boardStatus[getBaseImgFromTag(mapCell,mapCell.hideWhen[j].subtract[1])].count;
                    }
                }
                if (_type(mapCell.hideWhen[j].equals).type == "string") {
                    if (mapCell.hideWhen[j].equals.subset(0,2) == "@P.") {
                        equals = localAccount.player[mapCell.hideWhen[j].equals.subset(".\\after","end")];
                    }
                }
                
                if (subtract > 0) value -= subtract;
                if (value === equals) pass = true;
            }
            if (pass) continue;
        }

        let image;
        if (mapCell.baseImg) {
            image = mapCell.name;
            if (mapCell.baseImgTags?.length > 0) image += "_";
            for (let i = 0; i < mapCell.baseImgTags.length; i++) {
                image += getBaseImgFromTag(mapCell,mapCell.baseImgTags[i])
            }
            image = getItemCanvas(image);
        } else {
            image = getItemCanvas(mapCell.name);
        }

        ctx_items.drawImage(image,x*gridSize,y*gridSize,gridSize,gridSize);

        if (mapCell.renderStatusNumber) {
            let value = getBaseImgFromTag(mapCell,mapCell.renderStatusNumber.value);
            let subtract = 0;
            if (mapCell.renderStatusNumber.subtract) {
                if (mapCell.renderStatusNumber.subtract[0] === "boardStatusCount") {
                    subtract += localAccount.boardStatus[getBaseImgFromTag(mapCell,mapCell.renderStatusNumber.subtract[1])].count;
                }
            }

            value -= subtract;
            if (value < 0) value = 0;


            ctx_items.font = "16px VT323";
            ctx_items.strokeStyle = "black";
            ctx_items.fillStyle = "white";
            ctx_items.lineWidth = 4;

            let textWidth = ctx_items.measureText(value).width;
            xPos = (x*(gridSize)) + ((gridSize)/2) - (textWidth/2);
            yPos = (y*(gridSize)) + ((gridSize)/2)+5;

            ctx_items.strokeText(value,xPos,yPos);
            ctx_items.fillText(value,xPos,yPos);
        }
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
    if (!direction) direction = "up";
    let image = list[direction];
    ctx_players.drawImage(image,xPos,yPos,width,height);
}
function server_renderPlayers() {
    for (let i = 0; i < updateSnakeCells.length; i++) {
        let arr = updateSnakeCells[i];
        //Clear Cell
        ctx_players.clearRect(arr[0].x*gridSize,arr[0].y*gridSize,gridSize,gridSize);
        for (let k = 1; k < arr.length; k++) {
            let obj = arr[k];
            let player;
            for (let j = 0; j < activePlayers.length; j++) {
                if (activePlayers[j].index === obj.index) {
                    player = activePlayers[j];
                    break;
                } 
            }
            if (!player) break;
    
            if (obj.type == "head") {
                let headObject = player.canvas.head;
                if (_type(player.invinsibleBodyEffect).type == "number") headObject = player.canvas.head.colors[player.invinsibleBodyEffect];
                drawRotated(headObject,player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);
                
                if (player.equiped.head) {
                    drawImage(getItemCanvas(player.equiped.head.name),player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize,canvas_players);
                }

                if (localAccount.renderTeamColors) {
                    drawRotated(player.canvas.head.teamOutlines[player.team],player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);
                }
            }
            if (obj.type == "body" || obj.type == "tail") {
                let active = []
                for (let j = 0; j < obj.siblings.length; j++) {
                    let sibling = obj.siblings[j];
                    const worldWidth = currentBoard.map[0].length; 
                    const worldHeight = currentBoard.map.length;

                    let dx = sibling.x - obj.x;
                    let dy = sibling.y - obj.y;

                    // Adjust for wrapping
                    if (dx > worldWidth / 2) dx -= worldWidth;
                    if (dx < -worldWidth / 2) dx += worldWidth;
                    if (dy > worldHeight / 2) dy -= worldHeight;
                    if (dy < -worldHeight / 2) dy += worldHeight;

                    // Calculate wrapped Manhattan distance
                    let distance = Math.min(Math.abs(sibling.x - obj.x), worldWidth - Math.abs(sibling.x - obj.x)) +
                                Math.min(Math.abs(sibling.y - obj.y), worldHeight - Math.abs(sibling.y - obj.y));

                    // Only push direction if the distance is exactly 1
                    if (distance === 1) {
                        if (dx < 0) active.push("left");
                        if (dx > 0) active.push("right");
                        if (dy < 0) active.push("top");
                        if (dy > 0) active.push("bottom");
                    }
                }
    
                //For Tunnels
                if (currentBoard.map[obj.y][obj.x].item?.pack == "Tunnels") {
                    if (obj.type == "body") {
                        if (active[0] == "bottom") active.push("top");
                        else active.push("bottom");
                    }
                    if (obj.type == "tail") {
                        if (active[0] == "bottom") active = ["left"];
                        else active = ["bottom"];
                    }
                }
                
                /* 
                    snakeTurn directions
                    up = Top - Right
                    left = Top - Left
                    right = Right - Bottom
                    down =  Bottom - Left
                */
    
                let direction, image,imageTeams;
    
                if (obj.type == "tail") {
                    
                    if (_type(player.invinsibleBodyEffect).type == "number") image = player.canvas.tail.colors[player.invinsibleBodyEffect];
                    else image = player.canvas.tail;
                    imageTeams = player.canvas.tail.teamOutlines[player.team]
                    if (active.includes("right")) direction = "right"; 
                    if (active.includes("left")) direction = "left"; 
                    if (active.includes("bottom")) direction = "down"; 
                    if (active.includes("top")) direction = "up"; 
                } else {
                    if (active.includes("left") && active.includes("right")) {
                        if (_type(player.invinsibleBodyEffect).type == "number") image = player.canvas.body.colors[player.invinsibleBodyEffect];
                        else image = player.canvas.body;
                        imageTeams = player.canvas.body.teamOutlines[player.team];
                        direction = "right";
                    }
                    if (active.includes("top") && active.includes("bottom")) {
                        if (_type(player.invinsibleBodyEffect).type == "number") image = player.canvas.body.colors[player.invinsibleBodyEffect];
                        else image = player.canvas.body;
                        imageTeams = player.canvas.body.teamOutlines[player.team];
                        direction = "up";
                    }
                    if (!image) {
                        if (_type(player.invinsibleBodyEffect).type == "number") image = player.canvas.turn.colors[player.invinsibleBodyEffect];
                        else image = player.canvas.turn;
                        imageTeams = player.canvas.turn.teamOutlines[player.team];
                        if (active.includes("top") && active.includes("right")) direction = "up";
                        if (active.includes("top") && active.includes("left")) direction = "left";
                        if (active.includes("right") && active.includes("bottom")) direction = "right";
                        if (active.includes("bottom") && active.includes("left")) direction = "down";
                    }
                }

                drawRotated(image,direction,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);
                if (localAccount.renderTeamColors) {
                    drawRotated(imageTeams,direction,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);
                }
            }
        }
    }
    updateSnakeCells = [];
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
    if (e.ctrlKey && e.key === 'q') {
        showPerformance = showPerformance ? false : true;
        
        if (showPerformance) $(".production").show("flex");
        else $(".production").hide();
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'i') {
        return;
    }
    if (killSwitch) return;
    if (!isActiveGame) return;
    
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
    if (gameType == "server" && !e.ctrlKey) {
        let activePlayer;
        for (let i = 0; i < activePlayers.length; i++) {
            if(activePlayers[i] == false) continue;
            if (activePlayers[i].accountID === localAccount.id) activePlayer = activePlayers[i];
        }
        if (!activePlayer) return;
        if (activePlayer.isDead) return;
        if (e.key == activePlayer.leftKey && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","left");
        }
        if (e.key == activePlayer.rightKey && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","right");
        }
        if (e.key == activePlayer.upKey && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","up");
        }
        if (e.key == activePlayer.downKey && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","down");
        }
        if (e.key == activePlayer.useItem1) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                socket.emit("changeItem",-1);
            }
            if (currentGameMode.mode_usingItemType == "direct") {
            }
        }
        if (e.key == activePlayer.useItem2) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                socket.emit("changeItem",1);
            }
            if (currentGameMode.mode_usingItemType == "direct") {
                activePlayer.selectingItem = 1;
            }
        }
        if (e.key == activePlayer.fireItem) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                if (activePlayer.items[activePlayer.selectingItem]) {
                    socket.emit("fireItem");
                }
            }
        }
        if (e.key == activePlayer.toggleTeamsKey) {
            localAccount.renderTeamColors = localAccount.renderTeamColors ? false : true;
            socket.emit("rerenderAllSnakes");
        }
        if (e.key == activePlayer.dropItem) {
            socket.emit("dropItem");
        }
    }
    
}


function setUpPlayerCanvas() {
    let html_playerCanvasHolder = $("playerCanvasHolder");
    html_playerCanvasHolder.innerHTML = "";
    for (let i = 0; i < activePlayers.length; i++) {
        if(activePlayers[i] == false) continue;
        let player = activePlayers[i];

        function getCanvas(image,direction,filter,outline = false) {
            if (filter) filter = `hue-rotate(${filter}deg)`;
            let playerCanvas = html_playerCanvasHolder.create("canvas");
            let playerCtx = playerCanvas.getContext("2d");
            playerCanvas.width = image.width;
            playerCanvas.height = image.height;
            if (!outline) playerCtx.filter = filter ? filter : getPlayerFilter(player);

            if (direction) {
                drawImage(image,direction,0,0,image.width,image.height,playerCanvas);
            } else {
                playerCtx.drawImage(image,0,0);
            }
            if (outline) {
                outline = _color(outline).ogColor;

                const imageData = playerCtx.getImageData(0, 0, playerCanvas.width, playerCanvas.height);
                const data = imageData.data;// Convert hex to RGB
                const r = parseInt(outline.substring(1, 3), 16);
                const g = parseInt(outline.substring(3, 5), 16);
                const b = parseInt(outline.substring(5, 7), 16);
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 0) { // Check if pixel is not transparent
                        data[i] = r;     // Red
                        data[i + 1] = g; // Green
                        data[i + 2] = b; // Blue
                    }
                }
                playerCtx.putImageData(imageData, 0, 0);
            }
            return playerCanvas;
        }

        player.canvas = {
            body: {
                left: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_body"),"left"),
                right: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_body"),"right"),
                up: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_body"),"up"),
                down: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_body"),"down"),
            },
            tail: {
                left: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_tail"),"left"),
                right: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_tail"),"right"),
                up: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_tail"),"up"),
                down: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_tail"),"down"),
            },
            turn: {
                left: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_turn"),"left"),
                right: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_turn"),"right"),
                up: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_turn"),"up"),
                down: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_turn"),"down"),
            },
            head: {
                left: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_head"),"left"),
                right: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_head"),"right"),
                up: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_head"),"up"),
                down: getCanvas($("img_snakeSkin_" + player.snakeSkin + "_head"),"down"),
            }
        }

        let parts = ["body","tail","turn","head"];
        let partsTag = ["img_snakeSkin_" + player.snakeSkin + "_body","img_snakeSkin_" + player.snakeSkin + "_tail","img_snakeSkin_" + player.snakeSkin + "_turn","img_snakeSkin_" + player.snakeSkin + "_head"];
        let directions = ["left","right","up","down"];
        let colors = [50,100,150,200,250,300,350];
        for (let p = 0; p < parts.length; p++) {
            player.canvas[parts[p]].colors = [];
            for (let c = 0; c < colors.length; c++) {
                player.canvas[parts[p]].colors.push({});
                for (let d = 0; d < directions.length; d++) {
                    player.canvas[parts[p]].colors[c][directions[d]] = getCanvas($(partsTag[p]),directions[d],colors[c]);

                }
            }
        }

        let teams = [
            "white","aquamarine","blue","buff","coral","crimsonpurple","gold","green","lemon","lime","magenta","orange","pink","red","skyblue","slateblue","venom",
        ]
        for (let p = 0; p < parts.length; p++) {
            player.canvas[parts[p]].teamOutlines = {};
            for (let c = 0; c < teams.length; c++) {
                player.canvas[parts[p]].teamOutlines[teams[c]] = {};
                for (let d = 0; d < directions.length; d++) {
                    player.canvas[parts[p]].teamOutlines[teams[c]][directions[d]] = getCanvas($(partsTag[p] + "_outline"),directions[d],false,teams[c]);

                }
            }
        }

    }
}

let cameraFollowPlayer = false;
let cameraQuickZoom;
function startGame(solo = false) {
    productionType = "local";
    setUpProductionHTML();
    setScene("game");
    $(".endGamePopup").hide();
    $(".pauseGamePopup").hide();
    $("playerCardsHolder").innerHTML = "";
    $("playerCardsHolder").style.visibility = "visible";

    $("playerCardsHolder").style.cursor = "none";

    gamePaused = false;
    renderEmotesList = [];

    currentBoard = boards[currentBoardIndex];
    //if (activeGameMode !== false) currentGameMode = gameModes[activeGameMode];

    //currentGameMode = structuredClone(currentGameMode);

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
    //itemList = 
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

    for (let i = 0; i < itemList.length; i++) {
        let item = itemList[i];
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

let productionType;
let production = {
    //Local Player
    gameLoop: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "local",
        dataType: "ms",
    },
    renderCells: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "local",
        dataType: "ms",
    },
    movePlayers: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "local",
        dataType: "ms",
    },
    setPlayerPos: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "sub",
        showIF: "local",
        dataType: "ms",
    },
    checkingPlayerCollision: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "sub",
        showIF: "local",
        dataType: "ms",
    },
    testingItems: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "sub",
        showIF: "local",
        dataType: "ms",
    },
    growingTail: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "sub",
        showIF: "local",
        dataType: "ms",
    },
    deleteSnakeCells: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "local",
        dataType: "ms",
    },
    renderPlayers: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "local",
        dataType: "ms",
    },
    renderTail: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "sub",
        showIF: "local",
        dataType: "ms",
    },



    //Server Play
    ping: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 1,
        type: "dom",
        showIF: "server",
        dataType: "ms",
    },
    In_Game_Client_Stats: {
        type: "title",
        showIF: "server",
    },
    updatePositions_speed: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "server",
        dataType: "ms",
    },
    updatePositions_recieveData: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "server",
        dataType: "bytes",
    },
    Server_Stats: {
        type: "title",
        showIF: "server",
    },
    lobby_gameLoop: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 100,
        type: "dom",
        showIF: "server",
        dataType: "ms",
    },
    server_player_count: {
        value: 0,
        type: "dom",
        showIF: "server",
        dataType: "count",
    },
    server_lobby_count: {
        value: 0,
        type: "dom",
        showIF: "server",
        dataType: "count",
    },
    Memory_Ussage: {
        type: "title",
        showIF: "server",
    },
    server_rss: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 1,
        type: "dom",
        showIF: "server",
        dataType: "mb",
    },
    server_heapTotal: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 1,
        type: "dom",
        showIF: "server",
        dataType: "mb",
    },
    server_heapUsed: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 1,
        type: "dom",
        showIF: "server",
        dataType: "mb",
    },
    server_external: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 1,
        type: "dom",
        showIF: "server",
        dataType: "mb",
    },
    server_arrayBuffers: {
        times: [],
        average: 0,
        timeStart: 0,
        cap: 1,
        type: "dom",
        showIF: "server",
        dataType: "mb",
    },
}
function setUpProductionHTML() {
    let holder = $(".production");
    holder.innerHTML = "";
    for (let i = 0; i < Object.entries(production).length; i++) {
        let entry = Object.entries(production)[i];
        if (entry[1].showIF !== productionType) continue;

        let div = holder.create("div");
        div.className = "production_holder";
        let title = div.create("div");
        if (entry[1].type == "dom")
            title.className = "production_title";
        if (entry[1].type == "sub")
            title.className = "production_titleSub";
        if (entry[1].type == "title")
            title.className = "production_titletitle";
        title.innerHTML = entry[0];
        if (entry[1].type !== "title") {
            let value = holder.create("div");
            value.id = "production_" + entry[0];
            value.className = "production_value";
            if (["ms","bytes","mb"].includes(entry[1].dataType)) {
                value.innerHTML = entry[1].average.toFixed(2);
            }
            if (["count"].includes(entry[1].dataType)) {
                value.innerHTML = entry[1].count;
            }
             
        }
        
    }
}
function updateProduction() {
    for (let i = 0; i < Object.entries(production).length; i++) {
        let entry = Object.entries(production)[i];

        if (entry[1].type == "title") continue;

        if (["ms","bytes","mb"].includes(entry[1].dataType)) {
            if (entry[1].times.length > entry[1].cap) {
                entry[1].times.shift();
            }
            if (entry[1].times.length == 0) entry[1].times.push(0);
            entry[1].average = entry[1].times.avg();
        }
        
        
        if (entry[1].dataType == "ms") $("production_" + entry[0]).innerHTML = entry[1].average.toFixed(2) + "ms";
        if (entry[1].dataType == "bytes") $("production_" + entry[0]).innerHTML = entry[1].average.toFixed(2) + "bytes";
        if (entry[1].dataType == "mb") $("production_" + entry[0]).innerHTML = ((entry[1].average/1000000).toFixed(2)) + "mb";
        if (entry[1].dataType == "count") $("production_" + entry[0]).innerHTML = (entry[1].value);
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
        for (let i = 0; i < itemList.length; i++) {
            if (itemList[i].spawnLimit < 1 && _type(itemList[i].spawnLimit).type == "number") continue;
            totalWeight += itemList[i].specialSpawnWeight;
        }

        // Generate a random number between 0 and totalWeight
        const randomWeight = Math.random() * totalWeight;

        // Find the item corresponding to the random weight
        let cumulativeWeight = 0;
        findingItem: for (const item of itemList) {
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

