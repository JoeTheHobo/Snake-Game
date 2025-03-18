const { parentPort } = require("worker_threads");

parentPort.on("message", (lobby) => {
    function gameLoop() {
        if (!lobby.gameStartedAt) {
            lobby.gameStartedAt = Date.now();
        }

        lobby.lobby_gameLoop_start = Date.now();

        // Perform game logic
        server_movePlayers(lobby);
        if (lobby.checkingSpawnTimers) checkSpawnStatusTimers(lobby);
        updateClientPositions(lobby);

        lobby.updatePositionTimeStamp = Date.now();
        lobby.updateSnakeCells = [];
        lobby.updateCells = [];
        lobby.updateTiles = [];
        lobby.playSounds = [];
        lobby.canvasFilters = [];

        // Check if the game should end
        let winningPlayer = lobby.inGamePlayers.find(player => player.winGame);
        if (!lobby.gameEnd && !winningPlayer) {
            setTimeout(gameLoop, 16);
        } else {
            endGame(lobby);
            parentPort.postMessage({ type: "end", lobbyId: lobby.id });
        }
    }

    function endGame(lobby) {
        lobby.isActiveGame = false;
        lobby.isInGame = false;

        lobby.inGamePlayers.forEach(player => {
            if (!player.isDead) deletePlayer(lobby, player, false, false, true);
        });

        let longestTailPlayer = lobby.inGamePlayers.reduce((max, player) => 
            player.longestTail > max.longestTail ? player : max
        );

        let timeSurvivedPlayer = lobby.inGamePlayers.reduce((max, player) => 
            player.timeSurvived > max.timeSurvived ? player : max
        );

        let mostKillsPlayer = lobby.inGamePlayers.reduce((max, player) => 
            player.playerKills > max.playerKills ? player : max
        );

        let longestTail = longestTailPlayer.longestTail;
        let timeSurvived = timeSurvivedPlayer.timeSurvived;

        let minutes = Math.floor(timeSurvived / 60);
        let seconds = timeSurvived % 60;
        if (seconds < 10) seconds = "0" + seconds;

        let obj = {
            lobbyId: lobby.id,
            longestTailPlayer,
            timeSurvivedPlayer,
            mostKillsPlayer,
            longestTail,
            timeSurvived,
            minutes,
            seconds,
            winningPlayer: lobby.inGamePlayers.find(player => player.winGame) || null,
        };

        parentPort.postMessage({ type: "gameOver", data: obj });
    }

    gameLoop();
});
