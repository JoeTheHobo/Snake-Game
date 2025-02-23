const socket = io({reconnection: false});

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

socket.on("setPlayer", (id,account) =>{
    if (localAccount.id !== false) return;
    localAccount.id = id;
    localAccount.isInGame = false;
    localAccount.lobbyID = false;
    localAccount.players = account.players;
    localAccount.boards = account.boards;
    localAccount.gameModes = account.gameModes;
    localAccount.username = account.username;
    localAccount.isInLobby = false;
    localAccount.lobbyBoards = [];
});
socket.on("setClientLobby",(socketID,lobby) => {
    if (socketID !== localAccount.id) return;
    localAccount.lobbyID = lobby.id;
    socket.emit("requestUpdateLobbyPage");
    updateLobbyPage(lobby);
    setScene("lobby");
    localAccount.isInLobby = true;
})
socket.on("updateLobbyPage",(lobby) => {
    if (localAccount.lobbyID !== lobby.id) return;
    updateLobbyPage(lobby);
})
socket.on("updateLobbies", (backEndLobbies,onlineCount, lobby,playerID) =>{
    if (playerID) if (playerID !== localAccount.id) return;
    if ($(".content_servers").style.display == "none") return;

    frontEndLobbies = backEndLobbies;
    loadServersHTML();
    $(".servers_online_text").innerHTML = onlineCount;
})
socket.on("settingLobbyBoards",(boardsList) => {
    localAccount.lobbyBoards = boardsList;
})
socket.on("startingGame", (lobby) => {
    productionType = "server";
    setUpProductionHTML();
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
    
    currentBoard = lobby.board;
    updateSnakeCells = [];
    updateCells = [];
    currentGameMode = lobby.gameMode;

    $(".closeWhenGameStarts").hide();
    setScene("game");
    $(".pauseGamePopup").hide();
    $("playerCardsHolder").innerHTML = "";
    $("playerCardsHolder").style.visibility = "visible";
    $(".firstPersonMap").hide();
    $(".firstPersonCanvas").hide();
    $(".extraCanvas").hide();
    
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

    let color = _color(getAverageCanvasColor(canvas_tiles)).darken(10).ogColor;
    console.log(color)
    document.body.style.background = color;
    

})
socket.on("endGame",(obj,lobbyID) => {
    if (localAccount.lobbyID !== lobbyID) return;
    localAccount.isInGame = false;
    
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

    showEndScreen()
})
socket.on("preparingGame",(lobbyID) => {
    if (localAccount.lobbyID !== lobbyID) return;
    $(".numbersPopup").show();
    showNumber(3);
})
function showNumber(index) {
    if (index == 0) index = "go";
    $(".np_img_holder").hide();
    $("np_img_" + index).show();

    if (index == "go") {
        setTimeout(function() {
            $(".numbersPopup").hide();
        },250);
        return;
    }

    setTimeout(function() {
        showNumber(index-1);
    },1000);

}
socket.on("updatePositions",(obj,lobbyID) => {
    if (localAccount.lobbyID !== lobbyID) return;
    if (!localAccount.isInGame) return; 

    const jsonString = JSON.stringify(obj);
    const sizeInBytes = new TextEncoder().encode(jsonString).length;
    production.updatePositions_recieveData.times.push(sizeInBytes);
    for (let i = 0; i < obj.updatedPlayers.length; i++) {
        for (let j = 0; j < activePlayers.length; j++) {
            let local_player = activePlayers[j];
            let server_player = obj.updatedPlayers[i];
            if (local_player.index !== server_player.index) continue;

            local_player.selectingItem = server_player.selectingItem;
            local_player.items = server_player.items;
            local_player.moving = server_player.moving;
            local_player.shield = server_player.shield;
            local_player.tailLength = server_player.tailLength;
            local_player.playerKills = server_player.playerKills;

            if (local_player.accountID === localAccount.id) updateGameScene(local_player);
            else updateGameFlags(local_player);
            //Will have to update glags of individual players
        }
    }

    updateSnakeCells = updateSnakeCells.concat(obj.updateSnakeCells);
    updateCells = updateCells.concat(obj.updateCells);

    for (let i = 0; i < obj.playSounds.length; i++) {
        let src = obj.playSounds[i];
        var audio = new Audio(src);
        audio.play();
    }
    
    server_renderPlayers();
    updateProduction();
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
    socket.emit("localSendingPlayers",localAccount.players,updateLobby);
}
//