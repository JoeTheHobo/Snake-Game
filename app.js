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

//Subset v1
String.prototype.subset = function(start=0,end = undefined,...modifiers) {
    let startIndex = findIndex(this,start)
    let endIndex = findIndex(this,end);

    if (end === true) endIndex.index = this.length;
    if (end === false || end === undefined) endIndex.index = startIndex.index;
    if (endIndex.indexType == "count") endIndex.index = startIndex.index + endIndex.index;
    if (!isNaN(end) && !(end == true || end == false)) endIndex.index = end;

    if (startIndex.position == "full") startIndex.index -= startIndex.string.length - 1;

    //Return With Modifers
    let returnString = this.substring(startIndex.index,endIndex.index+1)
    let modObj = {
        length: returnString.length,
        trim: [],
        return: "string",
    }

    for (let i = 0; i < modifiers.length; i++) {
        let setting = modifiers[i].split("\\");
        setting[0] = setting[0].toLowerCase();
        if (setting[0] == "limit" || setting[0] == "length") modObj.length = Number(setting[1])
        if (setting[0] == "trim") modObj.trim.push(setting[1])
        if (setting[0] == "return") modObj.return = setting[1];
    }

    for (let i = 0; i < modObj.trim.length; i++) {
        returnString = returnString.replaceAll(modObj.trim[i],"");
    }

    if (modObj.return == "string")
        return returnString.substring(0,modObj.length);
    if (modObj.return == "number")
        return Number(returnString.substring(0,modObj.length));
}

String.prototype.orCompare = function(...compares) {
    for (let i = 0; i < compares.length; i++) {
        if (this.toString() === compares[i]) return true;
    }
    return false;
}
String.prototype.andCompare = function(...compares) {
    for (let i = 0; i < compares.length; i++) {
        if (this !== compares[i]) return false;
    }
    return true;
}
function findIndex(string,searchString) {
    let indexObj = {
        position: "on", //before/on/after/full
        indexType: "find",//index/count/find
        caseSensitive: true, //true/false
        add: 0, //Any Number
        index: searchString, 
        string: searchString,
    }
    searchingString: if (typeof searchString == "string") {

        let stringArr = searchString.split("\\");

        for (let i = 1; i < stringArr.length; i++) {
            //Fix abriviations
            if (stringArr[i] == "af") stringArr[i] = "after";
            if (stringArr[i] == "be") stringArr[i] = "before";
            if (stringArr[i] == "fu") stringArr[i] = "full";
            if (stringArr[i] == "in") stringArr[i] = "index";
            if (stringArr[i] == "co") stringArr[i] = "count";
            if (stringArr[i] == "fi") stringArr[i] = "find";

            //Find results
            if (stringArr[i].orCompare("after","before","on","full")) indexObj.position = stringArr[i];
            if (stringArr[i].orCompare("count","index")) indexObj.indexType = stringArr[i];
            if (stringArr[i].orCompare("ci","cs")) indexObj.caseSensitive = stringArr[i] == "cs" ? true : false;
            if (!isNaN(stringArr[i])) indexObj.add = Number(stringArr[i]);
        }

        indexObj.string = stringArr[0];

        if (indexObj.indexType === "count" || indexObj.indexType === "index") {
            searchString = Number(stringArr[0]);
            break searchingString;
        }

        if (indexObj.caseSensitive)
            searchString = string.indexOf(stringArr[0]);
        else
            searchString = string.toLowerCase().indexOf(stringArr[0].toLowerCase());

        if (stringArr[0] === "*end") {
            searchString = string.length-1;
        }

        if (searchString == -1) {
            searchString = string.length;
            break searchingString;
        }

        if (indexObj.position == "before") searchString -= 1;
        if (indexObj.position == "after") searchString += stringArr[0].length;
        if (indexObj.position == "full") searchString += stringArr[0].length-1;


    }
    indexObj.index = searchString + indexObj.add;

    return indexObj;
}
function s_shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
Array.prototype.shuffle = function() {
    return s_shuffle(this);
}
String.prototype.shuffle = function() {
    return s_shuffle(this.split('')).join("");
}
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




 
const { timeStamp } = require('console');
const express = require('express');
const app = express();

//socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 25000, pingTimeout: 60000});


const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

const lobbies = {};
const onlineAccounts = {};




io.on('connection', (socket) => {
    console.log('a user connected');
    onlineAccounts[socket.id] = {
        id: socket.id,
        players: [ {
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
                x: 0,
                y: 0, 
            },
            tail: [],
            moveQueue: [],
            prevMove: "start",
            id: Date.now(),
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
            active: false, 
        }],
        selectedPlayerIndex: 0,
        player: false,
        gameModes: [],
        boards: [],
        lobby: false,
    }
    io.emit("updateLobbies", lobbies);
    io.emit('setPlayer', socket.id, onlineAccounts);
    io.emit('updatePlayers', onlineAccounts)

    socket.on("ping", () => {
        console.log(`Ping received from ${socket.id}`);
    });
    //socket.emit communicates with the player that just connected, io.emit communicates with the whole lobby
    socket.on('disconnect', (reason) => {
        console.log("A user disconnected due to " + reason);
        if (onlineAccounts[socket.id].lobby) {
            let lobby = lobbies[onlineAccounts[socket.id].lobby];
            let player = onlineAccounts[socket.id].player;

            for (let i = 0; i < lobby.activePlayers.length; i++) {
                if (lobby.activePlayers[i].id === player.id) lobby.activePlayers.splice(i,1); 
            }
            for (let i = 0; i < lobby.players.length; i++) {
                if (lobby.players[i].id === socket.id) lobby.players.splice(i,1); 
            }
        }
        
        io.emit("kickPlayer");
        delete onlineAccounts[socket.id];
        //io.emit('updatePlayers', onlineAccounts);
    }) 

    socket.on("newLobby", (lobby) =>{
        lobbies[lobby.id] = lobby;
        onlineAccounts[socket.id].lobby = lobby.id;
        io.emit("updateLobbies", lobbies);
    })

    socket.on("joinLobby",(lobbyID,playerID) => {
        if (socket.id !== playerID){
            socket.disconnect();
            return;
        }
        let lobby = lobbies[lobbyID];
        if (lobby.playerCount + 1 <= lobby.playerMax) {
            lobby.playerCount++;
            lobby.players.push(playerID);
            onlineAccounts[socket.id].lobby =  lobby.id;
            onlineAccounts[socket.id].player = structuredClone(onlineAccounts[socket.id].players[onlineAccounts[socket.id].selectedPlayerIndex]);
            io.emit("updateLobbies", lobbies, "joining", lobby);
        }
    })
    socket.on("startGame", () =>{
        console.log("Server Started")
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        lobby.board.map = structuredClone(lobby.board.originalMap);

        
        lobby.board.doColorRender = false;
        lobby.specialItemIteration = 0;
        lobby.specialItemActiveChance = 4;
        lobby.specialItemLowChance = 1;
        lobby.specialItemHighChance = 6;
        lobby.board.isActiveGame = true; 
        lobby.updateCells = [];
        lobby.updateSnakeCells = [];
        lobby.updatePoints = [];
        lobby.board.renderEmotesList = [];
        lobby.board.location_tunnels = [];
        lobby.board.location_status = [];
        lobby.board.location_spawns = [];
        lobby.board.boardStatus = [];




        //Resetting Players
        for (let i = 0; i < lobby.players.length; i++) {
            if (!onlineAccounts[lobby.players[i]].player) onlineAccounts[lobby.players[i]].player = onlineAccounts[lobby.players[i]].players[onlineAccounts[lobby.players[i]].selectedPlayerIndex]
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
            player.status = ["status_white"];
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

        lobby.activePlayers = getPlayersList(lobby.players);

        fixItemDifferences(lobby.board,lobby.board.map);
        fixTileDifferences(lobby.board,lobby.board.map);

        for (let i = 0; i < lobby.players.length; i++) {
            let player = onlineAccounts[lobby.players[i]].player;
            spawn(lobby,player);
        }

        for (let i = 0; i < lobby.gameMode.items.length; i++) {
            let item = lobby.gameMode.items[i];
            for (let j = 0; j < Number(item.onStartSpawn); j++) {
                spawn(lobby,item.name,false);
            }
        }


        lobby.gameEnd = false;
        lobby.deltaTime = 0;
        lobby.lastTimestamp = Date.now();
        lobby.updateTimeStamp = Date.now();
        lobby.updatePositionTimeStamp = Date.now();
        lobby.timer = 0;
        lobby.boardStatusCount = 0;
        lobby.boardStatus = [];

        io.emit("startingGame", lobby,onlineAccounts[socket.id].player);
        io.emit("updatePositions",{
            activePlayers: lobby.activePlayers,
            updateSnakeCells: lobby.updateSnakeCells,
            deltaTime: 1,
            player: onlineAccounts[socket.id].player,
        })
        lobby.gameLoop = function() {
            let timestamp = Date.now();
            this.deltaTime = (timestamp - this.lastTimestamp) / (1000/60);
            server_movePlayers(this)
            this.lastTimestamp = timestamp;

            if (timestamp - this.updateTimeStamp >= 200) { // Every 200ms
                if (onlineAccounts[socket.id]) {
                    io.emit("updatedLocalAccount",{
                        id: socket.id,
                        isInGame: true,
                        board: this.board,
                        updateCells: this.updateCells,
                    })
                }
                this.updateTimeStamp = timestamp;
                this.updateCells = [];
            }

            if (timestamp - this.updatePositionTimeStamp >= 100) { // Every 200ms
                if (onlineAccounts[socket.id]) {
                    io.emit("updatePositions",{
                        activePlayers: this.activePlayers,
                        updateSnakeCells: this.updateSnakeCells,
                        deltaTime: this.deltaTime,
                        player: onlineAccounts[socket.id].player,
                        dontSend: true,
                    })
                }
                this.updatePositionTimeStamp = timestamp;
                this.updateSnakeCells = [];
            }
            


            if (!this.gameEnd) {
                setTimeout(() => this.gameLoop(), Math.max(0, (1000/60) - (Date.now() - timestamp)));
            } else {
                this.isActiveGame = false;

                //Kill Any Non Dead Snakes
                for (let i = 0; i < this.activePlayers.length; i++) {
                    if (!this.activePlayers[i].isDead) {
                        deletePlayer(this,this.activePlayers[i],false,false,true);
                    }
                }

                let longestTail = this.activePlayers[0].longestTail;
                let timeSurvived = this.activePlayers[0].timeSurvived;
                let mostKills = this.activePlayers[0].playerKills;
                let longestTailPlayer = this.activePlayers[0];
                let timeSurvivedPlayer = this.activePlayers[0];
                let mostKillsPlayer = this.activePlayers[0];
                for (let i = 1; i < this.activePlayers.length; i++) {
                    if (this.activePlayers[i].longestTail > longestTail) {
                        longestTail = this.activePlayers[i].longestTail;
                        longestTailPlayer = this.activePlayers[i];
                    }
                    if (this.activePlayers[i].timeSurvived > timeSurvived) {
                        timeSurvived = this.activePlayers[i].timeSurvived;
                        timeSurvivedPlayer = this.activePlayers[i];
                    }
                    if (this.activePlayers[i].playerKills > mostKills) {
                        mostKills = this.activePlayers[i].mostKills;
                        mostKillsPlayer = this.activePlayers[i];
                    }
                }

                let minutes = (timeSurvived-(timeSurvived%60))/60;
                let seconds = timeSurvived%60;

                if ((seconds + "").length == 1) seconds = "0" + seconds;

                io.emit("endGame",{
                    lobby: this,
                    longestTail: longestTail,
                    timeSurvived: timeSurvived,
                    longestTailPlayer: longestTailPlayer,
                    timeSurvivedPlayer: timeSurvivedPlayer,
                    mostKillsPlayer: mostKillsPlayer,
                    minutes: minutes,
                    seconds: seconds,
                })
            }
        }
        /*
        lobby.timerLoop = function() {
            setTimeout(() => {
                this.timer++;
                this.timerLoop();
            },1000)
        }
        */
        lobby.gameLoop();
        //lobby.timerLoop();

    })
    socket.on("movePlayerKey",(direction) => {
        if (onlineAccounts[socket.id].player.moveQueue.length >= 4) return;
        onlineAccounts[socket.id].player.moveQueue.push(direction);
    })
    socket.on("fireItem",() => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        let player = onlineAccounts[socket.id].player;
        useItem(lobby,player);
    })
    socket.on("changeItem",(change) => {
        let player = onlineAccounts[socket.id].player;
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        let currentGameMode = lobby.gameMode;
        player.selectingItem += change;
        if (player.selectingItem < 0) player.selectingItem = currentGameMode.howManyItemsCanPlayersUse-1;
        if (player.selectingItem > currentGameMode.howManyItemsCanPlayersUse-1) player.selectingItem = 0;
    })
    console.log(Object.keys(onlineAccounts).length);
});


