// everything I've moved is down here
let playerNames1 = [
    "Squabbling", "Terrifying", "Witty", "Sassy", "Mysterious",
    "Jolly", "Spunky", "Clumsy", "Grumpy", "Cheeky",
    "Funky", "Zesty", "Breezy", "Quirky", "Snarky",
    "Boisterous", "Goofy", "Rambunctious", "Vivacious", "Frolicking"
];
let playerNames2 = [
    "Cheesecake", "Martian", "Taco", "Wombat", "Penguin",
    "Sasquatch", "Narwhal", "Donut", "Giraffe", "Unicorn",
    "Robot", "Ostrich", "Dragon", "Platypus", "Sloth",
    "Cactus", "Llama", "Cupcake", "Blobfish", "Banana"
];


/*
    _type v2 Documentation
    _type(object) return a string of whatever the object is
    Detailed is set to false, if you set it too true it will give you a detailed explanation of the type
    All Types
    ------------
    number
    string
    array
    object
    boolean
    number
    function
    HTMLElement
    class
    symbol
    bigint
    null
    undefined
*/
function _type(ele) {
    if (ele == null || ele == undefined) {
        obj = {
            type: ele+"",
            value: ele,
        }
        return obj
    }
    
    let returnName = ele.constructor.name;

    let returnObj = {
        type: ele.constructor.name.toLowerCase(),
        detailedType: ele.constructor.name,
        constructor: ele.constructor,
        value: ele,
        isNumber: false,
    }
    if (returnName == "HTMLElement") {
        returnObj.type = "htmlelement";
        returnObj.parent = ele.$P();
        returnObj.children = ele.children;
    }
    if (returnObj.type == "number") {
        returnObj.length = (ele + "").length;
        returnObj.isNumber = true;
    }
    if (returnObj.type == "array") {
        returnObj.length = ele.length;

        let foundType = false;
        searching: for (let i = 0; i < ele.length; i++) {
            if (foundType === false) foundType = _type(ele[i]).type;
            else {
                if (foundType !== _type(ele[i]).type) {
                    foundType = undefined;
                    break searching;
                }
            }
        }
        if (foundType === undefined) returnObj.arrayType = "mixed";
        if (foundType === false) returnObj.arrayType = "empty";
        if (foundType === "number") returnObj.arrayType = "number";
        if (foundType === "string") returnObj.arrayType = "string";
        if (foundType === "array") returnObj.arrayType = "array";
        if (foundType === "object") returnObj.arrayType = "object";
    }
    if (returnObj.type == "string") {
        returnObj.length = ele.length;
        returnObj.isNumber = !isNaN(ele);
        if (ele.includes(" ") || ele === "") returnObj.isNumber = false;

        returnObj.isUpperCase = ele.toUpperCase() == ele;
        returnObj.isLowerCase = ele.toLowerCase() == ele;

        returnObj.isColor = false;
        
        try {
            JSON.parse(ele);
            returnObj.isJSON = true;
        } catch {
            returnObj.isJSON = false;

        }

        //Testing If Color
        //Hex
        if (ele.charAt(0) == "#" && _type(ele.substring(1,ele.length)).isNumber && (ele.length == 4 || ele.length == 5 || ele.length == 7 || ele.length == 8)) {
            returnObj.isColor = true;
            returnObj.colorType = "hex";
            returnObj.colorObject = _color(ele);
        }  
        //other colors
        if (ele.charAt(ele.length-1) == ")" && ele.includes(",")) {
            let colorTypes = ["rgb","rgba","cmyk","hsl","hsla","ryb","ryba"];
            
            let pass = false, colorType;

            for (let i = 0; i < colorTypes.length; i++) {
                if (ele.substring(0,colorTypes[i].length+1).toLowerCase() == colorTypes[i] + "(") {
                    pass = true;
                    colorType = colorTypes[i];
                }
            }

            if (pass) {
                returnObj.isColor = true;
                returnObj.colorType = colorType;
                returnObj.colorObject = _color(ele);
            }
        }

    }

    return returnObj;
    
}

