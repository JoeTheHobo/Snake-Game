ls.setID("snakegame");

let players = [];
let gs_playerCount = 2;
let gridX = 50;
let gridY = 30;
let gridSize = 20;
let circleWalls = true;
let specialItemLowChance = 1;
let specialItemHighChance = 6;
let specialItemActiveChance = 4;
let specialItemIteration = 0;
let totalSpecialItems = 1;

//Setting Up Canvas
let canvas = $("game");
let ctx = canvas.getContext("2d");
function adjustCanvasSize() {
    let width = gridX * gridSize;
    let height = gridY * gridSize;
    canvas.width = width;
    canvas.height = height;
    canvas.css({
        width: width + "px",
        height: height + "px",
    })
}
//End Setting Up Canvas

//Load All Item Images
for (let i = 0; i < items.length; i++) {
    if (!items[i].img) continue;

    let img = $(".imageHolder").create("img");
    img.src = "img/" + items[i].img;
    img.id = "item_" + items[i].img.subset(0,".\\before");
}
//End Load All Item Images


function renderGame() {
    ctx.fillStyle = getItem("air").color;
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
        if (mapCell.img) {
            console.log();
            ctx.drawImage($("item_" + mapCell.img.subset(0,".\\before")),updateCells[i].x*gridSize,updateCells[i].y*gridSize,gridSize,gridSize);
        } else {
            ctx.fillStyle = mapCell.color;
            ctx.fillRect(updateCells[i].x*gridSize,updateCells[i].y*gridSize,gridSize,gridSize)
        }
    }
    updateCells = [];
}
function drawImage(image, direction, xPos, yPos, width, height) {
    if (direction == false) direction = "up";
    // Save the current canvas state
    ctx.save();

    // Translate the canvas to the position where the image will be drawn
    ctx.translate(xPos + width / 2, yPos + height / 2);

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
            ctx.restore();
            return;
    }

    // Rotate the canvas
    ctx.rotate((angle * Math.PI) / 180);

    // Draw the image centered at the translated position
    ctx.drawImage(image, -width / 2, -height / 2, width, height);

    // Restore the canvas state
    ctx.restore();
}

