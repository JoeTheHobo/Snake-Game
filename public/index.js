const socket = io({transports: ["websocket"],reconnection: false});

function uint8ArrayToObject(uint8Array) {
    return uint8Array;
}

$(".sc_chatHolder").style.maxHeight = (0.1627638737758433 * window.innerHeight) + "px";
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
    selectionBoards: false,
};
let gameType = "local";
socket.on("kickPlayer",(message) => {
    killSwitch = true;
    alert(message);

})
socket.on("setPlayer", (id,account,server_accessedBattlePasses,server_items,server_basedGameMode,server_presetGameModes,server_backgrounds,server_tiles,server_nameColors,server_snakeColors) =>{
    localAccount.id = id;
    localAccount.isInGame = false;
    localAccount.lobbyID = false;
    localAccount.players = account.players;
    localAccount.username = account.username;
    localAccount.tag = account.tag;
    localAccount.isInLobby = false;
    localAccount.lobbyBoards = [];
    localAccount.gameModeLimit = account.gameModeLimit;
    localAccount.playerLimit = account.playerLimit;
    localAccount.boardLimit = account.boardLimit;
    localAccount.serverSnake = account.serverSnake;
    localAccount.allowedItemIds = account.allowedItemIds;
    localAccount.allowedTileIds = account.allowedTileIds;
    localAccount.allowedNameColors = account.allowedNameColors;
    localAccount.allowedSnakeColors = account.allowedSnakeColors;
    localAccount.battlePassPoints = account.battlePassPoints;
    localAccount.battlePasses = account.battlePasses;
    localAccount.coins = account.coins;
    localAccount.publishedBoardLimit = account.publishedBoardLimit;
    localAccount.loggedIn = account.loggedIn;
    localAccount.status = account.status;
    localAccount.dateCreated = account.dateCreated;
    localAccount.boards = [];
    accessedBattlePasses = server_accessedBattlePasses;

    global_musicVolume = account.musicVolume;
    global_sfxVolume = account.sfxVolume;
    adjustVolumeSliders();


    $(".newMenu_statPoints").innerHTML = localAccount.battlePassPoints;
    $(".newMenu_statGold").innerHTML = localAccount.coins;
    if (server_items) items = JSON.parse(pako.inflate(server_items, { to: 'string' }));
    if (server_tiles)  tiles = JSON.parse(pako.inflate(server_tiles, { to: 'string' }));
    if (server_basedGameMode) basedGameMode = server_basedGameMode;
    if (server_presetGameModes) presetGameModes = server_presetGameModes;
    if (server_nameColors) local_nameColors = server_nameColors;
    if (server_snakeColors) local_snakeColors = server_snakeColors;

    if (server_backgrounds) backgrounds = server_backgrounds;

    if (server_items) {
        global_loading_total = items.length;
        global_loading_total += tiles.length;
        global_loading_total *= 4;

        //Load All Item Images
        requestIdleCallback(function() {
            loadAllCanvas(items);
        })
        //Load All Tile Images
        requestIdleCallback(function() {
            loadAllCanvas(tiles);
        })
        //Make Game Tips
        generateGameTips();
    }
    

    loadAllBattlePasses();

    renderMapsInServersTab = true;
});
socket.on("sendingZippedBoard",(zippedBoard,boardName) => {
    downloadTextFile(boardName,zippedBoard);
})
socket.on("updatePlayersBoards",(board,sentFrom) => {
    if (sentFrom == "openMapEditor") {
        openMapEditor(board);
    }
    if (sentFrom == "loadBoardsScreen") {
        loadBoardMenu();
    }
    if (sentFrom == "loadCustomizeSnakeScreen") {
        console.log("AHHHH")
    }
    if (sentFrom == "changeServerBoard") {
        socket.emit("changeServerBoard",pako.deflate(JSON.stringify(shortenBoard(board)), { to: 'string' }));
        setScene("lobby");
    }
})
socket.on("serverSending_publishedBoards",(boardStats) => {
    localAccount.selectionBoards = boardStats;
    updateBoardMenu();
    //showBoardMenu(boardStats);
})
socket.on("serverSending_boardStats",(boardStats,sentFrom) => {
    localAccount.boards = boardStats;
    if (sentFrom == "MapEditor") {
        generatePlayerBoardsScreen(localAccount.boards);
    }
})
socket.on("setClientLobby",(lobby) => {
    if (lobby.hostID == localAccount.id) localAccount.isHost = true;
    else localAccount.isHost = false;

    localAccount.lobbyID = lobby.id;
    updateLobbyPage(lobby);
    setScene("lobby");
    localAccount.isInLobby = true;
})
socket.on("updateLobbyPage",(lobby,type,extra,extra2,extra3) => {
    updateLobbyPage(lobby,type,extra,extra2,extra3);
})
socket.on("updateLobbies", (backEndLobbies,onlineCount, lobbyCount,) =>{
    production.server_player_count.value = onlineCount;
    production.server_lobby_count.value = lobbyCount;
    if ($(".content_servers").style.display == "none") return;


    frontEndLobbies = backEndLobbies;
    loadServersHTML();
    $(".servers_online_text").innerHTML = onlineCount;
})
socket.on("settingLobbyBoards",(boardsList) => {
    localAccount.lobbyBoards = (boardsList);
})
socket.on("startingGame", (lobby) => {
    //lobby = JSON.parse(pako.inflate(lobby, { to: 'string' }));
    localAccount.isInGame = true;

    let foundPlayer = false;
    searchingForPlayer: for (let j = 0; j < lobby.players.length; j++) {
        if (localAccount.id === lobby.players[j]) {
            foundPlayer = true;
            localAccount.player  = lobby.players[j];
            break searchingForPlayer;
        } 
    } 
    if (!foundPlayer) return;
    
    itemList = lobby.items;
    currentBoard = lobby.board;
    updateSnakeCells = [];
    updateCells = [];
    updateTiles = [];
    activeProjectiles = [];
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
    localAccount.boardStatus = oldBoardStatus;
    localAccount.boardFilters = [];

    $(".closeWhenGameStarts").hide();
    setScene("game");
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
    emotesToRender = [];
    isActiveGame = true;
    gameEnd = false;
    gameType = "server";
    localAccount.firstRound = true;

    addZonesToRender(lobby.board.spawnZones);

    setResolution(lobby.board.map[0].length,lobby.board.map.length);
    setUpPlayerCanvas();
    ctx_items.clearRect(0,0,canvas_items.width,canvas_items.height);
    ctx_tiles.clearRect(0,0,canvas_tiles.width,canvas_tiles.height);
    setGameScene(activePlayers);
    serverGameLoop();
    generatePlayerHTMLOverlays(activePlayers);
    generatePreGamePlayerInfo(activePlayers);
    
    socket.emit("snakeIsReady");
    setAllCanvasToRightSize();

})
function generatePlayerHTMLOverlays(players) {
    $(".preGamePlayerInfo").innerHTML = "";
    
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        let holder = $(".preGamePlayerInfo").create("div");
        holder.className = "pgpi_card";
        holder.id = "pgpi_" + player.index;

        holder.ring = holder.create("div.pgpi_ring");
        holder.text = holder.create("div");
        holder.text.className = "pgpi_title";
        holder.text.id = "pgpi_title_" + player.index;  
    }
}
function updatePlayerHTMLOverlayPositions(players) {
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        let holder = $("pgpi_" + player.index);

        const rect = $("render_background").getBoundingClientRect();
        holder.css({
            left: ((player.pos.x*gridSize)+rect.left-50+(gridSize/2)) + "px",
            top: ((player.pos.y*gridSize)+rect.top-50+(gridSize/2)) + "px",
        })
    }

}
function hidePlayerHTMLOverlays() {
    let query = document.querySelectorAll(".pgpi_card");
    for (let i = 0; i < query.length; i++) {
        let child = query[i];
        child.ring.hide();
        child.text.hide();
    }
}
socket.on("showPlayerRing",(index,timer) => {
    let holder = $("pgpi_" + index);
    holder.ring.show();

    setTimeout(function() {
        holder.ring.hide();
    },timer * 1000);

})
function generatePreGamePlayerInfo(players) {
    updatePlayerHTMLOverlayPositions(players);
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        let holder = $("pgpi_" + player.index);

        if (localAccount.id === player.accountID) {
            holder.ring.show();
            holder.text.hide();
        } else {
            holder.text.show();
            holder.ring.hide();
            if (player.preGameStatus == "waiting") {
                holder.text.innerHTML = "Loading";
                holder.text.style.color = "blue";
            }
            if (player.preGameStatus == "ready") {
                holder.text.innerHTML = player.accountName;
                holder.text.style.color = "white";
            }
            if (player.preGameStatus == "disconnected") {
                holder.text.innerHTML = "Disconnected";
                holder.text.style.color = "red";
            }
        }
        
    }

}

