function renderCells(list,ctx) {
    for (let i = 0; i < list.length; i++) {
        let x = list[i].x;
        let y = list[i].y;
        
        let mapCell = list[i].item;

        if (mapCell?.type !== "tile" || mapCell == undefined) ctx.clearRect(x*gridSize,y*gridSize,gridSize,gridSize);
        if (mapCell == undefined) continue;
        if (!mapCell.visible) continue;
        if (mapCell.hideWhen) {
            let pass = false;
            for (let j = 0; j < mapCell.hideWhen.length; j++) {
                let value = getBaseImgFromTag(mapCell,mapCell.hideWhen[j].value);
                let subtract = 0;
                let equals = false;
                let lessOrEqual = false;
                if (mapCell.hideWhen[j].equals !== undefined) equals = mapCell.hideWhen[j].equals;
                if (mapCell.hideWhen[j].lessOrEqual !== undefined) lessOrEqual = mapCell.hideWhen[j].lessOrEqual;

                if (mapCell.hideWhen[j].subtract) {
                    if (mapCell.hideWhen[j].subtract[0] === "boardStatusCount") {
                        let gbiftValue = getBaseImgFromTag(mapCell,mapCell.hideWhen[j].subtract[1]);
                        if (gbiftValue == "white") gbiftValue = localAccount.player.team;
                        if (gbiftValue !== "white") 
                            subtract += localAccount.boardStatus[gbiftValue].count;
                    }
                }

                if (equals !== false) {
                    if (_type(mapCell.hideWhen[j].equals).type == "string") {
                        if (mapCell.hideWhen[j].equals.subset(0,2) == "@P.") {
                            equals = localAccount.player[mapCell.hideWhen[j].equals.subset(".\\after","end")];
                        }
                    }
                }
                if (lessOrEqual !== false) {
                    if (_type(mapCell.hideWhen[j].lessOrEqual).type == "string") {
                        if (mapCell.hideWhen[j].lessOrEqual.subset(0,2) == "@P.") {
                            lessOrEqual = localAccount.player[mapCell.hideWhen[j].lessOrEqual.subset(".\\after","end")];
                        }
                    }
                }

                if (subtract > 0) value -= subtract;
                if (equals !== false) if (value === equals) pass = true;
                if (lessOrEqual !== false) if (value <= lessOrEqual) pass = true;
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
            image = getItemCanvas(image,mapCell.type);
        } else {
            image = getItemCanvas(mapCell.name,mapCell.type);
        }

        ctx.drawImage(image,x*gridSize,y*gridSize,gridSize,gridSize);

        if (mapCell.renderStatusNumber) {
            let value = getBaseImgFromTag(mapCell,mapCell.renderStatusNumber.value);
            let subtract = 0;
            if (mapCell.renderStatusNumber.subtract) {
                if (mapCell.renderStatusNumber.subtract[0] === "boardStatusCount") {
                    let gbiftValue = getBaseImgFromTag(mapCell,mapCell.renderStatusNumber.subtract[1]);
                    if (gbiftValue == "white") gbiftValue = localAccount.player.team;
                    if (gbiftValue !== "white") 
                        subtract += localAccount.boardStatus[gbiftValue].count;
                }
                if (mapCell.renderStatusNumber.subtract[0] === "playerSnakeSize") {
                    subtract += localAccount.player.tailLength;
                }
            }

            value -= subtract;
            if (value < 0) value = 0;

            let doRender = true;
            if (mapCell.renderStatusNumber.dontRenderIfValueEquals !== undefined) {
                if (mapCell.renderStatusNumber.dontRenderIfValueEquals +"" == value + "") {
                    doRender = false;
                }
            }

            if (doRender) {
                ctx.font = "16px VT323";
                ctx.strokeStyle = "black";
                ctx.fillStyle = mapCell.renderStatusColor ?? "white";
                ctx.lineWidth = 4;
    
                let textWidth = ctx.measureText(value).width;
                xPos = (x*(gridSize)) + ((gridSize)/2) - (textWidth/2);
                yPos = (y*(gridSize)) + ((gridSize)/2)+5;
    
                ctx.strokeText(value,xPos,yPos);
                ctx.fillText(value,xPos,yPos);
            }
        }
    }
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
                if (_type(player.invinsibleBodyEffect).type == "number") headObject = snakeSkinCanvasObj[player.snakeSkin].head.colors[player.invinsibleBodyEffect];
                drawRotated(headObject,player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);
                
                if (player.equiped.head) {
                    drawImage(getItemCanvas(player.equiped.head.name,"item"),player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize,canvas_players);
                }

                if (localAccount.renderTeamColors) {
                    drawRotated(snakeSkinCanvasObj[player.snakeSkin].head.teamOutlines[player.team],player.moving,obj.x*gridSize,obj.y*gridSize,gridSize,gridSize);
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
                    
                    if (_type(player.invinsibleBodyEffect).type == "number") image = snakeSkinCanvasObj[player.snakeSkin].tail.colors[player.invinsibleBodyEffect];
                    else image = player.canvas.tail;
                    imageTeams = snakeSkinCanvasObj[player.snakeSkin].tail.teamOutlines[player.team];
                    if (active.includes("right")) direction = "right"; 
                    if (active.includes("left")) direction = "left"; 
                    if (active.includes("bottom")) direction = "down"; 
                    if (active.includes("top")) direction = "up"; 
                } else {
                    if (active.includes("left") && active.includes("right")) {
                        if (_type(player.invinsibleBodyEffect).type == "number") image = snakeSkinCanvasObj[player.snakeSkin].body.colors[player.invinsibleBodyEffect];
                        else image = player.canvas.body;
                        imageTeams = snakeSkinCanvasObj[player.snakeSkin].body.teamOutlines[player.team];
                        direction = "right";
                    }
                    if (active.includes("top") && active.includes("bottom")) {
                        if (_type(player.invinsibleBodyEffect).type == "number") image = snakeSkinCanvasObj[player.snakeSkin].body.colors[player.invinsibleBodyEffect];
                        else image = player.canvas.body;
                        imageTeams = snakeSkinCanvasObj[player.snakeSkin].body.teamOutlines[player.team];
                        direction = "up";
                    }
                    if (!image) {
                        if (_type(player.invinsibleBodyEffect).type == "number") image = snakeSkinCanvasObj[player.snakeSkin].turn.colors[player.invinsibleBodyEffect];
                        else image = player.canvas.turn;
                        imageTeams = snakeSkinCanvasObj[player.snakeSkin].turn.teamOutlines[player.team];
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
    let controlDown = e.ctrlKey;
    let shiftDown = e.shiftKey;
    let metaDown = e.metaKey;
    let keyDown = e.key.toLowerCase();
    let preventDefault = true;
    if (controlDown && shiftDown && keyDown === 'i') preventDefault = false;
    if (metaDown) preventDefault = false;
    if (keyDown == "f5") preventDefault = false;
    if (killSwitch) return;
    if (!isActiveGame) return;
    

    if (preventDefault) e.preventDefault;

    if (keyDown == "escape" && gameType !== "server") {
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
        if (keyDown == "m") {
            if ($(".firstPersonMap").style.display == "block") {
                $(".firstPersonMap").hide();
            } else {
                $(".firstPersonMap").show();
            }
        }
    }

    if (gameType == "server" && !controlDown) {
        let activePlayer;
        for (let i = 0; i < activePlayers.length; i++) {
            if(activePlayers[i] == false) continue;
            if (activePlayers[i].accountID === localAccount.id) activePlayer = activePlayers[i];
        }
        if (!activePlayer) return;
        if (activePlayer.isDead) return;
        if (keyDown == activePlayer.leftKey.toLowerCase() && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","left");
        }
        if (keyDown == activePlayer.rightKey.toLowerCase() && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","right");
        }
        if (keyDown == activePlayer.upKey.toLowerCase() && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","up");
        }
        if (keyDown == activePlayer.downKey.toLowerCase() && activePlayer.moveQueue.length < 4) {
            socket.emit("movePlayerKey","down");
        }
        if (keyDown == activePlayer.useItem1.toLowerCase()) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                socket.emit("changeItem",-1);
            }
            if (currentGameMode.mode_usingItemType == "direct") {
            }
        }
        if (keyDown == activePlayer.useItem2.toLowerCase()) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                socket.emit("changeItem",1);
            }
            if (currentGameMode.mode_usingItemType == "direct") {
                activePlayer.selectingItem = 1;
            }
        }
        if (keyDown == activePlayer.fireItem.toLowerCase()) {
            if (currentGameMode.mode_usingItemType == "scroll") {
                if (activePlayer.items[activePlayer.selectingItem]) {
                    socket.emit("fireItem");
                }
            }
        }
        if (keyDown == activePlayer.toggleTeamsKey.toLowerCase()) {
            localAccount.renderTeamColors = localAccount.renderTeamColors ? false : true;
            socket.emit("rerenderAllSnakes");
        }
        if (keyDown == activePlayer.dropItem.toLowerCase()) {
            socket.emit("dropItem");
        }
    }
    
}
function getPlayerCanvas(holder,image,direction,filter,outline = false,player) {
    if (filter) filter = `hue-rotate(${filter}deg)`;
    let playerCanvas = holder.create("canvas");
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
function loadSnakeSkins() {
    for (let i = 0; i < snakeSkins.length; i++) {
        let skin = snakeSkins[i];
        snakeSkinCanvasObj[skin] = {};


        let parts = ["body","tail","turn","head"];
        let partsTag = ["img_snakeSkin_" + skin + "_body","img_snakeSkin_" + skin + "_tail","img_snakeSkin_" + skin + "_turn","img_snakeSkin_" + skin + "_head"];
        let directions = ["left","right","up","down"];
        let colors = [50,100,150,200,250,300,350];
        for (let p = 0; p < parts.length; p++) {
            snakeSkinCanvasObj[skin][parts[p]] = {};
            snakeSkinCanvasObj[skin][parts[p]].colors = [];
            for (let c = 0; c < colors.length; c++) {
                snakeSkinCanvasObj[skin][parts[p]].colors.push({});
                for (let d = 0; d < directions.length; d++) {
                    snakeSkinCanvasObj[skin][parts[p]].colors[c][directions[d]] = getPlayerCanvas($("snakeSkinsHolder"),$(partsTag[p]),directions[d],colors[c]);

                }
            }
        }

        let teams = [
            "white","aquamarine","blue","buff","coral","crimsonpurple","gold","green","lemon","lime","magenta","orange","pink","red","skyblue","slateblue","venom",
        ]
        for (let p = 0; p < parts.length; p++) {
            snakeSkinCanvasObj[skin][parts[p]].teamOutlines = {};
            for (let c = 0; c < teams.length; c++) {
                snakeSkinCanvasObj[skin][parts[p]].teamOutlines[teams[c]] = {};
                for (let d = 0; d < directions.length; d++) {
                    snakeSkinCanvasObj[skin][parts[p]].teamOutlines[teams[c]][directions[d]] = getPlayerCanvas($("snakeSkinsHolder"),$(partsTag[p] + "_outline"),directions[d],false,teams[c]);
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

        player.canvas = {
            body: {
                left: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_body"),"left",false,false,player),
                right: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_body"),"right",false,false,player),
                up: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_body"),"up",false,false,player),
                down: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_body"),"down",false,false,player),
            },
            tail: {
                left: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_tail"),"left",false,false,player),
                right: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_tail"),"right",false,false,player),
                up: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_tail"),"up",false,false,player),
                down: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_tail"),"down",false,false,player),
            },
            turn: {
                left: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_turn"),"left",false,false,player),
                right: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_turn"),"right",false,false,player),
                up: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_turn"),"up",false,false,player),
                down: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_turn"),"down",false,false,player),
            },
            head: {
                left: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_head"),"left",false,false,player),
                right: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_head"),"right",false,false,player),
                up: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_head"),"up",false,false,player),
                down: getPlayerCanvas(html_playerCanvasHolder,$("img_snakeSkin_" + player.snakeSkin + "_head"),"down",false,false,player),
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
        updatePlayerCard(player);
    }

    setUpPlayerCanvas();
    renderGame();
    fixItemDifferences(currentBoard.map);
    fixTileDifferences(currentBoard.map);
    //renderCells();
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
function serverGameLoop() {
    deltaTime = 1;
    if (!isActiveGame) return;
    renderCells(updateTiles,ctx_tiles)
    renderCells(updateCells,ctx_items);
    updateTiles = [];
    updateCells = [];
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

