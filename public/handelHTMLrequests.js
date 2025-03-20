
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
$("button_mainMenu").on("click",function() {
    setScene("newMenu")
    $(".production").show("none");
    loadLocalScreen();
    isActiveGame = false;
})
$("button_playAgain").on("click",function() {
    startGame();
    $(".button_mapEditorHolder").hide();
})
$("button_mapEditor").on("click",function() {
    openMapEditor(currentBoard);
    isActiveGame = false;
})


$(".menu_tab").on("click",function() {
    let value = this.id.subset(0,"_\\before");

    if (value == "servers") {
        serverSelected = false;
        $(".server_holder").className = "server_holder";
        $("joinServer").classAdd("servers_button_inactive");
    }
})
$("hostServer").on("click",function() {
    loadServerCreation();
})
$("refreshServers").on("click",function() {
    server_refreshLobby();
})
$("joinServer").on("click",function() {
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
    showBoardMenu(function(board) {
        socket.emit("changeServerBoard",pako.deflate(JSON.stringify(shortenBoard(board)), { to: 'string' }));
    }) 
})
$(".sc_editboard").on("click",function() {
    openMapEditor(localAccount.lobbyBoard,"server");
})
$(".servers_invite_button").on("click",function() {
    socket.emit("searchingHiddenServer",$(".servers_invite_input").value);
    $(".servers_invite_input").value = "";
})

$(".cbp_cancel").on("click",function() {
    this.$P().$P().hide();
})
$(".cbp_tab").on("click",function() {
    let idStart = this.id.subset(0,"_\\before");
    if (idStart == "cgm") 
        if (!localAccount.isInMapEditor) {
            loadGameModesToPopup(this.id.subset("_\\after","end"),function(gameMode) {
                socket.emit("changeServerGameMode",gameMode);
            })
        } else {
            loadGameModesToPopup(this.id.subset("_\\after","end"),function(gameMode) {
                currentGameMode = gameMode;
                currentBoard.gameMode = structuredClone(currentGameMode);
                $("me_gameMode").innerHTML = gameMode.name;
                $("saveStatus").innerHTML = "Board Is Not Saved";
            });
        }
    if (idStart == "cbp")
        selectTabInBoardMenu(this.innerHTML.subset(0," \\before").toLowerCase());
})
$(".sc_gmb_changeGameModeHolder").on("click",function() {
    $(".chooseGameModePopup").show("flex");
    loadGameModesToPopup("preset",function(gameMode) {
        socket.emit("changeServerGameMode",gameMode);
    });
});
$("me_gameMode").on("click",function() {
    
    $(".chooseGameModePopup").show("flex");
    loadGameModesToPopup("preset",function(gameMode) {
        currentGameMode = gameMode;
        currentBoard.gameMode = structuredClone(currentGameMode);
        $("me_gameMode").innerHTML = gameMode.name;
        $("saveStatus").innerHTML = "Board Is Not Saved";
    });
})
$(".sc_gmb_editGameModeHolder").on("click",function() {
    $(".customizeGamemodePopup").show();
    editGameMode($(".customizeGamemodePopup"),localAccount.lobbyGamemode,false,"server");
})
$("sc_boards_recommendedGameMode").on("click",function() {
    socket.emit("changeGameModetoBoards");
})
$("button_backToLobby").on("click",function() {
    $(".endScreenStats").hide();

    setScene("lobby")
})
$(".sc_bb_customizeSnakeHolder").on("click",function() {
    $(".customizeSnakePopup").show();
    generateHTMLContent($(".customizeSnakePopup"),[
        {type: "title",text: "Appearance"},
        [
            [{type: "image", src: ".snakeSkinHead",filter: "player",tag:"image",width: "200px",height: "200px",background: "none",borderRadius: "5px",}],
            {type: "div",class: "colorOptions"},
        ],
        {type: "title",text: "Key Binds"},
        {type: "close"},
        [
            [
                {type: "label",text: "Move Left"},
                {type: "label",text: "Move Down"},
                {type: "label",text: "Move Right"},
                {type: "label",text: "Move Up"},
            ],
            [
                {type: "keyBind",value: ".leftKey",bind: {key: "leftKey",type: "set"}},
                {type: "keyBind",value: ".downKey",bind: {key: "downKey",type: "set"}},
                {type: "keyBind",value: ".rightKey",bind: {key: "rightKey",type: "set"}},
                {type: "keyBind", value: ".upKey",bind: {key: "upKey",type: "set"}},
            ],
            [
                {type: "label",text: "Scroll Left"},
                {type: "label",text: "Scroll Right"},
                {type: "label",text: "Use Item"},
                {type: "label",text: "Drop Item"},
                {type: "label",text: "Toggle Teams"},

            ],
            [
                {type: "keyBind", value: ".useItem1",bind: {key: "useItem1",type: "set"}},
                {type: "keyBind", value: ".useItem2",bind: {key: "useItem2",type: "set"}},
                {type: "keyBind", value: ".fireItem",bind: {key: "fireItem",type: "set"}},
                {type: "keyBind", value: ".dropItem",bind: {key: "dropItem",type: "set"}},
                {type: "keyBind", value: ".toggleTeamsKey",bind: {key: "toggleTeamsKey",type: "set"}},

            ]
        ],
    ],localAccount.serverSnake,false,localAccount.isInLobby);
    generateAllowedSnakeColors($(".colorOptions"));
})

$(".sc_addLobbyBoard").on("click",function() {
    showBoardMenu(function(board) {
        socket.emit("addBoardToLobbyBoards",pako.deflate(JSON.stringify(shortenBoard(board)), { to: 'string' }));
    }) 
})

$("quitGameButton").on("click",function() {
    socket.emit("quitServer");
    setScene("newMenu");
    localAccount.isInLobby = false;
    localAccount.lobbyID = false;

})
$("endGameButton").on("click",function() {
    socket.emit("endGame");
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