socket.on("updatePreGamePlayerInfo",(players) => {
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
$(".endScreen_br_image").on("click",function() {
    if (this.liked == true) {
        this.liked = false;
        this.src = "img/menuIcons/star_inactive.png";
        socket.emit("playerDislikedLobbyBoard");
    } else {
        this.liked = true;
        this.src = "img/menuIcons/star_active.png";
        socket.emit("playerLikedLobbyBoard");
    }
})
socket.on("playerHasLikedBoard",() => {
    $(".endScreen_br_image").liked = true;
    $(".endScreen_br_image").src = "img/menuIcons/star_active.png";
})
socket.on("playerHasNotLikedBoard",() => {
    $(".endScreen_br_image").liked = false;
    $(".endScreen_br_image").src = "img/menuIcons/star_inactive.png";

})
socket.on("endGame",(obj) => {
    obj = obj;
    if (!localAccount.isInGame) return;
    localAccount.isInGame = false;
    showEndScreen()

    if (localAccount.status !== "Guest") {
        $(".endScreen_boardRating").show("flex");
        socket.emit("checkIfILikeTheBoard")
    } else {
        $(".endScreen_boardRating").hide();
    }
    
    $("playerCardsHolder").style.cursor = "";
    gameEnd = true;
    isActiveGame = false;

    let timeSurvivedPlayer = obj.timeSurvivedPlayer;
    let longestTailPlayer = obj.longestTailPlayer;
    let mostKillsPlayer = obj.mostKillsPlayer;

    $("endScreen_winnerTitle").innerHTML = obj.winningTitle;
    $("endScreen_conditionTitle").innerHTML = obj.conditionTitle;
    if (obj.conditionImage) {
        $("endScreen_conditionTitle").innerHTML += `<img src="${getImage(getById(obj.conditionImage.type,obj.conditionImage.id),"src")}" class="endScreen_conditionTitleImage">`;
    }

    $(".endScreen_winnersList").innerHTML = "";
    for (let i = 0; i < obj.winningPlayers.length; i++) {
        let div = $(".endScreen_winnersList").create("div.endScreen_winnerHolder");
        let imgHolder = div.create("div.endScreen_winnerImageHolder");
        let img = imgHolder.create("img.fullImage");
        img.classAdd("borderRadius5");
        img.src = "img/snakeSkins/classic/snake_classic_head.png";
        img.css({
            filter: getPlayerFilter(obj.winningPlayers[i]),
        })

        let name = div.create("div.endScreen_winnerName");
        name.innerHTML = obj.winningPlayers[i].accountName;
    }

    let listA = $("endScreen_playerList1");
    let listB = $("endScreen_playerList2");

    listA.innerHTML = "";
    listB.innerHTML = "";

    for (let i = 0; i < obj.activePlayers.length; i++) {
        let html_list = Math.floor(i/4) === 0 ? listA : listB;
        let player = obj.activePlayers[i];
        let playerCardHolder = html_list.create("div.endScreen_playerCardHolder");

        let row1 = playerCardHolder.create("div.endScreen_pch_topRow");
        let playerImageHolder = row1.create("div.endScreen_pch_playerImageHolder");
        let playerImage = playerImageHolder.create("img.fullImage");
        playerImage.classAdd("borderRadius5");
        playerImage.src = "img/snakeSkins/classic/snake_classic_head.png";
        playerImage.css({
            filter: getPlayerFilter(player),
        })

        let playerName = row1.create("div.endScreen_pch_playerName");
        playerName.innerHTML = player.accountName;

        let longestTailText = playerCardHolder.create("div.endSceeen_pch_stat");
        longestTailText.innerHTML = "Longest Tail: " + (player.longestTail + 1);
        if (longestTailPlayer === player.accountName) longestTailText.classAdd("endScreen_pch_goldText");

        let timeSurvived = Math.max(...player.timeAlive);
        let totalSeconds = Math.floor(timeSurvived / 1000);
        let minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        let seconds = (totalSeconds % 60).toString().padStart(2, '0');
        let timeSurvivedText = playerCardHolder.create("div.endSceeen_pch_stat");
        timeSurvivedText.innerHTML = "Time Survived: " + minutes + ":" + seconds;
        if (timeSurvivedPlayer === player.accountName) timeSurvivedText.classAdd("endScreen_pch_goldText");

        let playersKilledText = playerCardHolder.create("div.endSceeen_pch_stat");
        playersKilledText.innerHTML = "Players Killed: " + player.playerKills;
        if (mostKillsPlayer === player.accountName) playersKilledText.classAdd("endScreen_pch_goldText");

        playerCardHolder.css({
            background: `linear-gradient(107.12deg, ${_color(player.team).darken(30).ogColor} 2.94%, ${_color(player.team).darken(50).ogColor} 100%)`,
        })

    }

})
socket.on("preparingGame",() => {
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
            hidePlayerHTMLOverlays();
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
socket.on("updatePositions",(obj) => {
    production.updatePositions_speed.timeStart = performance.now();
    if (!localAccount.isInGame) return; 

    production.updatePositions_recieveData.times.push(obj.byteLength);

    obj = JSON.parse(pako.inflate(obj, { to: 'string' }));

    if (_type(obj.g).type == "number") production.lobby_gameLoop.times.push(obj.g);

    if (obj.a) {
        updatePlayerHTMLOverlayPositions(
            obj.a.map(o => ({
                pos: o.po,
                index: o.i
            }))
        );
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
                local_player.invinsibleBodyEffect = server_player.ibe;
                local_player.timeAlive = server_player.ta;
                local_player.ghost = server_player.gh;
    
                if (local_player.accountID === localAccount.id) {
                    localAccount.player  = local_player;
                    updateGameScene(local_player);
                }
                else updateGameFlags(local_player);
                //Will have to update glags of individual players
            }
        }
    }

    if (obj.pr) {
        activeProjectiles = obj.pr;
    }
    if (obj.s) {
        updateSnakeCells = updateSnakeCells.concat(obj.s);
        console.log(updateSnakeCells)
    }
    if (obj.c) updateCells = updateCells.concat(obj.c);
    if (obj.t) updateTiles = updateTiles.concat(obj.t);
    if (obj.z) updateZones = updateZones.concat(obj.z);

    if (obj.p) {
        for (let i = 0; i < obj.p.length; i++) {
            let soundObject = obj.p[i];
            playAudio(soundObject.src,soundObject.type);
        }
    }

    if (obj.f) {
        for (let i = 0; i < obj.f.length; i++) {
            let key = rnd(99999);
            localAccount.boardFilters.push({
                filter: obj.f[i].filter,
                key: key,
            });

            setTimeout(function() {
                for (let i = 0; i < localAccount.boardFilters.length; i++) {
                    if (localAccount.boardFilters[i].key === key) localAccount.boardFilters.splice(i,1);
                }
            },obj.f[i].duration*1000)
        }
    }
    let filterString = "";
    for (let i = 0; i < localAccount.boardFilters.length; i++) {
        filterString += localAccount.boardFilters[i].filter + " ";
    }
    canvas_background.style.filter = filterString;
    canvas_tiles.style.filter = filterString;
    canvas_items.style.filter = filterString;
    canvas_emote_background.style.filer = filterString;
    canvas_players.style.filter = filterString;
    canvas_overhangs.style.filter = filterString;
    canvas_top.style.filter = filterString;
    

    if (obj.b) updateBoardStatusTracker(obj.b);
    
    server_renderPlayers();
    production.updatePositions_speed.times.push(performance.now() - production.updatePositions_speed.timeStart);

});
socket.on("askToSpectate",(lobbyID,code) => {
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
socket.on("setPlayerToHomeScreen",() => {
    setScene("newMenu");
    localAccount.isInLobby = false;
})
socket.on("lsSave",(name,save) => {
    ls.save(name,save);
})
socket.on("login_error",(err) => {
    $(".lrd_warning_signin").show();
    $(".lrd_warning_signin").innerHTML = err;
})
socket.on("signup_error",(err) => {
    $(".lrd_warning_signup").show();
    $(".lrd_warning_signup").innerHTML = err;
})
socket.on("user_registered_successfully",(message) => {
    loginLoad("verifyEmail");
})
function updateLobbyToServer(lobby){
    socket.emit("newLobby", (lobby));  
}
function server_joinLobby(lobby) {
    socket.emit("joinLobby",lobby);
}
function server_refreshLobby() {
    socket.emit("refreshLobbies");
}

function server_startGame(){
    socket.emit("startGame")
}

function spawn(name,generateRandomItem = true,counting = false) {
    socket.emit("spawn",name,generateRandomItem = true,counting = false);
};
function server_movePlayers() {
    socket.emit("movePlayer");
}

//
function getAndLoadNewPlayer() {
    socket.emit("createNewPlayer");
}
socket.on("consolelog",(log) => {
    console.log(log);
})
socket.on("popup",(text) => {
    genericPopup(text);
})
function genericPopup(text) {
    makePopUp([
        {type: "title",text: text},
        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "200px",background: "green",text:"Close"}
    ],{
        id: "serverPopup",

    })

}
socket.on("setScene",(scene) => {
    setScene(scene);
})
function saveServerSnake() {
    socket.emit("saveServerSnake",localAccount.serverSnake);
    $(".sc_bb_snakeImg").css({
        filter: getColorFilter(localAccount.serverSnake.colorID),
    });
}

socket.on("allowPasswordChange",() => {
    makePopUp([
        {type: "title",text: "Enter New Password"},
        {type: "input", id:"password", inputType:"password", maxLength: "30", placeholder: "New Password...", width: "200px"},
        {type: "title",text: "Re-Enter Password"},
        {type: "input", id:"password2", inputType:"password", maxLength: "30", placeholder: "New Password...", width: "200px"},
        {type: "text", className: "paswordWarning", color: "red"},
        {type: "button",cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "green",text:"Continue",onClick: (ids) => {
            const {password,password2} = ids;

            let warning = false;
            if (password.value == "" || password2.value == "") warning = "All Fields Required";
            if (password.value !== password2.value) warning = "Passwords Don't Match";

            if (warning) {
                $(".paswordWarning").show();
                $(".paswordWarning").innerHTML = warning;
                return;
            }

            socket.emit("user_changePassword",password.value);
            password.$P().remove();

            
        }},
    ],{
        exit: {
            cursor: "url('./img/pointer.cur'), auto",
        },
        id: "changePasswordCheck",

    })
    $(".paswordWarning").hide();
})
socket.on("disallowPasswordChange",() => {
    makePopUp([
        {type: "title",text: "Incorrect Password"},
        [
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "200px",background: "green",text:"Forgot Password", onClick: () => {
                socket.emit("user_forgotPassword")
            }},
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "200px",background: "green",text:"Close"}
        ],
        
    ],{
        exit: {
            cursor: "url('./img/pointer.cur'), auto",
        },
        id: "changePasswordDisallow",

    })
})
//

productionType = "server";
setUpProductionHTML();
function updateProductionFunction() {
    updateProduction();

    requestAnimationFrame(updateProductionFunction);
}
updateProductionFunction();

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); // Get token from URL
    const action = urlParams.get('action'); // Get the action type (verify or reset-password)

    if (token) {
        if (token.subset("=\\after","end") === 'verify') {
            // Handle verification process
            setScene("login");
            loginLoad("login");
        }
        if (token.subset("=\\after","end") === 'reset-password') {
            // Handle reset-password process

        }
       
        return;
    }

    let signInToken = ls.get("signInToken",false);
    let signInEmail = ls.get("signInEmail",false);
    if (signInToken && signInEmail) {
        socket.emit("signInUsingToken",signInToken,signInEmail);
    } else {
        setScene("newMenu");
    }
    
    
};

socket.on("startRespawnTimer",function(time,deathPoint) {
    handelRespawnTimer(time,deathPoint)
})
function handelRespawnTimer(time,deathPoint) {

    let miliseconds = Date.now()-deathPoint; 
    if (miliseconds >= (time*1000)) {
        $(".whiteTextAtTopOfGame").hide();
        return;
    }

    let seconds = time-Math.ceil(miliseconds/1000);
    $(".whiteTextAtTopOfGame").innerHTML = `Respawn In ${seconds+1} Seconds`;


    $(".whiteTextAtTopOfGame").show("flex");
    setTimeout(function() {
        handelRespawnTimer(time,deathPoint);
    },100);

}

setScene("loading");
