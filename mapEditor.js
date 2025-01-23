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
let forwardHistory;
let history;

let tool = "draw";
let subTool = "brush";
let aligning = false;
let selectedCells  = {
    selecting: false,
    start: {
        x: false,
        y: false,
    },
    end: {
        x: false,
        y: false,
    },
}
let copiedCells = [];

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
    copiedCells = [];
    history = [];
    forwardHistory = [];
    $(".redo_tool").style.opacity = "0.5";
    $(".undo_tool").style.opacity = "0.5";
    setScene("mapEditor");
    $("me_name").value = board.name;

    me_loadDropdown($(".me_itemsContent"),items,"item_");
    me_loadDropdown($(".me_tilesContent"),tiles,"tile_");

    setResolution(board.width,board.height);
    renderMapEditorCanvas();
    fixItemDifferencesMapEditor(currentBoard.originalMap);
    saveBoard(true);
    tool = false;
    setTool("draw");

    clearInterval(saveInterval);
    saveInterval = setInterval(function() {
        if (!isActiveGame)
            saveBoard();
    },60000)
    addHistory();
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

    if (selectedCells.selecting) {
        let obj = getRectPos(selectedCells.start,selectedCells.end);
        me_ctx.strokeRect(obj.startX,obj.startY,obj.width,obj.height);
    }

    if (selectedCells.shape) {
        let obj = getRectPos(selectedCells.start,selectedCells.end);
        me_ctx.strokeRect(obj.startX,obj.startY,obj.width,obj.height);
    }
}
function getRectPos(pos1,pos2) {
    let startX = pos1.x * gridSize;
    let startY = pos1.y * gridSize;

    let width = ((pos2.x) - pos1.x)*gridSize;
    let height = ((pos2.y) - pos1.y)*gridSize;

    if (pos2.x > pos1.x) width += gridSize;
    if (width == 0) width = gridSize;
    if (pos2.y > pos1.y) height += gridSize;
    if (height == 0) height = gridSize;

    if (pos2.x < pos1.x) {
        startX += gridSize;
        width -= gridSize;
    }
    if (pos2.y < pos1.y) {
        startY += gridSize;
        height -= gridSize;
    }

    return {
        startX: startX,
        startY: startY,
        width: width,
        height: height,
    };
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
        me_ctx.strokeStyle = "blue"; 
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

    //If Cursor Is Off Screen
    if (!board.originalMap[mouseY]) return;
    else if (!board.originalMap[mouseY][mouseX]) return;

    board.originalMap[mouseY][mouseX].mouseOver = true;
    
    if (tool == "bucket") {
        
    }
    if (tool == "draw" || tool == "eraser") {
        if (subTool == "shape") {
            selectedCells.end = {
                x: mouseX,
                y: mouseY,
            }

            if (aligning) {
                selectedCells.end = makeSquare(selectedCells.start,selectedCells.end);
            }
        }
        if (subTool == "brush") {
            if ((mouseDown || rightMouse) && selectedItem) {
                if (rightMouse || tool == "eraser") {
                    board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
                } else if (selectedItem.canEdit) {
                    board.originalMap[mouseY][mouseX][selectedItem.type] = structuredClone(selectedItem.cell);
                }
                $("saveStatus").innerHTML = "Board Is Not Saved";
            }
        }
    }
    
    if (tool == "select" && mouseDown) {
        selectedCells.end = {
            x: mouseX,
            y: mouseY,
        }
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
    
    if (tool == "select" && mouseDown) {
        $(".subTool_select").hide();
        selectedCells = {
            selecting: true,
            shape: false,
            start: {
                x: mouseX,
                y: mouseY,
            },
            end: {
                x: mouseX,
                y: mouseY,
            },
        }
    }
    if (tool == "draw" || tool == "eraser") {
        if (subTool == "shape") {
            selectedCells = {
                selecting: false,
                shape: true,
                start: {
                    x: mouseX,
                    y: mouseY,
                },
                end: {
                    x: mouseX,
                    y: mouseY,
                },
            }
        }
    }
    if (tool == "bucket") {

    }
    
    renderMapEditorCanvas();
})
$("me_canvas").on("mouseup",function(e) {
    mouseDown = false;
    rightMouse = false;

    if (tool == "draw" || tool == "eraser") {
        if (subTool == "shape") {
            tool_fill();
            addHistory();
        }
        if (subTool == "brush") {
            if (selectedItem) {
                if (rightMouse || tool == "eraser") {
                    board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
                } else if (selectedItem.canEdit) {
                    board.originalMap[mouseY][mouseX][selectedItem.type] = structuredClone(selectedItem.cell);
                }
                addHistory();
            }
        }
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (tool == "select") {
        $(".subTool_select").show();
        if (copiedCells.length == 0) $(".pastingTool").hide();
        else $(".pastingTool").show();
    }

    renderMapEditorCanvas();
})

$("me_canvas").on("mouseleave",function(e) {
    mouseDown = false;
    rightMouse = false;
})
$("me_canvas").on("contextmenu",function(e) {
    e.preventDefault();
})
document.on('keydown', (e) => {
    if ($("scene_mapEditor").style.display == "none") return;
    // Check if Ctrl and S are pressed
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault(); // Prevent the default save action
        saveBoard();
    }
    if (!e.ctrlKey && e.key === 's') {
        setTool("select");
    }
    if (e.key == "d") {
        setTool("draw");
    }
    if (e.key == "b") {
        setTool("bucket");
    }
    if (e.key == "e") {
        setTool("eraser");
    }
    if (e.key == "Delete" && tool == "select" && selectedCells.selecting == true) {
        runTool('delete');
    }
    if (e.shiftKey) {
        aligning = {
            x: mouseX,
            y: mouseY,
        };
    }
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault(); // Prevent the default save action
        runTool("undo");
    }
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault(); // Prevent the default save action
        runTool("redo");
    }
});
document.on("keyup",function(e) {
    if ($("scene_mapEditor").style.display == "none" || $("scene_mapEditor").style.display == "") return;

    if (!e.shiftKey) {
        aligning = false;
    }
})
function getDimensions(start,end) {
    return {
        upY: start.y < end.y ? start.y : end.y,
        leftX: start.x < end.x ? start.x : end.x,
        bottomY: start.y > end.y ? start.y : end.y,
        rightX: start.x > end.x ? start.x : end.x,
    }
    
    
    
    
}
function tool_fill() {
    let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);

    for (let i = upY; i < bottomY+1; i++) {
        for (let j = leftX; j < rightX+1; j++) {
            if (tool == "eraser") board.originalMap[i][j][selectedItem.type] = false;
            else board.originalMap[i][j][selectedItem.type] = cloneObject(selectedItem.cell);
        }
    }

    renderMapEditorCanvas();
    
    if (tool == "select") return;

    selectedCells = {
        selecting: false,
        shape: false,
        start: {
            x: false,
            y: false,
        },
        end: {
            x: false,
            y: false,
        },
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

function setTool(tool2) {
    if (tool === tool2) return;
    tool = tool2;

    if (tool == "draw" || tool == "eraser") {
        $(".subToolHolder").hide();
        $(".subTool_draw").show();
        setSubTool("brush");
        selectedCells = {
            selecting: false,
            shape: false,
            start: {
                x: false,
                y: false,
            },
            end: {
                x: false,
                y: false,
            },
        }
    }
    if (tool == "select") {
        $(".subToolHolder").hide();
    }
    if (tool == "bucket") {
        $(".subToolHolder").hide();
        $(".subTool_bucket").show();
        setSubTool("bucket");
    }
    if (tool == "move") {
        $(".subToolHolder").hide();
        $(".subTool_" + tool).show();
        setSubTool("move");
    }

    $(".toolBarToolHolder").classRemove("toolIsSelected");
    $("tool_" + tool).$P().classAdd("toolIsSelected")
    renderMapEditorCanvas();
}
function setSubTool(tool2) {
    subTool = tool2;

    $(".subToolHolder").classRemove("toolIsSelected");
    $("subTool_" + subTool).$P().classAdd("toolIsSelected")
    setTimeout(function() {
        $("subTool_" + subTool).$P().classAdd("toolIsSelected")
    },1)
}
function getArrayOfSelection() {
    let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
    let newBoard = [];
    let map = currentBoard.originalMap;
    for (let i = upY; i < bottomY+1; i++) {
        let row = [];
        for (let j = leftX; j < rightX+1; j++) {
            row.push(cloneObject(map[i][j]));
        }
        newBoard.push(row);
    }

    return newBoard;
}
function runTool(type) {
    if (type == "reflectX") {
        let newBoard = flipHorizontally(getArrayOfSelection());
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        paste(leftX,upY,newBoard);
        addHistory();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "reflectY") {
        let newBoard = flipVertically(getArrayOfSelection());
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        paste(leftX,upY,newBoard);
        addHistory();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "delete") {
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        for (let i = upY; i < bottomY+1; i++) {
            for (let j = leftX; j < rightX+1; j++) {
                board.originalMap[i][j][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
            }
        }
        renderMapEditorCanvas();
        addHistory();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "fill") {
        tool_fill();
        addHistory();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "copy") {
        copiedCells = getArrayOfSelection();
        $(".pastingTool").show();
    }
    if (type == "paste") {
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        paste(leftX,upY,copiedCells)
        addHistory();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "undo") {
        if (history.length < 2) return;

        forwardHistory.push(history.pop());
        currentBoard.originalMap = history[history.length-1];
        $(".redo_tool").style.opacity = "1";
        if (history.length < 2) {
            $(".undo_tool").style.opacity = "0.5";
        }
        renderMapEditorCanvas();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "redo") {
        if (forwardHistory.length < 1) return;
        currentBoard.originalMap = forwardHistory[forwardHistory.length - 1];
        history.push(forwardHistory[forwardHistory.length - 1]);
        forwardHistory.pop();

        $(".undo_tool").style.opacity = "1";
        if (forwardHistory.length == 0) {
            $(".redo_tool").style.opacity = "0.5";
        }
        renderMapEditorCanvas();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
}
function paste(x,y,map) {
    for (let i = y; i < y+map.length; i++) {
        for (let j = x; j < x+map[0].length; j++) {
            currentBoard.originalMap[i][j] = cloneObject(map[i-y][j-x]);
        }
    }
    renderMapEditorCanvas();
}
function flipHorizontally(array) {
    return array.map(row => row.reverse());
}
function flipVertically(array) {
    return array.slice().reverse();
}
function makeSquare(start, end) {
    let x1 = start.x;
    let y1 = start.y;
    let x2 = end.x;
    let y2 = end.y;
    let x = x2;
    let y = y2;

    let height = Math.abs(y2 - y1);
    let width = Math.abs(x2 - x1);

    if (width < height) {
        // Keep x2 as x
        x = x2;
        if (y2 > y1) y = y1 + width; // Move down
        else y = y1 - width; // Move up
    } else if (height < width) {
        // Keep y2 as y
        y = y2;
        if (x2 > x1) x = x1 + height; // Move right
        else x = x1 - height; // Move left
    }

    return { x, y };
}
function addHistory() {
    console.log("hmm");
    forwardHistory = [];
    history.push(structuredClone(currentBoard.originalMap));
    if (history.length > 30) history.splice(0,1);

    $(".undo_tool").style.opacity = "1";
    $(".redo_tool").style.opacity = "0.5";

    if (history.length < 2) $(".undo_tool").style.opacity = "0.5";
}