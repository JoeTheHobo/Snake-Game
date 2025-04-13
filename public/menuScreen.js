let serverSelected = false;


function loadServersHTML() {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_servers").show("flex");
    $("servers_tab").classAdd("menu_tab_selected");
    let holder = $(".servers_servers_holder");
    holder.innerHTML = "";
    let foundSelectedServer;
    for (let server in frontEndLobbies) {
        server = frontEndLobbies[server];
        if (!server.id) continue;
        let server_holder = holder.create("div");
        server_holder.classAdd("server_holder");
        if (server.id == serverSelected.id) {
            server_holder.classAdd("serverSelected");
            foundSelectedServer = false;
        } 

        let boardCanvas = server_holder.create("canvas");
        boardCanvas.className = "server_canvas";
        boardCanvas.height = boardCanvas.clientHeight;
        boardCanvas.width = boardCanvas.clientWidth;
        if (renderMapsInServersTab)
            drawBoardToCanvas(server.board.originalMap,boardCanvas,true)
        
        let column = server_holder.create("div");
        column.className = "server_column";

        let boardTitleContainer = column.create("div");
        boardTitleContainer.className = "server_title_container";

        if (server.serverType.toLowerCase() == "private") {
            let lockImageHolder = boardTitleContainer.create("div");
            lockImageHolder.className = "server_lock_holder";
            let lockImage = lockImageHolder.create("img");
            lockImage.className = "server_lock_image";
            lockImage.src = "img/menuIcons/lock.png";
        }

        let boardName = boardTitleContainer.create("div");
        boardName.className = "server_board_name";
        boardName.innerHTML = server.lobbyName;
        
        if (server.isInGame) {
            let inInGameTitle = boardTitleContainer.create("div");
            inInGameTitle.className = "server_isInGame";
            inInGameTitle.innerHTML = "In-Game"

        }

        let hostName = column.create("div");
        hostName.className = "server_host_name";
        hostName.innerHTML = "Board: " + server.board.name;

        let gameMode = column.create("div");
        gameMode.className = "server_game_mode_name";
        gameMode.innerHTML = "Gamemode: " + server.gameMode.name;

        let activePlayers = server_holder.create("div");
        activePlayers.className = "server_active_players";
        activePlayers.innerHTML = server.players.length + "/" + server.playerMax; 

        /* To Be Added Later When Board Author is a thing
        let boardAuthor = server_holder.create("div");
        boardAuthor.className = "server_board_author";
        boardAuthor.innerHTML = "Board Created By: " + (server.board.author || "4ChanLoverXX");
        */

        server_holder.server = server;
        server_holder.on("click",function() {
            $(".server_holder").classRemove("serverSelected");
            this.classAdd("serverSelected");
            serverSelected = this.server;
            $("joinServer").classRemove("playButtonSounds_inactive");
        })
    }
    if (!foundSelectedServer) {
        serverSelected = false;
        $("joinServer").classAdd("playButtonSounds_inactive");

    }
}

function loadServerCreation(updateLobby = false,lobby) {
    
    makePopUp([
        {type: "title",text: "Choose Lobby Type", color: "white"},
        [
            {type: "button",id:"hidden", cursor: "url('./img/pointer.cur'), auto", width: "100px", className: "hidden_server playButtonSounds popup_makeServer_button", background: "black",text:"Hidden",onClick: function(parentIDS,params,div) {
                $(".popup_makeServer_button").css({
                    background: "black",
                    color: "white",
                });
                div.css({
                    background: "#8bc4e2",
                    color: "black",
                })
                $(".popup_makeServer_input").show();
                $(".popup_makeServer_input").value = updateLobby ? lobby.code : rnd(1000,9999);
            }},
            {type: "button",id:"public",cursor: "url('./img/pointer.cur'), auto", width: "100px", className: "public_server playButtonSounds popup_makeServer_button", background: "#8bc4e2", color: "black",text:"Public",onClick: function(parentIDS,params,div) {
                $(".popup_makeServer_button").css({
                    background: "black",
                    color: "white",
                });
                div.css({
                    background: "#8bc4e2",
                    color: "black",
                })
                $(".popup_makeServer_input").hide();
            }},
            {type: "button",id:"private",cursor: "url('./img/pointer.cur'), auto", width: "100px", className: "private_server playButtonSounds popup_makeServer_button", background: "black",text:"Private",onClick: function(parentIDS,params,div) {
                $(".popup_makeServer_button").css({
                    background: "black",
                    color: "white",
                });
                div.css({
                    background: "#8bc4e2",
                    color: "black",
                })

                $(".popup_makeServer_input").show();
                $(".popup_makeServer_input").value = updateLobby ? lobby.code : rnd(1000,9999);
            }},
        ],
        {type: "input", id: "input",display: "none", className: "popup_makeServer_input",},
        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", className: "playButtonSounds", background: "#D9D9D9", color: "black",text:(updateLobby ? "Update Settings" : "Host Server"), onClick: function(parentIDS,param,button) {
            const {hidden, public, private, input} = parentIDS;
            let serverType = false;
            if (hidden.style.background === "rgb(139, 196, 226)") serverType = "hidden";
            if (public.style.background === "rgb(139, 196, 226)") serverType = "public";
            if (private.style.background === "rgb(139, 196, 226)") serverType = "private";

            let code = input.value;
            if (code === "") code = rnd(1000,9999);

            let lobby = {
                code: code,
                serverType: serverType,
            }

            if (updateLobby) socket.emit("updateLobbySettings",lobby);
            else updateLobbyToServer(lobby);
        }},
    ],{
        id: "makeServer",
        exit: {
            cursor: "url('./img/pointer.cur'), auto",
        },
    })

    if (updateLobby) {
        if (lobby.serverType.toLowerCase() === "hidden" || lobby.serverType.toLowerCase() === "private") {
            $(".public_server").style.background = "black";
            $(".public_server").style.color = "white";
            $(`.${lobby.serverType}_server`).style.background = "#8bc4e2";
            $(".popup_makeServer_input").show();
            $(".popup_makeServer_input").value = lobby.code;
        }
    }

    
}

