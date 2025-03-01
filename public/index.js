
const socket = io({reconnection: false});

function uint8ArrayToObject(uint8Array) {
    return uint8Array;
}
//const player = new Player(x, y);
//const players = {};
let frontEndLobbies = {};
let localGameActive = false;
const localAccount = {
    id: false,
    isInGame: false,
    currentBoard: false,
    player: false,
    updateSnakeCells: [],
    updateCells: [],
    players: [],
    startTime: false,
    isInLobby: false,
    lobbyBoards: [],
};
let gameType = "local";
socket.on("kickPlayer",(playerID,message) => {
    if (playerID !== localAccount.id) return;
    killSwitch = true;
    alert(message);

})
socket.on("updateLocalGameModes",(accountID,gameModes,sentFrom) => {
    if (localAccount.id !== accountID) return;
    localAccount.gameModes = gameModes;

    if (sentFrom == "loadGameModesScreen") {
        loadGameModesScreen(localAccount.gameModes.length-1);
    }
    if (sentFrom == "editGameMode") {
        loadGameModesScreen();
    }
})
socket.on("setPlayer", (id,account,server_items,server_basedGameMode,server_presetGameModes,server_presetBoards,server_backgrounds,server_tiles,player_boards) =>{
    if (localAccount.id !== false) return;
    localAccount.id = id;
    localAccount.isInGame = false;
    localAccount.lobbyID = false;
    localAccount.players = account.players;
    localAccount.boards = player_boards;
    localAccount.gameModes = account.gameModes;
    localAccount.username = account.username;
    localAccount.isInLobby = false;
    localAccount.lobbyBoards = [];
    localAccount.gameModeLimit = account.gameModeLimit;
    localAccount.playerLimit = account.playerLimit;
    localAccount.boardLimit = account.boardLimit;
    localAccount.serverSnake = account.serverSnake;

    items = JSON.parse(pako.inflate(server_items, { to: 'string' }));
    tiles = JSON.parse(pako.inflate(server_tiles, { to: 'string' }));
    basedGameMode = server_basedGameMode;
    presetGameModes = server_presetGameModes;
    presetBoards = server_presetBoards;

    if (currentBoardIndex > localAccount.boards.length - 1) currentBoardIndex = 0;

    backgrounds = server_backgrounds;

    setScene("newMenu");
    //Load All Item Images
    setUpItemCanvas();
    //Load All Tile Images
    for (let i = 0; i < tiles.length; i++) {
        if (!tiles[i].img) continue;
    
        let img = $(".imageHolder").create("img");
        img.src = "img/" + tiles[i].img;
        img.id = "tile_" + tiles[i].name;
    }
    renderMapsInServersTab = true;
});
socket.on("sendingZippedBoard",(socketID,zippedBoard,boardName) => {
    if (socketID !== localAccount.id) return;
    downloadTextFile(boardName,zippedBoard);
})
socket.on("updatePlayersBoards",(socketID,boards,sentFrom,board) => {
    if (socketID !== localAccount.id) return;
    localAccount.boards = boards;
    
    currentBoardIndex = localAccount.boards.length-1;
    ls.save("currentBoardIndex",currentBoardIndex);
    
    if (sentFrom == "openMapEditor") {
        openMapEditor(localAccount.boards[currentBoardIndex]);
    }
    if (sentFrom == "loadBoardsScreen") {
        loadBoardsScreen();
    }
    if (sentFrom == "loadCustomizeSnakeScreen") {
        loadCustomizeSnakeScreen();
    }
    if (sentFrom == "changeServerBoard") {
        socket.emit("changeServerBoard",JSON.stringify(shortenBoard(board)));
        setScene("lobby");
    }
})
socket.on("setClientLobby",(socketID,lobby) => {
    if (socketID !== localAccount.id) return;
    localAccount.lobbyID = lobby.id;
    updateLobbyPage(lobby);
    setScene("lobby");
    localAccount.isInLobby = true;
})
socket.on("updateLobbyPage",(lobbyID,lobby,type,extra,extra2,extra3) => {
    if (localAccount.lobbyID !== lobbyID) return;
    updateLobbyPage(lobby,type,extra,extra2,extra3);
})
socket.on("updateLobbies", (backEndLobbies,onlineCount, lobbyCount,playerID) =>{
    if (playerID) if (playerID !== localAccount.id) return;
    if ($(".content_servers").style.display == "none") return;

    production.server_player_count.value = onlineCount;
    production.server_lobby_count.value = lobbyCount;

    frontEndLobbies = backEndLobbies;
    loadServersHTML();
    $(".servers_online_text").innerHTML = onlineCount;
})
socket.on("settingLobbyBoards",(boardsList) => {
    localAccount.lobbyBoards = (boardsList);
})
socket.on("startingGame", (lobby) => {
    lobby = (lobby);
    if (localAccount.lobbyID !== lobby.id) return;
    localAccount.isInGame = true;

    let foundPlayer = false;
    searchingForPlayer: for (let j = 0; j < lobby.players.length; j++) {
        if (localAccount.id === lobby.players[j]) {
            foundPlayer = true;
            break searchingForPlayer;
        } 
    } 
    if (!foundPlayer) return;
    
    itemList = lobby.items;
    currentBoard = lobby.board;
    updateSnakeCells = [];
    updateCells = [];
    currentGameMode = lobby.gameMode;
    oldBoardStatus = {
        aquamarine: {
            count: 0,
            location: false,
        },
        blue: {
            count: 0,
            location: false,
        },
        buff: {
            count: 0,
            location: false,
        },
        coral: {
            count: 0,
            location: false,
        },
        crimsonpurple: {
            count: 0,
            location: false,
        },
        gold: {
            count: 0,
            location: false,
        },
        green: {
            count: 0,
            location: false,
        },
        lemon: {
            count: 0,
            location: false,
        },
        lime: {
            count: 0,
            location: false,
        },
        magenta: {
            count: 0,
            location: false,
        },
        orange: {
            count: 0,
            location: false,
        },
        pink: {
            count: 0,
            location: false,
        },
        red: {
            count: 0,
            location: false,
        },
        skyblue: {
            count: 0,
            location: false,
        },
        slateblue: {
            count: 0,
            location: false,
        },
        venom: {
            count: 0,
            location: false,
        },
    }

    $(".closeWhenGameStarts").hide();
    setScene("game");
    $(".pauseGamePopup").hide();
    $("playerCardsHolder").innerHTML = "";
    $("playerCardsHolder").style.visibility = "visible";
    $(".firstPersonMap").hide();
    $(".firstPersonCanvas").hide();
    $(".extraCanvas").hide();
    $(".game_c2_info").show("flex");
    $(".gameInfoNumbers").hide();
    $(".gameInfoWaiting").show("flex");
    $(".game_c2_extra").hide();
    
    //Draw On Background canvas
    let backgroundImage = new Image();
    backgroundImage.src = "img/backgrounds/" + lobby.board.background + ".png";
    backgroundImage.onload = function() {
        ctx_background.drawImage(backgroundImage,0,0,canvas_background.width,canvas_background.height);
    }

    activePlayers = lobby.activePlayers;
    currentBoard = lobby.board;
    isActiveGame = true;
    gameEnd = false;
    gameType = "server";

    setResolution(lobby.board.map[0].length,lobby.board.map.length);
    setUpPlayerCanvas();
    renderGame();
    renderCells();
    setGameScene(activePlayers);
    serverGameLoop();
    generatePreGamePlayerInfo(activePlayers);

    let color = _color(getAverageCanvasColor(canvas_tiles)).darken(10).ogColor;
    document.body.style.background = color;
    
    socket.emit("snakeIsReady");

})
function generatePreGamePlayerInfo(players) {
    $(".preGamePlayerInfo").innerHTML = "";
    $(".preGamePlayerInfo").show();

    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        let holder = $(".preGamePlayerInfo").create("div");
        holder.className = "pgpi_card";
        holder.id = "pgpi_" + player.index;

        const rect = $("render_background").getBoundingClientRect();

        holder.css({
            left: ((player.pos.x*gridSize)+rect.left-50+(gridSize/2)) + "px",
            top: ((player.pos.y*gridSize)+rect.top-50+(gridSize/2)) + "px",
        })

        if (localAccount.id === player.accountID) {
            let ring = holder.create("div");
            ring.className = "pgpi_ring";
        } else {
            let title = holder.create("div");
            title.className = "pgpi_title";
            title.id = "pgpi_title_" + player.index;
            
            if (player.preGameStatus == "waiting") {
                title.innerHTML = "Loading";
                title.style.color = "blue";
            }
            if (player.preGameStatus == "ready") {
                title.innerHTML = player.accountName;
                title.style.color = "white";
            }
            if (player.preGameStatus == "disconnected") {
                title.innerHTML = "Disconnected";
                title.style.color = "red";
            }
        }
        
    }
}
socket.on("updatePreGamePlayerInfo",(lobbyID,players) => {
    if (localAccount.lobbyID !== lobbyID) return;

    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player.accountID == localAccount.id) continue;

        if (player.preGameStatus == "waiting") {
            $("pgpi_title_" + player.index).innerHTML = "Loading";
            $("pgpi_title_" + player.index).style.color = "blue";
        }
        if (player.preGameStatus == "ready") {
            $("pgpi_title_" + player.index).innerHTML = player.accountName;
            $("pgpi_title_" + player.index).style.color = "white";
        }
        if (player.preGameStatus == "disconnected") {
            $("pgpi_title_" + player.index).innerHTML = "Disconnected";
            $("pgpi_title_" + player.index).style.color = "red";
        }
    }
})
socket.on("endGame",(obj,lobbyID) => {
    obj = obj;
    if (localAccount.lobbyID !== lobbyID) return;
    localAccount.isInGame = false;
    showEndScreen()
    
    $("playerCardsHolder").style.cursor = "";
    gameEnd = true;
    isActiveGame = false;

    let timeSurvivedPlayer = obj.timeSurvivedPlayer;
    let longestTailPlayer = obj.longestTailPlayer;
    let mostKillsPlayer = obj.mostKillsPlayer;
    let minutes = obj.minutes;
    let seconds = obj.seconds;
    let longestTail = obj.longestTail;
    let mostKills = obj.mostKills;
    let winningPlayer = obj.winningPlayer;

    $(".longestTimePlayerImg").style.filter = getPlayerFilter(timeSurvivedPlayer);
    $(".longestTailPlayerImg").style.filter = getPlayerFilter(longestTailPlayer);
    $(".mostKillsImg").style.filter = getPlayerFilter(mostKillsPlayer);
    $(".engGame_playerNameTime").innerHTML = timeSurvivedPlayer.accountName;
    $(".engGame_playerTime").innerHTML = minutes + ":" + seconds + " Minutes";
    $(".engGame_playerNameLength").innerHTML = longestTailPlayer.accountName;
    $(".engGame_playerLength").innerHTML = (longestTail+1) + " Length";
    $(".engGame_playerNameKills").innerHTML = mostKillsPlayer.accountName;
    $(".engGame_playerKills").innerHTML = (mostKills) + " Kill" + (mostKills > 1 ? "s" : "");

    if (activePlayers.length > 1 && mostKills > 0) {
        $("snakeKillsStat").show("flex");
    } else {
        $("snakeKillsStat").hide();
    }

    $("winnerStat").hide();
    if (winningPlayer) {
        $("winnerStat").show("flex");
        $(".winnerPlayerImg").style.filter = getPlayerFilter(winningPlayer);
        $(".engGame_playerNameWinner").innerHTML = winningPlayer.accountName;
    }

})
socket.on("preparingGame",(lobbyID) => {
    if (localAccount.lobbyID !== lobbyID) return;
    $(".gameInfoWaiting").hide();
    $(".gameInfoNumbers").show("flex");
    showNumber(3);
})
function showNumber(index) {
    if (index == 0) index = "go";
    $(".np_img_holder").hide();
    $("np_img_" + index).show();

    if (index == "go") {
        setTimeout(function() {
            $(".game_c2_info").hide();
            $(".game_c2_extra").show();
            $(".preGamePlayerInfo").hide();
        },250);
        return;
    }

    setTimeout(function() {
        showNumber(index-1);
    },1000);

}
socket.on("updateMemorry",(obj) => {
    production.server_rss.times = [obj.rss];
    production.server_heapTotal.times = [obj.heapTotal];
    production.server_heapUsed.times = [obj.heapUsed];
    production.server_external.times = [obj.external];
    production.server_arrayBuffers.times = [obj.arrayBuffers];
});
socket.on("updatePositions",(obj,lobbyID) => {
    production.updatePositions_speed.timeStart = performance.now();
    if (localAccount.lobbyID !== lobbyID) return;
    if (!localAccount.isInGame) return; 

    production.updatePositions_recieveData.times.push(obj.byteLength);

    obj = JSON.parse(pako.inflate(obj, { to: 'string' }));

    if (_type(obj.g).type == "number") production.lobby_gameLoop.times.push(obj.g);

    if (obj.a) {
        for (let i = 0; i < obj.a.length; i++) {
            for (let j = 0; j < activePlayers.length; j++) {
                let local_player = activePlayers[j];
                let server_player = obj.a[i];
                if (local_player.index !== server_player.i) continue;
    
                local_player.selectingItem = server_player.s;
                local_player.items = server_player.it;
                local_player.moving = server_player.m;
                local_player.equiped = server_player.e;
                local_player.tailLength = server_player.t;
                local_player.playerKills = server_player.k;
    
                if (local_player.accountID === localAccount.id) updateGameScene(local_player);
                else updateGameFlags(local_player);
                //Will have to update glags of individual players
            }
        }
    }

    if (obj.s) {
        updateSnakeCells = updateSnakeCells.concat(obj.s);
    }
    if (obj.c) updateCells = updateCells.concat(obj.c);

    if (obj.p) {
        for (let i = 0; i < obj.p.length; i++) {
            let src = obj.p[i];
            if (src == "sounds/mouse/mouse_spawn_1.mp3") continue;
            var audio = new Audio(src);
            audio.play();
        }
    }
    

    if (obj.b) updateBoardStatusTracker(obj.b);
    
    server_renderPlayers();
    production.updatePositions_speed.times.push(performance.now() - production.updatePositions_speed.timeStart);
});
socket.on("askToSpectate",(accountID,lobbyID,code) => {
    if (localAccount.id !== accountID) return;
    makePopUp([
        {type: "title",text: "Lobby Is In A Round"},
        
        [
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "black",text:"Quit"},
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "black",text:"Spectate", onClick: function() {
                socket.emit("joinLobby",lobbyID,code,true);
            }},
        ],
        
    ],{
        id: "lobbyInRound",

    })
})
socket.on("setCode",(id,oldCode) => {
    if (localAccount.id !== id) return;
    chooseCodePopUp(oldCode);
})
socket.on("setPlayerToHomeScreen",(accountID) => {
    if (localAccount.id !== accountID) return;
    setScene("newMenu");
    localAccount.isInLobby = false;
})
function chooseCodePopUp(code) {
    makePopUp([
        {type: "title",text: "Set Code"},
        [
            {type: "input", id:"code", value:code, placeholder: "Type A Code", width: "200px"},
        ],
        
        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "black",text:"Done",onClick: (ids) => {
            const {code} = ids;
            if (code.value == "") return;

            $(".lobbyCode").innerHTML = code.value;
            socket.emit("setCode",code.value);
        }},
    ],{
        id: "chooseCode",

    })
}

function updateLobbyToServer(lobby){
    socket.emit("newLobby", (lobby));  
}
function server_joinLobby(lobby) {
    socket.emit("joinLobby",lobby);
}
function server_refreshLobby() {
    socket.emit("refreshLobbies",localAccount.id);
}

function server_startGame(){
    socket.emit("startGame")
}

function spawn(name,generateRandomItem = true,counting = false) {
    socket.emit("spawn",name,generateRandomItem = true,counting = false);
};

function getCurrentBoard() {

}
function server_movePlayers() {
    socket.emit("movePlayer");
}

//
function getAndLoadNewPlayer() {
    socket.emit("createNewPlayer");
}
socket.on("playersBeenMade",(players) => {
    localAccount.players = players;
    loadCustomizeSnakeScreen(players.length-1);
})
function savePlayers(updateLobby = false) {
    socket.emit("localSendingPlayers",localAccount.players,localAccount.serverSnake,updateLobby);
    $(".sc_bb_snakeImg").css({
        filter: getPlayerFilter(localAccount.serverSnake),
    });
}
//

productionType = "server";
setUpProductionHTML();
function updateProductionFunction() {
    updateProduction();

    requestAnimationFrame(updateProductionFunction);
}
updateProductionFunction();
