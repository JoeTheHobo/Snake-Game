const socket = io();

//const player = new Player(x, y);
//const players = {};
const playersInServer = [];
let frontEndLobbies = [];
let localGameActive = false;
const localAccount = {
    id: false,
    isInGame: false,
    currentBoard: false,
    player: false,
};
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

socket.on("setPlayer", (id, backendAccounts) =>{
    if (localAccount.id !== false) return;
    localAccount.id = backendAccounts[id].id;

});

socket.on("updateLobbies", (onlineLobbies,isPlayerJoining, lobby) =>{
    frontEndLobbies = onlineLobbies;
    loadServersHTML();
    if (isPlayerJoining) setScene("waiting", lobby);
})

socket.on("startingGame", (lobby) =>{
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
    localAccount.currentBoard = lobby.board;
    localAccount.playersInServer = lobby.activePlayers;
                    
    setScene("game");
    $(".endGamePopup").hide();
    $(".pauseGamePopup").hide();
    $("playerCardsHolder").innerHTML = "";
    $("playerCardsHolder").style.visibility = "visible";
    
    //Draw On Background canvas 
    let backgroundImage = new Image();
    backgroundImage.src = "img/" + currentBackground;
    backgroundImage.onload = function() {
        ctx_background.drawImage(backgroundImage,0,0,canvas_background.width,canvas_background.height);
    }

    setResolution(lobby.board.map[0].length,lobby.board.map.length);
    setUpPlayerCanvas();
    renderGame();
    fixItemDifferences(currentBoard.map);
    renderCells();
    //loadBoardStatus();

    requestAnimationFrame(gameLoop);

})
socket.on("updatedLocalAccount",(obj) => {
    localAccount.id = obj.id;
    localAccount.isInGame = obj.isInGame;
    localAccount.currentBoard = obj.currentBoard;
    localAccount.playersInServer = obj.playersInServer;
    localAccount.player = obj.player;

    setUpPlayerCanvas();
})

function updateLobbyToServer(lobby){
    socket.emit("newLobby", (lobby));  
}
function server_joinLobby(lobby) {
    socket.emit("joinLobby",lobby,localAccount.id);
}

function server_startGame(){
    socket.emit("startGame")
}

function spawn(name,generateRandomItem = true,counting = false) {
    socket.emit("spawn",name,generateRandomItem = true,counting = false);
};

function getCurrentBoard() {

}
function updateLocalAccount() {
    socket.emit("updateLocalAccount");
}
function movePlayer(playerID) {
    socket.emit("movePlayer",playerID);
}