function generateHTMLScreen(holder,listObj,contentObj) {
    holder.innerHTML = "";

    holder.css({
        width: "100%",
        hieght: "100%",
        padding: "5px",
        display: "flex",
        flexDirection: "row",
        userSelect: "none",
    })

    let list = holder.create("div");
    list.css({
        width: "50%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
    })
    let content = holder.create("div");
    content.css({
        width: "50%",
        height: "90%",
        borderLeft: "1px solid white",
        overflowY: "auto",
    })

    generateHTMLList(list,listObj,contentObj,content);
}
function generateHTMLList(holder,listObj,contentObj,contentHTML) {
    let top = holder.create("div");
    let forceOpen = false;
    top.css({
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    })
    for (let i = 0; i < listObj.top.length; i++) {
        let content = listObj.top[i];
        let div = top.create("div");

        if (content.text) div.innerHTML = content.text;

        if (content.type == "button") {
            div.css({
                minWidth: "100px",
                textAlign: "center",
                color: "white",
                fontSize: "25px",
                cursor: "url('./img/pointer.cur'), auto",
                background: _color("neonpurple").color,
                borderRadius: "5px",
                margin: "10px",
                padding: "5px",
                height: "40px",
                lineHeight: "40px",
                userSelect: "none",
            })
            div.classAdd("hover");
        }

        if (content.onClick) {
            div.on("click",function() {
                content.onClick();
            })
        }
    }

    let list = holder.create("div");
    list.css({
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    })
    for (let i = 0; i < listObj.list.length; i++) {
        let content = listObj.list[i];
        let contentHolder = list.create("div");

        contentHolder.css({
            width: "95%",
            height: "40px",
            background: "#888",
            borderRadius: "5px",
            marginTop: "5px",
            cursor: "url('./img/pointer.cur'), auto",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        })
        contentHolder.classAdd("hover");
        contentHolder.classAdd("list_element")

        contentHolder.open = function() {
            $(".list_element").classRemove("list_selected");
            this.classAdd("list_selected");
            if (contentObj) generateHTMLContent(contentHTML,contentObj,content,contentHolder);
            else editGameMode(contentHTML,content,contentHolder.tags["name"]); 
        }
        contentHolder.on("click",function() {
            this.open();
        })
        
        
        

        if (listObj.forceOpen !== false) {
            forceOpen = contentHolder;
        }

        contentHolder.tags = {};

        function generateContent(list,parent,index,contentHTML) {
            for (let j = 0; j < list.length; j++) {
                let obj = list[j];
                let div;
                if (_type(obj).type == "array") {
                    div = parent.create("div");
                    div.css({
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        height: "100%",
                        
                        marginLeft: "auto",
                        alignItems: "center",
                        marginRight: "5px",
                    })
                    generateContent(obj,div,index);
                    continue;
                }


                if (obj.special) if (content.cantEdit) continue;

                if (["image"].includes(obj.type)) div = parent.create("img");
                if (["title","button"].includes(obj.type)) div = parent.create("div");
                
                if (obj.text) {
                    if (obj.text.charAt(0) == ".") {
                        div.innerHTML = index[obj.text.subset(".\\after","end")];
                    } else div.innerHTML = obj.text;
                }

                if (obj.type == "image") {
                    div.css({
                        height: "95%",
                        width: "auto",
                        filter: obj.filter == "player" ? getPlayerFilter(index) : "",
                    })
                    div.src = "img/" + obj.src;
                }
                if (obj.type == "title") {
                    div.css({
                        color: "white",
                        fontSize: "25px",
                        marginLeft: "5px",
                    })
                }
                if (obj.type == "button") {
                    div.classAdd("hover");
                    div.css({
                        height: "70%",
                        width: "max-content",
                        borderRadius: "5px",
                        background: obj.background || "white",
                        paddingLeft: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingRight: "5px",
                        fontSize: "20px",
                        marginLeft: "5px",
                    })
                }
                if (obj.tag) {
                    contentHolder.tags[obj.tag] = div;
                }

                if (obj.onClick) {
                    div.on("click",function() {
                        obj.onClick(index,i);
                    })
                }
            }
        }

        generateContent(listObj.listContent,contentHolder,content,contentHTML);
        

    }

    if (forceOpen) forceOpen.open();
}
function generateHTMLContent(holder,contentList,valueObj,contentHolder,updateLobby = false) {
    holder.innerHTML = "";
    holder.tags = {};

    function generateContent(list,obj,parent,direction = "column",originalParent,updateLobby) {
        let holder = parent.create("div");
        holder.css({
            display: "flex",
            flexDirection: direction,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "max-content",
        })


        for (let i = 0; i < list.length; i++) {
            let l = list[i];

            if (_type(l).type == "array") {
                generateContent(l,obj,holder,(direction == "column" ? "row" : "column"),originalParent,updateLobby);
                continue;
            }

            let div;

            if (l.special == "delete") if (obj.cantEdit) continue;

            if (["image"].includes(l.type)) div = holder.create("img");
            if (["canvas"].includes(l.type)) div = holder.create("canvas");
            if (["title","text","label","delete","close","div"].includes(l.type)) div = holder.create("div");
            if (["keyBind","slider","input"].includes(l.type)) div = holder.create("input");

            if (l.class) div.className = l.class;
            if (l.text) div.innerHTML = l.text;

            if (l.type == "close") {
                div.css({
                    position: "absolute",
                    top:  10,
                    right: 10,
                    color: "red",
                    width: "30px",
                    height: "30px",
                    lineHeight: "30px",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                    borderRadius: "5px",
                    border: "2px solid black",
                    background: "white",
                    cursor: "url('./img/pointer.cur'), auto",
                })
                div.classAdd("hover");
                div.innerHTML = "X";
                div.on("click",function() {
                    originalParent.hide();
                })
            }
            if (l.type == "title") {
                div.css({
                    fontSize: "30px",
                    color: "white",
                })
            }
            if (l.type == "delete" && contentHolder) {
                div.classAdd("hover");
                div.innerHTML = "Delete"
                div.css({
                    width: "60%",
                    height: "50px",
                    borderRadius: "5px",
                    userSelect: "none",
                    background: "#C12F2F",
                    textAlign: "center",
                    lineHeight: "50px",
                    fontSize: "30px",
                    color: "black",
                    cursor: "url('./img/pointer.cur'), auto",
                })
                div.on("click",function() {
                    makePopUp([
                        {type: "text",text: "Delete " + contentHolder.tags["name"].innerHTML},
                        {type: "title",text: "Are You Sure?"},
                        [
                            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100px",  background: "black",text:"No"},
                            {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto",width: "100px", background: "red",text:"Delete",onClick: (ids,param) => {
                                if (l.deleteLoad == "loadBoardsScreen") {
                                    socket.emit("deleteBoard",obj.id,"loadBoardsScreen");
                                }
                            }},
                        ],
                    ],{
                        id: "deletePopUp",
                    })
                })
            }
            if (l.type == "text") {
                div.css({
                    fontSize: "25px",
                    color: "white",
                })
            }
            if (l.type == "canvas") {
                div.css({
                    width: l.width || "auto",
                    height: l.height || "auto",
                    borderRadius: l.borderRadius || "5px",
                })

                if (l.height == "square") div.style.height = div.clientWidth + "px";

                div.width = div.clientWidth;
                div.height = div.clientHeight;
                if (l.display) {
                    l.display(obj,div);
                }
            }
            if (l.type == "slider") {
                div.type = "range";
                div.min = l.min;
                div.max = l.max;
                if (l.value.charAt(0) == ".") div.value = obj[l.value.subset(".\\after","end")];
                else div.value = l.value;
                div.css({
                    SliderColor: "green",
                })

            }
            if (l.type == "label") {
                div.css({
                    fontSize: "20px",
                    color: "white",
                    width: "100px",
                    height: "40px",
                    margin: "3px",
                    lineHeight: "40px",
                })
            }
            if (l.type == "input") {
                if (l.value.charAt(0) == ".") div.value = obj[l.value.subset(".\\after","end")];
                else div.value = l.value;
                div.css({
                    width: "75%",
                    height: "40px",
                    outline: "none",
                    border: "none",
                    textAlign: "center",
                    fontSize: "20px",
                    margin: "3px",
                })
            }
            if (l.type == "keyBind") {
                if (l.value.charAt(0) == ".") div.value = obj[l.value.subset(".\\after","end")];
                else div.value = l.value;
                div.css({
                    width: "65px",
                    height: "40px",
                    outline: "none",
                    border: "none",
                    textAlign: "center",
                    fontSize: "20px",
                    margin: "3px",
                    cursor: "url('./img/pointer.cur'), auto",
                })
                div.on("click",function() {
                    this.value = "";
                })
                div.on("keydown",function(e) {
                    e.preventDefault();
                    this.value = e.key;
                    const event = new Event("input", { bubbles: true, cancelable: true });
                    this.dispatchEvent(event);
                })
            }

            if (l.type == "image") {
                div.css({
                    filter: l.filter == "player" ? getPlayerFilter(obj) : "",
                    width: l.width,
                    height: l.height,
                    background: l.background,
                    borderRadius: l.borderRadius,
                })
                if (l.src == ".snakeSkinHead") div.src = "img/snakeSkins/" + obj.snakeSkin + "/snake_" + obj.snakeSkin + "_head.png";
                else div.src = "img/" + l.src;
            }
            if (l.tag) {
                originalParent.tags[l.tag] = div;
            }
            if (l.bind) {
                div.on("input",function() {
                    if (l.bind.type == "!==") if (this.value !== "") obj[l.bind.key] = this.value;
                    if (l.bind.type == "set" || !l.type) obj[l.bind.key] = this.value;

                    if (l.bind.update) {
                        let value = obj[l.bind.key];
                        
                        if (l.bind.update.type == "filterPlayer") {
                            if (l.bind.update.externalKey && contentHolder) contentHolder.tags[l.bind.update.externalKey].style.filter = getPlayerFilter(obj);
                            if (l.bind.update.key) originalParent.tags[l.bind.update.key].style.filter = getPlayerFilter(obj);
                        } else {
                            if (l.bind.update.externalKey && contentHolder) contentHolder.tags[l.bind.update.externalKey][l.bind.update.type] = value;
                            if (l.bind.update.key) originalParent.tags[l.bind.update.key][l.bind.update.type] = value;
                        }
                    }
                    savePlayers(updateLobby);
                })
                if (l.type == "slider") {
                    div.on("change",function() {
                        if (l.save  == undefined || l.save == true) {
                            savePlayers(updateLobby);
                        }
                    })
                }
            }

        }
    }

    generateContent(contentList,valueObj,holder,"column",holder,updateLobby)
}