String.prototype.rnd = function(amt = false,l=[]) {
    for (let i = 0; i < amt; i++) {
        l.push(this.charAt(rnd(0,this.length - 1)));
    }
    return amt !== false ? l : this.charAt(rnd(0,this.length - 1));
}
Array.prototype.rnd = function(amt = false,l=[]) {
    for (let i = 0; i < amt; i++) {
        l.push(this[rnd(0,this.length - 1)]);
    }
    return amt !== false ? l : this[rnd(0,this.length - 1)];
}

function rnd(num,to,exp) {
    if (!isNaN(num)) {
        while (true) {
            if (!to && to !== 0) {
                to = num;
                num = 1;
            }
            let finalNum = Math.floor((Math.random() * (to - num + 1)) + num);
            let checked = true; 
            if (exp) {
                if (!exp.length) exp = [exp];
                for (let i = 0; i < exp.length; i++) {
                    if (exp[i] == finalNum) checked = false;
                }
            }
            if (checked || !exp) return finalNum;
        }
    }

    if (typeof num == 'string') {
        if ((num.toLowerCase() == 'letter' || num.toLowerCase() == 'abc') && to !== false) {
            let abc = 'abcdefghijklmnopqrstuvwxyz';
            if (num === 'LETTER' || num === 'ABC') return abc.rnd().toUpperCase();
            if (num === 'Letter' || num === 'Abc') return rnd(2) == 2 ? abc.rnd().toUpperCase() : abc.rnd();
            return abc.rnd();
        }

        if (num == 'color') {
            if (to == 'hex' || !to) {
                let tool = '0123456789abcdef';
                return '#' + tool.rnd() + tool.rnd() + tool.rnd() + tool.rnd() + tool.rnd() + tool.rnd();
            }
            if (to == 'rgb') return 'rgb(' + rnd(0,255) + ',' + rnd(0,255) + ',' + rnd(0,255) + ')';

            return console.warn('Invalid Coler Format, try "hex" or "rgb"');
        }

        //Return Random Letter In String Num
        return num.rnd();
    }
    if (typeof num == 'object') {
        return num.rnd();
    }
}




 
const express = require('express');
const app = express();

//socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000});


const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

const lobbies = [];
const onlineAccounts = {};


// function handleDeaths(deadPlayer){
//     io.emit("playerDied", deadPlayer);
// }

