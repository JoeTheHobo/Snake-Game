let serverSelected = false;


function loadServersHTML() {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_servers").show("flex");
    $("servers_tab").classAdd("menu_tab_selected");
    let holder = $(".servers_servers_holder");
    holder.innerHTML = "";
    for (let server in frontEndLobbies) {
        server = frontEndLobbies[server];
        if (!server.id) continue;
        let server_holder = holder.create("div");
        server_holder.classAdd("server_holder");
        if (server.id == serverSelected.id) server_holder.classAdd("serverSelected");

        let boardCanvas = server_holder.create("canvas");
        boardCanvas.className = "server_canvas";
        boardCanvas.height = boardCanvas.clientHeight;
        boardCanvas.width = boardCanvas.clientWidth;
        drawBoardToCanvas(server.board.originalMap,boardCanvas,true)
        
        let column = server_holder.create("div");
        column.className = "server_column";

        let boardTitleContainer = column.create("div");
        boardTitleContainer.className = "server_title_container";

        if (server.serverType == "Private") {
            let lockImageHolder = boardTitleContainer.create("div");
            lockImageHolder.className = "server_lock_holder";
            let lockImage = lockImageHolder.create("img");
            lockImage.className = "server_lock_image";
            lockImage.src = "img/menuIcons/lock.png";
        }

        let boardName = boardTitleContainer.create("div");
        boardName.className = "server_board_name";
        boardName.innerHTML = server.hostName + server.hostTag + "'s Lobby";

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
            $("joinServer").classRemove("servers_button_inactive");
        })
    }
}

function loadServerCreation() {
    //let holder = $(".content_servers");
    //holder.innerHTML = "";

    let board = shortenBoard(boards[0]);

    let lobby = {
        board: JSON.stringify(board),
        gameMode: gameModes[0],
    }
    updateLobbyToServer(lobby);
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

        if (!content.cantEdit || listObj.type !== "gameModes") {
            contentHolder.open = function() {
                $(".list_element").classRemove("list_selected");
                this.classAdd("list_selected");
                if (contentObj) generateHTMLContent(contentHTML,contentObj,content,contentHolder);
                else editGameMode(contentHTML,content,contentHolder.tags["name"]); 
            }
            contentHolder.on("click",function() {
                this.open();
            })
        }
        
        
        

        if (listObj.forceOpen) {
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
                        filter: obj.filter == "player" ? `hue-rotate(${index.color}deg) sepia(${index.color2}%) contrast(${index.color3}%)` : "",
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
            if (["title","text","label","delete","close"].includes(l.type)) div = holder.create("div");
            if (["keyBind","slider","input"].includes(l.type)) div = holder.create("input");

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
                    let saveArray = l.delete;
                    makePopUp([
                        {type: "text",text: "Delete " + contentHolder.tags["name"].innerHTML},
                        {type: "title",text: "Are You Sure?"},
                        [
                            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100px",  background: "black",text:"No"},
                            {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto",width: "100px", background: "red",text:"Delete",onClick: (ids,param) => {
                                let saveArray = param.saveArray;

                                let index = false;
                                findingIndex: for (let i = 0; i < saveArray.length; i++) {
                                    if (saveArray[i].id === obj.id) {
                                        index = i;
                                        break findingIndex;
                                    }
                                }

                                if (index === false) return;

                                saveArray.splice(index,1);

                                savePlayers();
                                saveBoards();
                                saveAllGameModes();
                                l.deleteLoad();
                            }},
                        ],
                    ],{
                        id: "deletePopUp",
                        parameter: {
                            saveArray: saveArray,
                        } 
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
                    filter: l.filter == "player" ? `hue-rotate(${obj.color}deg) sepia(${obj.color2}%) contrast(${obj.color3}%)` : "",
                    width: l.width,
                    height: l.height,
                    background: l.background,
                    borderRadius: l.borderRadius,
                })
                div.src = "img/" + l.src;
            }
            if (l.tag) {
                originalParent.tags[l.tag] = div;
            }
            if (l.bind) {
                div.on("input",function() {
                    if (l.bind.type == "!==") if (this.value !== "") obj[l.bind.key] = this.value;
                    if (l.bind.type == "set" || !l.type) obj[l.bind.key] = this.value;

                    if (l.save  == undefined || l.save == true) {
                        savePlayers(updateLobby);
                    }
                    if (l.bind.update) {
                        let value = obj[l.bind.key];
                        
                        if (l.bind.update.type == "filterPlayer") {
                            if (l.bind.update.externalKey && contentHolder) contentHolder.tags[l.bind.update.externalKey].style.filter = `hue-rotate(${obj.color}deg) sepia(${obj.color2}%) contrast(${obj.color3}%)`;
                            if (l.bind.update.key) originalParent.tags[l.bind.update.key].style.filter = `hue-rotate(${obj.color}deg) sepia(${obj.color2}%) contrast(${obj.color3}%)`;
                        } else {
                            if (l.bind.update.externalKey && contentHolder) contentHolder.tags[l.bind.update.externalKey][l.bind.update.type] = value;
                            if (l.bind.update.key) originalParent.tags[l.bind.update.key][l.bind.update.type] = value;
                        }
                    }
                })
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
            listContent: [{type: "image",src: "snakeHead.png", filter: "player",tag: "image"},{type: "title",text: ".name",tag: "name"}],
            top: [{type: "button",text: "New Snake",onClick: function() {
                getAndLoadNewPlayer();
            }}],
        },
        [
            {type: "title",text: "Appearance"},
            [
                [{type: "image", src: "snakeHead.png",filter: "player",tag:"image",width: "200px",height: "200px",background: "white",borderRadius: "5px",}],
                [
                    {type: "text",text: "Snake Name"},
                    {type: "input",value: ".name", tag: "name", bind: {key: "name",type: "!==",value: "",update: {externalKey: "name",type: "innerHTML"}}},
                    {type: "text",text: "Hue"},
                    {type: "slider", value: ".color",min: 0, max: 360,bind: {key: "color",type: "set",update: {externalKey: "image",key:"image",type: "filterPlayer"}}},
                    {type: "text",text: "Sepia"},
                    {type: "slider", value: ".color2",min: 0, max: 100,bind: {key: "color2",type: "set",update: {externalKey: "image",key:"image",type: "filterPlayer"}}},
                    {type: "text",text: "Contrast"},
                    {type: "slider", value: ".color3",min: 0, max: 200,bind: {key: "color3",type: "set",update: {externalKey: "image",key:"image",type: "filterPlayer"}}},
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

                ],
                [
                    {type: "keyBind", value: ".useItem1",bind: {key: "useItem1",type: "set"}},
                    {type: "keyBind", value: ".useItem2",bind: {key: "useItem2",type: "set"}},
                    {type: "keyBind", value: ".fireItem",bind: {key: "fireItem",type: "set"}},

                ]
            ],
            {type: "title",text: "Danger Zone"},
            {type: "delete", delete: localAccount.players,deleteLoad: loadCustomizeSnakeScreen}
        ]
    )
}

