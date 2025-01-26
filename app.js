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
        players: [{
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
        }],
        gameModes: [],
        boards: [],
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
        searchingLobbies: for (let i = 0; i < lobbies.length; i++) {
            let lobby = lobbies[i];
            if (lobbyID === lobby.id) {
                if (lobby.playerCount + 1 <= lobby.playerMax) {
                    lobby.playerCount++;
                    lobby.players.push(playerID);
                    io.emit("updateLobbies", lobbies, "joining");
                }
                break searchingLobbies;
            }
        }
    })

    console.log(onlineAccounts);
});

server.listen(port, () => {
    console.log('app listening on port' + port);
}) 









