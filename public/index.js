const socket = io({reconnection: false});

//const player = new Player(x, y);
//const players = {};
const playersInServer = {};
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
socket.on('updatePlayers', (backendAccounts) => {
    if(localGameActive == false){
        /*
        for (const id in backendAccounts){
            const backendAccount = backendAccounts[id];
            if(typeof backendAccount == "function") continue;
            const backenedPlayer = backendAccount.players;

            if (!playersInServer[id]){
                playersInServer.push({
                    id: id, 
                    name: playerNames1.rnd() + playerNames2.rnd(),
                    color: backenedPlayer.color, //Hue
                    color2: backenedPlayer.color2, //Brightness
                    color3: backenedPlayer.color3, //Contrast
                    moving: backenedPlayer.moving,
                    growTail: backenedPlayer.growTail,
                    isDead: backenedPlayer.isDead,
                    pos: backenedPlayer.pos,
                    tail: backenedPlayer.tail,
                    moveQueue: backenedPlayer.moveQueue,
                    prevMove: backenedPlayer.prevMove,
                    whenInventoryIsFullInsertItemsAt: backenedPlayer.whenInventoryIsFullInsertItemsAt,
                    moveTik: backenedPlayer.moveTik,
                    moveSpeed: backenedPlayer.moveSpeed,
                    longestTail: backenedPlayer.longestTail,
                    timeSurvived: backenedPlayer.timeSurvived,
                    turboDuration: backenedPlayer.turboDuration,
                    turboActive: backenedPlayer.turboActive,
                    shield: backenedPlayer.shield,
                    items: backenedPlayer.items,
                    status: backenedPlayer.status, 
                })
            }
        }

        for (const id in playersInServer.id) {
            if (!backendAccounts[id]) {
                playersInServer.isDead;
            }
        }*/

        setScene("newMenu");
        localGameActive = true;
    }
})

socket.on("kickPlayer",() => {
    killSwitch = true;
    alert("Disconnected");

})

socket.on("setPlayer", (id, backendAccounts) =>{
    if (localAccount.id !== false) return;
    localAccount.id = backendAccounts[id].id;

});

socket.on("updateLobbies", (backEndLobbies,isPlayerJoining, lobby) =>{
    frontEndLobbies = backEndLobbies;
    loadServersHTML();
    if (isPlayerJoining) setScene("waiting", lobby);
})
socket.on("startingGame", (lobby,player) =>{
    if (localAccount.isInGame) return;

    let foundPlayer = false;
    searchingForPlayer: for (let j = 0; j < lobby.players.length; j++) {
        if (localAccount.id === lobby.players[j]) {
            foundPlayer = true;
            localAccount.player = lobby.players[j];
            break searchingForPlayer;
        } 
    } 
    if (!foundPlayer) return;
    localAccount.isInGame = true;
    currentBoard = lobby.board;
    localAccount.playersInServer = lobby.activePlayers;
    updateSnakeCells = [];
    updateCells = [];
    currentGameMode = lobby.gameMode;
    localAccount.player = player;
    localAccount.startTime = 0;
                    
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
socket.on("endGame",(obj) => {
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
socket.on("updatePositions",(obj) => {

    let player = obj.player;
    ctx_top.clearRect(0,0,canvas_top.width,canvas_top.height);
    ctx_top.fillRect(player.pos.x*gridSize,player.pos.y*gridSize,gridSize,gridSize)

    deltaTime = obj.deltaTime;

    if (obj.dontSend) return;

    let canvasList = [];
    let oldPosList = [];
    for (let i = 0; i < activePlayers.length; i++) {
        canvasList.push(activePlayers[i].canvas)
        oldPosList.push({x: activePlayers.x, y: activePlayers.y})
    }
    activePlayers = obj.activePlayers;
    for (let i = 0; i < canvasList.length; i++) {
        activePlayers[i].canvas = canvasList[i];
        if (oldPosList[i].x !== activePlayers[i].pos.x || oldPosList[i].x !== activePlayers[i].pos.x) {
            updateSnakeCells.push(oldPosList[i]);
        }
    }
    localAccount.player = obj.player;
    updateSnakeCells = updateSnakeCells.concat(obj.updateSnakeCells);
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