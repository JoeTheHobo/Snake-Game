let selectedItem = {
    type: "item",
    content: getRealItem("pellet"),
    canEdit: true,
    path: false,
    cell: cloneObject(getRealItem("pellet")),
}
let board;
let mouseDown = false;
let rightMouse = false;
let mouseX;
let mouseY;
let saveInterval;
let itemCounts;

let shiftDown = false;
let fill = {
    pointA: false,
    pointB: false,
    delete: false,
}

loadObjectMenu();
function fixItemDifferencesMapEditor(map) {
    if (!currentBoard.itemDifferences) return;
    for (let i = 0; i < currentBoard.itemDifferences.length; i++) {
        let d = currentBoard.itemDifferences[i];
        let pos = structuredClone(map[d.y][d.x].item);
        if (!pos) continue;
        for (let j = 0; j < d.differences.length; j++) {
            let change = d.differences[j]; 
            if (change.length == 3) {
                pos[change[0]][change[1]] = change[2];
            }
            if (change.length == 2) pos[change[0]] = change[1];
        }
        map[d.y][d.x].item = pos;
    }
}
function openMapEditor(boardComingIn) {
    board = boardComingIn;
    setScene("mapEditor");
    $("me_name").value = board.name;

    me_loadDropdown($(".me_itemsContent"),items,"item_");
    me_loadDropdown($(".me_tilesContent"),tiles,"tile_");

    setResolution(board.width,board.height);
    renderMapEditorCanvas();
    fixItemDifferencesMapEditor(currentBoard.originalMap);
    saveBoard(true);

    clearInterval(saveInterval);
    saveInterval = setInterval(function() {
        if (!isActiveGame)
            saveBoard();
    },60000)
}
function me_loadDropdown(holder,group,name) {
    holder.innerHTML = "";
    for (let i = 0; i < group.length; i++) {
        if (group[i].showInEditor == false) continue;

        let itemHolder = holder.create("div");
        itemHolder.className = "me_itemHolder";
        let itemImage = itemHolder.create("img");
        itemImage.src = $(name + group[i].name).src;
        itemImage.css({
            width: "100%",
            height: "100%",
        })

        itemHolder.type = name.subset(0,"_\\before");
        itemHolder.content = cloneObject(group[i]);
        itemHolder.id = "me_" + name + group[i].name;
        itemHolder.on("click",function() {
            selectedItem = {
                type: this.type,
                content: structuredClone(this.content),
                canEdit: true,
                path: false,
                cell: structuredClone(this.content),
            }

            $(".me_itemHolder").classRemove("me_goldBorder");
            this.classList.add("me_goldBorder");

            loadObjectMenu();
        })
    }
}
function renderMapEditorCanvas() {
    itemCounts = [];
    me_ctx.clearRect(0,0,me_canvas.width,me_canvas.height)
    for (let i = 0; i < board.originalMap.length; i++) {
        for (let j = 0; j < board.originalMap[i].length; j++) {
            me_updateCell(j,i)
        }
    }

    selectedItem.canEdit = true;
    for (let i = 0; i < items.length; i++) {
        $("me_item_" + items[i].name).classRemove("me_fullSpawnLimit");
        if (items[i].spawnLimit === false) {
            continue;
        }
        let count = itemCounts.reduce((acc, item) => (item === ("item_" + items[i].name) ? acc + 1 : acc), 0);
        if (count === (items[i].spawnLimit*items[i].spawnCount)) {
            if (selectedItem.cell.name === items[i].name && selectedItem.type == "item") selectedItem.canEdit = false;
            $("me_item_" + items[i].name).classAdd("me_fullSpawnLimit");
        }
    }

    if (fill.pointA && !fill.pointB) {
        me_ctx.strokeStyle = "purple";
        let startX = fill.pointA.x * gridSize;
        let startY = fill.pointA.y * gridSize;

        let width = ((mouseX) - fill.pointA.x)*gridSize;
        let height = ((mouseY) - fill.pointA.y)*gridSize;

        if (mouseX > fill.pointA.x) width += gridSize;
        if (width == 0) width = gridSize;
        if (mouseY > fill.pointA.y) height += gridSize;
        if (height == 0) height = gridSize;

        if (mouseX < fill.pointA.x) {
            startX += gridSize;
            width -= gridSize;
        }
        if (mouseY < fill.pointA.y) {
            startY += gridSize;
            height -= gridSize;
        }
        me_ctx.strokeRect(startX,startY,width,height);
    }
}
function me_updateCell(x,y) {
    let cell = board.originalMap[y][x];

    if (cell.tile) {
        itemCounts.push("tile_" + cell.tile.name);
        me_ctx.drawImage($("tile_" + cell.tile.name),gridSize*x,gridSize*y,gridSize,gridSize);
    }
    if (cell.item) {
        itemCounts.push("item_" + cell.item.name);
        me_ctx.drawImage(getItemCanvas(cell.item.name),gridSize*x,gridSize*y,gridSize,gridSize);
        if (cell.item.renderStatusPath.length > 0) {
            let name = cell.item;
            for (let j = 0; j < cell.item.renderStatusPath.length; j++) {
                name = name[cell.item.renderStatusPath[j]];
            }
            let change = 1.5;
            if (name == "player") name = cell.item.name;
            if (_type(name).type == "array") name = name[0];

            if (name.subset(0,5) == "player") {
                if (name !== "player") {
                    me_ctx.fillStyle = "black";
                    me_ctx.font = "20px Arial";
                    name = "P" + name.subset("_\\after","end");
                    me_ctx.fillText(name,(x*gridSize) + (gridSize/2) - (gridSize/change/2),y*gridSize + (gridSize/2) - (gridSize/change/2)+(gridSize/2),gridSize/change,gridSize/change);
                }
            } else {
                me_ctx.drawImage(getItemCanvas(getItem(name).name),(x*gridSize) + (gridSize/2) - (gridSize/change/2),y*gridSize + (gridSize/2) - (gridSize/change/2),gridSize/change,gridSize/change);
            }
        }
    }

    if (cell.mouseOver) {
        if (shiftDown) me_ctx.strokeStyle = "purple"; 
        else me_ctx.strokeStyle = "blue";
        me_ctx.strokeRect(gridSize*x,gridSize*y,gridSize,gridSize);
    }
}
$("me_canvas").on("mousemove",function(e) {
    let rect = me_canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    mouseX = Math.floor(x/gridSize);
    mouseY = Math.floor(y/gridSize);

    for (const row of board.originalMap) {
        for (const cell of row) {
            cell.mouseOver = false;
        }
    }

    if (!board.originalMap[mouseY]) return;
    else if (!board.originalMap[mouseY][mouseX]) return;

    board.originalMap[mouseY][mouseX].mouseOver = true;
    
    if (shiftDown && fill.pointA !== false) {
        return;
    }

    if ((mouseDown || rightMouse) && selectedItem) {
        if (rightMouse) {
            board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
        } else if (selectedItem.canEdit) {
            board.originalMap[mouseY][mouseX][selectedItem.type] = structuredClone(selectedItem.cell);
        }
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }

    renderMapEditorCanvas();
})
$("me_canvas").on("mousedown",function(e) {
    var isRightMB;
    e = e || window.event;

    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2; 

    rightMouse = isRightMB;
    mouseDown = true;
    
    if (shiftDown && fill.pointA == false) {
        fill.pointA = {
            x: mouseX,
            y: mouseY,
        }
        renderMapEditorCanvas();
        return;
    }
})
$("me_canvas").on("mouseup",function(e) {
    mouseDown = false;
    rightMouse = false;
})
$("me_canvas").on("contextmenu",function(e) {
    e.preventDefault();

    if (shiftDown && fill.pointA == false) {
        fill.pointA = {
            x: mouseX,
            y: mouseY,
        }
        renderMapEditorCanvas();
        return;
    }
    if (shiftDown && fill.pointB == false) {
        fill.delete = true;
        fill.pointB = {
            x: mouseX,
            y: mouseY,
        }
        tool_fill();
        return;
    }

    board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? cloneObject(getTile("clear")) : false;
    renderMapEditorCanvas();
})
$("me_canvas").on("click",function(e) {
    if (shiftDown && fill.pointA == false) {
        fill.pointA = {
            x: mouseX,
            y: mouseY,
        }
        renderMapEditorCanvas();
        return;
    }
    if (shiftDown && fill.pointB == false) {
        fill.delete = false;
        fill.pointB = {
            x: mouseX,
            y: mouseY,
        }
        tool_fill();
        return;
    }

    if (selectedItem && selectedItem.canEdit) {
        board.originalMap[mouseY][mouseX][selectedItem.type] = structuredClone(selectedItem.cell);
        renderMapEditorCanvas();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
})
$("me_canvas").on("mouseleave",function(e) {
    mouseDown = false;
    rightMouse = false;
})
document.on('keydown', (e) => {
    if ($("scene_mapEditor").style.display == "none") return;
    // Check if Ctrl and S are pressed
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault(); // Prevent the default save action
        saveBoard();
    }
    
    shiftDown = e.shiftKey;
    if (shiftDown) renderMapEditorCanvas();
});
document.on("keyup",function(e) {
    if ($("scene_mapEditor").style.display == "none" || $("scene_mapEditor").style.display == "") return;
    shiftDown = e.shiftKey;
    
    if (!shiftDown) {
        fill = {
            pointA: false,
            pointB: false,
            delete: false,
        }
        renderMapEditorCanvas();
    }
})

