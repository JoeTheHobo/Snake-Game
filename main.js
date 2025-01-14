//Load All Item Images
for (let i = 0; i < items.length; i++) {
    if (!items[i].img) continue;

    let img = $(".imageHolder").create("img");
    img.src = "img/" + items[i].img;
    img.id = "item_" + items[i].img.subset(0,".\\before");
}
//End Load All Item Images


function renderGame() {
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            let mapItem = map[i][j];

            updateCells.push({
                x: j,
                y: i,
            });
        }
    }
    renderCells();
}
function renderCells() {
    for (let i = 0; i < updateCells.length; i++) {
        let mapCell = map[updateCells[i].y][updateCells[i].x];
        ctx.drawImage(mapCell.canvas,updateCells[i].x*gridSize,updateCells[i].y*gridSize,gridSize,gridSize);        
    }
    updateCells = [];
}
function drawImage(image, direction, xPos, yPos, width, height,cnvs = canvas) {
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
    ctx.drawImage(image,xPos,yPos,width,height);
}
function renderPlayers() {
    for (let i = 0; i < players.length; i++) {
        let player = players[i];

        if (player.isDead) continue;

        drawRotated(player.canvas.head,player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);
        
        if (player.shield == 1){
            let item = getItem("bronzeShield");
            drawImage(item.canvas,player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);
        }
        if (player.shield == 2){
            let item = getItem("silverShield");
            drawImage(item.canvas,player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);
        }

        production.renderTail.timeStart = performance.now();
        for (let j = 0; j < player.tail.length; j++) {
            if (j !== 0 && j !== player.tail.length-1) continue;

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
                /* 
                    snakeTurn directions
                    up = Top - Right
                    left = Top - Left
                    right = Right - Bottom
                    down =  Bottom - Left
                */
                if (Math.abs(beforeTail.x - afterTail.x) == 2) {
                    drawRotated(player.canvas.body,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (Math.abs(beforeTail.y - afterTail.y) == 2) {
                    drawRotated(player.canvas.body,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }

                if (beforeTail.x < tailX && afterTail.y < tailY) { //Right And Top
                    if (beforeTail.x == 0 && afterTail.x > 1)
                        drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if (afterTail.y == 0 && beforeTail.y > 1){
                        console.log("1.5")
                        drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    }
                    else
                        drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.x < tailX && afterTail.y > tailY) { //Right and Bottom
                    if (beforeTail.x == 0 && afterTail.x > 1)
                        drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if(afterTail.y == 0 && beforeTail.y > 1)
                        drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else
                        drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.x > tailX && afterTail.y < tailY) { //Left and top
                    if (beforeTail.x == gridX-1 && afterTail.x < gridX-2)
                        drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if (beforeTail.y == gridY-1 && afterTail.y < gridY-2)
                        drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else
                        drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.x > tailX && afterTail.y > tailY) { //Left and bottom
                    if (beforeTail.x == gridX-1 && afterTail.x < gridX-2)
                        drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if (beforeTail.y == gridY-1 && afterTail.y < gridY-2)
                        drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else
                        drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }

                if (beforeTail.y < tailY && afterTail.x < tailX) { //top and left
                    if (beforeTail.y == 0 && afterTail.y > 1)
                        drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if (beforeTail.x == 0 && afterTail.x > 1)
                        drawRotated(player.canvas.turn,"bottom",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else
                        drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.y < tailY && afterTail.x > tailX) { //Top and right
                    if (beforeTail.y == 0 && afterTail.y > 1)
                        drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if (beforeTail.x == 0 && afterTail.x > 1) 
                        drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else
                        drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.y > tailY && afterTail.x < tailX) { //Bottom and left
                    if (beforeTail.y == gridY-1 && afterTail.y < gridY-2)
                        drawRotated(player.canvas.turn,"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if (beforeTail.x == gridX-1 && afterTail.x < gridX-2)
                        drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else
                        drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.y > tailY && afterTail.x > tailX) { //Bottom and right
                    if (beforeTail.y == gridY-1 && afterTail.y < gridY-2)
                        drawRotated(player.canvas.turn,"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else if (beforeTail.x == gridX-1 && afterTail.x < gridX-2)
                        drawRotated(player.canvas.turn,"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                    else
                        drawRotated(player.canvas.turn,"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }

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
}
function growPlayer(player,grow) {
    player.growTail = grow;
}


function movePlayers() {
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player.isDead){
            continue;
        }
        if (player.moveTik >= player.moveSpeed)
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
                updateCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y});
                player.tail.pop();
            }
            if (player.tail.length > 0)
                updateCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y});

            updateCells.push({
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
            let mapItem = map[player.pos.y][player.pos.x];
            if (mapItem.pickUp) {
                let pickedUpItem = false;
                findingEmptyItemSlot: for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                    if (player.items[k] == "empty") {
                        player.items[k] = mapItem;
                        if (mapItem.onEat_deleteMe == true) {
                            map[player.pos.y][player.pos.x] = getItem("air");
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
                        map[player.pos.y][player.pos.x] = getItem("air");
                    }
                    drawPlayerBox(player)
                }
            } else {
                if (mapItem.canEat == true) {
                    useItemHelper(player,mapItem);
                }
                if (mapItem.onEat_deleteMe == true) {
                    map[player.pos.y][player.pos.x] = getItem("air");
                }
            }
            
            //Check for Collisions
            for (let a = 0; a < players.length; a++){
                let checkedPlayer = players[a];
                if (checkedPlayer.isDead) continue;
                for(let b = 0; b < checkedPlayer.tail.length; b++){
                    let tailPiece = checkedPlayer.tail[b];
                    if (player.pos.x == tailPiece.x && player.pos.y == tailPiece.y)
                    {
                        deletePlayer(player);
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
}
function endScreen() {
    gameEnd = true;
    $(".endGamePopup").show("flex");
    let longestTail = players[0].longestTail;
    let timeSurvived = players[0].timeSurvived;
    let longestTailPlayer = players[0];
    let timeSurvivedPlayer = players[0];
    for (let i = 1; i < players.length; i++) {
        if (players[i].longestTail > longestTail) {
            longestTail = players[i].longestTail;
            longestTailPlayer = players[i];
        }
        if (players[i].timeSurvived > timeSurvived) {
            timeSurvived = players[i].timeSurvived;
            timeSurvivedPlayer = players[i];
        }
    }

    let minutes = (timeSurvived-(timeSurvived%60))/60;
    let seconds = timeSurvived%60;


    $(".longestTimePlayerImg").style.filter = `hue-rotate(${timeSurvivedPlayer.color}deg) sepia(${timeSurvivedPlayer.color2}%) contrast(${timeSurvivedPlayer.color3}%)`;
    $(".longestTailPlayerImg").style.filter = `hue-rotate(${longestTailPlayer.color}deg) sepia(${longestTailPlayer.color2}%) contrast(${longestTailPlayer.color3}%)`;
    $(".engGame_playerNameTime").innerHTML = timeSurvivedPlayer.name;
    $(".engGame_playerTime").innerHTML = minutes + ":" + seconds + " Minutes";
    $(".engGame_playerNameLength").innerHTML = longestTailPlayer.name;
    $(".engGame_playerLength").innerHTML = (longestTail+1) + " Length";
}
function deletePlayer(player){
    if (player.shield == 0){
        //Delete Tail
        for (let i = 0; i < player.tail.length; i++) {
            updateCells.push({
                x: player.tail[i].x,
                y: player.tail[i].y,
            })
        }
        //Delete Player
        player.isDead = true;
        player.timeSurvived = timer;
        drawPlayerBox(player)

        let playersDead = 0;
        for (let i = 0; i < players.length; i++) {
            if (players[i].isDead) playersDead++;
        }
        if (playersDead == players.length) {
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
            arr.push(getItem("air"));
        }
        map.push(arr);
    }
}
//adds movement to a queue of max 3 moves
document.body.onkeydown = function(e) {
    if (!isActiveGame) return;
    if (e.key !== "F5")
        e.preventDefault();

    for (let i = 0; i < players.length; i++) {
        let player = players[i];
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
    for (let i = 0; i < players.length; i++) {
        let player = players[i];

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
        currentGameMode.items[i].canvas = getCanvas($("item_" + currentGameMode.items[i].img.subset(0,".\\before")));
    }
}


function startGame() {
    setScene("game");
    $(".endGamePopup").hide();
    gameEnd = false;
    
    $("playerCardsHolder").innerHTML = "";
    $("playerCardsHolder").css({
        visibility: "visible",
    })
    //Resetting Players
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        //Ressurect Player
        player.isDead = false;
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
    }

    specialItemIteration = 0;

    setUpPlayerCanvas();
    setUpItemCanvas();

    newMap();
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
    timerInterval = setInterval(function() {
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
    
    production.renderPlayers.timeStart = performance.now();
    renderPlayers();
    production.renderPlayers.times.push(performance.now() - production.renderPlayers.timeStart);

    production.gameLoop.times.push(performance.now() - production.gameLoop.timeStart);

    updateProduction();
    if (!gameEnd) requestAnimationFrame(gameLoop);
}

function specialItemManager()
{
    if (specialItemIteration >= specialItemActiveChance)
    {
        let randomItem = rnd(1,12);
        specialItemIteration = 0;
        specialItemActiveChance = rnd(specialItemLowChance,specialItemHighChance);
        switch(randomItem)
        {
            case 1:
            case 2:
            case 3:
                spawn("turbo");
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                spawn("super_pellet");
                break;
            case 8:
            case 9:
                spawn("wall");
                break;
            case 10:
            case 11:
                spawn("bronzeShield");
                break;
            case 12:
                spawn("silverShield");
                break;
            default:
                console.log("No Item");
                break;
        }
    }
    else
    {
        specialItemIteration ++;
    }
}

setScene("menu")