io.on('connection', (socket) => {
    console.log('a user connected');
    onlineAccounts [socket.id] = {
        id: socket.id,
        player: {
            downKey: "s",
            upKey: "w",
            leftKey: "a",
            rightKey: "d",
            useItem1: "q",
            useItem2: "e",
            fireItem: "r",
            name: playerNames1.rnd() + playerNames2.rnd(),
            color: rnd(360), //Hue
            color2: 0, //Brightness
            color3: 100, //Contrast
            moving: false,
            growTail: 0,
            isDead: false,
            pos: {
                x: false,
                y: false, 
            },
            tail: [],
            moveQueue: [],
            prevMove: "start",
            id: 0,
            whenInventoryIsFullInsertItemsAt: 0,
            moveTik: 0,
            moveSpeed: 6,
            longestTail: 0,
            timeSurvived: 0,
            turboDuration: 0,
            turboActive: false,
            shield: 0,
            items: [],
            status: [],
            active: true, 
        },
        gameModes: [],
        boards: [],
        lobby: false,
    }

    io.emit("updateLobbies", lobbies);
    io.emit('setPlayer', socket.id, onlineAccounts);
    io.emit('updatePlayers', onlineAccounts)
 
    //socket.emit communicates with the player that just connected, io.emit communicates with the whole lobby
    socket.on('disconnect', (reason) => {
        console.log("A user disconnected due to " + reason);
        onlineAccounts[socket.id].isDead = true;
        movePlayer();
        io.emit('updatePlayers', onlineAccounts);
        delete onlineAccounts[socket.id];
        //io.emit('updatePlayers', onlineAccounts);
    }) 

    socket.on("newLobby", (lobby) =>{
        lobbies.push(lobby);
        onlineAccounts[socket.id].lobby = lobby.id;
        io.emit("updateLobbies", lobbies);
    })

    socket.on("joinLobby",(lobbyID,playerID) => {
        if (socket.id !== playerID){
            socket.disconnect();
            return;
        }
        searchingLobbies: for (let i = 0; i < lobbies.length; i++) {
            let lobby = lobbies[i];
            if (lobbyID === lobby.id) {
                if (lobby.playerCount + 1 <= lobby.playerMax) {
                    lobby.playerCount++;
                    lobby.players.push(playerID);
                    onlineAccounts[socket.id].lobby =  lobby.id
                    io.emit("updateLobbies", lobbies, "joining", lobby);
                }
                break searchingLobbies;
            }
        }
    })
    socket.on("startGame", () =>{
        console.log("Server Started")
        searchingLobbies: for (let p = 0; p < lobbies.length; p++) {
            let lobby = lobbies[p];
            if (onlineAccounts[socket.id].lobby === lobby.id) {
                if(lobby.host !== socket.id) continue
                
                

                lobby.board.map = structuredClone(lobby.board.originalMap);

                
                lobby.doColorRender = false;
                lobby.specialItemIteration = 0;
                lobby.isActiveGame = true; 
                lobby.updateCells = [];



                //Resetting Players
                for (let i = 0; i < lobby.players.length; i++) {
                    let player = onlineAccounts[lobby.players[i]].player;
                    player.isPlayer = true;
                    //Ressurect Player
                    player.isDead = false;
                    player.justDied = false;
                    player.bodyArmor = 1;
                    //Set Player Selecting Item To 1
                    player.selectingItem = 0;
                    player.justTeleported = false;
                    //Set Player Item Usage
                    player.howManyItemsCanIUse = lobby.gameMode.howManyItemsCanPlayersUse;
                    player.whenInventoryIsFullInsertItemsAt = 0;
                    player.status = ["player_" + i];
                    //Set All Player Items To Empty
                    player.items = [];
                    for (let j = 0; j < lobby.gameMode.howManyItemsCanPlayersUse; j++) {
                        player.items.push("empty");
                    }
                    //Draw Player's Card
                    //drawPlayerBox(player);  add later
                    //_________________________________________

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
                    //Spawn Players
                }


                let currentGameMode = lobby.gameMode;
                let currentBoard = lobby.board;
                let activePlayers = getPlayersList(lobby.players);

                for (let i = 0; i < lobby.players.length; i++) {
                    let player = onlineAccounts[lobby.players[i]].player;
                    let obj = spawn(currentGameMode,currentBoard,activePlayers,player);
                    player.pos.x = obj.x;
                    player.pos.y = obj.y;
                }

                for (let i = 0; i < lobby.gameMode.items.length; i++) {
                    let item = lobby.gameMode.items[i];
                    for (let j = 0; j < Number(item.onStartSpawn); j++) {
                        let obj = spawn(currentGameMode,currentBoard,activePlayers,item.name,false);

                        if (!Array.isArray(obj)) obj = [obj];

                        for (let k = 0; k < obj.length; k++) {
                            currentBoard.map[obj[k].y][obj[k].x].item = currentGameMode.items[obj[k].itemIndex];
                            lobby.updateCells.push({
                                x: obj[k].x,
                                y: obj[k].y,
                            })
                            if (obj[k].generateRandomItem) specialItemManager();
                        }
                    }
                }


                lobby.gameEnd = false;
                lobby.deltaTime = 0;
                lobby.lastTimestamp = 0;
                lobby.timer = 0;
                lobby.activePlayers = getPlayersList(lobby.players);
                lobby.boardStatusCount = 0;
                lobby.boardStatus = [];
                /*
                lobby.timerInterval = setInterval((lobby) => {
                    lobby.timer++;
                }, 1000);
                */

        

                io.emit("startingGame", lobby);
                break searchingLobbies;
            }
        }
    })
    socket.on("spawn",(name,generateRandomItem = true,counting = false) => {
        let lobby = findLobby(socket.id);
        let currentGameMode = lobby.gameMode;
        let currentBoard = lobby.board;
        let activePlayers = getPlayersList(lobby.players);

        console.log("NO GO");
        let obj = spawn(currentGameMode,currentBoard,activePlayers,name,generateRandomItem = true,counting = false);
        
        if (obj.isPlayer) {

        } else {

        }
    })
    socket.on("movePlayerKey",(direction) => {
        if (onlineAccounts[socket.id].player.moveQueue.length >= 4) return;
        onlineAccounts[socket.id].player.moveQueue.push(direction);

    })
    socket.on("updateLocalAccount",() => {
        let lobby = findLobby(socket.id);
        io.emit("updatedLocalAccount",{
            id: socket.id,
            isInGame: true,
            currentBoard: lobby.board,
            player: onlineAccounts[socket.id].player,
            playersInServer: lobby.activePlayers,
        })
    })
    socket.on("movePlayer",(playerID) => {
        if (playerID !== socket.id) return;
        let player = onlineAccounts[socket.id].player;

        let obj = movePlayer(player,findLobby(socket.id));

        let lobby = findLobby(socket.id);

        if (obj.updateCells.length > 0) console.log(obj.updateCells)

        io.emit("updatedLocalAccount",{
            id: socket.id,
            isInGame: true,
            currentBoard: lobby.board,
            player: player,
            playersInServer: lobby.activePlayers,
            updateSnakeCells: obj.updateSnakeCells,
            updateCells: obj.updateCells,
        })
        /*
        player.moveTik = obj.moveTik;
        player.moveSpeed = obj.moveSpeed;
        player.turboActive = obj.turboActive;
        player.turboDuration = obj.turboDuration;
        player.moveQueue = obj.moveQueue;
        player.moving = obj.moving;
        player.growTail = obj.growTail;
        player.tail = obj.tail;
        player.pos = obj.pos;
        player.justTeleported = obj.justTeleported;
        player.justDied = obj.justDied;
        */
    })
    console.log(onlineAccounts);
});


