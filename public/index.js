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
});
socket.on("setClientLobby",(socketID,lobby) => {
    if (socketID !== localAccount.id) return;
    localAccount.lobbyID = lobby.id;
    socket.emit("requestUpdateLobbyPage");
    updateLobbyPage(lobby);
    setScene("lobby");
})
socket.on("updateLobbyPage",(lobby) => {
    updateLobbyPage(lobby);
})
socket.on("updateLobbies", (backEndLobbies,onlineCount, lobby,playerID) =>{
    if (playerID) if (playerID !== localAccount.id) return;
    if ($(".content_servers").style.display == "none") return;

    frontEndLobbies = backEndLobbies;
    loadServersHTML();
    $(".servers_online_text").innerHTML = onlineCount;
})
socket.on("startingGame", (lobby) => {
    productionType = "server";
    setUpProductionHTML();
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
    generatePlayerCards(activePlayers);
    serverGameLoop();

    let color = _color(getAverageCanvasColor(canvas_tiles)).darken(20).color;
    document.body.style.background = color;
    

})
socket.on("endGame",(obj,lobbyID) => {
    if (localAccount.lobbyID !== lobbyID) return;
    localAccount.isInGame = false;
    
    $("playerCardsHolder").style.cursor = "";
    gameEnd = true;
    isActiveGame = false;

    console.log(obj)

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

    showEndScreen()
})
socket.on("preparingGame",(lobby) => {
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

            updatePlayerCard(local_player);
        }
    }

    updateSnakeCells = updateSnakeCells.concat(obj.updateSnakeCells);
    updateCells = updateCells.concat(obj.updateCells);
    
    server_renderPlayers();
    updateProduction();
});
socket.on("updatedLocalAccount",(obj) => {
    localAccount.id = obj.id;
    localAccount.isInGame = obj.isInGame;
    currentBoard = obj.board;
    updateCells = updateCells.concat(obj.updateCells);
    renderCells();
})
socket.on("setCode",(id,oldCode) => {
    if (localAccount.id !== id) return;
    chooseCodePopUp(oldCode);
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
    socket.emit("joinLobby",lobby,localAccount.id);
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
function savePlayers() {
    socket.emit("localSendingPlayers",localAccount.players);
}
//