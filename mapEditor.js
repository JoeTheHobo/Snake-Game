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
let alignPoint = false;
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
let copyType = false;
let copyTypeNeedsToReset = true;

let zoom = 1;
let xChange = 0;
let yChange = 0;
let showGrid = false;
let showFullGrid = false;

let oldMap = [];

loadObjectMenu();
function fixItemDifferencesMapEditor(map) {
    if (!currentBoard.itemDifferences) return;
    for (let i = 0; i < currentBoard.itemDifferences.length; i++) {
        let e = currentBoard.itemDifferences[i];
        let d = {
            differences: e[0],
            x: e[1],
            y: e[2],
        }
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
    currentBoard.originalMap = forceAllCellsToBeTheirOwn(board.originalMap);
    oldMap = structuredClone(currentBoard.originalMap);
    copiedCells = [];
    copyType = false;
    copyTypeNeedsToReset = true;
    history = [];
    forwardHistory = [];
    zoom = 1;
    showFullGrid = false;
    showGrid = false;
    selectedItem = {
        type: "item",
        content: getRealItem("pellet"),
        canEdit: true,
        path: false,
        cell: cloneObject(getRealItem("pellet")),
    }
    $(".redo_tool").style.opacity = "0.5";
    $(".undo_tool").style.opacity = "0.5";
    setScene("mapEditor");
    $("me_name").value = board.name;
    setGridSize(.17);
    me_loadDropdown($(".me_itemsContent"),items,"item_");
    me_loadDropdown($(".me_tilesContent"),tiles,"tile_");

    adjustCanvasSize(board.width,board.height,zoom);
    renderMapEditorCanvas(true);
    fixItemDifferencesMapEditor(currentBoard.originalMap);
    saveBoard(true);
    tool = false;
    setTool("draw");

    xChange = ($(".me_canvasHolder").offsetWidth - $(".edit_canvas")[0].offsetWidth)/2;
    yChange = ($(".me_canvasHolder").offsetHeight - $(".edit_canvas")[0].offsetHeight)/2;
    adjustCanvasPosition();

    clearInterval(saveInterval);
    saveInterval = setInterval(function() {
        if (!isActiveGame)
            saveBoard();
    },60000)
    addHistory();
}
function me_loadDropdown(holder,group,name) {
    let pack = getPacks(group);
    holder.innerHTML = "";

    for (let j = 0; j < pack.length; j++) {
        if (pack[j].name == "Hidden") continue;

        let packHolder = holder.create("div");
        packHolder.className = "me_packHolder";
        let packTitle = packHolder.create("div");
        packTitle.className = "me_packTitle";
        packTitle.innerHTML = pack[j].name;

        let itemsHolder = packHolder.create("div");
        itemsHolder.className = "me_packItems";

        for (let i = 0; i < pack[j].items.length; i++) {
            let item = pack[j].items[i];
            if (item.showInEditor == false) continue;
            
            let itemHolder = itemsHolder.create("div");
            itemHolder.className = "me_itemHolder";
            let itemImage = itemHolder.create("img");
            itemImage.src = $(name + item.name).src;
            itemImage.css({
                width: "100%",
                height: "100%",
            })
    
            itemHolder.type = name.subset(0,"_\\before");
            itemHolder.content = cloneObject(item);
            itemHolder.id = "me_" + name + item.name;
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
}
function renderTopCanvas() {
    me2_ctx.clearRect(0,0,me2_canvas.width,me2_canvas.height)

    if (selectedCells.selecting || selectedCells.shape) {
        me2_ctx.lineWidth = 1;
        let obj = getRectPos(selectedCells.start,selectedCells.end);
        me2_ctx.strokeStyle = "blue";
        me2_ctx.strokeRect(obj.startX,obj.startY,obj.width,obj.height);
    }

    if (selectedCells.shape) {
        if (tool !== "eraser") {
            let array = [];
            if (subTool == "circle") {
                array = generateOvalPoints(selectedCells.start,selectedCells.end);
            }
            if (subTool == "shape") {
                array = generatePointsInRect(selectedCells.start,selectedCells.end);
            }
            for (let i = 0; i < array.length; i++) {
                me_updateCell(me2_ctx,array[i].x,array[i].y,0.5)
            }
        }
    }

    if (showFullGrid) {
        me2_ctx.strokeStyle = "black";
        me2_ctx.lineWidth = 1;
        for (let i = 0; i < currentBoard.originalMap.length; i++) {
            me2_ctx.beginPath();
            me2_ctx.moveTo(0, i*gridSize*zoom);
            me2_ctx.lineTo(me_canvas.width, i*gridSize*zoom);
            me2_ctx.stroke();
        }
        for (let i = 0; i < currentBoard.originalMap[0].length; i++) {
            me2_ctx.beginPath();
            me2_ctx.moveTo(i*gridSize*zoom, 0);
            me2_ctx.lineTo(i*gridSize*zoom, me_canvas.height);
            me2_ctx.stroke();
        }
    }

    if (showGrid) {
        me2_ctx.lineWidth = 2;

        function drawLine(type,color,pos) {
            pos = ((gridSize*zoom)*pos)
            
            let x1 = type == "x" ? 0 : pos;
            let x2 = type == "x" ? me_canvas.width : pos;
            let y1 = type == "y" ? 0 : pos;
            let y2 = type == "y" ? me_canvas.height : pos;

            me2_ctx.strokeStyle = color;
    
            me2_ctx.beginPath();
            me2_ctx.moveTo(x1, y1);
            me2_ctx.lineTo(x2, y2);
            me2_ctx.stroke();
        }
        //Draw Extra Lines
        drawLine("y","gray",board.originalMap[0].length / 4);
        drawLine("x","gray",board.originalMap.length / 4);
        drawLine("y","gray",board.originalMap[0].length-(board.originalMap[0].length / 4));
        drawLine("x","gray",board.originalMap.length-(board.originalMap.length / 4));

        //Draw Center Lines
        drawLine("y","gray",board.originalMap[0].length / 2);
        drawLine("x","gray",board.originalMap.length / 2);

    }

    me2_ctx.lineWidth = 1;
    me2_ctx.strokeStyle = "blue"; 
    me2_ctx.strokeRect((gridSize*zoom)*mouseX,(gridSize*zoom)*mouseY,(gridSize*zoom),(gridSize*zoom));
}
function checkRenderThenRender() {
     renderMapEditorCanvas();
}
function renderMapEditorCanvas(renderEverything = false) {
    itemCounts = [];
    for (let i = 0; i < board.originalMap.length; i++) {
        for (let j = 0; j < board.originalMap[i].length; j++) {
            let tileIsDifferent = JSON.stringify(board.originalMap[i][j].tile) !== JSON.stringify(oldMap[i][j].tile);
            let itemIsDifferent = JSON.stringify(board.originalMap[i][j].item) !== JSON.stringify(oldMap[i][j].item);
            if (tileIsDifferent || itemIsDifferent || renderEverything) {
                me_updateCell(me_ctx,j,i)
            }
        }
    }
    oldMap = structuredClone(currentBoard.originalMap);

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
}
function getRectPos(pos1,pos2) {
    let startX = pos1.x * (gridSize*zoom);
    let startY = pos1.y * (gridSize*zoom);

    let width = ((pos2.x) - pos1.x)*(gridSize*zoom);
    let height = ((pos2.y) - pos1.y)*(gridSize*zoom);

    if (pos2.x > pos1.x) width += (gridSize*zoom);
    if (width == 0) width = (gridSize*zoom);
    if (pos2.y > pos1.y) height += (gridSize*zoom);
    if (height == 0) height = (gridSize*zoom);

    if (pos2.x < pos1.x) {
        startX += (gridSize*zoom);
        width -= (gridSize*zoom);
    }
    if (pos2.y < pos1.y) {
        startY += (gridSize*zoom);
        height -= (gridSize*zoom);
    }

    return {
        startX: startX,
        startY: startY,
        width: width,
        height: height,
    };
}
function me_updateCell(ctx,x,y,opacity) {
    let cell = cloneObject(board.originalMap[y][x]);

    if (opacity) cell[selectedItem.type] = selectedItem.cell;
    else opacity = 1;

    ctx.globalAlpha = opacity;

    let Xpos = ((gridSize*zoom)*x);
    let Ypos = ((gridSize*zoom)*y);

    ctx.clearRect(Xpos,Ypos,(gridSize*zoom),(gridSize*zoom))

    if (cell.tile) {
        itemCounts.push("tile_" + cell.tile.name);
        ctx.drawImage($("tile_" + cell.tile.name),Xpos,Ypos,(gridSize*zoom),(gridSize*zoom));
    }
    if (cell.item) {
        itemCounts.push("item_" + cell.item.name);
        ctx.drawImage(getItemCanvas(cell.item.name),Xpos,Ypos,(gridSize*zoom),(gridSize*zoom));
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
                    ctx.fillStyle = "black";
                    ctx.font = "20px Arial";
                    name = "P" + name.subset("_\\after","end");
                    ctx.fillText(name,(x*(gridSize*zoom)) + ((gridSize*zoom)/2) - ((gridSize*zoom)/change/2),y*(gridSize*zoom) + ((gridSize*zoom)/2) - ((gridSize*zoom)/change/2)+((gridSize*zoom)/2),(gridSize*zoom)/change,(gridSize*zoom)/change);
                }
            } else {
                ctx.drawImage(getItemCanvas(getItem(name).name),Xpos + ((gridSize*zoom)/2) - ((gridSize*zoom)/change/2),Ypos + ((gridSize*zoom)/2) - ((gridSize*zoom)/change/2),(gridSize*zoom)/change,(gridSize*zoom)/change);
            }
        }
    }

    ctx.globalAlpha = 1;
}
var mouseDirection = {
    y: 0,
    x: 0,
};
var oldMouseX = 0;
var oldMouseY = 0;
mousemovemethod = function (e) {
    mouseDirection = {
        y: e.pageY - oldMouseY,
        x: e.pageX - oldMouseX,
    }

    oldMouseX = e.pageX;
    oldMouseY = e.pageY;
    if ((tool == "move" && mouseDown === true) || mouseDown == "wheel") {
        xChange += mouseDirection.x;
        yChange += mouseDirection.y;
        adjustCanvasPosition();
    }
}
$(".me_canvasHolder").on('mousemove', mousemovemethod);
function adjustMousePos(e) {
    let rect = me_canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    mouseX = Math.floor(x/(gridSize*zoom));
    mouseY = Math.floor(y/(gridSize*zoom));
}
$("me_canvas").on("mousemove",function(e) {
    adjustMousePos(e);

    for (const row of board.originalMap) {
        for (const cell of row) {
            cell.mouseOver = false;
        }
    }

    //If Cursor Is Off Screen
    if (!board.originalMap[mouseY]) return;
    else if (!board.originalMap[mouseY][mouseX]) return;

    board.originalMap[mouseY][mouseX].mouseOver = true;
    
    if ((tool == "draw" || tool == "eraser")) {
        if (subTool == "shape" || subTool == "circle") {
            selectedCells.end = {
                x: mouseX,
                y: mouseY,
            }

            if (aligning) {
                selectedCells.end = makeSquare(selectedCells.start,selectedCells.end);
            }
        }
        if (subTool == "brush") {
            if (((mouseDown===true) || rightMouse) && selectedItem) {
                let x = mouseX;
                let y = mouseY;

                if (aligning) {
                    if (alignPoint.direction == false) {
                        let xDis = Math.abs(mouseX - alignPoint.x);
                        let yDis = Math.abs(mouseY - alignPoint.y);
    
                        if (xDis < yDis) alignPoint.direction = "x";
                        if (xDis > yDis) alignPoint.direction = "Y";
                    }

                    if (alignPoint.direction !== false) {
                        if (alignPoint.direction == "x") x = alignPoint.x;
                        else y = alignPoint.y;
                    }
                }

                if (rightMouse || tool == "eraser") {
                    board.originalMap[y][x][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
                } else if (selectedItem.canEdit) {
                    board.originalMap[y][x][selectedItem.type] = structuredClone(selectedItem.cell);
                }
                $("saveStatus").innerHTML = "Board Is Not Saved";
                if (mouseDown !== "wheel") checkRenderThenRender();
            }
        }
    }
    
    if (tool == "select" && mouseDown === true) {
        selectedCells.end = {
            x: mouseX,
            y: mouseY,
        }
    }
    
    if (mouseDown !== "wheel") renderTopCanvas()
})
$("me_canvas").on("mousedown",function(e) {
    var isRightMB;
    e = e || window.event;

    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2; 



    rightMouse = isRightMB;
    mouseDown = e.which == 2 ? "wheel" : true;
    
    if (tool == "select" && mouseDown === true) {
        $(".subTool_select").hide();
        if (aligning) {
            selectedCells.end = {
                x: mouseX,
                y: mouseY,
            }
            checkRenderThenRender();
        } else {
            clearSelection();
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
    }
    if (tool == "draw" || tool == "eraser") {
        alignPoint = {
            x: mouseX,
            y: mouseY,
            direction: false,
        }
        if (subTool == "shape" || subTool == "circle") {
            clearSelection();
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
    
    checkRenderThenRender();
})
$("me_canvas").on("mouseup",function(e) {

    if (mouseDown === true && (tool == "draw" || tool == "eraser")) {
        if (subTool == "shape") {
            tool_fill();
            addHistory();
        }
        if (subTool == "circle") {
            let array = generateOvalPoints(selectedCells.start,selectedCells.end);
            fillInPoints(array);
            clearSelection();
        }
        if (subTool == "brush") {
            if (selectedItem && !aligning) {
                if (rightMouse || tool == "eraser") {
                    board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
                } else if (selectedItem.canEdit) {
                    board.originalMap[mouseY][mouseX][selectedItem.type] = structuredClone(selectedItem.cell);
                }
                addHistory();
            }
        }
        $("saveStatus").innerHTML = "Board Is Not Saved";
        checkRenderThenRender();
    }

    if (tool == "select" && mouseDown === true) {
        $(".subTool_select").show();
        if (copiedCells.length == 0) $(".pastingTool").hide();
        else $(".pastingTool").show();
        
        let selectingOneCell = isSelectingOneCell();
        if (selectingOneCell) {
            if (currentBoard.originalMap[mouseY][mouseX][selectedItem.type] !== false) {
                selectedItem = {
                    type: selectedItem.type,
                    content: structuredClone(currentBoard.originalMap[mouseY][mouseX][selectedItem.type]),
                    canEdit: true,
                    path: false,
                    cell: structuredClone(currentBoard.originalMap[mouseY][mouseX][selectedItem.type]),
                }
                loadObjectMenu();
            }
        }
           
    }
    if (tool == "bucket" && mouseDown === true) {
        if (subTool == "bucket") {
            useBucketTool();
            addHistory();
            $("saveStatus").innerHTML = "Board Is Not Saved";
        }
        if (subTool == "global_bucket") {
            let insideOfSelection = false;
            let selectionMap;
            if (selectedCells.selecting) {
                let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
                if (mouseY >= upY && mouseY <= bottomY) {
                    if (mouseX >= leftX && mouseX <= rightX) insideOfSelection = true;
                }
                selectionMap = {
                    upY: upY,
                    leftX: leftX,
                    rightX: rightX,
                    bottomY: bottomY,
                }
            }
            const Control = currentBoard.originalMap[mouseY][mouseX][selectedItem.type];
            for (let i = 0; i < currentBoard.originalMap.length; i++) {
                for (let j = 0; j < currentBoard.originalMap[i].length; j++) {
                    let cell = currentBoard.originalMap[i][j][selectedItem.type];
                    if (Control == false) {
                        if (cell !== false) continue;
                    } else {
                        if (cell.name !== Control.name) continue;
                    }
                    if (insideOfSelection) {
                        if (i < selectionMap.upY || j < selectionMap.leftX || i > selectionMap.bottomY || j > selectionMap.rightX) continue;
                    } else {
                        if (selectedCells.selecting) {
                            if (i >= selectionMap.upY && j >= selectionMap.leftX && i <= selectionMap.bottomY && j <= selectionMap.rightX) continue;
                        }
                    }
                    
                    currentBoard.originalMap[i][j][selectedItem.type] = cloneObject(selectedItem.cell);
                }
            }
            
            addHistory();
            $("saveStatus").innerHTML = "Board Is Not Saved";
        }
        checkRenderThenRender();
    }

    mouseDown = false;
    rightMouse = false;
    
})

$(".me_canvasHolder").on("wheel",function(e) {
    const delta = Math.sign(e.deltaY);

    changeZoom(delta);

    moveCanvasToStayInPosition(e,mouseX,mouseY);
    checkRenderThenRender();
    renderTopCanvas();
});
function moveCanvasToStayInPosition(e,originalX,originalY) {
    adjustMousePos(e);

    let xDif = mouseX - originalX;
    let yDif = mouseY - originalY;

    xChange += xDif*(gridSize*zoom)
    yChange += yDif*(gridSize*zoom)

    adjustCanvasPosition();

    adjustMousePos(e);

    if (mouseX !== originalX || originalY !== mouseY) moveCanvasToStayInPosition(e,originalX,originalY);

}
function adjustCanvasPosition() {
    $("me_canvas").style.marginLeft = xChange + "px";
    $("me_canvas").style.marginTop = yChange + "px";
    $("me_canvas2").style.marginLeft = xChange + "px";
    $("me_canvas2").style.marginTop = yChange + "px";
}
function changeZoom(delta) {
    if (delta < 0) zoom += 0.1;
    if (delta > 0) zoom -= 0.1;
    if (delta === 0) zoom = 1;

    if (zoom < 0.1) zoom = 0.1;

    adjustCanvasSize(board.width,board.height,zoom);
    checkRenderThenRender();
    renderTopCanvas();
}
$("me_canvas").on("mouseleave",function(e) {
    mouseDown = false;
    rightMouse = false;
})
$("me_canvas").on("contextmenu",function(e) {
    e.preventDefault();
})
document.on('keydown', (e) => {
    if ($("scene_mapEditor").style.display == "none") return;
    // Check if the currently focused element is an input, textarea, or select
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return; // Exit early if an input element is focused
    }

    // Check if Ctrl and S are pressed
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault(); // Prevent the default save action
        saveBoard();
    }
    if (!e.ctrlKey && e.key === 's') {
        setTool("select");
    }
    if (!e.ctrlKey && e.key == "d") {
        setTool("draw");
    }
    if (e.key == "Tab") {
        e.preventDefault();
        if (selectedItem.type == "item") {
            selectedItem = {
                type: "tile",
                content: getTile("grass"),
                canEdit: true,
                path: false,
                cell: cloneObject(getTile("grass")),
            }
        } else {
            selectedItem = {
                type: "item",
                content: getRealItem("pellet"),
                canEdit: true,
                path: false,
                cell: cloneObject(getRealItem("pellet")),
            }
        }
        loadObjectMenu();
    }
    if (e.key == "b") {
        setTool("bucket");
    }
    if (e.key == "e") {
        setTool("eraser");
    }
    if (e.key == "m") {
        setTool("move");
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
    if ((e.ctrlKey && e.key === 'd') || e.key == "Escape") {
        e.preventDefault(); // Prevent the default save action
        clearSelection();
        $(".subTool_select").hide();

    }
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault(); // Prevent the default save action
        if (tool !== "select") setTool("select");

        selectedCells.selecting = true;
        selectedCells.start = {
            x: 0,
            y: 0,
        };
        selectedCells.end = {
            x: currentBoard.originalMap[0].length - 1,
            y: currentBoard.originalMap.length - 1,
        }
        
        $(".subTool_select").show();

        checkRenderThenRender();
    }
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault(); // Prevent the default save action
        if (selectedCells.selecting) {
            runTool("copy")
        }
    }
    if (e.ctrlKey && e.key === 'v') {
        if (copiedCells.length > 0 && selectedCells.selecting) {
            runTool("paste");
        }
    }
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault(); // Prevent the default save action
        runTool("undo");
    }
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault(); // Prevent the default save action
        runTool("redo");
    }
    if (!e.ctrlKey && e.key === 'g') {
        e.preventDefault(); // Prevent the default save action
        runTool("show_grid2");
    }
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault(); // Prevent the default save action
        runTool("show_grid");
    }
    if (e.ctrlKey && e.key === 'x') {
        e.preventDefault(); // Prevent the default save action
        runTool("cut");
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
    if (!selectedCells.selecting && !selectedCells.shape) return;

    let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);

    for (let i = upY; i < bottomY+1; i++) {
        for (let j = leftX; j < rightX+1; j++) {
            if (tool == "eraser") board.originalMap[i][j][selectedItem.type] = false;
            else board.originalMap[i][j][selectedItem.type] = cloneObject(selectedItem.cell);
        }
    }

    checkRenderThenRender();
    
    if (tool == "select") return;

    clearSelection();
}
function saveBoard(saveDifferences = false) {
    let html_saveStatus = $("saveStatus");
    currentBoard.itemDifferences = findItemDifferences(currentBoard.originalMap);
    saveBoards();

    html_saveStatus.innerHTML = "Board Saved";
}