function loadBoardsScreen(index = false) {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_boards").show("flex");
    $("boards_tab").classAdd("menu_tab_selected");
    generateHTMLScreen($(".content_boards"),
        {
            list: boards,
            forceOpen: index,
            listContent: [{type: "title",text: ".name",tag: "name"},[{type: "button", text:"Export", onClick: (board) => {
                const encoder = new TextEncoder();
                const shortenBoardResult = shortenBoard(board);
                
                if (!shortenBoardResult) {
                    throw new Error('shortenBoard(board) returned invalid data.');
                }
                
                const jsonString = JSON.stringify(shortenBoardResult);
                const encodedText = encoder.encode(jsonString);
                
                const compressed = pako.gzip(encodedText);

                downloadTextFile(board.name,JSON.stringify(compressed));
                  
            }},{type: "button",special: true, text:"Edit", onClick: (board,index) => {
                currentBoardIndex = index;
                currentBoard = boards[currentBoardIndex];
                openMapEditor(board);
            }}]],
            top: [{type: "button",text: "New Board",onClick: function() {
                makePopUp([
                    {type: "title",text: "New Board"},
                    [
                        {type: "text", text: "Name"},
                        {type: "input", id:"name", placeholder: "Untitled", width: "200px"},
                    ],
                    [
                        {type: "text", text: "Width"},
                        {type: "number", id:"width", value: "50", min: 5, max: 70, width: "50px"},
                        {type: "text", text: "Height"},
                        {type: "number", id:"height", value: "30", min: 5, max: 70, width: "50px"},
                    ],
                    
                    {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "green",text:"Create",onClick: (ids) => {
                        const {name,width,height} = ids;
                        let boardName = name.value == "" ? "Untitled" : name.value;
                        createBoard(boardName,width.value,height.value);
                        
                    }},
                ],{
                    exit: {
                        cursor: "url('./img/pointer.cur'), auto",
                    },
                    id: "newBoard",
        
                })
            }},{type: "button",text: "Import",onClick: () => {

                // Create an input element of type file
                const input = document.createElement('input');
                input.type = 'file';

                // When the user selects a file
                input.addEventListener('change', (event) => {
                    const file = event.target.files[0]; // Get the first selected file
                    if (file) {
                        readFileContent(file); // Read the content of the file

                    } else {
                    alert('No file selected!');
                    }
                });

                // Programmatically click the input to open the file dialog
                input.click();

                

            }}],
        },
        [
            {type: "canvas", width: "90%", height: "square",display: function(board,canvas) {
                drawBoardToCanvas(board.originalMap,canvas)
            }},
            {type: "title",special: "delete", text: "Danger Zone"},
            {type: "delete", special: "delete", delete: boards,deleteLoad: loadBoardsScreen}
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
                img.src = "img/snakeHead.png";
                img.className = "local_content_snakeHead";
                img.style.filter = `hue-rotate(${list[i].color}deg) sepia(${list[i].color2}%) contrast(${list[i].color3}%)`;
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


function loadGameModesScreen(index = false) {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_gameModes").show("flex");
    $("gameModes_tab").classAdd("menu_tab_selected");
    generateHTMLScreen($(".content_gameModes"),
        {
            list: gameModes,
            forceOpen: index,
            type: "gameModes",
            listContent: [{type: "title",text: ".name",tag: "name"}],
            top: [{type: "button",text: "New Game Mode",onClick: function() {
                gameModes.push(structuredClone(gameModes[0]));
                gameModes[gameModes.length-1].name = "Untitled";
                gameModes[gameModes.length-1].cantEdit = false;
                gameModes[gameModes.length-1].id = Date.now() + rnd(5000);
                loadGameModesScreen(gameModes.length-1);
                saveAllGameModes()
            }}],
        });
}

function editGameMode(holder2,gameMode,htmlName) {
    if (gameMode.cantEdit) return;
    let html_gameModesHolder = holder2;
    html_gameModesHolder.innerHTML = `
        <div class="gameModes_settings_title">General Settings</div>
        <div class="settingsHolder"></div>
        <div class="gameModes_settings_title">Item Settings</div>
        <div class="onSpawnHolder"></div>
        <div class="gameModes_settings_title" id="gameModes_item_selected_name">Nothing Selected</div>
        <div class="gameModes_item_settings"></div>
        <div class="gameModes_settings_title">Danger Zone</div>
        <div class="gameModes_fullWidth hover"><div class="gameModes_deleteButton">Delete Game Mode</div></div>
        
    `;

    $(".gameModes_deleteButton").on("click",function() {
        for (let i = 0; i < gameModes.length; i++) {
            if (gameModes[i].id === gameMode.id) {
                makePopUp([
                    {type: "text",text: "Delete " + gameMode.name},
                    {type: "title",text: "Are You Sure?"},
                    [
                        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100px",  background: "black",text:"No"},
                        {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto",width: "100px", background: "red",text:"Delete",onClick: () => {
                            gameModes.splice(i,1);
                            holder2.innerHTML = "";
                            loadGameModesScreen();
                            saveAllGameModes()
                        }},
                    ],
                ],{
                    id: "deletePopUp",
                })
                
            }
        }
    })
    
    function addSetting(title,type,value,func,list) {
        let holder = $(".settingsHolder").create("div");
        holder.className = "settingHolder";
        let settingsTitle = holder.create("div");
        settingsTitle.className = "settingTitle";
        settingsTitle.innerHTML = title;
        
        let settingsInput;
        if (type == "input" || type == "number") {
            settingsInput = holder.create("input");
            settingsInput.className = type == "input" ? "settingsInputFull" : "settingInput";
            settingsInput.value = value;
            settingsInput.id = "gm_" + title.toLowerCase().subset(0,"end","trim\\ ");
            if (type == "number") settingsInput.type = "number";
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
        }
        settingsInput.on("input",function() {
            func(this.value,this);
        })
        
    }
    addSetting("Game Mode Name","input",gameMode.name,function(value,input) {
        if (value !== "")
        gameMode.name = value;
        htmlName.innerHTML = value;
        saveAllGameModes();
    });
    addSetting("Inventory Slots","number",gameMode.howManyItemsCanPlayersUse,function(value,input) {
        if (value < 0) input.value = 0;
        if (value > 10) input.value = 10;

        gameMode.howManyItemsCanPlayersUse = value;
        saveAllGameModes();
    });
    addSetting("Using Items Type","dropdown",gameMode.mode_usingItemType,function(value) {
        gameMode.mode_usingItemType = value;
        if (value == "direct") {
            $("gm_inventoryslots").value = 2;
            gameMode.howManyItemsCanPlayersUse = 2;
        }
        saveAllGameModes();
    },["direct","scroll"]);
    addSetting("Full Inventory","dropdown",gameMode.mode_whenInventoryFullWhereDoItemsGo,function(value) {
        gameMode.mode_whenInventoryFullWhereDoItemsGo = value;
        saveAllGameModes();
    },["noPickUp","select","recycle"]);
    addSetting("Snake Vanish On Death","dropdown",gameMode.snakeVanishOnDeath,function(value) {
        gameMode.snakeVanishOnDeath = value == "true" ? true : false;
        saveAllGameModes();
    },["true","false"]);
    addSetting("Respawn","dropdown",gameMode.respawn,function(value) {
        gameMode.respawn = value == "true" ? true : false;
        saveAllGameModes();
    },["true","false"]);
    addSetting("Respawn Timer (Seconds)","number",gameMode.respawnTimer,function(value,input) {
        if (value < 0) input.value = 0;
        gameMode.respawnTimer = value;
        saveAllGameModes();
    });
    addSetting("Respawn Tail %","number",gameMode.respawnGrowth,function(value,input) {
        if (value < 0) input.value = 0;
        if (value > 100) input.value = 100;
        gameMode.respawnGrowth = value;
        saveAllGameModes();
    });
    addSetting("Snake Collision","dropdown",gameMode.snakeCollision,function(value) {
        gameMode.snakeCollision = value == "true" ? true : false;
        saveAllGameModes();
    },["true","false"]);
    addSetting("Team Collision","dropdown",gameMode.teamCollision,function(value) {
        gameMode.teamCollision = value == "true" ? true : false;
        saveAllGameModes();
    },["true","false"]);


    let html_onSpawnHolder = $(".onSpawnHolder");
    let allItems = html_onSpawnHolder.create("div");
    allItems.className = "allItems";
    let itemEditor = html_onSpawnHolder.create("div");
    itemEditor.className = "itemEditorHolder";
    for (let i = 0; i < gameMode.items.length; i++) {
        let item = gameMode.items[i];

        if (!item.showInEditor) continue;

        let holder = allItems.create("div");
        holder.className = "spawn_holder";
        let imgHolder = holder.create("div");
        imgHolder.className = "spawn_imageHolder" + " " + (item.gameModeMenu_selectedItem ? "spawn_itemSelected" : "");
        let img = imgHolder.create("img");
        img.className = "spawn_image";
        
        if (item.baseImg) {
            let image = getImageFromItem(item,false);
            img.src = $("item_" + image).src;
        } else 
            img.src = $("item_" + item.name).src;

        imgHolder.gameMode = gameMode;
        imgHolder.item = item;
        imgHolder.holder = holder;
        imgHolder.on("click",function() {
            $(".spawn_holder").classRemove("spawn_itemSelected");
            this.holder.classAdd("spawn_itemSelected");
            $("gameModes_item_selected_name").innerHTML = this.item.name;
            gameMode_editItem(this.item,$(".gameModes_item_settings"),this.gameMode)
        })
    }
}
function gameMode_editItem(item,html_holder,gameMode) {
    html_holder.innerHTML = "";

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

    addSetting("Spawn Rate","number",item.specialSpawnWeight,function(value) {
        item.specialSpawnWeight = Number(value);
        if (value < 0) return;
        saveAllGameModes();
    });
    addSetting("Visible","toggle",item.visible,function(value) {
        item.visible = value;
        saveAllGameModes();
    });
    addSetting("Plays Audio","toggle",item.playSounds,function(value) {
        item.playSounds = value;
        saveAllGameModes();
    });

    if (item.canEat == true && item.onEat.growPlayer > 0 ) {
        addSetting("Grow Player","number",item.onEat.growPlayer,function(value) {
            if (value < 0) return;
            item.onEat.growPlayer = Number(value);
            saveAllGameModes();
        });
    }
    if (item.canEat == true) {
        addSetting("Attempt Spawn Random Item","toggle",item.onEat.spawnRandomItem,function(value) {
            item.onEat.spawnRandomItem = value;
            saveAllGameModes();
        });
    }
    if (item.canEat == true && item.onEat.shield > 0) {
        addSetting("Give Shield","number",item.onEat.shield,function(value) {
            item.onEat.shield = Number(value);
            saveAllGameModes();
        });
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Duration","number",item.onEat.turbo.duration,function(value) {
        if (value < 0) return;
        item.onEat.turbo.duration = Number(value);
        saveAllGameModes();
        });
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Speed","number",item.onEat.turbo.moveSpeed,function(value) {
        if (value < 0) return;
        item.onEat.turbo.moveSpeed = value;
        saveAllGameModes();
        });
    }

}