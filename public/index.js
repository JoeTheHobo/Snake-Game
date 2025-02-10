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
    startTime: false,
};
let gameType = "local";

socket.on("kickPlayer",(playerID,message) => {
    if (playerID !== localAccount.id) return;
    killSwitch = true;
    alert(message);

})

socket.on("setPlayer", (id) =>{
    if (localAccount.id !== false) return;
    localAccount.id = id;
    localAccount.isInGame = false;
    localAccount.lobbyID = false;
});
socket.on("setClientLobby",(socketID,lobbyID,lobby) => {
    if (socketID !== localAccount.id) return;
    localAccount.lobbyID = lobbyID;
    setScene("waiting", lobby);
})
socket.on("updateLobbies", (backEndLobbies,isPlayerJoining, lobby,playerID) =>{
    if (playerID) if (playerID !== localAccount.id) return;
    frontEndLobbies = backEndLobbies;
    loadServersHTML();
})
socket.on("startingGame", (lobby) => {
    console.log(localAccount.lobbyID,lobby.id);
    if (localAccount.lobbyID !== lobby.id) return;

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
                    
    setScene("game");
    $(".endGamePopup").hide();
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
    gameType = "server";

    setResolution(lobby.board.map[0].length,lobby.board.map.length);
    setUpPlayerCanvas();
    renderGame();
    renderCells();
    //loadBoardStatus();
    serverGameLoop();
    

})
socket.on("endGame",(obj,lobbyID) => {
    if (localAccount.lobbyID !== lobbyID) return;

    $("playerCardsHolder").style.cursor = "";
    gameEnd = true;
    isActiveGame = false;
    $(".endGamePopup").show("flex");

    let timeSurvivedPlayer = obj.timeSurvivedPlayer;
    let longestTailPlayer = obj.longestTailPlayer;
    let mostKillsPlayer = obj.mostKillsPlayer;
    let minutes = obj.minutes;
    let seconds = obj.seconds;
    let longestTail = obj.longestTail;
    let mostKills = obj.mostKills;

    $(".longestTimePlayerImg").style.filter = `hue-rotate(${timeSurvivedPlayer.color}deg) sepia(${timeSurvivedPlayer.color2}%) contrast(${timeSurvivedPlayer.color3}%)`;
    $(".longestTailPlayerImg").style.filter = `hue-rotate(${longestTailPlayer.color}deg) sepia(${longestTailPlayer.color2}%) contrast(${longestTailPlayer.color3}%)`;
    $(".mostKillsImg").style.filter = `hue-rotate(${mostKillsPlayer.color}deg) sepia(${mostKillsPlayer.color2}%) contrast(${mostKillsPlayer.color3}%)`;
    $(".engGame_playerNameTime").innerHTML = timeSurvivedPlayer.name;
    $(".engGame_playerTime").innerHTML = minutes + ":" + seconds + " Minutes";
    $(".engGame_playerNameLength").innerHTML = longestTailPlayer.name;
    $(".engGame_playerLength").innerHTML = (longestTail+1) + " Length";
    $(".engGame_playerNameKills").innerHTML = mostKillsPlayer.name;
    $(".engGame_playerKills").innerHTML = (mostKills) + " Kill" + (mostKills > 1 ? "s" : "");

    if (activePlayers.length > 1 && mostKills > 0) {
        $("snakeKillsStat").show("flex");
    } else {
        $("snakeKillsStat").hide();
    }

    $("winnerStat").hide();
})
socket.on("updatePositions",(obj,lobbyID) => {
    if (localAccount.lobbyID !== lobbyID) return;

    let canvasList = [];
    let oldPosList = [];
    for (let i = 0; i < activePlayers.length; i++) {
        canvasList.push(activePlayers[i].canvas)
        oldPosList.push({x: activePlayers.x, y: activePlayers.y})
    }
    activePlayers = obj.activePlayers;
    for (let i = 0; i < canvasList.length; i++) {
        activePlayers[i].canvas = canvasList[i];
        // if (oldPosList[i].x !== activePlayers[i].pos.x || oldPosList[i].x !== activePlayers[i].pos.x) {
        //     updateSnakeCells.push(oldPosList[i]);
        // }
    }
    updateSnakeCells = updateSnakeCells.concat(obj.updateSnakeCells);
    updateCells = updateCells.concat(obj.updateCells);
    
    deleteSnakeCells();
    renderPlayers();
});
socket.on("updatedLocalAccount",(obj) => {
    localAccount.id = obj.id;
    localAccount.isInGame = obj.isInGame;
    currentBoard = obj.board;
    updateCells = updateCells.concat(obj.updateCells);
    renderCells();
})

function updateLobbyToServer(lobby){
    socket.emit("newLobby", (lobby));  
}
function server_joinLobby(lobby) {
    socket.emit("joinLobby",lobby,localAccount.id);
}

function server_startGame(){
    console.log("Starting Server",socket.connected)
    socket.emit("startGame",localAccount.id)
}

function spawn(name,generateRandomItem = true,counting = false) {
    socket.emit("spawn",name,generateRandomItem = true,counting = false);
};

function getCurrentBoard() {

}
function server_movePlayers() {
    socket.emit("movePlayer");
}