$("me_button").on("click",function() {
    if ($("saveStatus").innerHTML == "Board Saved") {
        saveBoard();
        setScene("newMenu");
        loadBoardsScreen();
        return;
    }
    makePopUp([
        {type: "title",text: "Save Changes?"},
        [
            {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", background: "red",text:"Discard Changes",onClick: () => {
                setScene("newMenu");
                loadBoards();
            }},
            {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto", background: "green",text:"Save Changes",onClick: () => {
                saveBoard();
                setScene("newMenu");
                loadBoardsScreen();
            }},
        ],
    ],{
        exit: {
            cursor: "url('./img/pointer.cur'), auto",
        },
        id: "savePopUp",
    
    })
})
$("me_name").on("click",function() {
    this.storedValue = this.value;
    this.value = "";
})
$("me_name").on("focusout",function() {
    if (this.value == "") this.value = this.storedValue;
})
$("me_name").on("input",function() {
    let setValue = this.value;
    if (this.value == "") setValue = "Untitled";
    board.name = this.value;
    $("saveStatus").innerHTML = "Board Is Not Saved";
})

function loadObjectMenu() {
    $(".me_ih_image").src = "img/" + selectedItem.cell.img;
    let holder = $(".me_ih_settings");
    holder.innerHTML = "";
    $(".me_ih_name").innerHTML = selectedItem.cell.name;
    $(".me_ih_type").innerHTML = selectedItem.type;

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
                let selectingOneCell = isSelectingOneCell();

                if (this.path.length == 2) {
                    selectedItem.cell[this.path[0]][this.path[1]] = this.value;
                    if (selectingOneCell) currentBoard.originalMap[selectedCells.start.y][selectedCells.start.x][selectedItem.type][this.path[0]][this.path[1]] = this.value;
                }
                if (this.path.length == 1) {
                    selectedItem.cell[this.path[0]] = this.value;
                    if (selectingOneCell) currentBoard.originalMap[selectedCells.start.y][selectedCells.start.x][selectedItem.type][this.path[0]] = this.value;
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
function isSelectingOneCell() {
    if (selectedCells.selecting) {
        if (selectedCells.start.x == selectedCells.end.x) {
            if (selectedCells.start.y == selectedCells.end.y) {
                return true;
            }
        }
    }
    return false;
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
            let selectingOneCell = isSelectingOneCell();
            
            if (selectedItem.path.length == 2) {
                selectedItem.cell[selectedItem.path[0]][selectedItem.path[1]] = this.status;
                if (selectingOneCell) currentBoard.originalMap[selectedCells.start.y][selectedCells.start.x][selectedItem.type][selectedItem.path[0]][selectedItem.path[1]] = this.status;
            }
            if (selectedItem.path.length == 1) {
                selectedItem.cell[selectedItem.path[0]] = this.status;
                if (selectingOneCell) currentBoard.originalMap[selectedCells.start.y][selectedCells.start.x][selectedItem.type][selectedItem.path[0]] = this.status;
            }
            checkRenderThenRender();
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
    if (tool === tool2) {
        if (tool == "draw" || tool == "eraser") {
            if (subTool == "brush") setSubTool("shape");
            else if (subTool == "shape") setSubTool("circle");
            else setSubTool("brush");
        }
        if (tool == "bucket") {
            if (subTool == "bucket") setSubTool("global_bucket");
            else setSubTool("bucket");
        }
        return;
    }
    tool = tool2;

    if (tool == "draw" || tool == "eraser") {
        $(".subToolHolder").hide();
        $(".subTool_draw").show();
        setSubTool("brush");
        clearSelection();
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
    checkRenderThenRender();
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
    }
    if (type == "reflectY") {
        let newBoard = flipVertically(getArrayOfSelection());
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        paste(leftX,upY,newBoard);
    }
    if (type == "delete") {
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        for (let i = upY; i < bottomY+1; i++) {
            for (let j = leftX; j < rightX+1; j++) {
                board.originalMap[i][j][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
            }
        }
        checkRenderThenRender();
        addHistory();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "rotate_left" || type == "rotate_right") {
        copiedCells = getArrayOfSelection();
        runTool("delete");
        copiedCells = type == "rotate_left" ? rotateArrayLeft(copiedCells) : rotateArrayRight(copiedCells);
        paste(selectedCells.start.x,selectedCells.start.y,copiedCells);
        selectedCells.end = {
            x: selectedCells.start.x + copiedCells[0].length-1,
            y: selectedCells.start.y + copiedCells.length-1,
        }
        renderTopCanvas();
    }
    if (type == "fill") {
        tool_fill();
        addHistory();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "cut") {
        runTool("copy");
        runTool("delete");
    }
    if (type == "copy") {
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        let coords = {
            y: upY-1,
            x: leftX + ((rightX-leftX)/2),
        }
        let xy = getRealCoordsFromBoardPoints(coords.x,coords.y);

        if (copyTypeNeedsToReset) {
            copyTypeNeedsToReset = false;
            copyType = false;
        }

        if (copyType == false) copyType = [selectedItem.type]
        else if (copyType.length < 2) copyType.push(copyType[0] === "item" ? "tile" : "item");
        else copyType = [(copyType[0] == "item" ? "tile" : "item")]

        runToolTip(xy.x+(gridSize/2),xy.y,"Copied: " + copyType.join(" + "),"center",1);
        copiedCells = getArrayOfSelection();
        $(".pastingTool").show();
    }
    if (type == "paste") {
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        paste(leftX,upY,copiedCells,copyType)
    }
    if (type == "undo") {
        if (history.length < 2) return;

        forwardHistory.push(history.pop());
        currentBoard.originalMap = history[history.length-1];
        $(".redo_tool").style.opacity = "1";
        if (history.length < 2) {
            $(".undo_tool").style.opacity = "0.5";
        }
        checkRenderThenRender();
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
        checkRenderThenRender();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
    if (type == "zoomIn") {
        changeZoom(-1);
    }
    if (type == "zoomOut") {
        changeZoom(1);
    }
    if (type == "zoomZero") {
        changeZoom(0);
        xChange = ($(".me_canvasHolder").offsetWidth - $(".edit_canvas")[0].offsetWidth)/2;
        yChange = ($(".me_canvasHolder").offsetHeight - $(".edit_canvas")[0].offsetHeight)/2;
        adjustCanvasPosition();

    }
    if (type == "show_grid") {
        showGrid = showGrid == false ? true : false;
        renderTopCanvas();

        if (showGrid) $(".show_grid_tool").classAdd("toolIsSelected");
        else $(".show_grid_tool").classRemove("toolIsSelected");
    }
    if (type == "show_grid2") {
        showFullGrid = showFullGrid == false ? true : false;
        renderTopCanvas();

        if (showFullGrid) $(".show_grid_tool2").classAdd("toolIsSelected");
        else $(".show_grid_tool2").classRemove("toolIsSelected");
    }
}
function rotateArrayLeft(matrix) {
    return matrix[0].map((val, index) => matrix.map(row => row[row.length-1-index]));
}
function rotateArrayRight(matrix) {
    return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
}
function paste(x,y,map,type) {
    for (let i = y; i < y+map.length; i++) {
        if (i > currentBoard.originalMap.length-1) continue;
        for (let j = x; j < x+map[0].length; j++) {
            if (j > currentBoard.originalMap[0].length-1) continue;

            if (!type)
                currentBoard.originalMap[i][j] = cloneObject(map[i-y][j-x]);
            else {
                if (type.includes("item")) currentBoard.originalMap[i][j].item = cloneObject(map[i-y][j-x].item);
                if (type.includes("tile")) currentBoard.originalMap[i][j].tile = cloneObject(map[i-y][j-x].tile);
            }
        }
    }
    checkRenderThenRender();
    addHistory();
    $("saveStatus").innerHTML = "Board Is Not Saved";
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
    forwardHistory = [];
    history.push(structuredClone(currentBoard.originalMap));
    if (history.length > 30) history.splice(0,1);

    $(".undo_tool").style.opacity = "1";
    $(".redo_tool").style.opacity = "0.5";

    if (history.length < 2) $(".undo_tool").style.opacity = "0.5";
}
function useBucketTool(grid = currentBoard.originalMap, row = mouseY, col = mouseX, ) {
    let insideOfSelection = false;
    let selectionMap;
    if (selectedCells.selecting) {
        let {upY,leftX,bottomY,rightX} = getDimensions(selectedCells.start,selectedCells.end);
        if (row >= upY && row <= bottomY) {
            if (col >= leftX && col <= rightX) insideOfSelection = true;
        }
        selectionMap = {
            upY: upY,
            leftX: leftX,
            rightX: rightX,
            bottomY: bottomY,
        }
    }

    const controlValue = grid[row][col][selectedItem.type]; // Store the initial control value
    if (controlValue !== false)
        if (controlValue.name === selectedItem.cell.name) return; // Prevent infinite recursion if the selected value matches the control value

    // Helper function for recursion
    function fill(r, c) {
        // Base cases: Check if out of bounds or value doesn't match control value
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;
        if (controlValue !== false) {
            if (grid[r][c][selectedItem.type].name !== controlValue.name) return;
        } else if (grid[r][c][selectedItem.type] !== controlValue) {
            return;
        }
        if (insideOfSelection) {
            if (r < selectionMap.upY || c < selectionMap.leftX || r > selectionMap.bottomY || c > selectionMap.rightX) return;
        } else {
            if (selectedCells.selecting) {
                if (r >= selectionMap.upY && c >= selectionMap.leftX && r <= selectionMap.bottomY && c <= selectionMap.rightX) return;
            }
        }

        // Replace the current cell with the selected value
        grid[r][c][selectedItem.type] = cloneObject(selectedItem.cell);

        // Recursively fill in all four directions (up, down, left, right)
        fill(r - 1, c); // Up
        fill(r + 1, c); // Down
        fill(r, c - 1); // Left
        fill(r, c + 1); // Right
    }

    // Start the recursive fill
    fill(row, col);

    return grid; // Return the modified grid
}

function getPacks(list) {
    let packs = [];
    let packNameList = [];
    for (let i = 0; i < list.length; i++) {
        if (packNameList.includes(list[i].pack)) {
            for (let j = 0; j < packs.length; j++) {
                if (packs[j].name == list[i].pack) {
                    packs[j].items.push(list[i]);
                }
            }
        } else {
            let newPack = {
                name: list[i].pack,
                items: [list[i]],
            }
            packs.push(newPack);
            packNameList.push(list[i].pack);
        }
    }
    return packs;
}
function generateOvalPoints(point1, point2, step = 1) {
    const points = [];

    // Calculate the center of the circle/oval (midpoint of point1 and point2)
    const centerX = (point1.x + point2.x) / 2;
    const centerY = (point1.y + point2.y) / 2;

    // Calculate the semi-major and semi-minor axes based on the distance between point1 and point2
    const semiMajorAxis = Math.abs(point2.x - point1.x) / 2;
    const semiMinorAxis = Math.abs(point2.y - point1.y) / 2;

    // Loop through all grid points within the bounding box of point1 and point2
    for (let x = Math.min(point1.x, point2.x); x <= Math.max(point1.x, point2.x); x += step) {
        for (let y = Math.min(point1.y, point2.y); y <= Math.max(point1.y, point2.y); y += step) {
            // Check if the point (x, y) is inside the circle/oval
            const dx = (x - centerX) / semiMajorAxis;
            const dy = (y - centerY) / semiMinorAxis;
            if (dx * dx + dy * dy <= 1) {
                // If the point is inside the oval, add it to the list
                points.push({ x, y });
            }
        }
    }

    return points;
}


function fillInPoints(points) {
    for (let i = 0; i < points.length; i++) {
        if (rightMouse || tool == "eraser") {
            board.originalMap[points[i].y][points[i].x][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
        } else if (selectedItem.canEdit) {
            board.originalMap[points[i].y][points[i].x][selectedItem.type] = structuredClone(selectedItem.cell);
        }
    }
    addHistory();
    checkRenderThenRender();
}
function generatePointsInRect(pointA,pointB) {
    let arr = [];
    let {upY,leftX,bottomY,rightX} = getDimensions(pointA,pointB)
    for (let i = upY; i < bottomY+1; i++) {
        for (let j = leftX; j < rightX+1; j++) {
            arr.push({
                x: j,
                y: i,
            })
        }
    }
    return arr;
}



function getRealCoordsFromBoardPoints(x,y) {
    let rect = me_canvas.getBoundingClientRect();

    x = (gridSize * x * zoom) + rect.left;
    y = (gridSize * y * zoom) + rect.top;

    return {
        x: x,
        y: y,
    }
}
function clearSelection() {
    selectedCells  = {
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
    copyTypeNeedsToReset = true;
    renderTopCanvas();
}



function runToolTip(x,y,message,type,id = false) {
    let toolTip;
    if (id) {
        if ($("toolTip" + id)) {
            toolTip = $("toolTip" + id);
            clearTimeout(toolTip.timeOut)
        }
        else toolTip = $("scene_mapEditor").create("div");
    } else {
        toolTip = $("scene_mapEditor").create("div");
    }
    
    toolTip.className = "toolTip";
    toolTip.innerHTML = message;

    if (id) toolTip.id = "toolTip" + id;

    if (type == "center") {
        x = x - (toolTip.offsetWidth/2);
        y = y - (toolTip.offsetHeight/2);
    }

    toolTip.css({
        left: x + "px",
        top: y + "px",
    })
    toolTip.style.opacity = 0.8;
    toolTip.timeOut = setTimeout(function() {
        toolTip.style.opacity = 0;

        toolTip.remove()
    },1500)
}