function loadCustomizeSnakeScreen(index = false) {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_snake").show("flex");
    $("snake_tab").classAdd("menu_tab_selected");
    generateHTMLScreen($(".content_snake"),
        {
            list: localAccount.players,
            forceOpen: index,
            listContent: [{type: "image",src: ".snakeSkinHead", filter: "player",tag: "image"},{type: "title",text: ".name",tag: "name"}],
            top: [{type: "button",text: "New Snake",onClick: function() {
                getAndLoadNewPlayer();
            }}],
        },
        [
            {type: "title",text: "Appearance"},
            [
                [{type: "image", src: ".snakeSkinHead",filter: "player",tag:"image",width: "200px",height: "200px",background: "none",borderRadius: "5px",}],
                [
                    {type: "text",text: "Snake Name"},
                    {type: "input",value: ".name", tag: "name", bind: {key: "name",type: "!==",value: "",update: {externalKey: "name",type: "innerHTML"}}},
                    {type: "text",text: "Hue"},
                    {type: "slider", value: ".color",min: 0, max: 360,bind: {key: "color",type: "set",update: {externalKey: "image",key:"image",type: "filterPlayer"}}},
                    {type: "text",text: "Saturation"},
                    {type: "slider", value: ".color2",min: 0, max: 300,bind: {key: "color2",type: "set",update: {externalKey: "image",key:"image",type: "filterPlayer"}}},
                    {type: "text",text: "Brightness"},
                    {type: "slider", value: ".color3",min: 20, max: 200,bind: {key: "color3",type: "set",update: {externalKey: "image",key:"image",type: "filterPlayer"}}},
                ],
            ],
            {type: "title",text: "Key Binds"},
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
            {type: "title",text: "Danger Zone"},
            {type: "delete", delete: localAccount.players,deleteLoad: "loadCustomizeSnakeScreen"}
        ]
    )
}