server.listen(port, () => {
    console.log('app listening on port' + port);
}) 



function growPlayer(player,grow) {
    player.growTail += grow;
}
function movePlayer(player,lobby) {
    if (player.isDead) return{
        updateSnakeCells: [],
        updateCells: [],
    };

    let updateSnakeCells = [];
    let updateCells = [];

    //Change Later
    deltaTime = 1;
    //

    if ((player.moveTik*deltaTime) >= (player.moveSpeed/lobby.board.map[player.pos.y][player.pos.x].tile.changePlayerSpeed)) {   
        if (player.turboActive == true) {
            player.turboDuration --;
            if (player.turboDuration <= 0) {
                player.turboActive = false;
                //removePlayerStatus(player,"turbo");
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
            
            let tail = player.tail[player.tail.length-1];
            if (lobby.board.map[tail.y][tail.x].item) {
                let mapItem = lobby.board.map[tail.y][tail.x].item;
                if (mapItem.canCollide) runItemFunction(player,mapItem,"offCollision");
            }
            
            player.tail.pop();
        } else {
            if (lobby.board.map[player.pos.y][player.pos.x].item) {
                let mapItem = lobby.board.map[player.pos.y][player.pos.x].item;
                if (mapItem.canCollide) runItemFunction(player,mapItem,"offCollision");
            }
        }
        if (player.tail.length > 0)
            updateSnakeCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y,player: player});

        

        updateSnakeCells.push({
            x: player.pos.x,
            y: player.pos.y,
            player: player
        })

        //Move Player and make sure he can't go back on himself
        if (player.moving == "left") player.pos.x--;
        if (player.moving == "right") player.pos.x++;
        if (player.moving == "up") player.pos.y--;
        if (player.moving == "down") player.pos.y++;

        //Teleport Player If Needed
        if (_type(player.justTeleported).type == "object") {
            deleteSnakeCells();
            player.pos.x = player.justTeleported.x;
            player.pos.y = player.justTeleported.y;
            player.justTeleported = true;
        }

        //Collision Testing
        //Test If Player Hits Wall
        if (player.pos.x > lobby.board.map[0].length-1) {
            player.pos.x = 0;
        }
        if (player.pos.x < 0) {
            player.pos.x = lobby.board.map[0].length-1;
        }
        if (player.pos.y > lobby.board.map.length-1) {
            player.pos.y = 0;
        }
        if (player.pos.y < 0) {
            player.pos.y = lobby.board.map.length-1;
        }

        //Test Item Underplayer
        updateCells = testItemUnderPlayer(player,lobby);
        
        //Check for Collisions
        let playersInServer = getPlayersList(lobby.players);
        for (let a = 0; a < playersInServer.length; a++){
            let checkedPlayer = playersInServer[a];
            if (checkedPlayer.isDead && lobby.gameMode.snakeVanishOnDeath == true) continue;
            for(let b = 0; b < checkedPlayer.tail.length; b++){
                let tailPiece = checkedPlayer.tail[b];
                if (player.pos.x == tailPiece.x && player.pos.y == tailPiece.y)
                {
                    deletePlayer(player,checkedPlayer);
                }
            }
        }
    }
    else {
        player.moveTik++;
    }

    return {
        updateSnakeCells: updateSnakeCells,
        updateCells: updateCells,
    }
}
function testItemUnderPlayer(player,lobby) {
    let mapItem = lobby.board.map[player.pos.y][player.pos.x].item;
    if (!mapItem) return [];
    let updateCells = [];

    if (mapItem.pickUp) {
        let pickedUpItem = false;
        findingEmptyItemSlot: for (let k = 0; k < lobby.gameMode.howManyItemsCanPlayersUse; k++) {
            if (player.items[k] == "empty") {
                player.items[k] = mapItem;
                //drawPlayerBox(player) ADD LATER
                pickedUpItem = true;
                break findingEmptyItemSlot;
            }
        }
        if (!pickedUpItem && lobby.gameMode.mode_whenInventoryFullWhereDoItemsGo !== "noPickUp") {
            if (lobby.gameMode.mode_whenInventoryFullWhereDoItemsGo == "select") {
                player.items[player.selectingItem] = mapItem;
            }
            if (lobby.gameMode.mode_whenInventoryFullWhereDoItemsGo == "recycle") {
                player.items[player.whenInventoryIsFullInsertItemsAt] = mapItem;
                player.whenInventoryIsFullInsertItemsAt++;
                if (player.whenInventoryIsFullInsertItemsAt > player.items.length-1) player.whenInventoryIsFullInsertItemsAt = 0;
            }
            //drawPlayerBox(player) ADD LATER
        }
    } else if (mapItem.canEat == true) {
        updateCells = useItemHelper(player,mapItem,lobby);
    }

    if (_type(mapItem.teleport).type == "number" && !player.justTeleported) {
        findingPortal: for (let z = 0; z < lobby.board.map.length; z++) {
            for (let h = 0; h < lobby.board.map[z].length; h++) {
                if (!lobby.board.map[z][h].item) continue;
                if (player.pos.x == h && player.pos.y == z) continue;
                if (lobby.board.map[z][h].item.teleport === mapItem.teleport) {
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
        runItemFunction(player,mapItem,"onCollision",lobby);
    }

    let itemIsDelete = false;
    let worldStatusPass = false;
    let boardStatusCount = 0;
    for (let i = 0; i < mapItem.boardDestructible.length; i++) {
        if (mapItem.boardDestructible[i] == "yes")  {
            boardStatusCount++;
            continue;
        }
        if (lobby.board.boardStatus.includes(mapItem.boardDestructible[i])) {
            for (let j = 0; j < lobby.board.boardStatus.length; j++) {
                if (lobby.board.boardStatus[j] === mapItem.boardDestructible[i]) boardStatusCount++;
            }
            continue;
        }
    }
    worldStatusPass = boardStatusCount >= Number(mapItem.boardDestructibleCountRequired);
    if (worldStatusPass) {
        checking: for (let i = 0; i < mapItem.destructible.length; i++) {
            let status = mapItem.destructible[i];
            let deleteMe = false;
            if (status === false) {
                itemIsDelete = true;
                break checking;
            }
            if (status == "yes") deleteMe = true;
            if (player.status.includes(status)) deleteMe = true;
    
            if (deleteMe) {
                itemIsDelete = true;
                //Hurt Player
                deletePlayer(player,lobby,false,mapItem);
    
                if (mapItem.deleteOnDestruct == false) {
                    break checking;
                }
    
                //Checking On Eat Delete Me Object From Item
                if (mapItem.onDelete) {
                    if (mapItem.onDelete.removeStatus.length > 0) {
                        for (let j = 0; j < mapItem.onDelete.removeStatus.length; j++) {
                            removePlayerStatus(player,mapItem.onDelete.removeStatus[j]); //ADD LATER
                        }
                    }    
                }
    
                //Delete Item
                lobby.board.map[player.pos.y][player.pos.x].item = false;
                updateCells.push({
                    x: player.pos.x,
                    y: player.pos.y,
                })
                break checking;
            }
        }
    }
    if (!itemIsDelete) deletePlayer(player,lobby);
    return updateCells;
}
function runItemFunction(player,item,type,lobby) {
    if (!type) return;

    let collision;
    if (type == "onCollision") collision = item.onCollision;
    if (type == "offCollision") collision = item.offCollision;

    if (!collision) return;

    if (item.switchStatus == false || item.switchStatus == undefined) {
        item.switchStatus = true;
    } else {
        item.switchStatus = false;
    }

    if (collision.switchImage) {
        if (item.switchStatus === true) {
            item.canvasTag = "_switch";
        } else {
            item.canvasTag = "";
        }
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
        if (collision.setBoardStatus == "player") status = "player_" + player.id;

        if (item.sendingBoardStatus === status) return;

        if (item.sendingBoardStatus !== false) {
            removeBoardStatus(item.sendingBoardStatus,player);
        }

        item.sendingBoardStatus = status;
        addBoardStatus(status,player);
    }
    if (collision.changeHue) {
        addItemCanvas(item,item.img,item.name + "_" + player.name,collision.changeHue,player);
        item.canvasTag = "_" + player.name; 

        updateCells.push({
            x: player.pos.x,
            y: player.pos.y,
        })
    }
}
function useItemHelper(player,item,lobby) {
    let updateCells = [];

    let onEat = item.onEat;
    if (onEat.growPlayer > 0) {
        growPlayer(player,onEat.growPlayer);
    }
    if (onEat.spawn) {
        let currentGameMode = lobby.gameMode;
        let currentBoard = lobby.board;
        let activePlayers = getPlayersList(lobby.players);

        for (let i = 0; i < onEat.spawn.length; i++) {
            for (let j = 0; j < onEat.spawn[i].count; j++) {
                spawn(currentGameMode,currentBoard,activePlayers,onEat.spawn[i].name);
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
        deletePlayer(player,undefined,item);
    }
    if (onEat.shield > 0) {
        player.shield = onEat.shield;
    }
    if (onEat.winGame === true) {
        endScreen(player);
    }
    if (onEat.canvasFilter.active == true) {
        ctx_players.filter = onEat.canvasFilter.filter;
        ctx_items.filter = onEat.canvasFilter.filter;
        for (let i = 0; i < localAccount.currentBoard.map.length; i++) {
            for (let j = 0; j < localAccount.currentBoard.map[0].length; j++) {
                let mapTile = localAccount.currentBoard.map[i][j].tile;
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

            for (let i = 0; i < localAccount.currentBoard.map.length; i++) {
                for (let j = 0; j < localAccount.currentBoard.map[0].length; j++) {
                    let mapTile = localAccount.currentBoard.map[i][j].tile;
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
    return updateCells;
}

function deletePlayer(player,lobby,playerWhoKilled,item,instaKill = false){
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
        player.timeSurvived = timer;
        drawPlayerBox(player)

        let playersDead = 0;
        for (let i = 0; i < activePlayers.length; i++) {
            if (activePlayers[i].isDead) playersDead++;
        }
        if (playersDead == activePlayers.length) {
            endScreen();
        }
        return;
    }

    /*
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
    */
}
////
function findLobby(playerID) {
    for (let i = 0; i < lobbies.length; i++) {
        for (let j = 0; j < lobbies[i].players.length; j++) {
            if (lobbies[i].players[j] === playerID) return lobbies[i];
        }
    }
}
function getPlayersList(playerIds) {
    let list = [];
    for (let i = 0; i < playerIds.length; i++) {
        if(!onlineAccounts[playerIds[i]])
            continue
        list.push(onlineAccounts[playerIds[i]].player)
    }
    return list;
}




function spawn(currentGameMode,currentBoard,activePlayers,name,generateRandomItem = true,counting = false) {
    let isPlayer = name.isPlayer;
    let itemIndex = false;
    let item;
    if (!isPlayer) {
        for (let i = 0; i < currentGameMode.items.length; i++) {
            if (currentGameMode.items[i].name == name) {
                itemIndex = i;
                item = currentGameMode.items[i];
            }
        }
        if (item.spawnCount == undefined) item.spawnCount = 1;
        if (counting == false) {
            let returnValue = [];
                
            for (let i = 0; i < item.spawnCount; i++) {
                returnValue.push(spawn(currentGameMode,currentBoard,activePlayers,name,generateRandomItem,true));
            }
            return returnValue;
        }
        if (item.spawnLimit !== false) item.spawnLimit--;
    }
        

    let counter = 0;
    let foundSpot = false;
    let x,y;
    while (foundSpot == false) {
        if (isPlayer) {
            
            findingExactSpawner: for (let k = 0; k < currentBoard.map.length; k++) {
                for (let j = 0; j < currentBoard.map[0].length; j++) {
                    if (currentBoard.map[k][j].item === false) continue;
                    if (currentBoard.map[k][j].item.spawnPlayerHere !== true) continue;
                    if (currentBoard.map[k][j].item.spawnPlayerID == "player" || currentBoard.map[k][j].item.spawnPlayerID === undefined) continue;
                    if (Number(currentBoard.map[k][j].item.spawnPlayerID.subset("_\\after","end")) !== Number(name.id)) continue;

                    let playerOnIt = false;
                    for (let i = 0; i < activePlayers.length; i++) {
                        if (activePlayers[i].pos.x == j && activePlayers[i].pos.y == k) playerOnIt = true;
                    }
                    if (playerOnIt) continue;

                    x = j;
                    y = k;
                    foundSpot = true;
                    break findingExactSpawner;
                    
                }
            }
            if (!foundSpot) {

                findingSpawner: for (let k = 0; k < currentBoard.map.length; k++) {
                    for (let j = 0; j < currentBoard.map[0].length; j++) {
                        if (currentBoard.map[k][j].item === false) continue;
                        if (currentBoard.map[k][j].item.spawnPlayerHere !== true) continue;
                        if (currentBoard.map[k][j].item.spawnPlayerID !== "player") continue;
                        
                        let playerOnIt = false;
                        for (let i = 0; i < activePlayers.length; i++) {
                            if (activePlayers[i].pos.x == j && activePlayers[i].pos.y == k) playerOnIt = true;
                        }
                        if (playerOnIt) continue;
                        
                        x = j;
                        y = k;
                        foundSpot = true;
                        break findingSpawner;
                    }
                }

                
                if (!foundSpot) {
                    findingSpawner: for (let k = 0; k < currentBoard.map.length; k++) {
                        for (let j = 0; j < currentBoard.map[0].length; j++) {
                            if (currentBoard.map[k][j].item === false) continue;
                            if (currentBoard.map[k][j].item.spawnPlayerHere !== true) continue;
                            let playerOnIt = false;
                            for (let i = 0; i < activePlayers.length; i++) {
                                if (activePlayers[i].pos.x == j && activePlayers[i].pos.y == k) playerOnIt = true;
                            }
                            if (playerOnIt) continue;
        
                            x = j;
                            y = k;
                            foundSpot = true;
                            break findingSpawner;
                        }
                    }
                }
            }
        }
        
        if (foundSpot === false) {
            x = rnd(currentBoard.map[0].length)-1;
            y = rnd(currentBoard.map.length)-1;
            if (currentBoard.map[y][x].item == false && currentBoard.map[y][x].tile.canSpawn) {
                foundSpot = true;
                checkingDistanceFromPlayersHead: for (let j = 0; j < activePlayers.length; j++) {
                    let distance = calculateDistance(activePlayers[j].pos.x,activePlayers[j].pos.y,x,y);
                    if (distance < 5) {
                        foundSpot = false;
                        break checkingDistanceFromPlayersHead;
                    }
                    for (let p = 0; p < activePlayers[j].tail.length; p++) {
                        if (activePlayers[j].tail[p].x == x && activePlayers[j].tail[p].y == y) {
                            foundSpot = false;
                            break checkingDistanceFromPlayersHead;
                        }
                    }
                }
            }
            counter++;
            if (counter > (currentBoard.map.length * currentBoard.map[0].length) ) {
                foundSpot = "couldn't find any";
            }
        }
    }

    if (foundSpot == "couldn't find any") {
        findingAnySpot: for (let k = 0; k < currentBoard.map.length; k++) {
            for (let j = 0; j < currentBoard.mapcurrentBoard.map[0].length; j++) {
                if (currentBoard.map[k][j].item == false && currentBoard.map[k][j].tile.canSpawn) {
                    let foundGoodSpot = true;
                    checkingDistanceFromPlayersHead: for (let j = 0; j < activePlayers.length; j++) {
                        let distance = calculateDistance(activePlayers[j].pos.x,activePlayers[j].pos.y,x,y);
                        if (distance < 5) {
                            foundGoodSpot = false;
                            break checkingDistanceFromPlayersHead;
                        }
                        for (let p = 0; p < activePlayers[j].tail.length; p++) {
                            if (activePlayers[j].tail[p].x == x && activePlayers[j].tail[p].y == y) {
                                foundGoodSpot = false;
                                break checkingDistanceFromPlayersHead;
                            }
                        }
                    }
                    if (foundGoodSpot) {{
                        x = j;
                        y = k;
                        foundSpot = true;
                        break findingAnySpot;
                    }}
                }
            }
        }
    }

    if (foundSpot == true) {
        if (isPlayer) {
            return {
                isPlayer: true,
                x: x,
                y: y,
            }
        } else {
            return {
                isPlayer: false,
                x: x,
                y: y,
                itemIndex: itemIndex,
                generateRandomItem: generateRandomItem,
            }
        }
    } else {
        console.log("No Available Spot To Spawn");
    }
};

function calculateDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function specialItemManager() {

}
