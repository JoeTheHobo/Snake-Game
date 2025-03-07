const simple = require("./server_simple.js");
const {presetGameModes} = require("./presetGameModes.js");
let {presetBoards} = require("./presetBoards.js");
const {items} = require("./server_items.js");
const {tiles} = require("./server_tiles.js");
const zlib = require('zlib');
const express = require('express');
const app = express();
const pako = require('pako');
const profanity = require("./profanity.js");


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

let newPreset = [];
function retrieveAllPresetBoards(index) {
    let buffer = base64ToArrayBuffer(presetBoards[index]);
    decompressObject(buffer,(err,decompressed) => {
        if (err) {
            console.log(err);
            return;
        }
        decompressed.boardAuthors = [{
            id: false,
            username: "Preset Board",
        }];
        decompressed.accountID = false;
        newPreset.push(decompressed);
        if (index == presetBoards.length-1) {
            presetBoards = newPreset;
        } else retrieveAllPresetBoards(index+1);
    })
    
}
retrieveAllPresetBoards(0);

io.on('connection', (socket) => {
    console.log('a user connected');    
    let username = simple.rnd(playerNames1) + simple.rnd(playerNames2);
    let tag = "#" + formatNumber(Object.keys(onlineAccounts).length);
    onlineAccounts[socket.id] = {
        id: socket.id,
        players: [ ],
        player: false,
        serverSnake: newPlayer(socket.id,username,tag),
        gameModes: [],
        gameModeLimit: 10,
        boardLimit: 10,
        playerLimit: 10,
        boards: [],
        lobby: false,
        username: username,
        tag: tag,
        chatNameColor: simple.rnd("color"),
    }
    
    compressObject(onlineAccounts[socket.id].boards,(err,compressed) => {
        if (err) {
            console.log(err)
            return;
        }
        onlineAccounts[socket.id].boards = compressed;
        decompressObject(onlineAccounts[socket.id].boards,(err,decompressed) => {
            if (err) {
                console.log(err);
                return;
            }
            updateLobbies();
            let sendItems = pako.deflate(JSON.stringify(items), { to: 'string' });
            let sendTiles = pako.deflate(JSON.stringify(tiles), { to: 'string' });

            io.emit('setPlayer', socket.id, onlineAccounts[socket.id],sendItems,basedGameMode,presetGameModes,presetBoards,backgrounds,sendTiles,decompressed);
        })
    })

    //socket.emit communicates with the player that just connected, io.emit communicates with the whole lobby
    socket.on('disconnect', (reason) => {
        let username = onlineAccounts[socket.id].username;
        console.log("A user disconnected due to " + reason);
        if (onlineAccounts[socket.id].lobby) {
            let lobby = lobbies[onlineAccounts[socket.id].lobby];
            if (lobby.isInGame) {
                for (let i = 0; i < lobby.inGamePlayers.length; i++) {
                    if (lobby.inGamePlayers[i].accountID === socket.id) {
                        deletePlayer(lobby,lobby.inGamePlayers[i],false,false,true);
                    }
                }
            }
            
            for (let i = 0; i < lobby.players.length; i++) {
                if (lobby.players[i] === socket.id) {
                    lobby.players.splice(i,1); 
                }
            }

            if (lobby.players.length < 1) {
                delete lobbies[lobby.id];
            } else {
                lobby.chats.push({
                    account: null,
                    message: username + " Quit The Lobby",
                })

                if (lobby.hostID == socket.id) {
                    lobby.hostID = lobby.players[0];
                    lobby.hostName = onlineAccounts[lobby.players[0]].username;
                    lobby.hostTag = onlineAccounts[lobby.players[0]].tag;
                }
            
                lobby.activePlayers = getPlayersList(lobby.players);

                io.emit("updateLobbyPage", lobby.id, lobby);
            }

            
            updateLobbies();
        }
        
        io.emit("kickPlayer",socket.id,"Disconnected due to " + reason + " [Code: 002]");
        delete onlineAccounts[socket.id];
    }) 
    socket.on("saveBoard",(board) => {
        if (board.accountID !== socket.id) return;
        //Check Board TO BE ADDED

        let account = onlineAccounts[socket.id];
        decompressObject(account.boards,(err,decompressed) => {
            if (err) {
                console.log(err);
                return;
            }

            account.boards = decompressed;
            for (let i = 0; i < account.boards.length; i++) {
                if (account.boards[i].id === board.id) {
                    account.boards[i] = board;
                    io.emit("updatePlayersBoards",socket.id,account.boards);
                    compressObject(account.boards,(err,compressed) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        account.boards = compressed;
                    })
                    return;
                }
            }
            compressObject(account.boards,(err,compressed) => {
                if (err) {
                    console.log(err);
                    return;
                }
                account.boards = compressed;
            })
        })
    })
    socket.on("getZippedBoard",(board) => {
        compressObject(board,(err,compressed) => {
            if (err) {
                console.log(err);
                return;
            }
            io.emit("sendingZippedBoard",socket.id,compressed.toString("base64"),board.name)
        })
    });
    socket.on("deleteBoard",(boardID,sentFrom) => {
        let account = onlineAccounts[socket.id];

        decompressObject(account.boards,(err,decompressed) => {
            if (err) {
                console.log(err);
                return;
            }

            account.boards = decompressed;
            for (let i = 0; i < account.boards.length; i++) {
                if (account.boards[i].id === boardID) {
                    account.boards.splice(i,1);
                    io.emit("updatePlayersBoards",socket.id,account.boards,sentFrom);
                    compressObject(account.boards,(err,compressed) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        account.boards = compressed;
                    })
                    return;
                }
            }
        })

    })
    
    socket.on("saveBoardToIndex",(board,index,sentFrom) => {
        let account = onlineAccounts[socket.id];

        //Varify Board Here -To Be Added
        board = fixBoard(JSON.parse(board));

        if (board.accountID !== socket.id) {
            board.accountID = socket.id;
            board.boardAuthors.push({
                id: socket.id,
                username: account.username,
            })
        }

        if (index > account.boardLimit-1) return;

        decompressObject(account.boards,(err,decompressed) => {
            if (err) {
                console.log(err)
                return;
            }
            account.boards = decompressed;

            if (index > account.boards.length-1) account.boards.push(board); 
            else account.boards[index] = board;
    
            io.emit("updatePlayersBoards",socket.id,account.boards,sentFrom,board)
            compressObject(account.boards,(err,compressed) => {
                if (err) {
                    console.log(err)
                    return;
                }
                account.boards = compressed;
            });
        })

    });
    socket.on("createNewBoard",(boardName,width,height,sentFrom) => {
        let account = onlineAccounts[socket.id];
        if (simple.type(boardName) !== "string") boardName = "Untitled";
        if (boardName.length > 30) boardName = "Untitled";
        if (boardName == "") boardName = "Untitled";
        boardName = profanity.clean(boardName);

        width = 50;//Number(width);
        height = 30;//Number(height);
        let board = {
            name: boardName,
            width: width,
            height: height,
            minPlayers: 1,
            maxPlayers: 8,
            background: backgrounds[0],
            recommendedGameMode: false,
            gameMode: presetGameModes[0],
            originalMap: newMap(width,height), 
            map: [],
            id: Date.now() + "_" + simple.rnd(9999),
            accountID: socket.id,
            mouseOver: false,
            boardAuthors: [{
                id: socket.id,
                username: onlineAccounts[socket.id].username,
            }],
        };

        decompressObject(account.boards,(err,decompressed) => {
            if (err) {
                console.log(err)
                return;
            }
            account.boards = decompressed;

            if (account.boards.length >= account.boardLimit) return;

            account.boards.push(board);
    
            io.emit("updatePlayersBoards",socket.id,account.boards,sentFrom)
            compressObject(account.boards,(err,compressed) => {
                if (err) {
                    console.log(err)
                    return;
                }
                account.boards = compressed;
            });
        })

        
    })
    socket.on("addNewGameMode",(sentFrom) => {
        let account = onlineAccounts[socket.id];
        if (account.gameModes.length > account.gameModeLimit) {
            return;
        }

        let gameMode = structuredClone(basedGameMode);
        gameMode.id = Date.now();
        gameMode.accountID = socket.id;
        account.gameModes.push(gameMode);

        io.emit("updateLocalGameModes",socket.id,account.gameModes,sentFrom);

    })
    socket.on("deleteGameMode",(gameModeID,sentFrom) => {
        let account = onlineAccounts[socket.id];
        for (let i = 0; i < account.gameModes.length; i++) {
            if (account.gameModes[i].id == gameModeID) {
                account.gameModes.splice(i,1);
                io.emit("updateLocalGameModes",socket.id,account.gameModes,sentFrom)
                return;
            }
        }
    })
    socket.on("saveGamemode",(gameMode) => {
        let account = onlineAccounts[socket.id];
        for (let i = 0; i < account.gameModes.length; i++) {
            if (account.gameModes[i].id == gameMode.id) {
                if (checkGameMode(gameMode,socket.id) === true) {
                    account.gameModes[i] = gameMode;
                    account.gameModes[i].whenSnakesDie = account.gameModes[i].whenSnakesDie.toLowerCase(); 
                    io.emit("updateLocalGameModes",account.gameModes)
                }
            }
        }
    })
    socket.on("newLobby", (lobby) =>{
        if (!lobby) return;

        let id = Date.now() + "_" + simple.rnd(5000);
        lobbies[id] = {};
        lobbies[id].board = structuredClone(presetBoards[0]);
        lobbies[id].id = id;
        lobbies[id].hostID = socket.id;
        lobbies[id].hostName = onlineAccounts[socket.id].username;
        lobbies[id].hostTag = onlineAccounts[socket.id].tag;
        lobbies[id].players = [socket.id];
        lobbies[id].chats = [{
            account: null,
            message: "Lobby Created",
        }];
        if (lobby.code == "") lobby.code = rnd(9999);
        lobbies[id].code = lobby.code + "";
        let serverType = lobby.serverType.toLowerCase();
        if (!["public","hidden","private"]) serverType = "public";
        lobbies[id].serverType = serverType;
        lobbies[id].gameMode = presetGameModes[0];
        if (!lobby.playerMax) lobby.playerMax = 8;
        let playerMax = Number(lobby.playerMax);
        if (!simple.type(playerMax,true).isWholeNumber) playerMax = 8;
        if (playerMax < 1) playerMax = 1;
        if (playerMax > 8) playerMax = 8;
        lobbies[id].playerMax = playerMax;
        lobbies[id].lobbyBoards = [];
        lobbies[id].isInGame = false;
        lobbies[id].lobbyName = lobbies[id].hostName + "'s Lobby";
        onlineAccounts[socket.id].lobby = id;
        onlineAccounts[socket.id].player = structuredClone(onlineAccounts[socket.id].serverSnake);
        lobbies[id].activePlayers = getPlayersList(lobbies[id].players);

        io.emit("setClientLobby",socket.id,lobbies[id])
        updateLobbies();
    })
    socket.on("quitServer",() => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;

        let username = onlineAccounts[socket.id].username;
        for (let i = 0; i < lobby.players.length; i++) {
            if (lobby.players[i] == socket.id) {
                lobby.players.splice(i,1);
            }
        }

        if (lobby.isInGame) {
            for (let i = 0; i < lobby.inGamePlayers.length; i++) {
                if (lobby.inGamePlayers[i].accountID === socket.id) {
                    deletePlayer(lobby,lobby.inGamePlayers[i],false,false,true);
                }
            }
        }

        onlineAccounts[socket.id].lobby = false;

        if (lobby.players.length == 0) {
            delete lobbies[lobby.id];
            updateLobbies();
        } else {
            if (lobby.hostID == socket.id) {
                lobby.hostID = lobby.players[0];
                lobby.hostName = onlineAccounts[lobby.players[0]].username;
                lobby.hostTag = onlineAccounts[lobby.players[0]].tag;
            }
        
            lobby.activePlayers = getPlayersList(lobby.players);
            lobby.chats.push({
                account: null,
                message: username + " Quit The Lobby",
            })
    
            io.emit("updateLobbyPage", lobby.id, lobby);
            updateLobbies();
        }
    })
    socket.on("joinLobby",(lobbyID,code,spectate) => {
        let account = onlineAccounts[socket.id];
        if (account.lobby) return;
        let lobby = lobbies[lobbyID];
        if (!lobby) return;

        if (lobby.serverType.toLowerCase() == "private" || lobby.serverType.toLowerCase() == "hidden") {
            if (lobby.code !== code) return;
        }
        if (lobby.players.length == lobby.playerMax) return;


        if (lobby.isInGame && !spectate) {
            io.emit("askToSpectate",socket.id,lobbyID,code);
            return;
        }
        
        lobby.players.push(socket.id);
        lobby.chats.push({
            account: null,
            message: account.username + " Joined The Lobby",
        })
        account.lobby = lobby.id;
        account.player = structuredClone(account.serverSnake);
        account.player.canSubmitBoards = false;
        lobby.activePlayers = getPlayersList(lobby.players);
        updateLobbies();
        io.emit("updateLobbyPage", lobby.id, lobby.activePlayers, "players", lobby.hostID,lobby.players.length,lobby.playerMax);
        io.emit("setClientLobby",socket.id,lobby);
    })
    socket.on("refreshLobbies",() => {
        updateLobbies();
    })
    socket.on("sendChat",(message) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (message == "") return;
        message = profanity.clean(message,true,["swear_soft"]);

        let account;
        for (let i = 0; i < lobby.players.length; i++) {
            if (lobby.players[i] == socket.id) {
                account = onlineAccounts[lobby.players[i]].username;
            }
        }

        lobby.chats.push({
            message: message,
            account: account,
            color: onlineAccounts[socket.id].chatNameColor,
        })

        io.emit("updateLobbyPage", lobby.id, lobby.chats,"chats");
    })
    socket.on("searchingHiddenServer",(value) => {
        for (const lobbyID in lobbies) {
            let lobby = lobbies[lobbyID];
            if (lobby.serverType.toLowerCase() !== "hidden") continue;
            if (lobby.code === value) {
                socket.listeners("joinLobby")[0](lobby.id,value);
                return;
            }
        }
    })
    socket.on("updateLobbySettings",(settings) => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let serverType = settings.serverType.toLowerCase();
        if (!["public","hidden","private"]) serverType = "public";
        lobby.serverType = serverType;
        
        if (settings.code == "") settings.code = rnd(9999);
        lobby.code = settings.code + "";

        io.emit("updateLobbyPage", lobby.id, {
            serverType: serverType,
            code: lobby.code,
        },"settings",lobby.hostID);
        updateLobbies();

    })
    socket.on("changeGameModetoBoards",() => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let gameMode = lobby.board.gameMode;
        if (!gameMode) return;

        lobby.gameMode = gameMode;
        io.emit("updateLobbyPage", lobby.id, lobby.gameMode,"gameMode");

    })
    socket.on("editServerGameMode", (gamemode) => {
        socket.listeners("changeServerGameMode")[0](gamemode);
    })
    socket.on("changeServerGameMode",(gameMode) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (!gameMode) return;

        //Varify Game Mode Here -To Be Added

        lobby.gameMode = gameMode;
        io.emit("updateLobbyPage", lobby.id, lobby.gameMode,"gameMode");
    })
    socket.on("addBoardToLobbyBoards",(board) => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!onlineAccounts[socket.id].player.canSubmitBoards && lobby.hostID !== socket.id) return;
        if (!lobby) return;
        if (!board) return;


        //Varify Board Here -To Be Added
        board = fixBoard(JSON.parse(board));
        if (board.accountID !== socket.id) {
            board.accountID = socket.id;
            board.boardAuthors.push({
                id: socket.id,
                username: account.username,
            })
        }
        lobby.lobbyBoards.push(board);
    })
    socket.on("askForLobbyBoards", () => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        io.emit("settingLobbyBoards",lobby.lobbyBoards);

    })
    socket.on("changeServerBoard",(board) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (!board) return;

        //Varify Board Here -To Be Added
        board = JSON.parse(pako.inflate(board, { to: 'string' }));
        lobby.board = board;
        io.emit("updateLobbyPage", lobby.id, lobby.board,"board",lobby.hostID);
        updateLobbies();
    })
    socket.on("setCode",(code) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (code == "") return;

        lobby.code = code;
    })
    socket.on("setPlayerBoardSubbmisionStatus",(player, value) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let activePlayer = onlineAccounts[player.accountID];
        if (!activePlayer) return;
        if (lobby.id !== activePlayer.lobby) return;

        activePlayer.player.canSubmitBoards = value;

        lobby.activePlayers = getPlayersList(lobby.players);
        
        io.emit("updateLobbyPage", lobby.id, lobby.activePlayers,"submissionStatus",lobby.hostID);
    })
    socket.on("kickPlayerFromLobby",(player) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let kickedPlayer = onlineAccounts[player.accountID];
        if (!kickedPlayer) return;
        if (lobby.id !== kickedPlayer.lobby) return;

        kickedPlayer.lobby = false;

        for (let i = 0; i < lobby.players.length; i++) {
            if (lobby.players[i] === kickedPlayer.id) {
                let username = kickedPlayer.username;
                lobby.chats.push({
                    account: null,
                    message: username + " Got Kicked From Lobby",
                })
                lobby.players.splice(i,1);
                break;
            }
        }
        lobby.activePlayers = getPlayersList(lobby.players);

        updateLobbies();
        io.emit("setPlayerToHomeScreen",kickedPlayer.id);
        io.emit("updateLobbyPage", lobby.id, lobby.activePlayers, "players",lobby.hostID,lobby.players.length,lobby.playerMax);
    })
    socket.on("setLobbyHost",(player) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;

        let newHost = onlineAccounts[player.accountID]; 
        if (!newHost) return;
        if (lobby.id !== newHost.lobby) return;
        lobby.hostID = newHost.id;
        lobby.hostName = newHost.username;
        lobby.hostTag = newHost.tag;

        let username = newHost.username;
        lobby.chats.push({
            account: null,
            message: username + " Is The New Lobby Host",
        })

        io.emit("updateLobbyPage", lobby.id, lobby);
    })
    socket.on("endGame",() => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (!lobby.isInGame) return;

        lobby.gameEnd = true;
    })
    socket.on("changeLobbyName",(value) => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) return;
        if (value.length > 20) return;
        if (value === "") return;
        value = profanity.clean(value);
        lobby.lobbyName = value;

        io.emit("updateLobbyPage", lobby.id, lobby.lobbyName, "lobbyName");
        updateLobbies();
    })
    socket.on("ping", (callback) => {
        callback();
    });
    socket.on("startGame", () =>{
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby) return;
        if (lobby.hostID !== socket.id) {
            onlineAccounts[socket.id].kickPlayer = true;
            socket.emit("kickPlayer","Caught Hacking [Code: 001]");
            return;
        }
        
        console.log("onCollisionType",simple.type(lobby.board.originalMap[13][44].item.onCollision.checkStatus));
        lobby.board.map = structuredClone(lobby.board.originalMap);

        lobby.oldObj = false;
        lobby.isInGame = true;
        lobby.readyPlayers = [];
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
        lobby.snakeMap = [];
        for (let i = 0; i < lobby.board.map.length; i++) {
            let toPush = [];
            for (let j = 0; j < lobby.board.map[i].length; j++) {
                toPush.push([{
                    x: j,
                    y: i,
                }])
            }
            lobby.snakeMap.push(toPush);
        }

        lobby.items = structuredClone(items);
        
        for (let i = 0; i < lobby.gameMode.itemAlterations.length; i++) {
            let alterationGroup = lobby.gameMode.itemAlterations[i];
            for (let k = 0; k < lobby.items.length; k++) {
                let item = lobby.items[k];
                if (item.name !== alterationGroup.name) continue;

                for (let j = 0; j < alterationGroup.alterations.length; j++) {
                    let alteration = alterationGroup.alterations[j];
                    setNestedValue(item,alteration,"_LAST_");
                }
            }
        }


        //Resetting Players
        lobby.inGamePlayers = getPlayersList(lobby.players);

        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            let player = lobby.inGamePlayers[i];
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
            player.status = [];
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
            player.moving = "right";
            player.growTail = 0;
            player.tail = [];
            player.moveQueue = [];
            player.prevMove = "start";
            player.moveTik = 0;
            player.moveSpeed = 6;
            player.turboDuration = 0;
            player.turboActive = false;
            player.winGame = false;
            player.equiped = {
                head: false,
                body: false,
                tail: false,
            };
            
            player.playerKills = 0;
            player.index = i;
            player.preGameStatus = "waiting";

            player.pos = {
                x: false,
                y: false,
            }
            player.team = "white";
            //Spawn Players
        }

        

        getLocations(lobby);
        console.log("onCollisionType",simple.type(lobby.board.originalMap[13][44].item.onCollision.checkStatus));
        fixItemDifferences(lobby,lobby.board.map);
        console.log("onCollisionType",simple.type(lobby.board.originalMap[13][44].item.onCollision.checkStatus));

        fixTileDifferences(lobby,lobby.board,lobby.board.map);


        for (let i = 0; i < lobby.players.length; i++) {
            let player = onlineAccounts[lobby.players[i]].player;
            spawn(lobby,player);
        }

        for (let i = 0; i < lobby.items.length; i++) {
            let item = lobby.items[i];
            for (let j = 0; j < Number(item.onStartSpawn); j++) {
                spawn(lobby,item.name,false);
            }
        }


        lobby.gameEnd = false;
        lobby.updatePositionTimeStamp = Date.now();
        lobby.gameTimeStart = Date.now();
        lobby.boardStatusCount = 0;
        lobby.playSounds = [];
        lobby.boardStatus = [];

        io.emit("startingGame", lobby,onlineAccounts[socket.id].player);
        
        updateClientPositions(lobby)

        lobby.gameLoop = function() {
            let lobby_gameLoop_start = Date.now();
            server_movePlayers(this)

            updateClientPositions(this,lobby_gameLoop_start);

            this.updatePositionTimeStamp = Date.now();
            this.updateSnakeCells = [];
            this.updateCells = [];
            this.playSounds = [];
            
            //Check If Anyone Got The Crown
            let winningPlayer = false;
            for (let i = 0; i < this.inGamePlayers.length; i++) {
                if (this.inGamePlayers[i].winGame) {
                    winningPlayer = this.inGamePlayers[i];
                    break;
                }
            }

            if (!this.gameEnd && !winningPlayer) {
                setTimeout(() => this.gameLoop(), 16);
            } else {
                this.isActiveGame = false;
                this.isInGame = false;

                //Kill Any Non Dead Snakes
                for (let i = 0; i < this.inGamePlayers.length; i++) {
                    if (!this.inGamePlayers[i].isDead) {
                        deletePlayer(this,this.inGamePlayers[i],false,false,true);
                    }
                }

                let longestTail = this.inGamePlayers[0].longestTail;
                let timeSurvived = this.inGamePlayers[0].timeSurvived;
                let mostKills = this.inGamePlayers[0].playerKills;
                let longestTailPlayer = this.inGamePlayers[0];
                let timeSurvivedPlayer = this.inGamePlayers[0];
                let mostKillsPlayer = this.inGamePlayers[0];
                for (let i = 1; i < this.inGamePlayers.length; i++) {
                    if (this.inGamePlayers[i].longestTail > longestTail) {
                        longestTail = this.inGamePlayers[i].longestTail;
                        longestTailPlayer = this.inGamePlayers[i];
                    }
                    if (this.inGamePlayers[i].timeSurvived > timeSurvived) {
                        timeSurvived = this.inGamePlayers[i].timeSurvived;
                        timeSurvivedPlayer = this.inGamePlayers[i];
                    }
                    if (this.inGamePlayers[i].playerKills > mostKills) {
                        mostKills = this.inGamePlayers[i].mostKills;
                        mostKillsPlayer = this.inGamePlayers[i];
                    }
                }

                let minutes = (timeSurvived-(timeSurvived%60))/60;
                let seconds = timeSurvived%60;

                if ((seconds + "").length == 1) seconds = "0" + seconds;


                let obj = {
                    lobby: this,
                    longestTail: longestTail,
                    timeSurvived: timeSurvived,
                    longestTailPlayer: longestTailPlayer,
                    timeSurvivedPlayer: timeSurvivedPlayer,
                    mostKillsPlayer: mostKillsPlayer,
                    minutes: minutes,
                    seconds: seconds,
                    winningPlayer: winningPlayer,
                };
                io.emit("endGame",obj,lobby.id)

                
                updateLobbies();
                
            }
        }

        lobby.gameStatus = "prepare";
        lobby.waiting = true;
        setTimeout(function() {
            if (lobby.gameStatus === "game" || lobby.waiting == false) return;
            lobby.waiting = false;
            io.emit("preparingGame",lobby.id);
            setTimeout(function() {
                lobby.gameStatus = "game";
                lobby.gameLoop();
            },4000)
        },15000);
        
        updateLobbies();

    })
    socket.on("snakeIsReady", () => {
        let account = onlineAccounts[socket.id];
        let lobby = lobbies[account.lobby];
        if (!lobby) return;
        if (!lobby.isInGame) return;

        lobby.readyPlayers.push(socket.id);
        for (let i = 0; i < lobby.inGamePlayers.length; i++) {
            if (lobby.inGamePlayers[i].accountID == socket.id) lobby.inGamePlayers[i].preGameStatus = "ready";
        }
        io.emit("updatePreGamePlayerInfo",lobby.id,lobby.inGamePlayers)

        if (lobby.readyPlayers.length === lobby.inGamePlayers.length) {
            if (lobby.gameStatus == "game" || lobby.waiting == false) return;
            lobby.waiting = false;
            io.emit("preparingGame",lobby.id);
            setTimeout(function() {
                lobby.gameStatus = "game";
                lobby.gameLoop();
            },4000)
        }

    });
    socket.on("movePlayerKey",(direction) => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        let player = onlineAccounts[socket.id].player;
        if (!lobby) return;

        if (lobby.gameStatus == "prepare") {
            player.moving = direction;

            let pushObj = structuredClone(lobby.snakeMap[player.pos.y][player.pos.x]);
            pushObj.rnd = simple.rnd(9999);
            lobby.updateSnakeCells.push(pushObj);
            updateClientPositions(lobby);
            
            return;
        }

        if (onlineAccounts[socket.id].player.moveQueue.length >= 4) return;
        onlineAccounts[socket.id].player.moveQueue.push(direction);
    })
    socket.on("fireItem",() => {
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        let player = onlineAccounts[socket.id].player;
        if (!lobby || !player) return;

        useItem(lobby,player);
    })
    socket.on("changeItem",(change) => {
        let player = onlineAccounts[socket.id].player;
        let lobby = lobbies[onlineAccounts[socket.id].lobby];
        if (!lobby || !player) return;

        let currentGameMode = lobby.gameMode;
        player.selectingItem += change;
        if (player.selectingItem < 0) player.selectingItem = currentGameMode.howManyItemsCanPlayersUse-1;
        if (player.selectingItem > currentGameMode.howManyItemsCanPlayersUse-1) player.selectingItem = 0;
    })


    //Menu
    socket.on("createNewPlayer",() => {
        onlineAccounts[socket.id].players.push(newPlayer(socket.id,onlineAccounts[socket.id].username),onlineAccounts[socket.id].tag);
        io.emit("playersBeenMade",onlineAccounts[socket.id].players);
    })
    socket.on("localSendingPlayers",(players,serverSnake,updateLobby = false) => {
        if (!players) {
            console.log("Tried Sending: " + players)
            return;
        }
        let checksOut = true;
        for (let i = 0; i < players.length; i++) {
            if (checkPlayer(players[i],socket.id) !== true) checksOut = checkPlayer(players[i],socket.id);
        }
        if (checkPlayer(serverSnake,socket.id) !== true) checksOut = checkPlayer(serverSnake,socket.id);
        if (checksOut === true) {
            onlineAccounts[socket.id].players = players;
            onlineAccounts[socket.id].serverSnake = serverSnake;
            if (updateLobby) {
                let account = onlineAccounts[socket.id];
                let lobby = lobbies[account.lobby];
                if (!account) return;
                if (!lobby) return;

                onlineAccounts[socket.id].player = structuredClone(onlineAccounts[socket.id].serverSnake);
                lobby.activePlayers = getPlayersList(lobby.players);

                io.emit("updateLobbyPage", lobby.id, lobby);
                
            }
        } else {
            onlineAccounts[socket.id].kickPlayer = true;
            io.emit("kickPlayer",socket.id,"Hacked Players: " + checksOut + " [Code: 7834]");
        }
    })
    console.log(Object.keys(onlineAccounts).length);
});