function loadLocalScreen() {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_local").show("flex");
    $("local_tab").classAdd("menu_tab_selected");
    let boardHolder = $("local_boards");
    let snakesHolder = $("local_snakes");
    let gameModesHolder = $("local_gameModes");

    function loadContent(parent,list,type) {
        parent.innerHTML = "";

        if (type == "snakes") {
            //Check If Player Exists
            let newArr = [];
            for (let i = 0; i < activePlayerCount.length; i++) {
                for (let j = 0; j < players.length; j++) {
                    if (players[j].id === activePlayerCount[i].id) newArr.push(players[j]);
                }
            }
            activePlayerCount = newArr;
            //Reset Player Active IDS
            for (let i = 0; i < activePlayerCount.length; i++) {
                activePlayerCount[i].active = i;
            }
            ls.save("activePlayerCount",activePlayerCount);
            savePlayers();
        }

        for (let i = 0; i < list.length; i++) {
            let holder = parent.create("div");
            holder.className = `local_content_holder hover  local_content_${type}_${i} local_content_${type}`;

            if (type == "snakes") {
                let img = holder.create("img");
                img.src = "img/snakeSkins/" + list[i].snakeSkin + "/snake_" + list[i].snakeSkin + "_head.png";
                img.className = "local_content_snakeHead";
                img.style.filter = getPlayerFilter(list[i]);
            }

            let title = holder.create("div");
            title.innerHTML = list[i].name;
            title.className = "local_content_title";

            if (type == "gameModes" && i === activeGameMode) {
                holder.classAdd("local_content_selected");
            }
            if (type == "boards") {
                let div;
                if (list[i].recommendedGameMode) {
                    div = holder.create("div");
                    div.className = "local_content_board_gameMode hover";
                    div.innerHTML = "Enable Game Mode";

                    div.gameMode = list[i].gameMode;
                    div.on("click",function() {
                        activeGameMode = false;
                        currentGameMode = this.gameMode;
                        $(".local_content_board_gameMode").classRemove("local_content_board_gameMode_selected");
                        div.classAdd("local_content_board_gameMode_selected");
                        loadContent(gameModesHolder,gameModes,"gameModes");
                        $(".local_content_gameModes").classAdd("local_content_gameModes_blocked");
                    })
                }
                if (i == currentBoardIndex) {
                    if (list[i].recommendedGameMode) div.show();
                    holder.classAdd("local_content_selected");
                    
                    let snakeText = "Snakes";
                    if (currentBoard.maxPlayers < 2) snakeText = "Snake";
                    let text = `${currentBoard.minPlayers} - ${currentBoard.maxPlayers} ${snakeText} Are Required For Board`;
                    if (currentBoard.minPlayers === currentBoard.maxPlayers) text = `${currentBoard.maxPlayers} ${snakeText} Are Required For Board`
                    $(".snakedRequiredWarning").innerHTML = text;

                    drawBoardToCanvas(list[i].originalMap,$(".local_bottom_canvas"),true)
                }
            }
            if (type == "snakes") {
                let div = holder.create("div");
                div.className = "local_content_player_number";
                if (list[i].active !== false) {
                    holder.classAdd("local_content_selected");
                    div.innerHTML = "Player " + list[i].active;
                }
                holder.snakeNumber = div;
            }

            holder.object = list[i];
            holder.type = type;
            holder.index = i;
            holder.parent = parent;
            holder.on("click",function(e) {
                if (this.type !== "snakes") {
                    $(`.local_content_${this.type}`).classRemove("local_content_selected");
                    this.classAdd("local_content_selected");
                }
                

                if (this.type == "boards") {
                    if (e.target.classList.contains("local_content_board_gameMode")) return;

                    if (activeGameMode === false) {
                        activeGameMode = 0;
                        currentGameMode = gameModes[activeGameMode];
                        loadContent(gameModesHolder,gameModes,"gameModes");
                    }

                    if ($(".local_content_board_gameMode")) $(".local_content_board_gameMode").classRemove("local_content_board_gameMode_selected");

                    currentBoardIndex = this.index;
                    currentBoard = boards[currentBoardIndex];
                    ls.save("currentBoardIndex",currentBoardIndex)

                    if ($(".local_content_board_gameMode"))$(".local_content_board_gameMode").hide();

                    if (this.object.recommendedGameMode) this.$(".local_content_board_gameMode").show();

                    let snakeText = "Snakes";
                    if (currentBoard.maxPlayers < 2) snakeText = "Snake";
                    let text = `${currentBoard.minPlayers} - ${currentBoard.maxPlayers} ${snakeText} Are Required For Board`;
                    if (currentBoard.minPlayers === currentBoard.maxPlayers) text = `${currentBoard.maxPlayers} ${snakeText} Are Required For Board`
                    $(".snakedRequiredWarning").innerHTML = text;

                    drawBoardToCanvas(this.object.originalMap,$(".local_bottom_canvas"),true)
                    
                }
                if (this.type == "gameModes") {
                    $(".local_content_gameModes").classRemove("local_content_gameModes_blocked");
                    activeGameMode = this.index;
                    ls.save("activeGameMode",activeGameMode)
                    if ($(".local_content_board_gameMode")) $(".local_content_board_gameMode").classRemove("local_content_board_gameMode_selected");
                }
                if (this.type == "snakes") {
                    if (this.object.active === false) {
                        if (activePlayerCount.length >= 8) return;
                        activePlayerCount.push(this.object);
                        this.object.active = activePlayerCount.length - 1;
                    } else {
                        let index = this.object.active;
                        this.object.active = false;
                        activePlayerCount.splice(index,1);
                    }

                    loadContent(snakesHolder,players,"snakes");
                }
            })
        }
    }

    loadContent(boardHolder,boards,"boards");
    loadContent(snakesHolder,localAccount.players,"snakes");
    loadContent(gameModesHolder,gameModes,"gameModes");
}

