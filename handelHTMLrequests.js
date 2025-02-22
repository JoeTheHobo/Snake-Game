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
$("me_playButton").on("click",function() {
    startGame();
    $(".button_mapEditorHolder").show();
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