ls.setID("snakegame");

let html_board = $("game");
let players = [];
let gs_playerCount = 2;
let gridX = 50;
let gridY = 30;
let circleWalls = true;
let specialItemLowChance = 1;
let specialItemHighChance = 6;
let specialItemActiveChance = 4;
let specialItemIteration = 0;
let totalSpecialItems = 1;

function renderGame() {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            let mapItem = map[i][j];
            let html_table_cell = $("a" + i+"a"+j)
            
            html_table_cell.css({background: mapItem.color})
        }
    }
}
function renderPlayers() {
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        let html_table_cell = $("a" + player.pos.y+"a"+player.pos.x);

        html_table_cell.css({background: player.color})

        for (let i = 0; i < player.tail.length; i++) {
            $("a" + player.tail[i][1]+"a"+player.tail[i][0]).css({background: player.color})
        }

    }
}
function growPlayer(player,grow) {
    player.growTail = grow;
}

let keyBindVariable = [
    ["s","w","a","d","q","e"],
    ["5","8","4","6","7","9"],
];
let playerColors = ["white","grey"
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

                console.log(player.moving);

                player.moveQueue.shift();
            }
            //Growing/Moving Tail
            if (player.growTail > 0) {
                player.tail.unshift([player.pos.x,player.pos.y]);
                player.growTail--;
            } else if(player.tail.length > 0) {
                player.tail.unshift([player.pos.x,player.pos.y]);
                player.tail.pop();
            }
            //Move Player and make sure he can't go back on himself
            if (player.moving == "left") player.pos.x++;
            if (player.moving == "right") player.pos.x--;
            if (player.moving == "up") player.pos.y++;
            if (player.moving == "down") player.pos.y--;


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
                    if (player.pos.x == tailPiece[0] && player.pos.y == tailPiece[1])
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
function newMap(x,y) {
    map = [];
    html_board.innerHTML = "";

    for (let i = 0; i < y; i++) {
        let arr = [];
        let row = html_board.insertRow(0);
        for (let j = 0; j < x; j++) {
            arr.push(getItem("air"));
            let cell = row.insertCell(0);
            cell.id = "a" + i + "a" + j;
            cell.className = "tableCell";
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


function startGame(mapX,mapY) {
    players = [];
    for (let i = 0; i < gs_playerCount; i++){
        newPlayer(i);
    }

    newMap(mapX,mapY);


    spawn("pellet");
    spawn("pellet");
    spawn("pellet");



    let gameLoop = setInterval(function() {
        renderGame();
        movePlayers();
        renderPlayers();
    },1)


}

function specialItemManager()
{
    
    if (specialItemIteration >= specialItemActiveChance)
    {
        let randomItem = rnd(1,4);
        specialItemIteration = 0;
        console.log("here2");
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
        console.log("here1");
        specialItemIteration ++;
    }
}




startGame(gridX,gridY);