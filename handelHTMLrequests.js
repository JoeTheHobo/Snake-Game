$("button_startGame").on("click",function() {
    startGame();
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
})
$("button_gameMode").on("click",function() {
    setScene("gameModes");
    loadGameModes();
})
$("button_boards").on("click",function() {
    setScene("boardList");
    loadBoards();
})