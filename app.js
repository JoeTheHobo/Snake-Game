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
        delete onlineAccounts[socket.id];
        io.emit('updatePlayers', onlineAccounts);
    }) 

    socket.on("newLobby", (lobby) =>{
        console.log("here"+lobby);
        lobbies.push(lobby);
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
        searchingLobbies: for (let p = 0; p < lobbies.length; p++) {
            let lobby = lobbies[p];
            if (onlineAccounts[socket.id].lobby === lobby.id) {
                if(lobby.host !== socket.id) continue
                
                

                lobby.board.map = structuredClone(lobby.board.originalMap);

                setResolution(lobby.board.map[0].length,lobby.board.map.length);
                
                lobby.doColorRender = false;
                lobby.specialItemIteration = 0;
                lobby.isActiveGame = true; 



                //Resetting Players
                for (let i = 0; i < lobby.players.length; i++) {
                    let player = onlineAccounts[lobby.players.id].player;
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


                for (let i = 0; i < lobby.players.length; i++) {
                    let player = onlineAccounts[lobby.players.id].player;
                    spawn(player);

                }

                for (let i = 0; i < lobby.gameMode.items.length; i++) {
                    let item = lobby.gameMode.items[i];
                    for (let j = 0; j < Number(item.onStartSpawn); j++) {
                        spawn(item.name,false);
                    }
                }


                lobby.gameEnd = false;
                lobby.deltaTime = 0;
                lobby.lastTimestamp = 0;
                lobby.timer = 0;
                lobby.timerInterval = setInterval((lobby) => {
                    lobby.timer++;
                }, 1000);

            




                io.emit("startingGame", lobby);
                break searchingLobbies;
            }
        }
    })
    console.log(onlineAccounts);
});



server.listen(port, () => {
    console.log('app listening on port' + port);
}) 