server.listen(port, () => {
    console.log('app listening on port' + port);
}) 




//Copying From Functions.js
function getItem(lobby,name) {
    let currentGameMode = lobby.gameMode;
    for (let i = 0; i < currentGameMode.items.length; i++) {
        if (currentGameMode.items[i].name == name) {
            return structuredClone(currentGameMode.items[i]);
        }
    }
}
function findPlayersTeam(player) {
    for (let i = 0; i < player.status.length; i++) {
        if (player.status[i].subset(0,5) == "status") return player.status[i].subset("_\\after","end");
    }
}
function calculateDistance(currentBoard,x1, y1, x2, y2, boardLength, boardHeight) {
    boardLength = currentBoard.map[0].length;
    boardHeight = currentBoard.map.length;
    let dx = Math.min(Math.abs(x1 - x2), boardLength - Math.abs(x1 - x2));
    let dy = Math.min(Math.abs(y1 - y2), boardHeight - Math.abs(y1 - y2));
    return dx + dy;
}
function fixItemDifferences(currentBoard,map) {
    if (!currentBoard.itemDifferences) return;
    for (let i = 0; i < currentBoard.itemDifferences.length; i++) {
        let e = currentBoard.itemDifferences[i];
        let d = {
            differences: e[0],
            x: e[1],
            y: e[2],
        }
        let pos = structuredClone(map[d.y][d.x].item);
        if (!pos) continue;
        for (let j = 0; j < d.differences.length; j++) {
            let change = d.differences[j];
            if (change.length == 4) {
                pos[change[0]][change[1]][change[2]] = change[3];
            }
            if (change.length == 3) {
                pos[change[0]][change[1]] = change[2];
            }
            if (change.length == 2) {
                pos[change[0]] = change[1];
            }
        }
        map[d.y][d.x].item = pos;
        for (let i = 0; i < currentBoard.location_spawns.length; i++) {
            if (d.y == currentBoard.location_spawns[i].y && currentBoard.location_spawns[i].x == d.x) {
                currentBoard.location_spawns[i].item = map[d.y][d.x].item;
            }
        }
    }
}
function fixTileDifferences(currentBoard,map) {
    if (!currentBoard.tileDifferences) return;
    for (let i = 0; i < currentBoard.tileDifferences.length; i++) {
        let e = currentBoard.tileDifferences[i];
        let d = {
            differences: e[0],
            x: e[1],
            y: e[2],
        }
        let pos = structuredClone((map[d.y][d.x].tile));
        if (!pos) continue;
        for (let j = 0; j < d.differences.length; j++) {
            let change = d.differences[j];
            if (change.length == 4) {
                pos[change[0]][change[1]][change[2]] = change[3];
            }
            if (change.length == 3) {
                pos[change[0]][change[1]] = change[2];
            }
            if (change.length == 2) pos[change[0]] = change[1];
        }
        map[d.y][d.x].tile = pos;
    }
}
function spawn(lobby,name,generateRandomItem = true,counting = false,playAudio = true) {
    let currentGameMode = lobby.gameMode;
    let currentBoard = lobby.board;
    let activePlayers = lobby.activePlayers; 
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
            for (let i = 0; i < item.spawnCount; i++) {
                spawn(lobby,name,generateRandomItem,true,playAudio);
            }
            return;
        }
        if (item.spawnLimit !== false) item.spawnLimit--;
    }
        
    let counter = 0;
    let foundSpot = false;
    let x,y,team = "white";
    let allSpawns = currentBoard.location_spawns.shuffle();
    while (foundSpot == false) {
        if (isPlayer) {
            findingSpawner: for (let k = 0; k < allSpawns.length; k++) {
                let playerOnIt = false;
                for (let i = 0; i < activePlayers.length; i++) {
                    if (activePlayers[i].pos.x == allSpawns[k].x && activePlayers[i].pos.y == allSpawns[k].y) playerOnIt = true;
                }
                if (playerOnIt) continue;

                let playerTeam = findPlayersTeam(name);
                let spawnTeam = allSpawns[k].item.spawnPlayerTeam || "white";

                if (playerTeam !== "white" && spawnTeam !== playerTeam) continue;
                
                x = allSpawns[k].x;
                y = allSpawns[k].y;
                team = playerTeam !== "white" ? playerTeam : spawnTeam;
                foundSpot = true;
                break findingSpawner;
            }
        }
        
        if (foundSpot === false) {
            x = rnd(currentBoard.map[0].length)-1;
            y = rnd(currentBoard.map.length)-1;
            if (currentBoard.map[y][x].item == false && currentBoard.map[y][x].tile.canSpawn) {
                foundSpot = true;
                checkingDistanceFromPlayersHead: for (let j = 0; j < activePlayers.length; j++) {
                    let distance = calculateDistance(currentBoard,activePlayers[j].pos.x,activePlayers[j].pos.y,x,y);
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
            for (let j = 0; j < currentBoard.map[0].length; j++) {
                if (currentBoard.map[k][j].item == false && currentBoard.map[k][j].tile.canSpawn) {
                    let foundGoodSpot = true;
                    checkingDistanceFromPlayersHead: for (let j = 0; j < activePlayers.length; j++) {
                        let distance = calculateDistance(currentBoard,activePlayers[j].pos.x,activePlayers[j].pos.y,x,y);
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
            name.pos.x = x;
            name.pos.y = y;
            addPlayerStatus(lobby,name,"status_" + team);
        } else {
            //runItemFunction(name,currentGameMode.items[itemIndex],"onSpawn",{x:x,y:y},{playAudio: playAudio});
            currentBoard.map[y][x].item = structuredClone(currentGameMode.items[itemIndex]);
            currentBoard.map[y][x].item.pos = {
                x: x,
                y: y,
            }
            lobby.updateCells.push({
                x: x,
                y: y,
            })
            if (item.pack == "Tunnels") {
                currentBoard.location_tunnels.push(
                    {
                        x: x,
                        y: y,
                        name: item.name,
                    }
                )
            }
            if (generateRandomItem && item.onEat?.spawnRandomItem) specialItemManager(lobby);
        }
    } else {
        console.log("No Available Spot To Spawn");
    }
};

//Copied From Main.js
function useItem(lobby,player) {
    if (player.status.includes(player.items[player.selectingItem].img)) return;
    
    let item = player.items[player.selectingItem];
    if (item == "empty") return;
    if (item.cantUseIfStatus.length > 0) {
        for (let i = 0; i < item.cantUseIfStatus.length; i++) {
            let id = item.cantUseIfStatus[i];
            if (player.status.includes(id)) return;
        }
    }
    
    runItemFunction(lobby,player,player.items[player.selectingItem],"onEat");
    player.items[player.selectingItem] = "empty";
}
function specialItemManager(lobby) {
    let specialItemIteration = lobby.specialItemIteration;
    let specialItemActiveChance = lobby.specialItemActiveChance;
    let currentGameMode = lobby.gameMode;
    let specialItemLowChance = lobby.specialItemLowChance;
    let specialItemHighChance = lobby.specialItemHighChance;

    if (specialItemIteration >= specialItemActiveChance) {
        specialItemIteration = 0;
        lobby.specialItemActiveChance = rnd(specialItemLowChance,specialItemHighChance);
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
                spawn(lobby,item.name);
                break findingItem;
            }
        }

    } else {
        lobby.specialItemIteration++;
    }
}
function deletePlayer(lobby,player,playerWhoKilled,item,instaKill = false){
    let currentGameMode = lobby.gameMode;
    let activePlayers = lobby.activePlayers;

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
                lobby.updateSnakeCells.push({
                    x: player.tail[i].x,
                    y: player.tail[i].y,
                })
            }
        }

        //Delete Player
        player.isDead = true;
        player.justDied = true;

        if (!currentGameMode.respawn) {
            player.timeSurvived = lobby.timer;
            let playersDead = 0;
            for (let i = 0; i < activePlayers.length; i++) {
                if (activePlayers[i].isDead) playersDead++;
            }
            if (playersDead == activePlayers.length) {
                lobby.gameEnd = true;
            }
        } else {
            setTimeout(function() {
                respawnPlayer(lobby,player,currentGameMode.respawnGrowth);
            },currentGameMode.respawnTimer * 1000);
        }
        return;
    }

    if (player.shield == 2) {
        removePlayerStatus(lobby,player,"silverShield");
        removePlayerStatus(lobby,player,"bronzeShield");
        removePlayerStatus(lobby,player,"goldShield");

        addPlayerStatus(lobby,player,"silverShield");
    }
    if (player.shield == 1) {
        removePlayerStatus(lobby,player,"silverShield");
        removePlayerStatus(lobby,player,"bronzeShield");
        removePlayerStatus(lobby,player,"goldShield");

        addPlayerStatus(lobby,player,"bronzeShield");
    }
    if (player.shield == 0) {
        removePlayerStatus(lobby,player,"silverShield");
        removePlayerStatus(lobby,player,"bronzeShield");
        removePlayerStatus(lobby,player,"goldShield");
    }
}
function growPlayer(player,grow) {
    player.growTail += grow;
}
function testItemUnderPlayer(lobby,player) {
    let currentGameMode = lobby.gameMode;
    let currentBoard = lobby.board;
    let mapItem = currentBoard.map[player.pos.y][player.pos.x].item;
    if (!mapItem) return;
    if (mapItem.pickUp) {
        let pickedUpItem = false;
        findingEmptyItemSlot: for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
            if (player.items[k] == "empty") {
                player.items[k] = mapItem;
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
        }
    } else if (mapItem.canEat == true) {
        runItemFunction(lobby,player,mapItem,"onEat");
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
        if (pass) runItemFunction(lobby,player,mapItem,"onCollision");
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
                deletePlayer(lobby,player,false,mapItem);
    
                if (mapItem.deleteOnDestruct == false) {
                    break checking;
                }
    
                //Checking On Eat Delete Me Object From Item
                if (mapItem.onDelete) {
                    if (mapItem.onDelete.removeStatus.length > 0) {
                        for (let j = 0; j < mapItem.onDelete.removeStatus.length; j++) {
                            removePlayerStatus(lobby,player,mapItem.onDelete.removeStatus[j]);
                        }
                    }    
                }
    
                //Delete Item
                currentBoard.map[player.pos.y][player.pos.x].item = false;
                lobby.updateCells.push({
                    x: player.pos.x,
                    y: player.pos.y,
                })
                break checking;
            }
        }
    }
    if (!itemIsDelete) deletePlayer(lobby,player);
}
function runItemFunction(lobby,player,item,type,itemPos,settings = {playAudio: true}) {
    let currentBoard = lobby.board;
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
        lobby.updateCells.push({
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

        lobby.updateCells.push({
            x: player.pos.x,
            y: player.pos.y,
        })
    }
    if (collision.growPlayer > 0) {
        growPlayer(player,collision.growPlayer);
    }
    if (collision.spawn) {
        for (let i = 0; i < collision.spawn.length; i++) {
            for (let j = 0; j < collision.spawn[i].count; j++) {
                spawn(lobby,collision.spawn[i].name);
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
            addPlayerStatus(lobby,player,collision.addStatus[i])
        }
    }
    if (collision.removeStatus) {
        for (let i = 0; i < collision.removeStatus.length; i++) {
            removePlayerStatus(lobby,player,collision.removeStatus[i])
        }
    }
    if (collision.deletePlayer) {
        deletePlayer(lobby,player,undefined,item);
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
                lobby.updateCells.push({
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
                    lobby.updateCells.push({
                        x: j,
                        y: i,
                    })
                }
            }
            doColorRender = true;
        },collision.canvasFilter.duration)
    }
}
function addPlayerStatus(lobby,player,itemName) {
    if (itemName.subset(0,5) == "status") {
        removePlayerStatus(lobby,player,"teamColor");
        player.status.push(itemName);
    } else {
        player.status.push(getItem(lobby,itemName).name);
    }
}
function removePlayerStatus(lobby,player,itemName) {
    if (itemName == "teamColor") {
        findingStatus: for (let i = 0; i < player.status.length; i++) {
            if (player.status[i].subset(0,5) == "status") {
                player.status.splice(i,1);
                break findingStatus;
            }
        }
    } else {
        findingStatus: for (let i = 0; i < player.status.length; i++) {
            if (player.status[i] == getItem(lobby,itemName).name) {
                player.status.splice(i,1);
                break findingStatus;
            }
        }
    }
}