function renderPlayers() {
    for (let i = 0; i < players.length; i++) {
        let player = players[i];

        ctx.filter = `hue-rotate(${player.color}deg)`;

        drawImage($("img_snakeHead"),player.moving,player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);

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
                drawImage($("img_snakeTail"),direction,tailX*gridSize,tailY*gridSize,gridSize,gridSize);
            } else if (beforeTail.exist && afterTail.exist) {
                /* 
                    snakeTurn directions
                    up = Top - Right
                    left = Top - Left
                    right = Right - Bottom
                    down =  Bottom - Left
                */
                if (Math.abs(beforeTail.x - afterTail.x) == 2) {
                    drawImage($("img_snakeBody"),"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (Math.abs(beforeTail.y - afterTail.y) == 2) {
                    drawImage($("img_snakeBody"),"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }

                if (beforeTail.x < tailX && afterTail.y < tailY) { //Left and top
                    drawImage($("img_snakeTurn"),"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.x < tailX && afterTail.y > tailY) { //Left and Bottom
                    drawImage($("img_snakeTurn"),"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.x > tailX && afterTail.y < tailY) { //Right and top
                    drawImage($("img_snakeTurn"),"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.x > tailX && afterTail.y > tailY) { //Right and bottom
                    drawImage($("img_snakeTurn"),"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }

                if (beforeTail.y < tailY && afterTail.x < tailX) { //top and left
                    drawImage($("img_snakeTurn"),"left",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.y < tailY && afterTail.x > tailX) { //Top and right
                    drawImage($("img_snakeTurn"),"up",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.y > tailY && afterTail.x < tailX) { //Bottom and left
                    drawImage($("img_snakeTurn"),"down",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }
                if (beforeTail.y > tailY && afterTail.x > tailX) { //Bottom and right
                    drawImage($("img_snakeTurn"),"right",tailX*gridSize,tailY*gridSize,gridSize,gridSize);
                }

            } else {
                drawImage($("img_snakeBody"),direction,tailX*gridSize,tailY*gridSize,gridSize,gridSize);
            }
            
        }

    }
    
    ctx.filter = `none`;
}
function growPlayer(player,grow) {
    player.growTail = grow;
}

let keyBindVariable = [
    ["s","w","a","d","q","e"],
    ["5","8","4","6","7","9"],
];
let playerColors = ["0","90"
]


function movePlayers() {
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player.moveTik >= player.moveSpeed)
            {   
                if (player.turboActive == true)
                {
                    player.turboDuration --;
                    if (player.turboDuration <= 0) {
                        player.turboActive = false;
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

            ctx.fillStyle = map[player.pos.y][player.pos.x].color;
            ctx.fillRect(player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize);
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
            if (mapItem.canEat == true) {
                mapItem.onEat_func(player,i);
            }
            if (mapItem.onEat_deleteMe == true) {
                map[player.pos.y][player.pos.x] = getItem("air");
            }
            
            //Check for Collisions
            for (let a = 0; a < players.length; a++){
                let checkedPlayer = players[a];
                for(let b = 0; b < checkedPlayer.tail.length; b++){
                    let tailPiece = checkedPlayer.tail[b];
                    if (player.pos.x == tailPiece.x && player.pos.y == tailPiece.y)
                    {
                        deletePlayer(i, player);
                    }
                }
            }



        }
        else{
            player.moveTik ++;
        }        
    }
}

function deletePlayer(playerID, player){
    if (player.shield == false){
        if (playerID != 0)
            players.splice(playerID,playerID);
        else if (playerID == 0)
            players.shift();
            gs_playerCount --;
    }else{
        player.shield = false;
    }
}

function newPlayer(playerNumber) {
    let foundSpace = false;
    let startx,starty;
    let counter = 0;
    let gameCrashed = false;
    while (foundSpace == false)  {
        startx = rnd(gridX) - 1;
        starty = rnd(gridY) - 1;

        let foundPlayer = false;
        findingPlayer: for (let i = 0; i < players.length; i++) {
            if (players[i].pos.x == startx && players[i].pos.y == starty) {
                foundPlayer = true;
                break findingPlayer;
            }
        }
        if (!foundPlayer) {
            foundSpace = true;
        }
        counter++;
        if (counter > gridX * gridY) {
            //Table is full
            foundSpace = true;
            gameCrashed = true;
        }
    }
    if (gameCrashed) {
        console.log("Game Crashed")
        return;
    }

    
    let player = {
        downKey: keyBindVariable[playerNumber][0],
        upKey: keyBindVariable[playerNumber][1],
        leftKey: keyBindVariable[playerNumber][2],
        rightKey: keyBindVariable[playerNumber][3],
        useItem1: keyBindVariable[playerNumber][4],
        useItem2: keyBindVariable[playerNumber][5],
        color: playerColors[playerNumber],
        moving: false,
        growTail: 0,
        pos: {
            x: startx,
            y: starty, 
        },
        tail: [],
        moveQueue: [],
        prevMove: "start",
        moveTik: 0,
        moveSpeed: 6,
        turboDuration: 0,
        turboActive: false,
        shield: false,
    }
    players.push(player);
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
    }
}


function startGame() {
    setScene("game");
    players = [];
    for (let i = 0; i < gs_playerCount; i++){
        newPlayer(i);
    }

    newMap();
    adjustCanvasSize();

    spawn("pellet");
    spawn("pellet");
    spawn("pellet");


    renderGame();
    let gameLoop = setInterval(function() {
        renderCells();
        movePlayers();
        renderPlayers();
    },1000/60)


}

function specialItemManager()
{
    
    if (specialItemIteration >= specialItemActiveChance)
    {
        let randomItem = rnd(1,4);
        specialItemIteration = 0;
        specialItemActiveChance = rnd(specialItemLowChance,specialItemHighChance);
        switch(randomItem)
        {
            case 1:
                spawn("turbo");
                break;
            case 2:
                spawn("super_pellet");
                break;
            case 3:
                spawn("wall");
                break;
            case 4:
                spawn("shield");
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