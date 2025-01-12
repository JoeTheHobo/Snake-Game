$("button_startGame").on("click",function() {
    startGame();
})
$("button_players").on("click",function() {
    setScene("players");
    loadPlayers();
})
$("button_mainMenu").on("click",function() {
    setScene("menu");
})
$("button_playAgain").on("click",function() {
    startGame();
})