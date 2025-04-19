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
function setItemAlteration(gameMode,item) {
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


function editGameMode(gameMode,sendToServer = false,func = () => {}) {
    html_popup = $(".editGameModePopup");
    html_popup.show("flex");
    html_popup.gameMode = gameMode;
    html_popup.sendToServer = sendToServer;
    html_popup.closeFunction = func;

    
    setPopupTab("settings","gamemode");
}
function createGamemodeGrid(holder,width,height,grid,pullFrom,gridName = "") {
    html_popup = $(".editGameModePopup");
    holder.innerHTML = "";
    holder.show("flex");
    let rect = holder.getBoundingClientRect();

    widthValue = ((1/width)*rect.width) + "px";
    heightValue = (((1/height)-0.02)*rect.height) + "px";

    let columns = [];
    for (let i = 0; i < grid[0].length; i++) {
        let column = holder.create("div.gmGroup_column");
        column.css({
            width: (((1/grid[0].length)*100)-1) + "%",
        })
        columns.push(column);
    }

    let familyDivs = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            let g = grid[i][j];
            if (!g) {
                let holder = columns[j].create("div.gmGroup_invisible");
                holder.css({
                    height: heightValue,
                })
                continue;
            }

            let holder;
            if (g.familyID) {
                if (familyDivs.includes(gridName + "fa" + g.familyID)) {
                    holder = $(gridName + "fa" + g.familyID).create("div.gmGroup_holder");
                } else {
                    familyDivs.push(gridName + "fa" + g.familyID);
                    let group = columns[j].create("div.gmGroup_group");
                    group.id = gridName + "fa" + g.familyID;
                    holder = group.create("div.gmGroup_holder");
                }
                holder.id = gridName + "family" + g.familyID + "my" + g.myID;
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
                    
                    if (showCase.equals) {
                        if (showCase.equals == this.gmValue) {
                            showCase.element.css({
                                visibility: "visible",
                            });
                            if (showCase.onActiveSetValue) {
                                showCase.element.setValue(showCase.onActiveSetValue.value);
                            }
                        } else {
                            showCase.element.css({
                                visibility: "hidden",
                            });
                        }
                    }
                    if (showCase.isNumber) {
                        if (_type(this.gmValue).type == "number") {
                            showCase.element.css({
                                visibility: "visible",
                            });
                            if (showCase.onActiveSetValue) {
                                showCase.element.setValue(showCase.onActiveSetValue.value);
                            }
                        } else {
                            showCase.element.css({
                                visibility: "hidden",
                            });
                        }
                    }
                    if (showCase.isObject) {
                        if (_type(this.gmValue).type == "object") {
                            showCase.element.css({
                                visibility: "visible",
                            });
                            if (showCase.onActiveSetValue) {
                                showCase.element.setValue(showCase.onActiveSetValue.value);
                            }
                        } else {
                            showCase.element.css({
                                visibility: "hidden",
                            });
                        }
                    }
                }
            }

            if (g.showWhen) {
                $(gridName + "family" + g.familyID + "my" + g.showWhen.valueFromId).showCases.push({
                    element: holder,
                    equals: g.showWhen.equals,
                    isNumber: g.showWhen.isNumber,
                    isObject: g.showWhen.isObject,
                    onActiveSetValue: g.showWhen.onActiveSetValue,
                })

                let value = $(gridName + "family" + g.familyID + "my" + g.showWhen.valueFromId).gmValue;
                if ( g.showWhen.equals) {

                    if (g.showWhen.equals == value) {
                        holder.css({
                            visibility: "visible",
                        });
                    } else {
                        holder.css({
                            visibility: "hidden",
                        });
                    }
                }
                if (g.showWhen.isNumber) {
                    if (_type(value).type == "number") {
                        holder.css({
                            visibility: "visible",
                        });
                    } else {
                        holder.css({
                            visibility: "hidden",
                        });
                    }
                }
                if (g.showWhen.isObject) {
                    if (_type(value).type == "object") {
                        holder.css({
                            visibility: "visible",
                        });
                    } else {
                        holder.css({
                            visibility: "hidden",
                        });
                    }
                }
            }

            generateGamemodeSetting(holder,g,pullFrom);

        }
    }
}
function generateGamemodeSetting(holder,settings,pullFrom) {
    html_popup = $(".editGameModePopup");
    let gamemode = html_popup.gameMode;
    let title = holder.create("div.gmGroup_title");
    title.innerHTML = settings.title;
    let typeSettings = settings.typeSettings;

    let valueInput;
    if (settings.type == "input") {
        valueInput = holder.create("input.gmGroup_input");
        let nestedValue = getNestedValue(pullFrom,settings.valueString)
        if (nestedValue === undefined && typeSettings.default) {
            nestedValue = typeSettings.default;
        }
        valueInput.value = nestedValue;
        holder.gmValue = nestedValue;

        valueInput.on("change",function() {
            holder.setValue(this.value);
        })
        holder.setValue = function(value) {
            if (typeSettings.profanityCheck) {
                if (profanity.check(value)) {
                    valueInput.value = holder.gmValue;
                    return;
                }
            }
            if (typeSettings.profanityClean) {
                value = profanity.clean(value);
                valueInput.value = value;
            }
            holder.gmValue = value;
            setNestedValue(pullFrom,settings.valueString.split("."),value);
            holder.activateList();
            if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
            if (settings.editFunc) settings.editFunc(holder.gmValue);
        }
    }
    if (settings.type == "textarea") {
        valueInput = holder.create("textarea.gmGroup_textarea");
        valueInput.value = getNestedValue(pullFrom,settings.valueString);
        holder.gmValue = getNestedValue(pullFrom,settings.valueString);
        
        valueInput.on("change",function() {
            if (typeSettings.profanityCheck) {
                if (profanity.check(this.value)) {
                    valueInput.value = holder.gmValue;
                    return;
                }
            }
            if (typeSettings.profanityClean) {
                this.value = profanity.clean(this.value);
            }

            setNestedValue(pullFrom,settings.valueString.split("."),this.value);
            holder.gmValue = this.value;
            holder.activateList();
            if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
            if (settings.editFunc) settings.editFunc(holder.gmValue);
        })
        holder.setValue = function(value) {

        }
    }
    if (settings.type == "button") {
        valueInput = holder.create("div.endScreen_LobbyButton");
        valueInput.innerHTML = typeSettings.text;
        valueInput.on("click",typeSettings.func);
    }
    if (settings.type == "number") {
        valueInput = holder.create("input.gmGroup_number");
        let nestedValue = getNestedValue(pullFrom,settings.valueString)
        if (nestedValue === undefined && typeSettings.default) {
            nestedValue = typeSettings.default;
        }
        valueInput.value = nestedValue;
        holder.gmValue = nestedValue;
        valueInput.type = "number";

        valueInput.on("change",function() {
            holder.setValue(this.value)
        })
        holder.setValue = function(value) {
            if (_type(settings.typeSettings.min).type == "number") {
                if (Number(value) < settings.typeSettings.min) value = settings.typeSettings.min;
            }
            if (settings.typeSettings.max) {
                if (Number(value) > settings.typeSettings.max) value = settings.typeSettings.max;
            }
            valueInput.value = value;

            setNestedValue(pullFrom,settings.valueString.split("."),Number(value),false,true);
            holder.gmValue = Number(value);
            holder.activateList();
            if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
            if (settings.editFunc) settings.editFunc(holder.gmValue);
            
        }
    }
    if (settings.type == "toggle") {
        valueInput = holder.create("div.gmGroup_toggle");
        let isTrue = getNestedValue(pullFrom,settings.valueString);
        if (isTrue === undefined && typeSettings.default !== undefined) {
            isTrue = typeSettings.default;
        }
        if (typeSettings.setTrueIfValueIsNumber) {
            if (_type(isTrue).type == "number") isTrue = true;
            else isTrue = false;
        }
        if (typeSettings.setTrueIfValueIsObject) {
            if (_type(isTrue).type == "object") isTrue = true;
            else isTrue = false;
        }

        if (isTrue) {
            valueInput.classAdd("gmGroup_toggle_on");
            valueInput.innerHTML = "ON";
            valueInput.value = true;
        } else {
            valueInput.classAdd("gmGroup_toggle_off");
            valueInput.innerHTML = "OFF";
            valueInput.value = false;
        }
        holder.gmValue = getNestedValue(pullFrom,settings.valueString);

        valueInput.on("click",function() {
            let source = settings.valueString.split(".");
            let value;

            if (this.classList.contains("gmGroup_toggle_on")) {
                this.classRemove("gmGroup_toggle_on")
                this.classAdd("gmGroup_toggle_off");
                this.innerHTML = "OFF";
                value = false;

                if (typeSettings.whenUncheckedSet) {
                    source = typeSettings.whenUncheckedSet.source.split(".");
                    value = typeSettings.whenUncheckedSet.value;
                }
            } else {
                this.classAdd("gmGroup_toggle_on")
                this.classRemove("gmGroup_toggle_off");
                this.innerHTML = "ON";
                value = true;

                if (typeSettings.whenCheckedSet) {
                    source = typeSettings.whenCheckedSet.source.split(".");
                    value = typeSettings.whenCheckedSet.value;
                }
            }

            holder.gmValue = value;
            setNestedValue(pullFrom,source,value,false,true);

            holder.activateList();
            if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
            if (settings.editFunc) settings.editFunc(holder.gmValue);
        })
        holder.setValue = function(value) {
            
        }
    }
    if (settings.type == "list") {
        valueInput = holder.create("div.gmGroup_list");
        let options = [];
        for (let i = 0; i < typeSettings.options.length; i++) {
            let option = valueInput.create("div.gmGroup_list_option");
            option.innerHTML = typeSettings.options[i];
            options.push(option);

            let nestedValue = getNestedValue(pullFrom,settings.valueString);
            if (nestedValue == undefined && typeSettings.default !== undefined) {
                nestedValue = typeSettings.default;
            }
            let valueA = typeSettings.caseSensitive ? typeSettings.options[i] : typeSettings.options[i].toLowerCase();
            let valueB = typeSettings.caseSensitive ? nestedValue : nestedValue.toLowerCase();

            if (valueA == valueB) {
                option.classAdd("gmGroup_list_option_selected");
                holder.gmValue = valueA;
            } 

            option.on("click",function() {
                options.classRemove("gmGroup_list_option_selected");
                this.classAdd("gmGroup_list_option_selected");
                setNestedValue(pullFrom,settings.valueString.split("."),valueA,false,true);
                holder.gmValue = valueA;
                holder.activateList();
                
                if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
                if (settings.editFunc) settings.editFunc(valueA);
            })
            holder.setValue = function(value) {
                
            }
        }

    }
    if (settings.type == "item" || settings.type == "tile") {
        valueInput = holder.create("div.gmGroup_imageHolder");
        let img = valueInput.create("img.fullImage");
        img.src = getImage(getById(settings.type,Number(getNestedValue(pullFrom,settings.valueString))),"src")
        holder.gmValue = getNestedValue(pullFrom,settings.valueString);

        valueInput.on("click",function() {
            chooseItemPopup(settings.type,(item) => {
                holder.setValue(item);
            })
        })
        holder.setValue = function(item) {
            holder.gmValue = item.id;
            img.src = getImage(item,"src");
            
            setNestedValue(pullFrom,settings.valueString.split("."),holder.gmValue);
            if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
            if (settings.editFunc) settings.editFunc(holder.gmValue);
            holder.activateList();
            
        }
    }
    if (settings.type == "status") {
        valueInput = holder.create("div.gmGroup_statusHolder");
        valueNumber = valueInput.create("div.gmGroup_statusNumber");

        if (typeSettings.showNumber) {
            valueNumber.show();
        } else {
            valueNumber.hide();
        }

        let value = getNestedValue(pullFrom,settings.valueString);

        if (typeSettings.readAs == "color") {
            valueInput.css({
                background: _color(value).ogColor,
            })
            valueNumber.innerHTML = 1;
        }
        if (typeSettings.readAs == "object") {
            valueInput.css({
                background: _color(value.status).ogColor,
            })
            valueNumber.innerHTML = value.count;
        }

        holder.gmValue = value;

        valueInput.htmlNumber = valueNumber;
        holder.htmlNumber = valueNumber;

        valueInput.on("click",function() {
            let defaultNumber,defaultStatus;
            let numberHTML = this.htmlNumber;

            if (_type(holder.gmValue).type == "string") {
                defaultNumber = 0;
                defaultStatus = holder.gmValue;
            }
            if (_type(holder.gmValue).type == "object") {
                defaultNumber = holder.gmValue.count;
                defaultStatus = holder.gmValue.status;
            }

            showStatusMenu(typeSettings.statusMenuOptions,{
                status: function(status,element) {
                    $(".nonPlayer").css({
                        border: "2px solid black", 
                    })
                    if (element) element.style.border = "2px solid blue";

                    let list = settings.valueString.split(".");
                    if (typeSettings.readAs == "object") {
                        list.push("status");
                        holder.gmValue.status = status;
                    }
                    if (typeSettings.readAs == "color") {
                        holder.gmValue = status;
                    }
                    valueInput.css({
                        background: _color(status).ogColor,
                    })

                    setNestedValue(pullFrom,list,status);

                    if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
                    if (settings.editFunc) settings.editFunc(holder.gmValue);
                    holder.activateList();
                },
                number: function(value) {
                    let list = settings.valueString.split(".");
                    list.push("count")
                    holder.gmValue.count = value;
                    setNestedValue(pullFrom,list,value);
                    numberHTML.innerHTML = value;

                    if (settings.setItemAlteration) setItemAlteration(gamemode,pullFrom);
                    if (settings.editFunc) settings.editFunc(holder.gmValue);
                    holder.activateList();
                },
                final: function() {
                    $(".statusSelectionScreen").hide();
                }
            },{
                number: defaultNumber,
                status: defaultStatus,
            });
        })
        holder.setValue = function(value) {
            if (typeSettings.readAs == "color") {
                valueInput.css({
                    background: _color(value).ogColor,
                })
                this.htmlNumber.innerHTML = 1;
            }
            if (typeSettings.readAs == "object") {
                valueInput.css({
                    background: _color(value.status).ogColor,
                })
                this.htmlNumber.innerHTML = value.count;
            }
    
            holder.gmValue = value;
        }
    }

    if (typeSettings.placeholder) valueInput.placeholder = typeSettings.placeholder;
    if (typeSettings.maxLength) valueInput.maxLength = typeSettings.maxLength;

    let description = holder.create("div.gmGroup_description");
    description.innerHTML = settings.description || "";
}
function loadGamemodeTabSettings() {
    html_popup = $(".editGameModePopup");
    let gamemode = html_popup.gameMode;
    let holder = $("modernPopup_content_settings");
    holder.innerHTML = "";

    let a = createGamemodeSetting("Gamemode Name","input","name",{profanityClean: true,maxLength: 30,default: "Untitled",placeholder: "Gamemode name..."},"Title that is presented to the players.",1);
    let b = createGamemodeSetting("Gamemode Description","textarea","description",{profanityClean: true,maxLength: 150},"Explain what this gamemode does, and how to play it.",1);
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
    let p = createGamemodeSetting("Respawn Protection","number","respawnProtection",{min: 0, max: 60},"How many seconds does the player have protection after respawning.",4,4,{
        valueFromId: 1,
        equals: true,
    });
    let q = createGamemodeSetting("Limit Respawns","number","respawnCount",{min: -1,max: 100, default: -1},"Limit how many times a player is allowed to respawn. (-1 means infinite)",4,5,{
        valueFromId: 1,
        equals: true,
    });

    let grid = [
        [a,e,i,m],
        [b,f,j,n],
        [c,false,false,o],
        [false,false,false,p],
        [false,false,false,q],
    ]

    createGamemodeGrid(holder,4,5,grid,gamemode,"gamemode");

}
function loadGamemodeTabItems() {
    html_popup = $(".editGameModePopup");
    let gamemode = html_popup.gameMode;
    let itemHolder = $(".gamemodePopup_itemList");
    itemHolder.innerHTML = "";
    $(".gamemodePopup_item_settingsList").innerHTML = "";

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (!item.showInEditor) continue;

        let itemDiv = itemHolder.create("div.gmItems_imageHolder");
        let itemImg = itemDiv.create("img.gmItems_image");
        itemImg.src = getImage(item,"src");

        itemDiv.on("click",function() {
            $(".gmItems_imageHolder").classRemove("gmItems_imageHolder_selected");
            this.classAdd("gmItems_imageHolder_selected");

            let attributes = [];

            attributes.push({
                title: "At Start Spawn",
                type: "number",
                valueString: "onStartSpawn",
                typeSettings: {min: 0, max: 60},
                description: "When game starts spawn this many items.",
                familyID: false, myID: false, showWhen: false,setItemAlteration: true,
            })
            attributes.push({
                title: "Spawn Weight",
                type: "number",
                valueString: "specialSpawnWeight",
                typeSettings: {min: 0},
                description: "A higher rate increases the chances of this item spawning.",
                familyID: false, myID: false, showWhen: false,setItemAlteration: true,
            })
            attributes.push({
                title: "Visible",
                type: "toggle",
                valueString: "visible",
                typeSettings: {},
                description: "If the item shows or hides when rendereing the game.",
                familyID: false, myID: false, showWhen: false,setItemAlteration: true,
            })
            attributes.push({
                title: "Plays Audio",
                type: "toggle",
                valueString: "playSounds",
                typeSettings: {},
                description: "Does the item play sounds?",
                familyID: false, myID: false, showWhen: false,setItemAlteration: true,
            })
            if (item.onCollision?.growPlayer) {
                attributes.push({
                    title: "Grow Snake",
                    type: "number",
                    valueString: "onCollision.growPlayer",
                    typeSettings: {min: 0, max: 200},
                    description: "How much to grow snake when eaten.",
                    familyID: false, myID: false, showWhen: false,setItemAlteration: true,
                })
            }
            if (item.onCollision?.spawnRandomItem !== undefined) {
                attributes.push({
                    title: "Attempt To Spawn Random Item",
                    type: "toggle",
                    valueString: "onCollision.spawnRandomItem",
                    typeSettings: {},
                    description: "When eaten do I attempt to spawn random item?",
                    familyID: false, myID: false, showWhen: false,setItemAlteration: true,
                })
            }
            if (item.onActivate?.giveTurbo) {
                attributes.push({
                    title: "Turbo Duration",
                    type: "number",
                    valueString: "onActivate.giveTurbo.duration",
                    typeSettings: {min: 0, max: 60},
                    description: "How long turbo lasts (seconds).",
                    familyID: false, myID: false, showWhen: false,setItemAlteration: true,
                })
            }
            if (item.onActivate?.giveTurbo) {
                attributes.push({
                    title: "Turbo Speed",
                    type: "number",
                    valueString: "onActivate.giveTurbo.moveSpeed",
                    typeSettings: {min: 1.1, max: 5},
                    description: "How fast turbo is.",
                    familyID: false, myID: false, showWhen: false,setItemAlteration: true,
                })
            }

            let counter = 0;
            let grid = [
                [false,false],
                [false,false],
                [false,false],
                [false,false],
            ];

            for (let y = 0; y < grid.length; y++) {
                for (let x = 0; x < grid[0].length; x++) {
                    if (!attributes[counter]) continue;

                    grid[y][x] = attributes[counter];

                    counter++;
                }
            }

            createGamemodeGrid($(".gamemodePopup_item_settingsList"),2,4,grid,getItemAlterations(gamemode,item),"items");

        })
    }
}
function loadGamemodeTabWinning() {
    html_popup = $(".editGameModePopup");
    let gamemode = html_popup.gameMode;
    let html_availableConditions = $(".gamemodePopup_availableConditionsList");
    let html_slots = $(".gmp_condition_slot");
    let html_settings = $(".gamemodePopup_conditionSettings_list");
    $(".gmp_condition_slot_foreground").classRemove("gmp_slot_selected");

    if (!gamemode.winningConditions) gamemode.winningConditions = [{
        condition: "Touch Item X",
        x: 25,
        whoWins: "Player",
        type: "item",
    },false,false,false,false];

    html_settings.innerHTML = "";
    html_availableConditions.innerHTML = "";

    function selectSlot(index) {
        $(".gmp_condition_slot_foreground").classRemove("gmp_slot_selected");
        html_settings.innerHTML = "";
        if (index === false) return;
        let slot = html_slots[index].$(".gmp_condition_slot_foreground");
        slot.classAdd('gmp_slot_selected');
        let condition = gamemode.winningConditions[index];

        let pullFromCondition = false;
        for (let j = 0; j < conditions.length; j++) {
            if (conditions[j].condition == condition.condition) {
                pullFromCondition = conditions[j];
            }
        }

        let a = createGamemodeSetting("Who Wins","list","whoWins",{options: ["Player","Players Team","Specific Team","Everyone","Highest Value","No One"],caseSensitive: true},"When winning condition is met who wins?",1,1,false,(value) => {
            loadWinningConditions();
            if (value.toLowerCase() == "specific team") {
                showStatusMenu(["status"],{status: function(status) {
                    gamemode.winningConditions[index].whoWins = status;
                    $(".statusSelectionScreen").hide();
                    loadWinningConditions();
                }});
            }

        });
        let b = createGamemodeSetting(pullFromCondition.settingsTitle,pullFromCondition.settingsType,"x",{},pullFromCondition.settingsDescription,false,false,false,() => {
            loadWinningConditions();
        })
        let c = createGamemodeSetting("Highest Value","list","highestValue",{options: ["kills","size","time"], default: "kills"},"Whoever has the highest value of this will win.",1,2,{
            valueFromId:1,
            equals: "Highest Value",
        })
        let d = false;
        if (["Kill X Snakes","Reach Snake Size"].includes(pullFromCondition.settingsTitle)) {
            d = createGamemodeSetting("Pull Team Stats","toggle","pullTeamStats",{default: false},"Pull players team stats when testing condition. (EX: Kill 4 Snakes, will grab all snakes killed from players team)")
        }

        if (pullFromCondition.settingsTitle === false) b = false;

        let grid = [
            [a,b],
            [c,d]
        ]

        createGamemodeGrid(html_settings,2,2,grid,condition,"winning")
    }
    function loadWinningConditions() {
        for (let i = 0; i < 5; i++) {
            let condition = gamemode.winningConditions[i];
            let slot = html_slots[i].$(".gmp_condition_slot_foreground");
            if (!condition) {
                slot.hide();
                continue;
            } else {
                slot.show("flex");
            }

            if (slot.$(".gmp_slot_foreground_delete")) {
                slot.$(".gmp_slot_foreground_delete").remove();
            }
            if (slot.$(".gmp_slot_foreground_edit")) {
                slot.$(".gmp_slot_foreground_edit").remove();
            }

            let html_delete = slot.create("img.gmp_slot_foreground_delete");
            html_delete.src = "img/tool_delete.png";
            html_delete.on("click",function() {
                gamemode.winningConditions[i] = false;
                loadWinningConditions();
                html_settings.innerHTML = "";
                selectSlot(false);
            })

            let html_edit = slot.create("img.gmp_slot_foreground_edit");
            html_edit.src = "img/menuIcons/edit.png";
            html_edit.on("click",function() {
                selectSlot(i);
            })
            
            let pullFromCondition = false;
            for (let j = 0; j < conditions.length; j++) {
                if (conditions[j].condition == condition.condition) {
                    pullFromCondition = conditions[j];
                }
            }
            
            let htmlText = condition.condition;
            if (pullFromCondition.whereToModify) {
                let replacementText = condition.x;
                if (condition.type === "item" || condition.type === "tile") {
                    let type = condition.type == "item" ? items : tiles;
                    replacementText = `<img src="${getImage(getByID(condition.x,type),"src")}" class="gmp_slot_image">`;
                }
                htmlText = htmlText.replace(pullFromCondition.whereToModify,replacementText);
            }
            slot.$(".gmp_slot_foreground_text").innerHTML = htmlText;

            if (condition.whoWins === "Player") slot.$(".gmp_slot_foreground_team").hide();
            else if (condition.whoWins == "Everyone") {
                slot.$(".gmp_slot_foreground_team").show();
                slot.$(".gmp_slot_foreground_team").src = "img/menuIcons/publish.png";
            } else if (condition.whoWins == "Highest Value") {
                slot.$(".gmp_slot_foreground_team").show();
                slot.$(".gmp_slot_foreground_team").src = "img/arrow.png";
            } else if (condition.whoWins === "Players Team") {
                slot.$(".gmp_slot_foreground_team").show();
                slot.$(".gmp_slot_foreground_team").src = "img/items/item_flag_basic_white.png";
            } else if (condition.whoWins == "No One") {
                slot.$(".gmp_slot_foreground_team").show();
                slot.$(".gmp_slot_foreground_team").src = "img/menuIcons/skull.png";
            } else {
                slot.$(".gmp_slot_foreground_team").show();
                slot.$(".gmp_slot_foreground_team").src = "img/items/item_flag_basic_" + condition.whoWins + ".png";
            }



        }
    }

    let conditions = [];
    function addAvailableCondition(title,whereToModify,value,whoWins,settingsTitle,settingsType,settingsDescription) {
        let div = html_availableConditions.create("div.gmp_slot");
        div.innerHTML = title;
        let plus = div.create("img.gmp_plus")
        plus.src = "img/menuIcons/plus.png";
        conditions.push({
            condition: title,
            whereToModify: whereToModify,
            settingsTitle: settingsTitle,
            settingsType: settingsType,
            settingsDescription: settingsDescription,
        })

        plus.on("click",function() {
            for (let i = 0; i < 5; i++) {
                if (gamemode.winningConditions[i] === false) {
                    let sendX = value;
                    let sendType = value;

                    if (_type(value).type === "number") {
                        sendType = "number",
                        sendX = value;
                    } else if (_type(value).type == "string") {
                        if (value.subset(0,".\\before") === "item" || value.subset(0,".\\before") === "tile") {
                            sendType = value.subset(0,".\\before");
                            sendX = Number(value.subset(".\\after","end"));
                        }
                    }

                    gamemode.winningConditions[i] = {
                        condition: title,
                        x: sendX,
                        whoWins: whoWins,
                        type: sendType,
                        highestValue: "kills",
                        pullTeamStats: false,
                    }
                    loadWinningConditions();
                    selectSlot(i);

                    return;
                }
            }
            
            genericPopup("No Available Slots");

        })
    }
    addAvailableCondition("All Dead",false,false,"No One",false);
    addAvailableCondition("Last One Standing",false,false,"Player",false);
    addAvailableCondition("Last Team Standing",false, false, "Players Team",false);
    addAvailableCondition("Survive X Minutes","X",5,"Player","Survive X Minutes","number","Survive this long to win the game!");
    addAvailableCondition("Kill X Snakes","X",3,"Player","Kill X Snakes","number","Kill this many snakes to win the game!");
    addAvailableCondition("Reach Snake Size Of X","X",200,"Player","Reach Snake Size","number","Get this long to win the game!");
    addAvailableCondition("Touch Zone X","X","0000","Player","Touch Zone","input","Touch this zone to win the game!");
    addAvailableCondition("Touch Item X","X","item.25","Player","Touch Item","item","Touch this item to win the game!");
    addAvailableCondition("Touch Tile X","X","tile.1","Player","Touch Tile","tile","Touch this tile to win the game!");

    loadWinningConditions();
}
function setPopupTab(tab,type) {
    if (type == "gamemode") {
        $(".modernPopup_topRow_imageHolder").classRemove("modernPopup_topRow_image_selected");
        $("gamemode_popup_tab_" + tab).classAdd("modernPopup_topRow_image_selected");
    
        $(".modernPopup_content").hide();
        $("modernPopup_content_" + tab).show("flex");
        if (tab == "settings") {
            $(".modernPopup_topRow_title").innerHTML = "General Settings";
            loadGamemodeTabSettings();   
        }
        if (tab == "items") {
            $(".modernPopup_topRow_title").innerHTML = "Item Settings";
            loadGamemodeTabItems();   
        }
        if (tab == "winning") {
            $(".modernPopup_topRow_title").innerHTML = "Winning Conditions";
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
    let parent = this.$P().$P().$P(); 
    parent.hide();
    if (parent.id.subset(0,"_\\before") == "gamemode") {
        parent.closeFunction();
        if (parent.sendToServer) socket.emit("editServerGameMode",$(".editGameModePopup").gameMode);
    }
})