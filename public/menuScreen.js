let serverSelected = false;

function loadServersHTML() {
    let holder = $(".servers_servers_holder");
    holder.innerHTML = "";

    for (let i = 0; i < lobbies.length; i++) {
        let server = lobbies[i];
        let server_holder = holder.create("div");
        server_holder.classAdd("server_holder");
        if (serverSelected.id == serverSelected) server_holder.classAdd("serverSelected");

        let boardCanvas = server_holder.create("canvas");
        boardCanvas.className = "server_canvas";
        let column = server_holder.create("div");
        column.className = "server_column";


        let boardName = column.create("div");
        boardName.className = "server_board_name";
        boardName.innerHTML = server.board.name;

        let hostName = column.create("div");
        hostName.className = "server_host_name";
        hostName.innerHTML = "Host: " + server.host;

        let gameMode = column.create("div");
        gameMode.className = "server_game_mode_name";
        gameMode.innerHTML = server.gameMode.name;

        let activePlayers = server_holder.create("div");
        activePlayers.className = "server_active_players";
        activePlayers.innerHTML = server.playerCount + "/" + server.playerMax; 

        let boardAuthor = server_holder.create("div");
        boardAuthor.className = "server_board_author";
        boardAuthor.innerHTML = "Board Created By: " + (server.board.author || "4ChanLoverXX");
        
        server_holder.serverID = server.id;
        server_holder.on("click",function() {
            $(".server_holder").classRemove("serverSelected");
            this.classAdd("serverSelected");
            serverSelected = this.serverID;
            $("joinServer").classRemove("servers_button_inactive");
        })
    }
}

function loadServerCreation() {
    let holder = $(".servers_servers_holder");
    holder.innerHTML = "";


    let lobby = {
        board: boards[Number(prompt())],
        host: localAccount.id,
        gameMode: gameModes[0],
        playerMax: 8,
        playerCount: 1,
        id: Date.now() + "_" + rnd(5000),
    }
    updateLobbyToServer();  
}