function tool_fill() {
    let pointA = fill.pointA;
    let pointB = fill.pointB;

    let upY = pointA.y < pointB.y ? pointA.y : pointB.y;
    let leftX = pointA.x < pointB.x ? pointA.x : pointB.x;
    let bottomY = pointA.y > pointB.y ? pointA.y : pointB.y;
    let rightX = pointA.x > pointB.x ? pointA.x : pointB.x;

    for (let i = upY; i < bottomY+1; i++) {
        for (let j = leftX; j < rightX+1; j++) {
            if (fill.delete) board.originalMap[i][j][selectedItem.type] = false;
            else board.originalMap[i][j][selectedItem.type] = cloneObject(selectedItem.cell);
        }
    }

    renderMapEditorCanvas();
    
    fill = {
        pointA: false,
        pointB: false,
        delete: false,
    }
}
function saveBoard(saveDifferences = false) {
    let html_saveStatus = $("saveStatus");
    currentBoard.itemDifferences = findItemDifferences(currentBoard.originalMap);
    saveBoards();

    html_saveStatus.innerHTML = "Board Saved";
}

$("me_button").on("click",function() {
    saveBoard();
    setScene("boardList");
    loadBoards();
})
$("me_name").on("input",function() {
    if (this.value == "") return;
    board.name = this.value;
    saveBoards();
})