function getItemAlterations(gameMode,item) {
    item = structuredClone(item);
    for (let i = 0; i < gameMode.itemAlterations.length; i++) {
        let gmaAlteration = gameMode.itemAlterations[i]; 
        if (gmaAlteration.name !== item.name) continue;
        
        for (let j = 0; j < gmaAlteration.alterations.length; j++) {
            let change = gmaAlteration.alterations[j];
            setNestedValue(item,change,"_LAST_");
        }
    }
    return item;
}
function setItemAlteration(gameMode,item,isServer) {
    let realItem = getRealItem(item.name);
    let differences = compareObjects(realItem,item);

    let foundAlt = false;
    for (let i = 0; i < gameMode.itemAlterations.length; i++) {
        if (gameMode.itemAlterations[i].name !== item.name) continue;
        if (differences.length == 0) {
            gameMode.itemAlterations.splice(i,1);
            break;
        }
        foundAlt = true;
        gameMode.itemAlterations[i].alterations = differences;

    }
    if (foundAlt === false && differences.length > 0) {
        gameMode.itemAlterations.push({
            displayName: item.displayName,
            name: item.name,
            alterations: differences,
        })
    }

    if (isServer) socket.emit("editServerGameMode",gameMode);
}
function gameMode_editItem(item,html_holder,server,gameMode) {
    html_holder.innerHTML = "";
    item = getItemAlterations(gameMode,item);

    function addSetting(title,type,value,func,list) {
        let holder = html_holder.create("div");
        holder.className = "settingHolder";
        let settingsTitle = holder.create("div");
        settingsTitle.className = "settingTitle";
        settingsTitle.innerHTML = title;
        
        let settingsInput;
        if (type == "toggle") {
            settingsInput = holder.create("input");
            settingsInput.type = "checkbox";
            settingsInput.checked = value;
            settingsInput.className = "gameModes_checkbox";
            settingsInput.on("change",function() {
                func(this.checked,this);
            })

        }
        if (type == "input" || type == "number") {
            settingsInput = holder.create("input");
            settingsInput.className = "settingInput";
            settingsInput.value = value;
            settingsInput.id = "gm_" + title.toLowerCase().subset(0,"end","trim\\ ");
            if (type == "number") settingsInput.type = "number";
            settingsInput.on("input",function() {
                func(this.value,this);
            })
        }
        if (type == "dropdown") {
            settingsInput = holder.create("div");
            settingsInput.className = "dropdown";

            let button = settingsInput.create("button");
            button.className = "dropbtn";
            button.innerHTML = value;

            let content = settingsInput.create("div");
            content.className = "dropdown-content";

            for (let i = 0; i < list.length; i++) {
                let setting = content.create("div");
                setting.button = button;
                setting.innerHTML = list[i];
                setting.on("click",function() {
                    this.button.innerHTML = this.innerHTML;
                    func(this.innerHTML);
                })
            }
            settingsInput.on("input",function() {
                func(this.value,this);
            })
        }
        
    }

    addSetting("At Start Spawn","number",item.onStartSpawn,function(value) {
        if (value < 0) value = 0;
        if (value > 60) value = 60;
        item.onStartSpawn = Number(value);
        setItemAlteration(gameMode,item,server);
    });
    addSetting("Spawn Rate","number",item.specialSpawnWeight,function(value) {
        if (value < 0) value = 0;
        item.specialSpawnWeight = Number(value);
        setItemAlteration(gameMode,item,server);
    });
    addSetting("Visible","toggle",item.visible,function(value) {
        item.visible = value;
        setItemAlteration(gameMode,item,server);
    });
    addSetting("Plays Audio","toggle",item.playSounds,function(value) {
        item.playSounds = value;
        setItemAlteration(gameMode,item,server);
    });

    if (item.canEat == true && item.onEat.growPlayer > 0 ) {
        addSetting("Grow Player","number",item.onEat.growPlayer,function(value) {
            if (value < 0) value= 0;
            item.onEat.growPlayer = Number(value);
            setItemAlteration(gameMode,item,server);
        });
    }
    if (item.canEat == true) {
        addSetting("Attempt Spawn Random Item","toggle",item.onEat.spawnRandomItem,function(value) {
            item.onEat.spawnRandomItem = value;
            setItemAlteration(gameMode,item,server);
        });
    }
    if (item.canEat == true && item.onEat.shield > 0) {
        addSetting("Give Shield","number",item.onEat.shield,function(value) {
            item.onEat.shield = Number(value);
            setItemAlteration(gameMode,item,server);
        });
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Duration","number",item.onEat.turbo.duration,function(value) {
        if (value < 0) return;
        item.onEat.turbo.duration = Number(value);
        setItemAlteration(gameMode,item,server);
        });
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Speed","number",item.onEat.turbo.moveSpeed,function(value) {
        if (value < 0) return;
        item.onEat.turbo.moveSpeed = value;
        setItemAlteration(gameMode,item,server);
        });
    }
}
function loadBoardMenu() {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_boards").show("flex");
    $("boards_tab").classAdd("menu_tab_selected");

    let listHolder = $(".cb_boardList");
    listHolder.innerHTML = "";

    if (localAccount.boards.length == 0) {
        socket.emit("db_getAccountBoardStats","MapEditor");
    } else {
        generatePlayerBoardsScreen(localAccount.boards); 
    }

    

}
function generatePlayerBoardsScreen(boardStats) {
    let listHolder = $(".cb_boardList");
    listHolder.innerHTML = "";
    if (localAccount.status == "Admin") 
        $(".cb_tr_text_boardCount").innerHTML =  boardStats.length + "/Infinite";
    else
        $(".cb_tr_text_boardCount").innerHTML =  boardStats.length + "/" + localAccount.boardLimit;
    let publishedCount = 0;
    for (let i = 0; i < boardStats.length; i++) {
        publishedCount += boardStats[i].published;
    }
    if (localAccount.status == "Admin")
        $(".cb_tr_text_publishedCount").innerHTML =  publishedCount + "/Infinite";
    else
        $(".cb_tr_text_publishedCount").innerHTML =  publishedCount + "/" + localAccount.publishedBoardLimit;

    function makeBoard(holder,content,type,index) {
        if (type == "board") {
            let container = holder.create("div.bm_boardContainer");
            let boardPortion = container.create("canvas.bm_boardCanvas");
            let settingPortion = container.create("div.bm_boardSettings")
            let boardName = container.create("div.bm_boardName");
            boardName.innerHTML = content.board.name;

            drawBoardToCanvas(content.board.originalMap,boardPortion);
            

            boardPortion.on("click",function() {
                socket.emit("openMapEditor",content.id);
            })

            function addSetting(src,func) {
                let imgHolder = settingPortion.create("div.bm_settingDiv");
                let img = imgHolder.create("img.bm_settingImg");
                img.src = src;
                imgHolder.on("click",func);
            }
            addSetting("img/menuIcons/edit.png",function() {
                socket.emit("openMapEditor",content.id);
            });
            addSetting("img/menuIcons/delete.png",function() {
                makePopUp([
                    {type: "text",text: "Delete " + content.board.name},
                    {type: "title",text: "Are You Sure?"},
                    [
                        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100px",  background: "black",text:"No"},
                        {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto",width: "100px", background: "red",text:"Delete",onClick: (ids,param) => {
                            socket.emit("deleteBoard",content.id);
                            localAccount.boards.splice(index,1);
                            generatePlayerBoardsScreen(localAccount.boards);
                        }},
                    ],
                ],{
                    id: "deletePopUp",
                })
            });
            if (((publishedCount < localAccount.publishedBoardLimit) || (localAccount.status == "Admin")) && content.published === 0) {
                addSetting("img/menuIcons/publish.png",function() {
                    socket.emit("publishBoard",content.id);
                    localAccount.boards[index].published = 1;
                    generatePlayerBoardsScreen(localAccount.boards);
                });
            }
            if (content.published === 1) {
                addSetting("img/menuIcons/published.png",function() {
                    socket.emit("depublishBoard",content.id);
                    localAccount.boards[index].published = 0;
                    generatePlayerBoardsScreen(localAccount.boards);
                });
            }
            if (localAccount.status === "Admin") {
                addSetting("img/menuIcons/download.png",function() {
                    socket.emit("getZippedBoard",content.id);
                });
            }
        }
        
        if (type == "newBoard") {
            let container = holder.create("div.bm_boardContainer");
            container.classAdd("hover");
            container.classAdd("square");
            container.classAdd("pointerCursor");
            let plus = container.create("div.bm_plus");
            plus.innerHTML = "+";
            container.on("click",function() {
                makePopUp([
                    {type: "title",text: "New Board"},
                    [
                        {type: "text", text: "Name"},
                        {type: "input", id:"name", maxLength: "30", placeholder: "Untitled", width: "200px"},
                    ],
                    /*
                    [
                        {type: "text", text: "Width"},
                        {type: "number", id:"width", value: "50", min: 5, max: 70, width: "50px"},
                        {type: "text", text: "Height"},
                        {type: "number", id:"height", value: "30", min: 5, max: 70, width: "50px"},
                    ],
                    */
                    {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "green",text:"Create",onClick: (ids) => {
                        const {name,width,height} = ids;
                        let boardName = name.value == "" ? "Untitled" : name.value;
                        socket.emit("createNewBoard",boardName,50,30,"openMapEditor");
                        
                    }},
                ],{
                    exit: {
                        cursor: "url('./img/pointer.cur'), auto",
                    },
                    id: "newBoard",
        
                })
            })
        }
        
        if (type == "buyBoard") {
            
            let container = holder.create("div.bm_boardContainer");
            container.classAdd("hover");
            container.classAdd("square");
            container.classAdd("pointerCursor");
            let img = container.create("img.bm_shopImg");
            img.src = "img/menuIcons/shopingcart.png";
            container.on("click",function() {

            })
        }
    }

    for (let i = 0; i < boardStats.length; i++) {
        makeBoard(listHolder,boardStats[i],"board",i)
    }

    if (boardStats.length < localAccount.boardLimit || localAccount.status == "Admin") {
        makeBoard(listHolder,false,"newBoard")
    } else {
        makeBoard(listHolder,false,"buyBoard")
    }
}

