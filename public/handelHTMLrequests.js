
$("local_button_playGame").on("click",function() {
    let minPlayers = currentBoard.minPlayers;
    let maxPlayers = currentBoard.maxPlayers;
    let playerCount = activePlayerCount.length;
    if (playerCount < minPlayers) {
        warningPopup("At Least " + minPlayers + ` Snake${minPlayers === 1 ? "" : "s"} Required`);
        return;
    }
    if (playerCount > maxPlayers) {
        warningPopup("No More Than " + maxPlayers + ` Snake${maxPlayers === 1 ? "" : "s"} Allowed`);
        return;
    }

    $(".game_canvas").classRemove("singlePlayerCanvas");
    $(".game_canvas").css({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        margin: "auto",
    })
    cameraFollowPlayer = false;
    startGame();
    $(".button_mapEditorHolder").hide();
    
})
function warningPopup(text) {
    makePopUp([
        {type: "title",color: "red",text: text},
        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "green",text:"Return"},
    ],{
        exit: {
            cursor: "url('./img/pointer.cur'), auto",
        },
        id: "warning",

    })
}
$("local_button_playSolo").on("click",function() {
    let minPlayers = currentBoard.minPlayers;
    let playerCount = activePlayerCount.length;
    if (minPlayers > 1) {
        warningPopup(`Solo Mode Not Allowed On This Board`);
        return;
    }
    if (playerCount == 0) {
        warningPopup(`Select A Snake Before Playing Game`);
        return;
    }

    $(".game_canvas").classAdd("singlePlayerCanvas");
    cameraFollowPlayer = true;
    startGame(true);
    $(".button_mapEditorHolder").hide();
    
})
$("button_mapEditor").on("click",function() {
    openMapEditor(currentBoard);
    isActiveGame = false;
})


$(".menu_tab").on("click",function() {
    let value = this.id.subset(0,"_\\before");
    selectMenuTab(value)
})
function selectMenuTab(tab) {
    if (tab == "servers") {
        serverSelected = false;
        $(".server_holder").className = "server_holder";
        $("joinServer").classAdd("playButtonSounds_inactive");
    }

    if (tab == "servers") loadServersHTML();
    if (tab == "boards") loadBoardMenu();
    if (tab == "shop") loadShopMenu();
    if (tab == "profile") loadProfileMenu();
}
$("hostServer").on("click",function() {
    loadServerCreation();
})
$("refreshServers").on("click",function() {
    server_refreshLobby();
})
function clickJoinServer() {

    if (!serverSelected) return;

    if (serverSelected.players.length === serverSelected.playerMax) {
        makePopUp([
            {type: "title",text: "Lobby Is Full"},
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "black",text:"Go Back"},
        ],{
            id: "FullPlayers",
        })
        return;
    }

    if (serverSelected.serverType.toLowerCase() == "private") {
        makePopUp([
            {type: "title",text: "What Is The Lobby Code?"},
            [
                {type: "input", id:"code", value:"", placeholder: "Type A Code", width: "200px"},
            ],
            
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "black",text:"Join Server",onClick: (ids) => {
                const {code} = ids;
                socket.emit("joinLobby",serverSelected.id,code.value);
            }},
        ],{
            exit: {
                cursor: "url('./img/pointer.cur'), auto",
            },
            id: "guessCode",

        })
        return;
    }


    server_joinLobby(serverSelected.id);
}
$("joinServer").on("click",function() {
    clickJoinServer();
    
})
$("quitServerButton").on("click",function() {
    socket.emit("quitServer");
    setScene("newMenu");
    localAccount.isInLobby = false;
    localAccount.lobbyID = false;
})
$("startServerButton").on("click",function() {
    server_startGame();
    $(".button_mapEditorHolder").hide();
})
$(".sc_chat_input").on("keydown",function(e) {
    if (e.key == "Enter") {
        socket.emit("sendChat",this.value);
        this.value = "";
    }
})
$(".sc_chooseboard").on("click",function() {
    showBoardMenu();
    //socket.emit("gatherBoardsForBoardMenu");
})
$(".servers_invite_button").on("click",function() {
    socket.emit("searchingHiddenServer",$(".servers_invite_input").value);
    $(".servers_invite_input").value = "";
})

$(".sc_gmb_editGameModeHolder").on("click",function() {
    editGameMode(localAccount.lobbyGamemode,true);
})
$("button_backToLobby").on("click",function() {
    $(".endScreenStats").hide();

    setScene("lobby")
})
$(".sc_bb_customizeSnakeHolder").on("click",function() {
    loadSnakeCustomizationPopup();
})

/*
$(".sc_addLobbyBoard").on("click",function() {
    showBoardMenu(function(board) {
        socket.emit("addBoardToLobbyBoards",pako.deflate(JSON.stringify(shortenBoard(board)), { to: 'string' }));
    }) 
})
    */

$("quitGameButton").on("click",function() {
    socket.emit("quitServer");
    setScene("newMenu");
    localAccount.isInLobby = false;
    localAccount.lobbyID = false;

})
$("endGameButton").on("click",function() {
    socket.emit("endGame");
})
$(".sc_gmb_changeGameModeHolder").on("click",function() {
    if (!localAccount.isHost) return;

    $(".gameModesPopup").show("flex");
    loadBoardGameModes($(".gameModesPopup"),localAccount.lobbyBoard.gameModes,"lobby");

})
$(".sc_tb_lobbyName").on("click",function() {
    if (!localAccount.isHost) return;
    
    makePopUp([
        {type: "title",color: "white",text: "Change Lobby Name"},
        {type: "input",id: "input",maxLength: 20,value: $(".sc_tb_lobbyName").innerHTML},
        {type: "button", close: true,text: "Finalize", onClick: function(ids) {
            let {input} = ids;
            if (input.value == "") return;
            if (input.value.length > 20) return;

            socket.emit("changeLobbyName",input.value);
        }},
    ],{
        exit: {
            cursor: "url('./img/pointer.cur'), auto",
        },
        id: "changeLobbyName",

    })
})
$(".serverSettings").on("click",function() {
    loadServerCreation(true,localAccount.lobby);  
})
$(".vc_slider").on("input",function() {
    let value = Number(this.value);

    if (this.id === "volumeSliderMusic") global_musicVolume = value;
    else global_sfxVolume = value;

    adjustVolumeSliders();
})
$(".vc_img").on("click",function() {
    let type = this.id == "volumeImgMusic" ? "music" : "sfx";

    if (type === "music") {
        if (global_musicVolume > 0) global_musicVolume = 0;
        else global_musicVolume = 100;
    } else {
        if (global_sfxVolume > 0) global_sfxVolume = 0;
        else global_sfxVolume = 100;
    }
    adjustVolumeSliders();
})
function adjustVolumeSliders() {
    $("volumeSliderMusic").forEach(el => el.value = global_musicVolume);
    $("volumeSliderVolume").forEach(el => el.value = global_sfxVolume);

    $("volumeImgMusic").forEach(el => {
        el.src = global_musicVolume === 0 ? "img/menuIcons/volumeMusicOff.png" : "img/menuIcons/volumeMusic.png";
    });

    $("volumeImgVolume").forEach(el => {
        el.src = global_sfxVolume === 0 ? "img/menuIcons/volumeOff.png" : "img/menuIcons/volume.png";
    });

    updateAllVolumes();
}
$(".signinLink").on("click",function() {
    setScene("login")
    loginLoad("login");
})
$(".statHolderGold").on("click",function() {
    selectMenuTab("shop");
})