function loadObjectMenu() {
    $(".me_ih_image").src = "img/" + selectedItem.cell.img;
    let holder = $(".me_ih_settings");
    holder.innerHTML = "";
    $(".me_ih_name").innerHTML = selectedItem.cell.name;

    function addSetting(title,type,value,path) {
        let settingHolder = holder.create("div");
        settingHolder.className = "settingHolder";
        let html_title = settingHolder.create("div");
        html_title.className = "settingTitle";
        html_title.innerHTML = title;

        if (type == "number") {
            let input = settingHolder.create("input");
            input.type = "number",
            input.css({
                width: "45px",
                height: "45px",
                textAlign: "center",
                outline: "none",
                fontSize: "16px",
                borderRadius: "5px",
            })
            input.value = value
            
            input.path = path;
            input.on("input",function() {
                if (this.path.length == 2) {
                    selectedItem.cell[this.path[0]][this.path[1]] = this.value;
                }
                if (this.path.length == 1) {
                    selectedItem.cell[this.path[0]] = this.value;
                }
            })
        }
        if (type.subset(0,5) == "status") {
            let imgHolder = settingHolder.create("div");
            imgHolder.css({
                width: "50px",
                height: "50px",
                background: "white",
                cursor: "url('./img/pointer.cur'), auto",
                borderRadius: "5px",
                border: "2px solid black",
            })

            if (value.subset(0,5) == "player") {
                if (value.subset(0,6) == "player_") {
                    let text = imgHolder.create("div");
                    text.innerHTML = "P" + value.subset("_\\after","end"); 
                    text.css({
                        width: "100%",
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "25px",
                        lineHeight: "50px",
                        textAlign: "center",
                    })
                }
                if (value == "player") {
                    let text = imgHolder.create("div");
                    text.innerHTML = "P"; 
                    text.css({
                        width: "100%",
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "25px",
                        lineHeight: "50px",
                        textAlign: "center",
                    })
                }
            } else {
                let img = imgHolder.create("img");
                img.css({
                    width: "100%",
                    height: "100%",
                })
                let src;
                if (selectedItem.type == "item") src = "img/" + getRealItem(value).img;
    
                img.src = src;
            }

            imgHolder.path = path;
            imgHolder.type = type;
            imgHolder.on("click",function() {
                selectedItem.path = this.path;
                if (this.type == "statusPlayer") {
                    $(".nonPlayer").hide();
                } else {
                    $(".nonPlayer").show("inline-block");
                }
                $(".statusSelectionScreen").show("flex");
            })
        }
    }

    let object = selectedItem.cell;
    
    if (selectedItem.type == "tile") return;

    if (object.boardDestructible[0] !== "yes") {
        addSetting("Board Status Required","status",object.boardDestructible[0],["boardDestructible",0]);
    }
    if (object.destructible.length > 0) {
        if (object.destructible[0] !== "yes" && object.destructible[0] !== false && object.name !== "blueLock" && object.name !== "redLock" && object.name !== "greenLock") {
            addSetting("Player Status Required","status",object.destructible[0],["destructible",0]);
        }
    }
    if (object.canCollide) {
        if (object.onCollision.switchBoardStatus !== false && object.onCollision.switchBoardStatus !== undefined) {
            addSetting("Toggle Board Status","status",object.onCollision.switchBoardStatus,["onCollision","switchBoardStatus"]);
        }
        if (object.onCollision.addBoardStatus !== false && object.onCollision.addBoardStatus !== undefined) {
            addSetting("Add Board Status","status",object.onCollision.addBoardStatus,["onCollision","addBoardStatus"]);
        }
        if (object.onCollision.setBoardStatus !== false && object.onCollision.setBoardStatus !== undefined) {
            addSetting("Set Board Status","status",object.onCollision.setBoardStatus,["onCollision","setBoardStatus"]);
        }
        if (object.onCollision.removeBoardStatus !== false && object.onCollision.removeBoardStatus !== undefined) {
            addSetting("Remove Board Status","status",object.onCollision.removeBoardStatus,["onCollision","removeBoardStatus"]);
        }
        if (object.offCollision) {
            if (object.offCollision.removeBoardStatus !== false && object.offCollision.removeBoardStatus !== undefined) {
                addSetting("Remove Board Status","status",object.offCollision.removeBoardStatus,["offCollision","removeBoardStatus"]);
            }
        }
    }
    if (object.name == "boardLockedCell")
        addSetting("Board Status Required","number",object.boardDestructibleCountRequired,["boardDestructibleCountRequired"]);

    if (object.spawnPlayerID) {
        addSetting("Spawn Player ID","statusPlayer",object.spawnPlayerID,["spawnPlayerID"]);
    }
}

