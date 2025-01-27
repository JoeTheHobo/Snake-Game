$("button_startGame").on("click",function() {
    startGame();
    $(".button_mapEditorHolder").hide();
})
$("button_players").on("click",function() {
    setScene("players");
    loadPlayers();
})
$("button_mainMenu").on("click",function() {
    setScene("menu");
    $(".production").show("none");
    isActiveGame = false;
})
$("button_playAgain").on("click",function() {
    startGame();
    $(".button_mapEditorHolder").hide();
})
$("button_gameMode").on("click",function() {
    setScene("gameModes");
    loadGameModes();
})
$("button_boards").on("click",function() {
    setScene("boardList");
    loadBoards();
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
    $(".menu_tab").classRemove("menu_tab_selected");
    this.classAdd("menu_tab_selected");
    $(".menu_content").hide();
    let value = this.id.subset(0,"_\\before");
    $(".content_" + value).show("flex");

    if (value == "servers") {
        serverSelected = false;
        $(".server_holder").className = "server_holder";
        $("joinServer").classAdd("servers_button_inactive");
    }
})
$("hostServer").on("click",function() {
    loadServerCreation();
})