function loadProfileMenu() {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_profile").show("flex");
    $("profile_tab").classAdd("menu_tab_selected");

    const html_accountType = $(".cp_accountType");
    const html_dateCreated = $(".cp_dateCreated");

    html_accountType.innerHTML = localAccount.status;
    html_dateCreated.innerHTML = localAccount.dateCreated.subset(0,9);

    if (localAccount.status == "Guest") $(".cp_accountSettings").hide();
    else $(".cp_accountSettings").show("flex");

}
$(".cp_changeUsername").on("click",function() {

})
$(".cp_changePassword").on("click",function() {
    makePopUp([
        {type: "title",text: "Enter Current Password"},
        {type: "input", id:"password",inputType:"password", maxLength: "30", placeholder: "Old Password...", width: "200px"},
        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "green",text:"Continue",onClick: (ids) => {
            const {password} = ids;
            socket.emit("user_changePasswordCheck",password.value);
            
        }},
    ],{
        exit: {
            cursor: "url('./img/pointer.cur'), auto",
        },
        id: "changePasswordCheck",

    })
})
$(".cp_logOut").on("click",function() {
    socket.emit("user_logout");
})
$(".cp_deleteAccount").on("click",function() {
    makePopUp([
        {type: "text",text: "Delete Account"},
        {type: "title",text: "Are You Sure?"},
        [
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100px",  background: "black",text:"No"},
            {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto",width: "100px", background: "red",text:"Delete",onClick: (ids,param) => {
                
            }},
        ],
    ],{
        id: "deleteAccountPopUp",
    })
})