loadStatusSelectionScreen();
function loadStatusSelectionScreen() {
    let holder = $(".statusSelectionHolder");

    function createStatus(object,type) {
        let value = object;

        let imgHolder = holder.create("div");
        imgHolder.css({
            width: "50px",
            height: "50px",
            background: "white",
            cursor: "url('./img/pointer.cur'), auto",
            borderRadius: "5px",
            border: "2px solid black",
            display: "inline-block",
        })
        if (_type(value).type !== "string") {
            imgHolder.className = "nonPlayer";   
        }
        if (_type(value).type == "string") {
            imgHolder.status = "player";

            if (value.length == 2) imgHolder.status = "player_" + value.charAt(1);

            let text = imgHolder.create("div");
            text.innerHTML = value; 
            text.css({
                width: "100%",
                color: "black",
                fontWeight: "bold",
                fontSize: "25px",
                lineHeight: "50px",
                textAlign: "center",
            })
        } else {
            imgHolder.status = value.name;
            let img = imgHolder.create("img");
            img.css({
                width: "100%",
                height: "100%",
            })
            let src;
            src = "img/" + value.img;
    
            img.src = src;
        }
        imgHolder.on("click",function() {
            if (selectedItem.path.length == 2) {
                selectedItem.cell[selectedItem.path[0]][selectedItem.path[1]] = this.status;
            }
            if (selectedItem.path.length == 1) {
                selectedItem.cell[selectedItem.path[0]] = this.status;
            }
            $(".statusSelectionScreen").hide();
            loadObjectMenu();
        })
    }

    createStatus("P");
    createStatus("P0");
    createStatus("P1");
    createStatus("P2");
    createStatus("P3");
    createStatus("P4");
    createStatus("P5");
    createStatus("P6");
    createStatus("P7");
    for (let i = 0; i < items.length; i++) {
        if (!items[i].showInEditor) continue;
        createStatus(structuredClone(items[i]));
    }
}