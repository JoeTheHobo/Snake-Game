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
    })

    let list = $(".content_snake").create("div");
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid white",
    })

    generateHTMLList(list,listObj,contentObj,content);
}
function generateHTMLList(holder,listObj,contentObj,contentHTML) {
    let top = holder.create("div");
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

        contentHolder.on("click",function() {
            $(".list_element").classRemove("list_selected");
            this.classAdd("list_selected");
            generateHTMLContent(contentHTML,contentObj,content);
        })

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
                    })
                    generateContent(obj,div,index);
                    continue;
                }

                if (["image"].includes(obj.type)) div = parent.create("img");
                if (["title"].includes(obj.type)) div = parent.create("div");
                
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
            }
        }

        generateContent(listObj.listContent,contentHolder,content,contentHTML);
        

    }
}
function generateHTMLContent(holder,contentList,valueObj) {
    holder.innerHTML = "";

    function generateContent(list,obj,parent,direction = "column") {
        let holder = parent.create("div");
        holder.css({
            display: "flex",
            flexDirection: direction,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
        })


        for (let i = 0; i < list.length; i++) {
            let l = list[i];

            if (_type(l).type == "array") {
                generateContent(l,obj,holder,(direction == "column" ? "row" : "column"));
                continue;
            }

            let div;

            if (["image"].includes(l.type)) div = holder.create("img");
            if (["title","text","label"].includes(l.type)) div = holder.create("div");
            if (["keyBind","slider"].includes(l.type)) div = holder.create("input");

            if (l.text) div.innerHTML = l.text;

            if (l.type == "title") {
                div.css({
                    fontSize: "30px",
                    color: "white",
                })
            }
            if (l.type == "text") {
                div.css({
                    fontSize: "20px",
                    color: "white",
                })
            }
            if (l.type == "slider") {
                div.type = "range";
                div.min = l.min;
                div.max = l.max;
                console.log(obj[l.value.subset(".\\after","end")]);
                if (l.value.charAt(0) == ".") div.value = obj[l.value.subset(".\\after","end")];
                else div.value = l.value;

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

        }
    }

    generateContent(contentList,valueObj,holder)
}


function loadCustomizeSnakeScreen() {
    generateHTMLScreen($(".content_snake"),
        {
            list: players,
            listContent: [{type: "image",src: "snakeHead.png", filter: "player"},{type: "title",text: ".name"}],
            top: [{type: "button",text: "New Snake",onClick: function() { }}],
        },
        [
            {type: "title",text: "Appearance"},
            [
                [{type: "image", src: "snakeHead.png",filter: "player",id:"snakeImg",width: "200px",height: "200px",background: "white",borderRadius: "5px",}],
                [
                    {type: "text",text: "Snake Name"},
                    {type: "input",value: ".name", id: "snakeName"},
                    {type: "text",text: "Hue"},
                    {type: "slider", value: ".color",min: 0, max: 100},
                    {type: "text",text: "Sepia"},
                    {type: "slider", value: ".color2",min: 0, max: 100},
                    {type: "text",text: "Contrast"},
                    {type: "slider", value: ".color3",min: 0, max: 100}
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
                    {type: "keyBind", id:"moveLeft",value: ".leftKey"},
                    {type: "keyBind", id:"moveDown",value: ".downKey"},
                    {type: "keyBind", id:"moveRight",value: ".rightKey"},
                    {type: "keyBind", id:"moveUp",value: ".upKey"},
                ],
                [
                    {type: "label",text: "Scroll Left"},
                    {type: "label",text: "Scroll Right"},
                    {type: "label",text: "Use Item"},

                ],
                [
                    {type: "keyBind", id:"scrollLeft",value: ".useItem1"},
                    {type: "keyBind", id:"scrollRight",value: ".useItem2"},
                    {type: "keyBind", id:"useItem",value: ".fireItem"},

                ]
            ],
        ]
    )
}