server.listen(port, () => {
    console.log('app listening on port' + port);
}) 




//Copying From Functions.js
function setNestedValue(obj, path, value, toReturn = false) {
    let lastKey = path.pop(); // Remove and store the last key
    if (value === "_LAST_") {
        value = lastKey; // If value is "_LAST_", use the last key as the value
        lastKey = path.pop(); // Get the new last key
    }
    
    let target = path.reduce((acc, key) => {
        if (acc && acc.hasOwnProperty(key)) return acc[key];
        return undefined; // Exit early if the path doesn't exist
    }, obj);

    if (target === undefined || !target.hasOwnProperty(lastKey)) return; // Do nothing if path is invalid

    if (toReturn) {
        return target[lastKey]; // Return the value instead of setting it
    } else {
        target[lastKey] = value; // Set the value if not in return mode
    }
}
function getTile(name) {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].name == name) {
            return structuredClone(tiles[i]);
        }
    }
}
function getItem(lobby,name) {
    for (let i = 0; i < lobby.items.length; i++) {
        if (lobby.items[i].name == name) {
            return structuredClone(lobby.items[i]);
        }
    }
}
function calculateDistance(currentBoard,x1, y1, x2, y2, boardLength, boardHeight) {
    boardLength = currentBoard.map[0].length;
    boardHeight = currentBoard.map.length;
    let dx = Math.min(Math.abs(x1 - x2), boardLength - Math.abs(x1 - x2));
    let dy = Math.min(Math.abs(y1 - y2), boardHeight - Math.abs(y1 - y2));
    return dx + dy;
}
function fixItemDifferences(lobby,map) {
    console.log(1,"onCollisionType",simple.type(map[13][44].item.onCollision.checkStatus));
    let currentBoard = lobby.board;
    if (!currentBoard.itemDifferences) return;
    for (let i = 0; i < currentBoard.itemDifferences.length; i++) {
        let e = currentBoard.itemDifferences[i];
        let d = {
            differences: e[0],
            x: e[1],
            y: e[2],
        }
        if (e[1] == 44 && e[2] == 13) console.log(1.2,"onCollisionType",simple.type(map[13][44].item.onCollision.checkStatus));
        if (e[1] == 44 && e[2] == 13) console.log(1.25,"map",map[d.y][d.x].item);
        let pos = structuredClone(map[d.y][d.x].item);
        if (!pos) continue;
        if (e[1] == 44 && e[2] == 13) console.log(1.25,"differences",d.differences);
        for (let j = 0; j < d.differences.length; j++) {
            let change = d.differences[j];
            setNestedValue(pos,change,"_LAST_");
        }
        if (e[1] == 44 && e[2] == 13) console.log(1.4,"onCollisionType",simple.type(map[13][44].item.onCollision.checkStatus));
        map[d.y][d.x].item = pos;
        if (e[1] == 44 && e[2] == 13) console.log(1.42,"onCollisionType",simple.type(map[13][44].item.onCollision.checkStatus));
        if (e[1] == 44 && e[2] == 13) console.log(1.45,"pos",simple.type(pos.onCollision.checkStatus));
        
        for (let i = 0; i < currentBoard.location_spawns.length; i++) {
            if (d.y == currentBoard.location_spawns[i].y && currentBoard.location_spawns[i].x == d.x) {
                lobby.board.location_spawns[i].item = map[d.y][d.x].item;
            }
        }
        if (e[1] == 44 && e[2] == 13) console.log(1.6,"onCollisionType",simple.type(map[13][44].item.onCollision.checkStatus));
    }
    console.log(3,"onCollisionType",simple.type(map[13][44].item.onCollision.checkStatus));
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
            setNestedValue(pos,change,"_LAST_");
        }
        map[d.y][d.x].tile = pos;
    }
}
function spawn(lobby,name,generateRandomItem = true,counting = false,playAudio = true) {
    let currentBoard = lobby.board;
    let activePlayers = lobby.inGamePlayers; 
    let isPlayer = name.isPlayer;
    let itemIndex = false;
    let item;
    if (!isPlayer) {
        for (let i = 0; i < lobby.items.length; i++) {
            if (lobby.items[i].name == name) {
                itemIndex = i;
                item = lobby.items[i];
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
    let allSpawns = simple.shuffle(currentBoard.location_spawns);
    while (foundSpot == false) {
        if (isPlayer) {
            findingSpawner: for (let k = 0; k < allSpawns.length; k++) {
                let playerOnIt = false;
                for (let i = 0; i < activePlayers.length; i++) {
                    if (activePlayers[i] == false) continue;
                    if (activePlayers[i].pos.x == allSpawns[k].x && activePlayers[i].pos.y == allSpawns[k].y) playerOnIt = true;
                }
                if (playerOnIt) continue;

                let playerTeam = name.team;
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
            x = simple.rnd(currentBoard.map[0].length)-1;
            y = simple.rnd(currentBoard.map.length)-1;
            if (currentBoard.map[y][x].item == false && currentBoard.map[y][x].tile.canSpawn) {
                foundSpot = true;
                checkingDistanceFromPlayersHead: for (let j = 0; j < activePlayers.length; j++) {
                    if (activePlayers[j] == false) continue;
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
                        if (activePlayers[j] == false) continue;
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
            name.team = team;
            lobby.snakeMap[y][x].push({
                index: name.index,
                type: "head",
                siblings: [],
                x: x,
                y: y,
            });
            lobby.updateSnakeCells.push(lobby.snakeMap[y][x]);
        } else {
            runItemFunction(lobby,name,lobby.items[itemIndex],"onSpawn",{x:x,y:y},{playAudio: playAudio});
            currentBoard.map[y][x].item = structuredClone(lobby.items[itemIndex]);
            currentBoard.map[y][x].item.pos = {
                x: x,
                y: y,
            }
            lobby.updateCells.push({
                x: x,
                y: y,
                item: currentBoard.map[y][x].item,
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
function getLocations(lobby) {
    let currentBoard = lobby.board;
    for (let i = 0; i < currentBoard.map.length; i++) {
        for (let j = 0; j < currentBoard.map[0].length; j++) {
            let cell = currentBoard.map[i][j]; 

            if (cell.item === false) continue;

            cell.item = structuredClone(getItem(lobby,cell.item.name));
            if (cell.item == undefined) cell.item = false; //Prolly Will Need To Resolve Issue Later
            if (cell.item !== false) {
                cell.item.pos = {
                    x: j,
                    y: i,
                }

                if (cell.item.spawnLimit > 0 || cell.item.spawnLimit === false) {
                    cell.item.spawnLimit--; 
                    lobby.updateCells.push({
                        x: j,
                        y: i,
                    })
                    if (cell.item.pack == "Tunnels") {
                        lobby.board.location_tunnels.push({
                            x: j,
                            y: i,
                            name: cell.item.name,
                        })
                    }
                    if (cell.item.updateOn) {
                        for (let h = 0; h < cell.item.updateOn.length; h++) {
                            if (cell.item.updateOn[h] == "boardStatus") {
                                lobby.board.location_status.push({
                                    x: j,
                                    y: i,
                                    name: cell.item.name,
                                })
                            }
                        }
                    }
                    if (cell.item.spawnPlayerHere == true) {
                        lobby.board.location_spawns.push({
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
function removeBoardStatus(lobby,status,player) {
    if (status == "*P") status = player.team;

    checking: for (let i = 0; i < lobby.boardStatus.length; i++) {
        if (lobby.boardStatus[i] == status) {
            lobby.boardStatus.splice(i,1);
            break checking;
        }
    }
    for (let i = 0; i < lobby.board.location_status.length; i++) {
        let status = lobby.board.location_status[i];
        lobby.updateCells.push({
            x: status.x,
            y: status.y,
            item: status.item,
        })
    }
}
function addBoardStatus(lobby,status,player) {
    if (status == "white") return;
    if (status == "*P") status = player.team;
    lobby.boardStatus.push(status);
    for (let i = 0; i < lobby.board.location_status.length; i++) {
        let status = lobby.board.location_status[i];
        lobby.updateCells.push({
            x: status.x,
            y: status.y,
            item: status.item,
        })
    }
}
function useItem(lobby,player) {
    if (player.status.includes(player.items[player.selectingItem].img)) return;
    
    let item = player.items[player.selectingItem];
    if (item == "empty") return;

    let returnItem = runItemFunction(lobby,player,player.items[player.selectingItem],"onActivate");
    player.items[player.selectingItem] = returnItem;
}
function specialItemManager(lobby) {
    if (lobby.specialItemIteration >= lobby.specialItemActiveChance) {
        lobby.specialItemIteration = 0;
        lobby.specialItemActiveChance = simple.rnd(lobby.specialItemLowChance,lobby.specialItemHighChance);
        // Calculate the total weight
        let totalWeight = 0;
        for (let i = 0; i < lobby.items.length; i++) {
            if (lobby.items[i].spawnLimit < 1 && simple.type(lobby.items[i].spawnLimit) == "number") continue;
            totalWeight += lobby.items[i].specialSpawnWeight;
        }

        // Generate a random number between 0 and totalWeight
        const randomWeight = Math.random() * totalWeight;

        // Find the item corresponding to the random weight
        let cumulativeWeight = 0;
        findingItem: for (const item of lobby.items) {
            if (item.spawnLimit < 1 && simple.type(item.spawnLimit) == "number") continue;

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
function deletePlayer(lobby,player,playerWhoKilled,damage = 0,instaKill = false){
    let currentGameMode = lobby.gameMode;
    let activePlayers = lobby.inGamePlayers;

    let playerDied = true;
    if (playerWhoKilled) damage = playerWhoKilled.bodyArmor;


    if (damage === 0) playerDied = false;

    if (player.equiped.head?.whenEquiped?.protect) {
        player.equiped.head.whenEquiped.protect -= damage;
        if (player.equiped.head.whenEquiped.protect > -1) {
            playerDied = false;
            if (player.equiped.head.whenEquiped.protect < 1) player.equiped.head = false;
        } else {
            player.equiped.head = false;
        }
    }

    if (playerDied || instaKill){
        if (playerWhoKilled) if (playerWhoKilled.name !== player.name) playerWhoKilled.playerKills++;

        //Delete Tail
        if (currentGameMode.whenSnakesDie == "vanish") {
            snakeMapRemoveAll(lobby,player);
        }
        if (currentGameMode.whenSnakesDie == "become food") {
            snakeMapSetFood(lobby,player,true);
        }

        //Delete Player
        player.isDead = true;
        player.justDied = true;

        if (!currentGameMode.respawn) {
            player.timeSurvived = Math.floor((Date.now() - lobby.gameTimeStart) / 1000);
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
}
function growPlayer(player,grow) {
    player.growTail += grow;
}
function runItemFunction(lobby,player,item,type,itemPos,settings = {playAudio: true}) {
    let returnItem = "empty";
    let currentBoard = lobby.board;
    let currentGameMode = lobby.gameMode;
    if (!type) return returnItem;

    let collision;
    if (simple.type(type) == "object") collision = type; 
    else collision = item[type];

    if (!collision) return returnItem;

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
            item: item,
        })
    }
    if (collision.switchBoardStatus) {
        if (item.switchStatus === true) {
            addBoardStatus(lobby,collision.switchBoardStatus,player);
        } else {
            removeBoardStatus(lobby,collision.switchBoardStatus,player);
        }
    }
    if (collision.addBoardStatus) {
        addBoardStatus(lobby,collision.addBoardStatus,player);
    }
    if (collision.removeBoardStatus) {
        removeBoardStatus(lobby,collision.removeBoardStatus,player);
    }
    if (collision.setBoardStatus) {
        let status = collision.setBoardStatus;
        if (collision.setBoardStatus == "*P") status = player.team;
        if (item.sendingBoardStatus === status) return;

        if (item.sendingBoardStatus !== false) {
            removeBoardStatus(lobby,item.sendingBoardStatus,player);
        }

        item.sendingBoardStatus = status;
        addBoardStatus(lobby,status,player);
    }
    if (collision.equip) {
        let oldItem = structuredClone(player.equiped[collision.equip]);
        player.equiped[collision.equip] = structuredClone(item);
        if (oldItem) {
            returnItem = oldItem;
        }
    }
    if (collision.setBaseImgTag) {
        let value = collision.setBaseImgTag.value;
        if (value == "*P") value = player.team;
        item.baseImgTags[collision.setBaseImgTag.index] = value;

        lobby.updateCells.push({
            x: player.pos.x,
            y: player.pos.y,
            item: item,
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
        if (collision.turboServer.duration && simple.type(collision.turboServer.moveSpeed) == "number") {
            console.log("TURBOO");
            player.turboActive = true;
            player.turboDuration = collision.turboServer.duration;
            player.moveSpeed = collision.turboServer.moveSpeed;
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
    if (collision.winGame === true) {
        player.winGame = true;
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
                    item: mapTile,
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
                        item: mapTile,
                    })
                }
            }
            doColorRender = true;
        },collision.canvasFilter.duration)
    }
    if (collision.playSound && item.playSounds && settings?.playAudio && lobby.playSounds) {
        lobby.playSounds.push("sounds/" + item.soundFolder + "/" + item.soundFolder + "_" + collision.playSound[0] + "_" + simple.rnd(collision.playSound[1]) + ".mp3");
    }
    if (collision.killPlayer) {
        deletePlayer(lobby,player,false,false,true);
    }
    if (collision.spawnRandomItem) {
        specialItemManager(lobby);
    }
    if (collision.deleteMe) {
        if (item.type == "item") {
            currentBoard.map[player.pos.y][player.pos.x].item = false;
            lobby.updateCells.push({
                x: player.pos.x,
                y: player.pos.y,
                item: false,
            })
        }
    }
    if (collision.pickUp) {
        for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
            if (player.items[k] == "empty") {
                player.items[k] = structuredClone(item);
                if (item.type == "item") {
                    currentBoard.map[player.pos.y][player.pos.x].item = false;
                    lobby.updateCells.push({
                        x: player.pos.x,
                        y: player.pos.y,
                        item: false,
                    })
                }
                break;
            }
        }
    }
    if (collision.dealDamage) {
        deletePlayer(lobby,player,false,collision.dealDamage);
    }
    if (collision.removePlayerItem) {
        for (let j = 0; j < collision.removePlayerItem.length; j++) {
            let count = collision.removePlayerItem[j].count;
            for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                if (count == 0) continue;
                let playerSlot = player.items[k];
                if (playerSlot == "empty") continue;
                if (playerSlot.name == collision.removePlayerItem[j].name) {
                    player.items[k] = "empty";
                    count--;
                }
            }
        }
        
    }
    if (collision.teleport) {
        if (!player.justTeleported) {
            findingPortal: for (let z = 0; z < currentBoard.map.length; z++) {
                for (let h = 0; h < currentBoard.map[z].length; h++) {
                    if (!currentBoard.map[z][h].item) continue;
                    if (player.pos.x == h && player.pos.y == z) continue;
                    if (currentBoard.map[z][h].item.id === collision.teleport) {
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
    }
    if (collision.checkStatus) {
        let check = collision.checkStatus.check;
        let passedCheck = true;
        if (check.playerHasEmptySlot === true) {
            let pass = false;
            for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                if (player.items[k] === "empty") pass = true;
            }
            if (!pass) passedCheck = false;
        }
        if (check.playerHasItem) {
            let pass = true;
            for (let j = 0; j < check.playerHasItem.length; j++) {
                let count = 0;
                for (let k = 0; k < currentGameMode.howManyItemsCanPlayersUse; k++) {
                    let playerSlot = player.items[k];
                    if (playerSlot == check.playerHasItem.name) count++;
                }
                if (count < check.playerHasItem.count) pass = false;
            }
            if (!pass) passedCheck = false;
        }
        if (check.playerTeamStatus) {
            if (player.team !== check.playerTeamStatus) passedCheck = false;
        }
        if (check.boardStatus) {
            let count = 0;
            for (let j = 0; j < lobby.boardStatus.length; j++) {
                if (lobby.boardStatus[j] === check.boardStatus.name) count++;
            }
            if (count < check.boardStatus.count) passedCheck = false;
        }
        if (check.snakeSize) {
            if (player.tail.length + 1 < check.snakeSize) passedCheck = false;
        }


        //Finish Checking
        if (passedCheck) runItemFunction(lobby,player,item,collision.checkStatus.pass,itemPos,settings);
        else runItemFunction(lobby,player,item,collision.checkStatus.fail,itemPos,settings);
    }

    return returnItem;
}
function addPlayerStatus(lobby,player,itemName) {
    player.status.push(getItem(lobby,itemName).name);
}
function removePlayerStatus(lobby,player,itemName) {
    findingStatus: for (let i = 0; i < player.status.length; i++) {
        if (player.status[i] == getItem(lobby,itemName).name) {
            player.status.splice(i,1);
            break findingStatus;
        }
    }
}

//From App.js
function updateLobbies() {
    let lobbyList = Object.values(lobbies)
        .filter(lobby => lobby.serverType.toLowerCase() !== "hidden")
        .reduce((acc, lobby) => {
            acc[lobby.id] = { ...lobby, code: "", gameLoop: "" };
            return acc;
        }, {});
    io.emit("updateLobbies", lobbyList,Object.keys(onlineAccounts).length,Object.keys(lobbies).length);
}
setInterval(() => {
    io.emit("updateMemorry",process.memoryUsage());
  }, 5000);
function updateClientPositions(lobby,lobby_gameLoop_start = Date.now()) {
    let emitingActivePlayers = Object.values(lobby.inGamePlayers).map(({ 
        index, 
        selectingItem, 
        items, 
        tail, 
        moving, 
        playerKills, 
        equiped,
        team
    }) => ({
        i: index,  
        s: selectingItem, 
        it: items, 
        t: tail.length + 1,  
        m: moving,  
        k: playerKills, 
        e: equiped,
        te: team,
    }));
    let newObj = {
        a: emitingActivePlayers,  
        s: lobby.updateSnakeCells,
        c: lobby.updateCells,
        p: lobby.playSounds,
        b: lobby.boardStatus,
        g: Date.now() - lobby_gameLoop_start,
    };

    // Compare with previous object
    let changedList = getChangedValues(lobby.oldObj, newObj);
    let changes = pako.deflate(JSON.stringify(changedList), { to: 'string' });

    if (Object.keys(changes).length > 0) { // Only emit if there are changes
        io.emit("updatePositions", changes, lobby.id);
    }

    // Store the new state for next comparison
    lobby.oldObj = newObj;
}
function getChangedValues(oldObj, newObj) {
    if (!oldObj) return newObj; // If no old state, send everything

    let changes = {};

    for (let key in newObj) {
        if (key == "a" || key == "b" || key == "s")
            changes[key] = newObj[key]; // Only store changed values
        else if (JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key])) {
            changes[key] = newObj[key]; // Only store changed values
        }
    }

    return changes;
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64); // Decode Base64 to binary string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer; // Return ArrayBuffer
}
// Function to compress an object
function compressObject(obj, callback) {
    const jsonString = JSON.stringify(obj);
    zlib.gzip(jsonString, (err, compressedData) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, compressedData);
    });
}

// Function to decompress back to an object
function decompressObject(compressedData, callback) {
    zlib.gunzip(compressedData, (err, decompressedBuffer) => {
        if (err) {
            return callback(err, null);
        }
        const jsonString = decompressedBuffer.toString();
        callback(null, JSON.parse(jsonString));
    });
}
function newMap(width,height) {
    _newMap = [];
    for (let i = 0; i < height; i++) {
        let arr = [];
        for (let j = 0; j < width; j++) {
            arr.push({
                tile: getTile("grass"),
                item: false,
            })
        }
        _newMap.push(arr);
    }
    return _newMap;
}
let backgrounds = ["colors","water","space","clear"];
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
function formatNumber(num) {
    return num.toString().padStart(4, '0');
}
function checkGameMode(gameMode,accountID) {
    if (gameMode.accountID !== accountID) return "accountID";
    if (simple.type(gameMode.name) !== "string") return "name";
    if (gameMode.name.length > 15) return "name";
    if (gameMode.howManyItemsCanPlayersUse < 0 || gameMode.howManyItemsCanPlayersUse > 10) return "howManyItemsCanPlayersUse";
    if (!["scroll","direct"].includes(gameMode.mode_usingItemType)) return "mode_usingItemType";
    if (!["noPickUp","recycle","select"].includes(gameMode.mode_whenInventoryFullWhereDoItemsGo)) return "mode_whenInventoryFullWhereDoItemsGo";
    if (!["vanish","remain","become food"].includes(gameMode.whenSnakesDie)) return "whenSnakesDie";
    if (![false,true].includes(gameMode.respawn)) return "respawn";
    if (![false,true].includes(gameMode.snakeCollision)) return "snakeCollision";
    if (![false,true].includes(gameMode.teamCollision)) return "teamCollision";
    if (simple.type(gameMode.respawnGrowth) !== "number") return "respawnGrowth";
    if (gameMode.respawnGrowth < 0 || gameMode.respawnGrowth > 100) return "respawnGrowth";
    if (simple.type(gameMode.respawnTimer) !== "number") return "respawnTimer";
    if (gameMode.respawnTimer < 0 || gameMode.respawnTimer > 60) return "respawnTimer";

    return true;
}
let basedGameMode = {
    name: "Untitled",
    howManyItemsCanPlayersUse: 2,
    mode_usingItemType: "scroll",
    mode_whenInventoryFullWhereDoItemsGo: "select",
    itemAlterations: [],
    whenSnakesDie: "remain",
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    snakeCollision: true,
    teamCollision: true,
}
function respawnPlayer(lobby,player,growthPercentage) {
    let length = Math.round((growthPercentage/100) * player.tail.length);

    //Delete Old Tail
    snakeMapRemoveAll(lobby,player);

    player.isDead = false;
    player.tail = [];
    player.items = [];
    for (let j = 0; j < lobby.gameMode.howManyItemsCanPlayersUse; j++) {
        player.items.push("empty");
    }
    let team = player.team;
    player.status = ["status_" + team];
    player.justDied = false;
    player.bodyArmor = 1;
    player.justTeleported = false;
    player.moveQueue = [];
    player.moveTik = 0;
    player.moveSpeed = 6;
    player.turboDuration = 0;
    player.turboActive = false;
    player.equiped = {
        head: false,
        body: false,
        tail: false,
    }


    spawn(lobby,player);
    growPlayer(player,length);
}
function snakeMapSetType(lobby,index,y,x,type) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[y][x];
    if (type == "tail") {
        for (let i = 0; i < group.length; i++) {
            if (group[i].index == index) {
                lobby.snakeMap[y][x][i].type = type;
                if (type == "tail" && lobby.snakeMap[y][x][i].siblings.length > 1) lobby.snakeMap[y][x][i].siblings.shift();
                return;
            }
        }
    }
    if (type == "body") {
        for (let i = group.length-1; i > 0; i--) {
            if (group[i].index == index) {
                lobby.snakeMap[y][x][i].type = type;
                return;
            }
        }
    }
    
}

function snakeMapRemoveAll(lobby,player,setFood) {
    let snakeMap = lobby.snakeMap;
    for (let i = 0; i < snakeMap.length; i++) {
        for (let j = 0; j < snakeMap[i].length; j++) {
            for (let k = snakeMap[i][j].length-1; k > 0; k--) {
                if (snakeMap[i][j][k].index == player.index) {
                    snakeMap[i][j].splice(k,1);
                    lobby.updateSnakeCells.push(lobby.snakeMap[i][j]);
                    if (setFood && !currentBoard.map[y][x].item) {
                        let x = j;
                        let y = i;
                        runItemFunction(lobby,false,lobby.items[0],"onSpawn",{x:x,y:y},{playAudio: false});
                        currentBoard.map[y][x].item = structuredClone(lobby.items[0]);
                        currentBoard.map[y][x].item.pos = {
                            x: x,
                            y: y,
                        }
                        lobby.updateCells.push({
                            x: x,
                            y: y,
                            item: currentBoard.map[y][x].item,
                        })
                    }
                }
            }
        }
    }
}
function snakeMapRemove(lobby,index,y,x) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[y][x];
    for (let i = 0; i < group.length; i++) {
        if (group[i].index == index) {
            lobby.snakeMap[y][x].splice(i,1);
            return;
        }
    }
}
function snakeMapSetSibling(lobby,index,posY,posX,sibY,sibX) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[posY][posX];
    for (let i = group.length-1; i > 0; i--) {
        if (group[i].index == index) {
            group[i].siblings = [{
                x: sibX,
                y: sibY,
            }];
            return;
        }
    }

}
function snakeMapAddSibling(lobby,index,posY,posX,sibY,sibX) {
    let snakeMap = lobby.snakeMap;
    let group = snakeMap[posY][posX];
    for (let i = group.length-1; i > 0; i--) {
        if (group[i].index == index) {
            group[i].siblings.push({
                x: sibX,
                y: sibY,
            })
            return;
        }
    }
}
function getPlayersList(playerIds) {
    let list = [];
    for (let i = 0; i < playerIds.length; i++) {
        onlineAccounts[playerIds[i]].player.accountName = onlineAccounts[playerIds[i]].username;
        list.push(onlineAccounts[playerIds[i]].player);
    }
    return list;
}
function server_movePlayers(lobby) {
    activePlayers = lobby.inGamePlayers;
    let currentBoard = lobby.board;
    let currentGameMode = lobby.gameMode;
    for (let i = 0; i < activePlayers.length; i++) {
        let player = activePlayers[i];
        
        if (player.isDead) continue;
        if ((player.moveTik) < (player.moveSpeed/currentBoard.map[player.pos.y][player.pos.x].tile.changePlayerSpeed)) {   
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
        if (simple.type(player.justTeleported) == "object") {
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
            let occupiedPositions = new Map();
        
            // Step 1: Populate occupiedPositions with all players' tails & positions
            for (let a = 0; a < activePlayers.length; a++) {
                let checkedPlayer = activePlayers[a];
                if (checkedPlayer.isDead && currentGameMode.whenSnakesDie == "remain") continue;
                if (checkedPlayer.team === player.team && !currentGameMode.teamCollision && player.team !== "white") continue;
        
                for (let b = 0; b < checkedPlayer.tail.length; b++) {
                    occupiedPositions.set(`${checkedPlayer.tail[b].x},${checkedPlayer.tail[b].y}`, checkedPlayer);
                }
                if (checkedPlayer.id !== player.id) {
                    occupiedPositions.set(`${checkedPlayer.pos.x},${checkedPlayer.pos.y}`, checkedPlayer);
                }
            }
            // Step 2: Check if the player's new position exists in occupiedPositions
            if (occupiedPositions.has(`${player.pos.x},${player.pos.y}`)) {
                let killer = occupiedPositions.get(`${player.pos.x},${player.pos.y}`);
                deletePlayer(lobby, player, killer);
            }
        }

        //Test Item Underplayer
        let mapItem = currentBoard.map[player.pos.y][player.pos.x].item;
        if (mapItem) runItemFunction(lobby,player,mapItem,"onCollision");

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
                player.growTail--;
                if (player.tail.length > player.longestTail) player.longestTail = player.tail.length;
            } else if(player.tail.length > 0) {
                player.tail.unshift({
                    x: playerX,
                    y: playerY,
                    direction: player.moving,
                });
                lobby.updateSnakeCells.push(lobby.snakeMap[player.tail[player.tail.length-1].y][player.tail[player.tail.length-1].x]);
                

                let tail = player.tail[player.tail.length-1];
                if (currentBoard.map[tail.y][tail.x].item) {
                    let mapItem = currentBoard.map[tail.y][tail.x].item;
                    if (mapItem.offCollision) runItemFunction(lobby,player,mapItem,"offCollision");
                }
                
                snakeMapRemove(lobby,player.index,tail.y,tail.x);
                player.tail.pop();
            } else {
                snakeMapRemove(lobby,player.index,playerY,playerX);
                if (currentBoard.map[playerY][playerX].item) {
                    let mapItem = currentBoard.map[playerY][playerX].item;
                    if (mapItem.offCollision) runItemFunction(lobby,player,mapItem,"offCollision");
                }
            }
            if (player.tail.length > 0) {
                snakeMapSetType(lobby,player.index,player.tail[0].y,player.tail[0].x,"body");
                snakeMapSetType(lobby,player.index,player.tail[player.tail.length-1].y,player.tail[player.tail.length-1].x,"tail");
                lobby.updateSnakeCells.push(lobby.snakeMap[player.tail[player.tail.length-1].y][player.tail[player.tail.length-1].x]);
            }

            let sibling = player.tail.length > 0 ? [player.tail[0]] : [];
            lobby.snakeMap[player.pos.y][player.pos.x].push({
                index: player.index,
                siblings: sibling,
                type: "head",
                x: player.pos.x,
                y: player.pos.y,
            });
            if (sibling.length == 1) {
                snakeMapAddSibling(lobby,player.index,sibling[0].y,sibling[0].x,player.pos.y,player.pos.x)
            }
            if (player.tail.length == 1) snakeMapSetSibling(lobby,player.index,player.tail[0].y,player.tail[0].x,player.pos.y,player.pos.x);

            lobby.updateSnakeCells.push(lobby.snakeMap[playerY][playerX]);
            lobby.updateSnakeCells.push(lobby.snakeMap[player.pos.y][player.pos.x]);

            //End Growing Tail
        } else {
            player.pos = playerOldPos;
            player.moving = playerOldMoving;
        }
    }
}


//Players Menu
function newPlayer(socketID,accountName,accountTag) {
    return {
        downKey: "s",
        upKey: "w",
        leftKey: "a",
        rightKey: "d",
        useItem1: "q",
        useItem2: "e",
        fireItem: "r",
        name: simple.rnd(playerNames1) + simple.rnd(playerNames2),
        color: simple.rnd(360), //Hue
        color2: simple.rnd(300), //Saturation
        color3: simple.rnd(20,200), //Brightness
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
        selectingItem: 0,
        longestTail: 0,
        timeSurvived: 0,
        turboDuration: 0,
        turboActive: false,
        equiped: {
            head: false,
            body: false,
            tail: false,
        },
        items: [],
        status: [],
        active: false, 
        accountID: socketID,
        accountName: accountName,
        accountTag: accountTag,
        team: "white",
    }
}
function checkPlayer(player,socketID) {
    if (player.name == "") return "name-1";
    if (player.name.length > 20) return "name-2";
    
    if (Number(player.color) < 0) return "color-1";
    if (Number(player.color) > 360) return "color-2";
    if (Number(player.color2) < 0) return "color2-1";
    if (Number(player.color2) > 300) return "color2-2";
    if (Number(player.color3) < 20) return "color3-1";
    if (Number(player.color3) > 200) return "color3-2";

    if (player.accountID !== socketID) return "socketId-1" + player.accountID + "," + socketID;

    return true;
}

function fixBoard(oldBoard) {
    if (simple.type(oldBoard.originalMap[0][0]) !== "array") return oldBoard;

    let board = structuredClone(oldBoard);
    board.map = [];

    console.log("I AM HERE");

    board.originalMap = decompressMap(board.originalMap);

    return board;
}
function decompressMap(map) {
    let _newMap = [];
    for (let i = 0; i < map.length; i++) {
        let row = [];

        let _tiles = [];
        let _items = [];

        for (let j = 0; j < map[i][0].length; j++) {
            for (let k = 0; k < map[i][0][j][1]; k++) {
                _tiles.push(map[i][0][j][0]);
            }
        }
        for (let j = 0; j < map[i][1].length; j++) {
            for (let k = 0; k < map[i][1][j][1]; k++) {
                _items.push(map[i][1][j][0]);
            }
        }

        for (let j = 0; j < _tiles.length; j++) {
            row.push({
                mouseOver: false,
                tile: getByID(_tiles[j],tiles),
                item: getByID(_items[j],items),
            })
        }

        _newMap.push(row);
    }
    return _newMap;
}
function getByID(id,type) {
    let toReturn = false;
    searching: for (let i = 0; i < type.length; i++) {
        if (type[i].id === id) {
            toReturn = type[i];
            break searching;
        }
    }
    return toReturn;
}