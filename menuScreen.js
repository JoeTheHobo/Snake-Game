let servers = [];
let serverSelected = false;

function loadServersHTML() {
    let holder = $(".servers_servers_holder");
    holder.innerHTML = "";

    for (let i = 0; i < servers.length; i++) {
        let server = servers[i];
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


    let server = {
        board: boards[Number(prompt())],
        host: players[0].name,
        gameMode: gameModes[0],
        playerMax: 8,
        playerCount: 1,
        id: Date.now() + "_" + rnd(5000),
    }
    servers.push(server);

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
                width: "100px",
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
            generateHTMLContent(contentHTML,contentObj,content,contentHolder);
        }
        contentHolder.on("click",function() {
            this.open();
        })
        

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
                        obj.onClick(index);
                    })
                }
            }
        }

        generateContent(listObj.listContent,contentHolder,content,contentHTML);
        

    }

    if (forceOpen) forceOpen.open();
}
function generateHTMLContent(holder,contentList,valueObj,contentHolder) {
    holder.innerHTML = "";
    holder.tags = {};

    function generateContent(list,obj,parent,direction = "column",originalParent) {
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
                generateContent(l,obj,holder,(direction == "column" ? "row" : "column"),originalParent);
                continue;
            }

            let div;

            if (l.special == "delete") if (obj.cantEdit) continue;

            if (["image"].includes(l.type)) div = holder.create("img");
            if (["canvas"].includes(l.type)) div = holder.create("canvas");
            if (["title","text","label","delete"].includes(l.type)) div = holder.create("div");
            if (["keyBind","slider","input"].includes(l.type)) div = holder.create("input");

            if (l.text) div.innerHTML = l.text;

            if (l.type == "title") {
                div.css({
                    fontSize: "30px",
                    color: "white",
                })
            }
            if (l.type == "delete") {
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
                        savePlayers();
                    }
                    if (l.bind.update) {
                        let value = obj[l.bind.key];
                        
                        if (l.bind.update.type == "filterPlayer") {
                            if (l.bind.update.externalKey) contentHolder.tags[l.bind.update.externalKey].style.filter = `hue-rotate(${obj.color}deg) sepia(${obj.color2}%) contrast(${obj.color3}%)`;
                            if (l.bind.update.key) originalParent.tags[l.bind.update.key].style.filter = `hue-rotate(${obj.color}deg) sepia(${obj.color2}%) contrast(${obj.color3}%)`;
                        } else {
                            if (l.bind.update.externalKey) contentHolder.tags[l.bind.update.externalKey][l.bind.update.type] = value;
                            if (l.bind.update.key) originalParent.tags[l.bind.update.key][l.bind.update.type] = value;
                        }
                    }
                })

                

            }

        }
    }

    generateContent(contentList,valueObj,holder,"column",holder)
}


function loadCustomizeSnakeScreen(index = false) {
    generateHTMLScreen($(".content_snake"),
        {
            list: players,
            forceOpen: index,
            listContent: [{type: "image",src: "snakeHead.png", filter: "player",tag: "image"},{type: "title",text: ".name",tag: "name"}],
            top: [{type: "button",text: "New Snake",onClick: function() {
                newPlayer();
                loadCustomizeSnakeScreen(players.length-1);
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
            {type: "delete", delete: players,deleteLoad: loadCustomizeSnakeScreen}
        ]
    )
}

function loadBoardsScreen(index = false) {
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
                  
            }},{type: "button",special: true, text:"Edit", onClick: (board) => {
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


function savePlayers() {
    ls.save("players",players);
}
function saveAllGameModes() {
    ls.save("gameModes",gameModes);
}

function loadLocalScreen() {
    let boardHolder = $("local_boards");
    let snakesHolder = $("local_snakes");
    let gameModesHolder = $("local_gameModes");

    boardHolder.innerHTML = "";
    snakesHolder.innerHTML = "";
    gameModesHolder.innerHTML = "";

    function loadContent(parent,list,type) {
        for (let i = 0; i < list.length; i++) {
            let holder = parent.create("div");
            holder.className = "local_content_holder hover";

            if (type == "snakes") {
                let img = holder.create("img");
                img.src = "img/snakeHead.png";
                img.className = "local_content_snakeHead";
                img.style.filter = `hue-rotate(${list[i].color}deg) sepia(${list[i].color2}%) contrast(${list[i].color3}%)`;
            }

            let title = holder.create("div");
            title.innerHTML = list[i].name;
            title.className = "local_content_title";

            if (type == "gameModes" && i == currentBoardIndex) {
                holder.classAdd("local_content_selected");
            }
        }
    }

    loadContent(boardHolder,boards,"boards");
    loadContent(snakesHolder,players,"snakes");
    loadContent(gameModesHolder,gameModes,"gameModes");
}