//From Appj.js
function getPlayersList(playerIds) {
    let list = [];
    for (let i = 0; i < playerIds.length; i++) {
        list.push(onlineAccounts[playerIds[i]].player)
    }
    return list;
}

function server_movePlayers(lobby) {
    activePlayers = lobby.activePlayers;
    let currentBoard = lobby.board;
    let currentGameMode = lobby.gameMode;
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        
        if (player.isDead) continue;
        if ((player.moveTik*lobby.deltaTime) < (player.moveSpeed/currentBoard.map[player.pos.y][player.pos.x].tile.changePlayerSpeed)) {   
            player.moveTik++;
            continue;
        }

        if (player.turboActive == true) {
            player.turboDuration --;
            if (player.turboDuration <= 0) {
                player.turboActive = false;
                removePlayerStatus(lobby,player,"turbo");
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
            //deleteSnakeCells(); Add Later?
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
            if (player.pos.x > maxX) { cameraQuickZoom = "right"; player.pos.x = 0; }
            else if (player.pos.x < 0) { cameraQuickZoom = "left"; player.pos.x = maxX; }

            if (player.pos.y > maxY) { cameraQuickZoom = "bottom"; player.pos.y = 0; }
            else if (player.pos.y < 0) { cameraQuickZoom = "top"; player.pos.y = maxY; }
        }

        //Check for Player Collisions
        if (currentGameMode.snakeCollision) {
            let occupiedPositions = new Set();
        
            // Step 1: Populate occupiedPositions with all players' tails & positions
            for (let a = 0; a < activePlayers.length; a++) {
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
                deletePlayer(lobby,player);
            }
        }
        //Test Item Underplayer
        if (!player.isDead) testItemUnderPlayer(lobby,player);

        if (!player.isDead) {
            //Test Tile UnderPlayer
            let mapTile = currentBoard.map[player.pos.y][player.pos.x].tile;
            if (mapTile.onOver) runItemFunction(lobby,player,mapTile,"onOver");

            //Growing/Moving Tail
            let playerX = playerOldPos.x;
            let playerY = playerOldPos.y;

            if (player.growTail > 0) {
                player.tail.unshift({
                    x: playerX,
                    y: playerY,
                    direction: player.moving,
                });
                //drawPlayerBox(player); //REALLY LAGGY We should Update that specific part of their card.
                player.growTail--;
                if (player.tail.length > player.longestTail) player.longestTail = player.tail.length;
            } else if(player.tail.length > 0) {
                player.tail.unshift({
                    x: playerX,
                    y: playerY,
                    direction: player.moving,
                });
                lobby.updateSnakeCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y});
                

                let tail = player.tail[player.tail.length-1];
                if (currentBoard.map[tail.y][tail.x].item) {
                    let mapItem = currentBoard.map[tail.y][tail.x].item;
                    if (mapItem.canCollide) runItemFunction(lobby,player,mapItem,"offCollision");
                }
                
                player.tail.pop();
            } else {
                if (currentBoard.map[playerY][playerX].item) {
                    let mapItem = currentBoard.map[playerY][playerX].item;
                    if (mapItem.canCollide) runItemFunction(lobby,player,mapItem,"offCollision");
                }
            }
            if (player.tail.length > 0)
                lobby.updateSnakeCells.push({x: player.tail[player.tail.length-1].x,y: player.tail[player.tail.length-1].y});

            
            lobby.updateSnakeCells.push({
                x: playerX,
                y: playerY,
            })
            
            //End Growing Tail
        } else {
            player.pos = playerOldPos;
            player.moving = playerOldMoving;
        }
    }
}