function editGameMode(gameMode,sendToServer = false) {
    html_popup = $(".editGameModePopup");
    html_popup.show("flex");
    html_popup.gameMode = gameMode;
    html_popup.sendToServer = sendToServer;

    
    setPopupTab("settings","gamemode");
}
function createGamemodeGrid(holder,width,height,grid) {
    html_popup = $(".editGameModePopup");
    holder.innerHTML = "";
    let rect = holder.getBoundingClientRect();

    widthValue = ((1/width)*rect.width) + "px";
    heightValue = (((1/height)-0.02)*rect.height) + "px";

    let columns = [];
    for (let i = 0; i < width; i++) {
        let column = holder.create("div.gmGroup_column");
        column.css({
            width: (((1/width)*100)-1) + "%",
        })
        columns.push(column);
    }

    let familyDivs = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            let g = grid[i][j];
            if (!g) continue;

            let holder;
            if (g.familyID) {
                if (familyDivs.includes("fa" + g.familyID)) {
                    holder = $("fa" + g.familyID).create("div.gmGroup_holder");
                } else {
                    familyDivs.push("fa" + g.familyID);
                    let group = columns[j].create("div.gmGroup_group");
                    group.id = "fa" + g.familyID;
                    holder = group.create("div.gmGroup_holder");
                }
                holder.id = "family" + g.familyID + "my" + g.myID;
            } else {
                let group = columns[j].create("div.gmGroup_group");
                group.id = "naGroup";

                holder = group.create("div.gmGroup_holder");
            }

            holder.css({
                height: heightValue,
            })
            holder.showCases = [];
            holder.activateList = function() {
                for (let i = 0; i < this.showCases.length; i++) {
                    let showCase = this.showCases[i];
                    
                    if (showCase.equals == this.gmValue) {
                        showCase.element.show("flex");
                    } else {
                        showCase.element.hide();
                    }
                }
            }

            if (g.showWhen) {
                $("family" + g.familyID + "my" + g.showWhen.valueFromId).showCases.push({
                    element: holder,
                    equals: g.showWhen.equals,
                })

                let value = $("family" + g.familyID + "my" + g.showWhen.valueFromId).gmValue;
                if (g.showWhen.equals == value) {
                    holder.show("flex");
                } else {
                    holder.hide();
                }
            }

            generateGamemodeSetting(holder,g,g.familyID,g.myID);

        }
    }
}
function generateGamemodeSetting(holder,settings,familyID,myID) {
    html_popup = $(".editGameModePopup");
    let gamemode = html_popup.gameMode;
    let title = holder.create("div.gmGroup_title");
    title.innerHTML = settings.title;

    let valueInput;
    if (settings.type == "input") {
        valueInput = holder.create("input.gmGroup_input");
        valueInput.value = gamemode[settings.valueString];
        holder.gmValue = gamemode[settings.valueString];

        valueInput.on("change",function() {
            gamemode[settings.valueString] = this.value;
            holder.gmValue = this.value;
            holder.activateList();
        })
    }
    if (settings.type == "textarea") {
        valueInput = holder.create("textarea.gmGroup_textarea");
        valueInput.value = gamemode[settings.valueString];
        holder.gmValue = gamemode[settings.valueString];
        
        valueInput.on("change",function() {
            gamemode[settings.valueString] = this.value;
            holder.gmValue = this.value;
            holder.activateList();
        })
    }
    if (settings.type == "number") {
        valueInput = holder.create("input.gmGroup_number");
        valueInput.value = gamemode[settings.valueString];
        holder.gmValue = gamemode[settings.valueString];
        valueInput.type = "number";

        valueInput.on("change",function() {
            if (settings.typeSettings.min) {
                if (Number(this.value) < settings.typeSettings.min) this.value = settings.typeSettings.min;
            }
            if (settings.typeSettings.max) {
                if (Number(this.value) > settings.typeSettings.max) this.value = settings.typeSettings.max;
            }

            gamemode[settings.valueString] = Number(this.value);
            holder.gmValue = Number(this.value);
            holder.activateList();

        })
    }
    if (settings.type == "toggle") {
        valueInput = holder.create("div.gmGroup_toggle");
        if (gamemode[settings.valueString] == true) {
            valueInput.classAdd("gmGroup_toggle_on");
            valueInput.innerHTML = "ON";
            valueInput.value = true;
        } else {
            valueInput.classAdd("gmGroup_toggle_off");
            valueInput.innerHTML = "OFF";
            valueInput.value = false;
        }
        holder.gmValue = gamemode[settings.valueString];

        valueInput.on("click",function() {
            if (this.classList.contains("gmGroup_toggle_on")) {
                this.classRemove("gmGroup_toggle_on")
                this.classAdd("gmGroup_toggle_off");
                this.innerHTML = "OFF";
                gamemode[settings.valueString] = false;
                
                holder.gmValue = false;
            } else {
                this.classAdd("gmGroup_toggle_on")
                this.classRemove("gmGroup_toggle_off");
                this.innerHTML = "ON";
                gamemode[settings.valueString] = true;
                holder.gmValue = true;
            }
            holder.activateList();
        })
    }
    if (settings.type == "list") {
        valueInput = holder.create("div.gmGroup_list");
        let options = [];
        for (let i = 0; i < settings.typeSettings.options.length; i++) {
            let option = valueInput.create("div.gmGroup_list_option");
            option.innerHTML = settings.typeSettings.options[i];
            options.push(option);

            if (settings.typeSettings.options[i].toLowerCase() == gamemode[settings.valueString].toLowerCase()) {
                option.classAdd("gmGroup_list_option_selected");
                holder.gmValue = gamemode[settings.valueString].toLowerCase();
            } 

            option.on("click",function() {
                options.classRemove("gmGroup_list_option_selected");
                this.classAdd("gmGroup_list_option_selected");
                gamemode[settings.valueString] = settings.typeSettings.options[i].toLowerCase();
                holder.gmValue = settings.typeSettings.options[i].toLowerCase();
                holder.activateList();
            })
        }

    }

    let typeSettings = settings.typeSettings;
    if (typeSettings.placeholder) valueInput.placeholder = typeSettings.placeholder;
    if (typeSettings.maxLength) valueInput.maxLength = typeSettings.maxLength;





    let description = holder.create("div.gmGroup_description");
    description.innerHTML = settings.description || "";
}
function createGamemodeSetting(title,type,valueString,typeSettings,description,familyID = false,myID = false,showWhen = false) {
    return {
        title: title,
        type: type,
        valueString: valueString,
        typeSettings: typeSettings,
        description: description,
        familyID: familyID,
        myID: myID,
        showWhen: showWhen,
    }
}
function loadGamemodeTabSettings() {
    html_popup = $(".editGameModePopup");
    let gamemode = html_popup.gameMode;
    let holder = $("modernPopup_content_settings");
    holder.innerHTML = "";

    let a = createGamemodeSetting("Gamemode Name","input","name",{maxLength: 30,default: "Untitled",placeholder: "Gamemode name..."},"Title that is presented to the players.",1);
    let b = createGamemodeSetting("Gamemode Description","textarea","description",{maxLength: 150},"Explain what this gamemode does, and how to play it.",1);
    let c = createGamemodeSetting("Inventory Slots","number","howManyItemsCanPlayersUse",{min: 0, max: 10},"How many inventory slots the players have.");
    let e = createGamemodeSetting("Snake Collision","toggle","snakeCollision",{},"Do you take damage when hitting other snakes.",2,1);
    let f = createGamemodeSetting("Team Collision","toggle","teamCollision",{},"Do you take damage when hitting other snakes on the same team.",2,2,{
        valueFromId: 1,
        equals: true,
    });
    let i = createGamemodeSetting("When Snakes Die","list","whenSnakesDie",{options: ["Remain","Vanish","Become Food"]},"What happens when a snake dies.",3,1);
    let j = createGamemodeSetting("Become Food %","number","setFoodRate",{min: 0, max: 100},"What percent of the snake turns into food.",3,2,{
        valueFromId: 1,
        equals: "become food",
    });
    let m = createGamemodeSetting("Repsawn","toggle","respawn",{},"Do players respawn when they die.",4,1);
    let n = createGamemodeSetting("Respawn Timer","number","respawnTimer",{min: 0, max: 60},"How long it takes to respawn in seconds.",4,2,{
        valueFromId: 1,
        equals: true,
    });
    let o = createGamemodeSetting("Respawn Tail %","number","respawnGrowth",{min: 0, max: 100},"What percent of the players tail do they keep when they respawn.",4,3,{
        valueFromId: 1,
        equals: true,
    });
    let p = createGamemodeSetting("Respawn Protection","number","respawnGrowth",{min: 0, max: 60},"How many seconds does the player have protection after respawning.",4,4,{
        valueFromId: 1,
        equals: true,
    });

    let grid = [
        [a,e,i,m],
        [b,f,j,n],
        [c,false,false,o],
        [false,false,false,p]
    ]

    createGamemodeGrid(holder,4,4,grid);

}
function loadGamemodeTabItems() {

}
function loadGamemodeTabWinning() {

}
function setPopupTab(tab,type) {
    $(".modernPopup_topRow_imageHolder").classRemove("modernPopup_topRow_image_selected");
    $("gamemode_popup_tab_" + tab).classAdd("modernPopup_topRow_image_selected");

    $(".modernPopup_content").hide();
    $("modernPopup_content_" + tab).show("flex");

    if (type == "gamemode") {
        if (tab == "settings") {
            loadGamemodeTabSettings();   
        }
        if (tab == "items") {
            loadGamemodeTabItems();   
        }
        if (tab == "winning") {
            loadGamemodeTabWinning();   
        }
    }
}
function generateSettingsCard() {
    
}
$(".modernPopup_topRow_imageHolder").on("click",function() {
    setPopupTab(this.id.subset("tab_\\after","end"),this.id.subset(0,"_\\before"));
})
$(".modernPopup_topRow_close").on("click",function() {
    this.$P().$P().$P().hide();
})