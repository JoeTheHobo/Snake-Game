const socket = io();

//const player = new Player(x, y);
//const players = {};
const playersInServer = [];
let lobbies = [];
let localAccount = {};
socket.on('updatePlayers', (backendAccounts) => {
    for (const id in backendAccounts){
        const backendAccount = backendAccounts[id];
        if(typeof backendAccount == "function") continue;
        const backenedPlayer = backendAccount.players[0];

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
    }
})

socket.on("setPlayer", (id, backendAccounts) =>{
    localAccount = backendAccounts[id];
});

socket.on("updateLobbies", (onlineLobbies) =>{
    lobbies = onlineLobbies;
    console.log(lobbies);
})

function updateLobbyToServer(lobby){
    socket.emit("newLobby", (lobby));  
}