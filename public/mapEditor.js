let selectedItem = {
    type: "item",
    content: getRealItem("pellet"),
    canEdit: true,
    path: false,
    cell: structuredClone(getRealItem("pellet")),
}
let selectedZone;
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
let selectedObjectTab;
let selectedItemTags = [];
let selectedTileTags = [];
let savedSelectingItem = 1;
let savedSelectingTile = 1;
let userClickedZonePlayer = false;
let userClickedZoneItem = false;
let userClickedZoneSpecial = false;
let savedSelectingZonePlayer = 0;
let savedSelectingZoneItem = 0;
let savedSelectingZoneSpecial = 0;
let currentTab = "Items";
let showingZoneTypes = [];

let oldMap = [];

function fixItemDifferencesMapEditor(map) {
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
            setNestedValue(pos,change,"_LAST_");
        }
        map[d.y][d.x].item = pos;
    }
}
function fixTileDifferencesMapEditor(map) {
    if (!currentBoard.tileDifferences) return;
    for (let i = 0; i < currentBoard.tileDifferences.length; i++) {
        let e = currentBoard.tileDifferences[i];
        let d = {
            differences: e[0],
            x: e[1],
            y: e[2],
        }
        let pos = structuredClone(map[d.y][d.x].tile);
        if (!pos) continue;
        for (let j = 0; j < d.differences.length; j++) {
            let change = d.differences[j]; 
            if (change.length == 4) {
                pos[change[0]][change[1]][change[2]] = change[3];
            }
            if (change.length == 3) {
                pos[change[0]][change[1]] = change[2];
            }
            if (change.length == 2) pos[change[0]] = change[1];
        }
        map[d.y][d.x].tile = pos;
    }
}
let resetMap;
function openMapEditor(boardComingIn) {
    currentBoard = boardComingIn;
    board = boardComingIn;
    currentBoard.originalMap = forceAllCellsToBeTheirOwn(currentBoard.originalMap);
    oldMap = structuredClone(currentBoard.originalMap);
    copiedCells = [];
    resetMap = structuredClone(currentBoard.originalMap);
    copyType = false;
    copyTypeNeedsToReset = true;
    history = [];
    forwardHistory = [];
    zoom = 1;
    showFullGrid = false;
    showGrid = false;
    selectedZone = false;
    selectedItemTags = [];
    userClickedZonePlayer = false;
    userClickedZoneItem = false;
    userClickedZoneSpecial = false;

    //PARITY
    if (!currentBoard.spawnZones.special) currentBoard.spawnZones.special = [];    
    //END

    $(".show_zones_tool").classRemove("toolIsSelected");
    $(".redo_tool").style.opacity = "0.5";
    $(".undo_tool").style.opacity = "0.5";
    setScene("mapEditor");
    $(".me_s_holder_tools").show("flex");
    $(".me_s_holder_subtool").show("flex");


    //Load Board Settings HTML
    $("me_description").value = currentBoard.description || "";
    $("me_name").value = currentBoard.name;
    if (!currentBoard.background) currentBoard.background = backgrounds[0];
    $("me_background").innerHTML = currentBoard.background;
    $("me_minPlayers").value = currentBoard.minPlayers;
    $("me_maxPlayers").value = currentBoard.maxPlayers;

    $(".gameModeSelectionScreen").hide();
    $(".backgroundSelectionScreen").hide();
    
    //End Load Board Settings HTML

    setGridSize(.17);

    setObjectTab("Items");
    adjustCanvasSize(currentBoard.width,currentBoard.height,zoom);
    renderMapEditorCanvas(true);
    fixItemDifferencesMapEditor(currentBoard.originalMap);
    fixTileDifferencesMapEditor(currentBoard.originalMap);
    saveBoard(true);
    tool = false;
    setTool("draw");
    me_ctx_emote_background.globalAlpha = 0.4;
    me_ctx_emote_foreground.globalAlpha = 0.4;

    xChange = ($(".me_canvasHolder").offsetWidth - $(".edit_canvas")[0].offsetWidth)/2;
    yChange = ($(".me_canvasHolder").offsetHeight - $(".edit_canvas")[0].offsetHeight)/2;
    adjustCanvasPosition();
    
    selectedItem = {
        type: "item",
        content: getItemById(savedSelectingItem),
        canEdit: true,
        path: false,
        cell: structuredClone(getItemById(savedSelectingItem)),
    }
    $(".me_ob_tab").classRemove("me_ob_tab_selected");
    $(".me_ob_tab")[0].classAdd("me_ob_tab_selected");
    loadObjectMenu();

    renderBackgroundCanvas();
    renderZoneCanvas();

    clearInterval(saveInterval);
    saveInterval = setInterval(function() {
        if (global_scene === "mapEditor")
            saveBoard();
        else clearInterval(saveInterval);
    },60000)
    addHistory();
}
function renderZoneCanvas() {
    if (me_ctx_emote_background.globalAlpha !== 0.4) me_ctx_emote_background.globalAlpha = 0.4;
    if (me_ctx_emote_foreground.globalAlpha !== 0.4) me_ctx_emote_foreground.globalAlpha = 0.4;

    me_ctx_emote_background.clearRect(0,0,me_canvas_emote_background.width,me_canvas_emote_background.height);
    me_ctx_emote_foreground.clearRect(0,0,me_canvas_emote_foreground.width,me_canvas_emote_foreground.height);

    if (showingZoneTypes.includes("player")) {
        for (let i = 0; i < currentBoard.spawnZones.players.length; i++) {
            let zone = currentBoard.spawnZones.players[i];
            renderZone(me_canvas_emote_background,me_canvas_emote_foreground,zone,zoom)
        }
    }

    if (showingZoneTypes.includes("item")) {
        for (let i = 0; i < currentBoard.spawnZones.items.length; i++) {
            let zone = currentBoard.spawnZones.items[i];
            renderZone(me_canvas_emote_background,me_canvas_emote_foreground,zone,zoom)
        }
    }
    if (showingZoneTypes.includes("special")) {
        for (let i = 0; i < currentBoard.spawnZones.special.length; i++) {
            let zone = currentBoard.spawnZones.special[i];
            renderZone(me_canvas_emote_background,me_canvas_emote_foreground,zone,zoom)
        }
    }
}
function renderTopCanvas() {
    me_ctx_top.clearRect(0,0,me_canvas_top.width,me_canvas_top.height)

    if (selectedCells.selecting || selectedCells.shape) {
        me_ctx_top.lineWidth = 1;
        let obj = getRectPos(selectedCells.start,selectedCells.end);
        me_ctx_top.strokeStyle = "blue";
        me_ctx_top.strokeRect(obj.startX,obj.startY,obj.width,obj.height);
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
                me_updateCell("all",me_ctx_top,array[i].x,array[i].y,0.5)
            }
        }
    }

    if (showFullGrid) {
        me_ctx_top.strokeStyle = "black";
        me_ctx_top.lineWidth = 1;
        for (let i = 0; i < currentBoard.originalMap.length; i++) {
            me_ctx_top.beginPath();
            me_ctx_top.moveTo(0, i*gridSize*zoom);
            me_ctx_top.lineTo(me_canvas_top.width, i*gridSize*zoom);
            me_ctx_top.stroke();
        }
        for (let i = 0; i < currentBoard.originalMap[0].length; i++) {
            me_ctx_top.beginPath();
            me_ctx_top.moveTo(i*gridSize*zoom, 0);
            me_ctx_top.lineTo(i*gridSize*zoom, me_canvas_top.height);
            me_ctx_top.stroke();
        }
    }



    if (showGrid) {
        me_ctx_top.lineWidth = 2;

        function drawLine(type,color,pos) {
            pos = ((gridSize*zoom)*pos)
            
            let x1 = type == "x" ? 0 : pos;
            let x2 = type == "x" ? me_canvas_top.width : pos;
            let y1 = type == "y" ? 0 : pos;
            let y2 = type == "y" ? me_canvas_top.height : pos;

            me_ctx_top.strokeStyle = color;
    
            me_ctx_top.beginPath();
            me_ctx_top.moveTo(x1, y1);
            me_ctx_top.lineTo(x2, y2);
            me_ctx_top.stroke();
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

    me_ctx_top.lineWidth = 1;
    me_ctx_top.strokeStyle = "blue"; 
    me_ctx_top.strokeRect((gridSize*zoom)*mouseX,(gridSize*zoom)*mouseY,(gridSize*zoom),(gridSize*zoom));
}
function checkRenderThenRender() {
     renderMapEditorCanvas();
}
function renderBackgroundCanvas() {
    let image = new Image();
    image.src= "img/backgrounds/" + board.background + ".png";
    image.onload = function() {
        me_ctx_background.clearRect(0,0,me_canvas_background.width,me_canvas_background.height)
        me_ctx_background.drawImage(image,0,0,me_canvas_background.width,me_canvas_background.height)
    }
    
}
function renderMapEditorCanvas(renderEverything = false) {
    itemCounts = [];
    for (let i = 0; i < board.originalMap.length; i++) {
        for (let j = 0; j < board.originalMap[i].length; j++) {
            let tileIsDifferent = JSON.stringify(board.originalMap[i][j].tile) !== JSON.stringify(oldMap[i][j].tile);
            let itemIsDifferent = JSON.stringify(board.originalMap[i][j].item) !== JSON.stringify(oldMap[i][j].item);
            if (tileIsDifferent || renderEverything || itemIsDifferent) {
                me_updateCell("tile",me_ctx_tiles,j,i); 
                me_updateCell("item",me_ctx_items,j,i);
            }
        }
    }
    oldMap = structuredClone(currentBoard.originalMap);
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
function me_updateCell(type,ctx,x,y,opacity) {
    let cell = structuredClone(board.originalMap[y][x]);

    if (opacity) cell[selectedItem.type] = selectedItem.cell;
    else opacity = 1;

    if (ctx.globalAlpha !== opacity) ctx.globalAlpha = opacity;

    let Xpos = Math.round((gridSize*zoom)*x);
    let Ypos = Math.round((gridSize*zoom)*y);

    let nextX = Math.round((gridSize*zoom)*(x+1));
    let nextY = Math.round((gridSize*zoom)*(y+1));

    let xDif = nextX - (Xpos+(gridSize*zoom))+1;
    let yDif = nextY - (Ypos+(gridSize*zoom))+1;

    ctx.clearRect(Xpos,Ypos,(gridSize*zoom),(gridSize*zoom))

    if (type == "tile" || type == "all") {
        if (cell.tile) {
            itemCounts.push("tile_" + cell.tile.name);
            let filter = checkItemFilter(cell.tile);
            if (filter) ctx.filter = filter;
            ctx.drawImage(getImage(cell.tile,"canvas"),Xpos,Ypos,(gridSize*zoom)+xDif,(gridSize*zoom)+yDif);
            if (filter) ctx.filter = "none";
        }
    }
    if (type == "item" || type == "all") {
        if (cell.item) {

            itemCounts.push("item_" + cell.item.name);
            let image = getImage(cell.item,"canvas",true);
            ctx.drawImage(image,Xpos,Ypos,(gridSize*zoom)+xDif,(gridSize*zoom)+yDif);
    
            if (cell.item.boardDestructibleCountRequired > 1) {
                ctx.font = "16px VT323";
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.lineWidth = 4;
    
                let textWidth = ctx.measureText(cell.item.boardDestructibleCountRequired).width;
                xPos = (x*(gridSize*zoom)) + ((gridSize*zoom)/2) - (textWidth/2);
                yPos = (y*(gridSize*zoom)) + ((gridSize*zoom)/2);
    
                ctx.strokeText(cell.item.boardDestructibleCountRequired,xPos,yPos);
                ctx.fillText(cell.item.boardDestructibleCountRequired,xPos,yPos);
            }
    
            if (cell.item.renderStatusNumber) {
                let value = getBaseImgFromTag(cell.item,cell.item.renderStatusNumber.value);
    
                ctx.font = "16px VT323";
                ctx.strokeStyle = "black";
                ctx.fillStyle = cell.item.renderStatusColor ?? "white";
                ctx.lineWidth = 4;
    
                let textWidth = ctx.measureText(value).width;
                xPos = (x*(gridSize*zoom)) + ((gridSize*zoom)/2) - (textWidth/2);
                yPos = (y*(gridSize*zoom)) + ((gridSize*zoom)/2);
    
                ctx.strokeText(value,xPos,yPos);
                ctx.fillText(value,xPos,yPos);
            }
        }
    }

    if (ctx.globalAlpha !== 1) ctx.globalAlpha = 1;
}
var mouseDirection = {
    y: 0,
    x: 0,
};
var oldMouseX = 0;
var oldMouseY = 0;
let zoneMouseMode = false;
let zoneMouseHelper = false;
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
    if (currentTab == "Spawn Zones" && showingZoneTypes.includes(selectedZone.type) && !mouseDown) {
        let zone = selectedZone.zone;
        if (mouseX < zone.pos2.x && mouseX > zone.pos1.x && mouseY < zone.pos2.y && mouseY > zone.pos1.y) {
            $(".me_canvasHolder").classAdd("moveCursor");
        } else {
            $(".me_canvasHolder").classRemove("moveCursor");
        }
        let verticalResizeCursor = false;
        let horizontalResizeCursor = false;
        let nsCursor = false;
        let ewCursor = false;
        if (mouseX == zone.pos1.x && mouseY < zone.pos2.y && mouseY > zone.pos1.y) {
            horizontalResizeCursor = true;
        }
        if (mouseX == zone.pos2.x && mouseY < zone.pos2.y && mouseY > zone.pos1.y) {
            horizontalResizeCursor = true;
        }
        if (mouseY == zone.pos1.y && mouseX < zone.pos2.x && mouseX > zone.pos1.x) {
            verticalResizeCursor = true;
        }
        if (mouseY == zone.pos2.y && mouseX < zone.pos2.x && mouseX > zone.pos1.x) {
            verticalResizeCursor = true;
        }
        if (mouseX == zone.pos1.x && mouseY == zone.pos1.y) {
            nsCursor = true;
        }
        if (mouseX == zone.pos1.x && mouseY == zone.pos2.y) {
            ewCursor = true;
        }
        if (mouseX == zone.pos2.x && mouseY == zone.pos1.y) {
            ewCursor = true;
        }
        if (mouseX == zone.pos2.x && mouseY == zone.pos2.y) {
            nsCursor = true;
        }

        if (verticalResizeCursor) {
            $(".me_canvasHolder").classAdd("verticalResizeCursor");
        } else {
            $(".me_canvasHolder").classRemove("verticalResizeCursor");
        }
        if (horizontalResizeCursor) {
            $(".me_canvasHolder").classAdd("horizontalResizeCursor");
        } else {
            $(".me_canvasHolder").classRemove("horizontalResizeCursor");
        }
        if (ewCursor) {
            $(".me_canvasHolder").classAdd("ewCursor");
        } else {
            $(".me_canvasHolder").classRemove("ewCursor");
        }
        if (nsCursor) {
            $(".me_canvasHolder").classAdd("nsCursor");
        } else {
            $(".me_canvasHolder").classRemove("nsCursor");
        }


        
    }
    if (currentTab == "Spawn Zones" && showingZoneTypes.includes(selectedZone.type) && mouseDown && zoneMouseMode) {
        if (zoneMouseMode == "resizeLeft") {
            selectedZone.zone.pos1.x = mouseX;
        }
        if (zoneMouseMode == "resizeRight") {
            selectedZone.zone.pos2.x = mouseX;
        }
        if (zoneMouseMode == "resizeTop") {
            selectedZone.zone.pos1.y = mouseY;
        }
        if (zoneMouseMode == "resizeBottom") {
            selectedZone.zone.pos2.y = mouseY;
        }
        if (zoneMouseMode == "resizetl") {
            selectedZone.zone.pos1.x = mouseX;
            selectedZone.zone.pos1.y = mouseY;
        }
        if (zoneMouseMode == "resizetr") {
            selectedZone.zone.pos2.x = mouseX;
            selectedZone.zone.pos1.y = mouseY;
        }
        if (zoneMouseMode == "resizebl") {
            selectedZone.zone.pos1.x = mouseX;
            selectedZone.zone.pos2.y = mouseY;
        }
        if (zoneMouseMode == "resizebr") {
            selectedZone.zone.pos2.x = mouseX;
            selectedZone.zone.pos2.y = mouseY;
        }
        if (zoneMouseMode == "move") {
            let xDif = mouseX - zoneMouseHelper.anchor.x;
            let yDif = mouseY - zoneMouseHelper.anchor.y;

            selectedZone.zone.pos1.x = zoneMouseHelper.pos1.x + xDif;
            selectedZone.zone.pos2.x = zoneMouseHelper.pos2.x + xDif;
            selectedZone.zone.pos1.y = zoneMouseHelper.pos1.y + yDif;
            selectedZone.zone.pos2.y = zoneMouseHelper.pos2.y + yDif;
        }


        if (selectedZone.zone.pos1.x > selectedZone.zone.pos2.x) selectedZone.zone.pos1.x = selectedZone.zone.pos2.x;
        if (selectedZone.zone.pos2.x < selectedZone.zone.pos1.x) selectedZone.zone.pos2.x = selectedZone.zone.pos1.x;
        if (selectedZone.zone.pos1.y > selectedZone.zone.pos2.y) selectedZone.zone.pos1.y = selectedZone.zone.pos2.y;
        if (selectedZone.zone.pos2.y < selectedZone.zone.pos1.y) selectedZone.zone.pos2.y = selectedZone.zone.pos1.y;
        renderZoneCanvas();
    }
}
$(".me_canvasHolder").on('mousemove', mousemovemethod);
$(".me_canvasHolder").on("click",function() {
    mouseDown = false;
    rightMouse = false;

    
    
})

$(".me_canvasHolder").on("mousedown",function(e) {
    mouseDown = e.which == 2 ? "wheel" : true;
    if (currentTab == "Spawn Zones" && showingZoneTypes.includes(selectedZone.type)) {
        let zone = selectedZone.zone;
        if (mouseX < zone.pos2.x && mouseX > zone.pos1.x && mouseY < zone.pos2.y && mouseY > zone.pos1.y) {
            $(".me_canvasHolder").classAdd("grabCursor");  
            if (!zoneMouseMode) {
                zoneMouseMode = "move";
                zoneMouseHelper = {
                    pos1: {
                        x: zone.pos1.x,
                        y: zone.pos1.y,
                    },
                    pos2: {  
                        x: zone.pos2.x,
                        y: zone.pos2.y,
                    },
                    anchor: {
                        x: mouseX,
                        y: mouseY,
                    }
                }
            }
        }
        
        if (!zoneMouseMode) {
            if (mouseX == zone.pos1.x && mouseY < zone.pos2.y && mouseY > zone.pos1.y) {
                zoneMouseMode = "resizeLeft";
            }
            if (mouseX == zone.pos2.x && mouseY < zone.pos2.y && mouseY > zone.pos1.y) {
                zoneMouseMode = "resizeRight";
            }
            if (mouseY == zone.pos1.y && mouseX < zone.pos2.x && mouseX > zone.pos1.x) {
                zoneMouseMode = "resizeTop";
            }
            if (mouseY == zone.pos2.y && mouseX < zone.pos2.x && mouseX > zone.pos1.x) {
                zoneMouseMode = "resizeBottom";
            }
            if (mouseX == zone.pos1.x && mouseY == zone.pos1.y) {
                zoneMouseMode = "resizetl";
            }
            if (mouseX == zone.pos1.x && mouseY == zone.pos2.y) {
                zoneMouseMode = "resizebl";
            }
            if (mouseX == zone.pos2.x && mouseY == zone.pos1.y) {
                zoneMouseMode = "resizetr";
            }
            if (mouseX == zone.pos2.x && mouseY == zone.pos2.y) {
                zoneMouseMode = "resizebr";
            }
        }
        
    }
})
$(".me_canvasHolder").on("mouseup",function() {
    mouseDown = false;
    zoneMouseMode = false;
    if (currentTab == "Spawn Zones" && showingZoneTypes.includes(selectedZone.type)) {
        $(".me_canvasHolder").classRemove("grabCursor");
    }
})
function adjustMousePos(e) {
    let rect = me_canvas_top.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    mouseX = Math.floor(x/(gridSize*zoom));
    mouseY = Math.floor(y/(gridSize*zoom));
}
$("me_canvas_top").on("mousemove",function(e) {
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
    
    if ((tool == "draw" || tool == "eraser") && currentTab !== "Spawn Zones") {
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
    
    if (tool == "select" && mouseDown === true && currentTab !== "Spawn Zones") {
        selectedCells.end = {
            x: mouseX,
            y: mouseY,
        }
    }
    
    if (mouseDown !== "wheel") renderZoneCanvas()
    renderTopCanvas();
})
$("me_canvas_top").on("mousedown",function(e) {
    var isRightMB;
    e = e || window.event;

    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2; 



    rightMouse = isRightMB;
    mouseDown = e.which == 2 ? "wheel" : true;

    
    if (tool == "select" && mouseDown === true && currentTab !== "Spawn Zones") {
        $(".me_s_holder_subtool").hide();
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
    if ((tool == "draw" || tool == "eraser") && mouseDown === true && currentTab !== "Spawn Zones") {
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
$("me_canvas_top").on("mouseup",function(e) {

    if (mouseDown === true && (tool == "draw" || tool == "eraser") && currentTab !== "Spawn Zones") {
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

    if (tool == "select" && mouseDown === true && currentTab !== "Spawn Zones") {
        $(".me_s_holder_subtool").show("flex");
        $(".subToolHolder").hide();
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
    if (tool == "bucket" && mouseDown === true && currentTab !== "Spawn Zones") {
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
                    
                    currentBoard.originalMap[i][j][selectedItem.type] = structuredClone(selectedItem.cell);
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
    let canvasList = ["me_canvas_background","me_canvas_tiles","me_canvas_emote_background","me_canvas_items","me_canvas_emote_foreground","me_canvas_top"];
    for (let i = 0; i < canvasList.length; i++) {
        $(canvasList[i]).style.marginLeft = xChange + "px";
        $(canvasList[i]).style.marginTop = yChange + "px";
    }
}
function changeZoom(delta) {
    if (delta < 0) zoom += 0.1;
    if (delta > 0) zoom -= 0.1;
    if (delta === 0) zoom = 1;

    if (zoom < 0.1) zoom = 0.1;

    adjustCanvasSize(board.width,board.height,zoom);
    checkRenderThenRender();
    renderTopCanvas();
    renderZoneCanvas();
    renderMapEditorCanvas(true);
    renderBackgroundCanvas();
}
$("me_canvas_top").on("mouseleave",function(e) {
    //mouseDown = false;
    //rightMouse = false;
})
$("me_canvas_top").on("contextmenu",function(e) {
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
                cell: structuredClone(getTile("grass")),
            }
        } else {
            selectedItem = {
                type: "item",
                content: getRealItem("pellet"),
                canEdit: true,
                path: false,
                cell: structuredClone(getRealItem("pellet")),
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
            else board.originalMap[i][j][selectedItem.type] = structuredClone(selectedItem.cell);
        }
    }

    checkRenderThenRender();
    
    if (tool == "select") return;

    clearSelection();
}
function saveBoard() {
    let html_saveStatus = $("saveStatus");
    currentBoard.itemDifferences = findItemDifferences(currentBoard.originalMap);
    currentBoard.tileDifferences = findTileDifferences(currentBoard.originalMap);

    if (Number(localAccount.tag) == Number(currentBoard.tag)) {
        //Save To Personal Boards
        socket.emit("saveBoard",pako.deflate(JSON.stringify(shortenBoard(currentBoard)), { to: 'string' }));
    }
        
    socket.emit("db_getAccountBoardStats");

    html_saveStatus.innerHTML = "Board Saved";
}
$("me_button").on("click",function() {
    socket.emit("db_getAccountBoardStats","MapEditor");

    if (localAccount.isInLobby) {
        makePopUp([
            {type: "title",text: "Save Board"},
            [
                {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", background: "blue",text:"Add To Lobby Boards",onClick: () => {
                    saveBoard(false);
                    socket.emit("addBoardToLobbyBoards",pako.deflate(JSON.stringify(shortenBoard(currentBoard)), { to: 'string' }));
                    socket.emit("changeServerBoard",pako.deflate(JSON.stringify(shortenBoard(currentBoard)), { to: 'string' }));
                    setScene("lobby");
                }},
                {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto", background: "green",text:"Add To Your Boards",onClick: () => {
                    saveBoard(false);
                    selectAllPlayerBoardsPopUp("lobby");
                }},
            ],
            {type: "button",close: true, cursor: "url('./img/pointer.cur'), auto", background: "red",text:"Discard Changes",onClick: () => {
                currentBoard.originalMap = resetMap;
                saveBoard(false);
                setScene("lobby");
            }},
        ],{
            exit: {
                cursor: "url('./img/pointer.cur'), auto",
            },
            id: "savePopUp",
        
        })
        return;
    }

    goBackHome(true);
})
function goBackHome(save) {
    if (save) saveBoard(true);
    setScene("newMenu");
    loadBoardMenu();
    
}

function loadObjectMenu() {
    let holder = $(".me_ih_settings");
    holder.innerHTML = "";
    $(".me_ih_name").innerHTML = selectedItem.cell.displayName;
    $(".me_ih_description").innerHTML = selectedItem.cell.description;
    $(".me_ih_skins").innerHTML = "";
    let fakeItem = structuredClone(selectedItem.cell);
    for (let i = 0; i < selectedItem.cell.availableSkins.length; i++) {
        fakeItem.skin = selectedItem.cell.availableSkins[i];
        let img = $(".me_ih_skins").create("img.itemSkinImg");
        img.src = getImage(fakeItem,"src");
        if (fakeItem.skin === selectedItem.cell.skin) img.classAdd("itemSkinImgSelected")

        img.skin = fakeItem.skin;
        img.on("click",function() {
            $(".itemSkinImg").classRemove("itemSkinImgSelected");
            this.classAdd("itemSkinImgSelected");
            selectedItem.cell.skin = this.skin;
        })
    }

    function addSetting(title,type,value,path,extra,extra2) {
        let settingHolder = holder.create("div");
        settingHolder.className = "settingHolder";
        let html_title = settingHolder.create("div");
        html_title.className = "settingTitle";
        html_title.innerHTML = title;
        if (type == "toggle") {
            let toggle = settingHolder.create("input");
            toggle.type = "checkbox";
            toggle.checked = value;
            toggle.path = path;
            toggle.on("change",function() {
                setValue(isSelectingOneCell(),selectedItem.cell,this.path,this.checked);
            })
        }
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
                setValue(isSelectingOneCell(),selectedItem.cell,this.path,Number(this.value));
            })
        }
        if (type == "dropdown") {
            let select = settingHolder.create("select");

            extra.forEach(value2 => {
                let option = document.createElement("option");
                option.value = value2;
                option.textContent = value2;
                if (value2 === value) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

            select.path = path;
            select.onchange = function() {
                setValue(isSelectingOneCell(),selectedItem.cell,this.path,this.value);
            }
        }
        if (type == "button") {
            let contentHolder = settingHolder.create("div#me_button2");
            contentHolder.innerHTML = extra;
            if (extra == false) contentHolder.innerHTML = value;

            contentHolder.on("click",function() {
                selectedItem.path = path;
                extra2()
            });
        }
        if (type == "status" || type == "statusFull") {
            let contentHolder = settingHolder.create("div");
            contentHolder.css({
                width: "50px",
                height: "50px",
                background: getColorFromTeam(value),
                cursor: "url('./img/pointer.cur'), auto",
                borderRadius: "5px",
                border: "2px solid black",
                color: "black",
                display: "flex",
                fontSize: "20px",
                alignItems: "center",
                justifyContent: "center",
            })

            if (value == "*P") {
                contentHolder.style.background = "white";
                contentHolder.innerHTML = "@P";
            }

            contentHolder.path = path;
            contentHolder.type = type;
            let showingAllStatusOptions = ["status"];
            if (type == "statusFull") showingAllStatusOptions.push("playerStatus");
            showingAllStatusOptions.push("close");
            contentHolder.on("click",function() {
                selectedItem.path = this.path;
                
                showStatusMenu(showingAllStatusOptions,{status: function(status) {
                    setValue(isSelectingOneCell(),selectedItem.cell,selectedItem.path,status);
                    checkRenderThenRender();
                    loadObjectMenu();
                    $(".statusSelectionScreen").hide();
                    $(".statusSelectionScreen").hide();
                }});
            })
        }
    }

    let object = selectedItem.cell;
    
    if (object.onCollision?.forcePlayerMove) {
        addSetting("Direction","dropdown",object.onCollision.forcePlayerMove,["onCollision","forcePlayerMove"],["left","right","up","down"]);
    }
    if (object.onCollision?.playSound && selectedItem.type == "tile") {
        addSetting("Play Sound","button",object.onCollision.playSound[0],["onCollision","playSound",0],false,function() {
            pianoPopUp(object.onCollision.playSound[0]);
        });
    }
    if (object.onCollision?.checkStatus?.check?.boardStatus) {
        addSetting("Board Status Required","statusFull",object.onCollision.checkStatus.check.boardStatus.name,["onCollision","checkStatus","check","boardStatus","name"]);
    }
    if (object.onCollision?.checkStatus?.check?.boardStatus) {
        addSetting("Board Status Count","number",object.onCollision.checkStatus.check.boardStatus.count,["onCollision","checkStatus","check","boardStatus","count"]);
    }
    if (object.onCollision?.checkStatus?.check?.playerTeamStatus) {
        addSetting("Player Team Required","status",object.onCollision.checkStatus.check.playerTeamStatus,["onCollision","checkStatus","check","playerTeamStatus"]);
    }

    if (object.onCollision?.switchBoardStatus) {
        addSetting("Toggle Board Status","status",object.onCollision.switchBoardStatus,["onCollision","switchBoardStatus"]);
    }
    if (object.onCollision?.checkStatus?.pass?.addBoardStatus) {
        addSetting("Add Board Status","statusFull",object.onCollision?.checkStatus?.pass?.addBoardStatus,["onCollision","checkStatus","pass","addBoardStatus"]);
    }
    if (object.onCollision?.addBoardStatus) {
        addSetting("Add Board Status","statusFull",object.onCollision?.addBoardStatus,["onCollision","addBoardStatus"]);
    }
    if (object.onCollision?.setBoardStatus) {
        addSetting("Set Board Status","statusFull",object.onCollision.setBoardStatus,["onCollision","setBoardStatus"]);
    }
    if (object.onCollision?.removeBoardStatus) {
        addSetting("Remove Board Status","statusFull",object.onCollision.removeBoardStatus,["onCollision","removeBoardStatus"]);
    }
    if (_type(object.onCollision?.checkStatus?.check?.snakeSize).type == "number") {
        addSetting("Snake Size Required","number",object.onCollision.checkStatus.check.snakeSize,["onCollision","checkStatus","check","snakeSize"]);
    }
    
    if (selectedItem.type !== "tile") addSetting("Visible","toggle",object.visible,["visible"]);

    
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
    let holder = $(".statusHolderLetters");
    let holder2 = $(".statusHolderPlayers");

    function createStatus(string,className,holder) {
        let backgroundColor = "white";
        if (className == "nonPlayer") {
            backgroundColor = string[1];
            if (string[0] == "white") return;
        }

        let contentHolder = holder.create("div");
        contentHolder.css({
            width: "50px",
            height: "50px",
            backgroundColor: backgroundColor,
            cursor: "url('./img/pointer.cur'), auto",
            borderRadius: "5px",
            border: "2px solid black",
            display: "inline-block",
        })

        if (className == "playerStatus") {
            contentHolder.status = string;
            let text = contentHolder.create("div");
            text.innerHTML = string; 
            text.css({
                width: "100%",
                color: "black",
                fontWeight: "bold",
                fontSize: "25px",
                lineHeight: "50px",
                textAlign: "center",
            })
        } else {
            contentHolder.status = string[0];
        }

        contentHolder.className = className;
        contentHolder.classAdd("statusOption_" + string[0])
        
        contentHolder.on("click",function() {
            $(".statusSelectionScreen").funcs.status(this.status,this);
        })
    }

    createStatus("*P","playerStatus",holder2);
    for (let i = 0; i < global_gameColors.length; i++) {
        createStatus(global_gameColors[i],"nonPlayer",holder);
    }
}
$(".status_button_finalize").on("click",function() {
    $(".statusSelectionScreen").funcs.final();
})
$(".popup_status_number").on("change",function() {
    $(".statusSelectionScreen").funcs.number(this.value);
})
function setValue(selectingOneCell,item,path,value,returnValue = false) {
    let ties = [];
    if (returnValue == true) return setNestedValue(item, path, value,true);
    setNestedValue(item, path, value);
    if (item.tie && returnValue !== "tie") ties = item.tie;
    
    if (selectingOneCell) {
        if (currentBoard.originalMap[selectedCells.start.y][selectedCells.start.x][selectedItem.type].id === item.id) {
            setNestedValue(
                currentBoard.originalMap[selectedCells.start.y][selectedCells.start.x][selectedItem.type],
                path,
                value
            );
        }
    }
    
    if (ties) {
        for (let h = 0; h < ties.length; h++) {
            let setPath = ties[h][1].subset(1,"end").split(".");
            
            setValue(selectingOneCell,item,setPath,setValue(selectingOneCell,item,ties[h][0].subset(1,"end").split("."),false,true),"tie");
        }
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
        $(".me_s_holder_subtool").show("flex");
        $(".subToolHolder").hide();
        $(".subTool_draw").show();
        setSubTool("brush");
        clearSelection();
    }
    if (tool == "select") {
        $(".me_s_holder_subtool").hide();
    }
    if (tool == "bucket") {
        $(".me_s_holder_subtool").show("flex");
        $(".subToolHolder").hide();
        $(".subTool_bucket").show();
        setSubTool("bucket");
    }
    if (tool == "move") {
        $(".me_s_holder_subtool").show("flex");
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
    if (!subTool) return;
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
            row.push(structuredClone(map[i][j]));
        }
        newBoard.push(row);
    }

    return newBoard;
}
function runTool(type,desiredValue) {
    if (type == "boardSettings") {
        $(".me_popup_boardSettings").show("flex");
        loadBoardGameModes($(".me_ih_gameModesHolder"),currentBoard.gameModes,"mapEditor");
    }
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
        currentBoard.originalMap = structuredClone(history[history.length-1]);
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
        renderMapEditorCanvas(true)
    }
    if (type == "show_grid") {
        showGrid = !showGrid;
        renderTopCanvas();

        if (showGrid) $(".show_grid_tool").classAdd("toolIsSelected");
        else $(".show_grid_tool").classRemove("toolIsSelected");
    }
    if (type == "show_grid2") {
        showFullGrid = !showFullGrid;
        renderTopCanvas();

        if (showFullGrid) $(".show_grid_tool2").classAdd("toolIsSelected");
        else $(".show_grid_tool2").classRemove("toolIsSelected");
    }
    if (type.subset(0,8) == "show_zone") {
        let zoneType = type.subset("zone_\\after","end");
        if (zoneType == "player") userClickedZonePlayer = !userClickedZonePlayer;
        if (zoneType == "item") userClickedZoneItem = !userClickedZoneItem;
        if (zoneType == "special") userClickedZoneSpecial = !userClickedZoneSpecial;
        let toggle;
        if (zoneType == "player") toggle = userClickedZonePlayer;
        if (zoneType == "item") toggle = userClickedZoneItem;
        if (zoneType == "special") toggle = userClickedZoneSpecial;
        if (toggle) addShowingZone(zoneType);
        else removeShowingZone(zoneType);
        fixClassOnShowZoneTools();
    }
}
function fixClassOnShowZoneTools() {
    $(".show_zone_icon").classRemove("toolIsSelected");
    for (let i = 0; i < showingZoneTypes.length; i++) {
        $(".show_zone_" + showingZoneTypes[i] + "_tool").classAdd("toolIsSelected");
    }
    renderZoneCanvas();
}
function onlyShowZone(type) {
    showingZoneTypes = [type];
    if (userClickedZonePlayer) addShowingZone("player");
    if (userClickedZoneItem) addShowingZone("item");
    if (userClickedZoneSpecial) addShowingZone("special");

    fixClassOnShowZoneTools();
}
function deselectAllShowingZones() {
    showingZoneTypes = [];
    if (userClickedZonePlayer) addShowingZone("player");
    if (userClickedZoneItem) addShowingZone("item");
    if (userClickedZoneSpecial) addShowingZone("special");

    fixClassOnShowZoneTools();
}
function addShowingZone(type) {
    for (let i = 0; i < showingZoneTypes.length; i++) {
        if (showingZoneTypes[i] == type) return
    }
    showingZoneTypes.push(type);
    fixClassOnShowZoneTools();
}
function removeShowingZone(type) {
    let newZones = [];
    for (let i = 0; i < showingZoneTypes.length; i++) {
        if (showingZoneTypes[i] !== type) newZones.push(showingZoneTypes[i]); 
    }
    showingZoneTypes = newZones;
    fixClassOnShowZoneTools();
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
                currentBoard.originalMap[i][j] = structuredClone(map[i-y][j-x]);
            else {
                if (type.includes("item")) currentBoard.originalMap[i][j].item = structuredClone(map[i-y][j-x].item);
                if (type.includes("tile")) currentBoard.originalMap[i][j].tile = structuredClone(map[i-y][j-x].tile);
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
        grid[r][c][selectedItem.type] = structuredClone(selectedItem.cell);

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



//HTML ON Click

$("me_name").on("click",function() {
    this.storedValue = this.value;
    this.value = "";
})
$("me_name").on("focusout",function() {
    if (this.value == "") this.value = this.storedValue;
})
$("me_name").on("change",function() {
    this.value = profanity.clean(this.value);
    if (this.value == "") return;
    currentBoard.name = this.value;
    saveBoard();
})
$("me_description").on("change",function() {
    this.value = profanity.clean(this.value);
    if (this.value == "") return;
    currentBoard.description = this.value;
    saveBoard();

})
$("me_background").on("click",function() {
    let holder = $(".backgroundSelectionScreen");
    if (holder.style.display !== "none") holder.hide();
    else {
        holder.show("flex");
        loadBackgroundContent(holder);
    }
})

function loadBackgroundContent(parent) {
    parent.innerHTML = "";
    let list = backgrounds;
    for (let i = 0; i < list.length; i++) {
        let holder = parent.create("div");
        holder.className = `me_background_holder`;
        holder.style.background = "url(img/backgrounds/" + list[i] + ".png)";

        let title = holder.create("div");
        title.innerHTML = list[i];
        title.className = "me_background_title";

        holder.object = list[i];
        holder.index = i;
        holder.on("click",function() {
            currentBoard.background = this.object;
            parent.hide();
            $("me_background").innerHTML = this.object;
            $("saveStatus").innerHTML = "Board Is Not Saved";
            renderBackgroundCanvas();
        })
    }
}
function makeSpawnZoneListing(type,selectingZoneIndex,zoneList,holder,zone,i) {
    let color = "#ffffff";
    if (type == "player") color = _color(zone.team).ogColor;
    if (type == "special") color = _color(zone.giveStatus).ogColor;

    let spawnZoneHolder = holder.create("div");
    spawnZoneHolder.className = "spawnZoneHolder playButtonSounds hover";
    spawnZoneHolder.css({
        background: color + "cc",
        border: "3px solid " + _color(color).darken(10).ogColor,
    })

    let spawnZoneID = spawnZoneHolder.create("div.spawnZoneID");
    spawnZoneID.className = "spawnZoneID";
    spawnZoneID.innerHTML = zone.id;

    if (selectingZoneIndex === i) spawnZoneHolder.classAdd("spawnZoneSelected")

    let rightIcons = spawnZoneHolder.create("div.spawnZoneRight");
    let editIcon = rightIcons.create("img.spawnZoneImg");
    editIcon.src = "img/menuIcons/edit.png";
    editIcon.on("click",function() {
        editZonePopup(type,zone);
    })

    let deleteIcon = rightIcons.create("img.spawnZoneImg");
    deleteIcon.src = "img/tool_delete.png";
    deleteIcon.on("click",function() {
        if (zoneList.length == 1 && (type == "player" || type == "item")) return;
        zoneList.splice(i,1);
        if (zoneList.length == 0) {
            selectingZoneIndex = false;
            selectedZone = {
                type: type,
                zoneIndex: false,
                zone: false,
            }
            generateZoneListings(type,selectingZoneIndex,zoneList);
            renderZoneCanvas();
            return;
        }
        selectingZoneIndex = 0;
        selectedZone = {
            type: type,
            zoneIndex: selectingZoneIndex,
            zone: zoneList[selectingZoneIndex],
        }
        generateZoneListings(type,selectingZoneIndex,zoneList);
        
        renderZoneCanvas();
    })
    

    spawnZoneHolder.on("click",function() {
        $(".spawnZoneHolder").classRemove("spawnZoneSelected");
        this.classAdd("spawnZoneSelected");
        selectedZone = {
            type: type,
            zoneIndex: i,
            zone: zone,
        }
        selectingZoneIndex = i;
        renderZoneCanvas();
    })

}
function editZonePopup(type,zone) {
    let content = $("spawn_zones_content");
    $(".editZonePopup").show("flex");
    $(".modernPopup_topRow_title_zones").innerHTML = type.format("A") + " Zone: " + zone.id;

    let a = false, b= false, c = false, d = false, e = false,f = false, g = false, h = false, i = false, j = false, k = false, l = false, m = false, n = false, o = false, p = false,q = false, r = false, s = false, t = false;
    a = createGamemodeSetting("Zone Name","input","id",{profanityClean: true,maxLength: 30,default: "player",placeholder: "Zone name..."},"What to reference the zone as.",false,false,false,(value) => {
        renderZoneCanvas();
        if (selectedZone.type == "player") {
            $(".modernPopup_topRow_title_zones").innerHTML = "Player Zone: " + value;
            generateZoneListings("player",savedSelectingZonePlayer,currentBoard.spawnZones.players);
        }
        if (selectedZone.type == "item") {
            $(".modernPopup_topRow_title_zones").innerHTML = "Item Zone: " + value;
            generateZoneListings("item",savedSelectingZoneItem,currentBoard.spawnZones.items);
        }
        if (selectedZone.type == "special") {
            $(".modernPopup_topRow_title_zones").innerHTML = "Special Zone: " + value;
            generateZoneListings("special",savedSelectingZoneSpecial,currentBoard.spawnZones.special);
        }
    });
    d = createGamemodeSetting("Visible","toggle","visible",{default: false},"Is this zone visible during gameplay",10,1);
    h = createGamemodeSetting("Advanced Display Editor","button",false,{text: "Open Editor", func: function() {
        $(".editZonePopup").hide();
        $(".zoneCustomizePopup").show("flex");
        loadCustomizeZonePopup();
    }},"Open our more advanced tool for customization!",10,2,{
        valueFromId: 1,
        equals: true,
    });
    if (type == "special") {
        q = createGamemodeSetting("Give Status On Enter","toggle","giveStatusOnEnter",{background: "#070738"},"When a snake enters this zone follow zone giving settings.",7,1);
        b = createGamemodeSetting("Give Status","status","giveStatus",{background: "#070738", readAs: "color",statusMenuOptions: ["status","playerStatus","submit"]},"Which status to give when snake enters zone",6,1,{
            valueFromFamily: 7,
            valueFromId: 1,
            equals: true,
        },() => {
            renderZoneCanvas();
            generateZoneListings("special",savedSelectingZoneSpecial,currentBoard.spawnZones.special);
        });
        r = createGamemodeSetting("Give Status From","list","giveStatusFrom",{background: "#070738", options: ["All Players","Random Player","Random Team","All Teams","Largest Team"]},"When zone gives players status who within zone should it pull from?",6,2,{
            valueFromFamily: 7,
            valueFromId: 1,
            equals: true,
        });
        f = createGamemodeSetting("Give Status When Occupied By","list","giveStatusWhenOccupiedBy",{background: "#070738", options: ["Solo Player","Solo Team","Everyone"]},"Only give the status when this zone is occupied by these people",false,false,{
            valueFromFamily: 7,
            valueFromId: 1,
            equals: true,
        });
        g = createGamemodeSetting("Give Status Type","list","giveStatusType",{background: "#070738", options: ["set","add","remove"]},"How does the zone give the status?",false,false,{
            valueFromFamily: 7,
            valueFromId: 1,
            equals: true,
        });
        s = createGamemodeSetting("Give Status Delay (Seconds)","number","giveStatusDelay",{background: "#070738"},"When snake enters how long do they need to stay in zone to have the zone give status",false,false,{
            valueFromFamily: 7,
            valueFromId: 1,
            equals: true,
        });
        c = createGamemodeSetting("Repeat Status Type","list","repeatStatusType",{background: "#070738", options: ["Repeat","Single Use"]},"How does this zone give another status after it already gave one",false,false,{
            valueFromFamily: 7,
            valueFromId: 1,
            equals: true,
        });
    }
    if (type == "item") {
        b = createGamemodeSetting("Manage Item Spawning","button",false,{text: "Manage",func: () => {
            loadItemSpawning();
        }},"Control which items are allowed to spawn here.");
    }
    if (type == "player") {
        
        q = createGamemodeSetting("Zone Team","status","team",{readAs: "color",statusMenuOptions: ["remove","status","submit"]},"Give team status to people who spawn here.",false,false,false,() => {
            renderZoneCanvas();
            generateZoneListings("player",savedSelectingZonePlayer,currentBoard.spawnZones.players);
        });
        b = createGamemodeSetting("Allow Respawning","toggle","respawnHere",{},"Can players respawn here if they're on the zones team?");
        c = createGamemodeSetting("Limit Spawning","toggle","spawnCap",{setTrueIfValueIsNumber: true,whenCheckedSet: {
            source: "spawnCap",
            value: 3,
        }, whenUncheckedSet: {
            source: "spawnCap",
            value: false,
        }},"Control how many snakes can spawn in this zone.",1,1);
        g = createGamemodeSetting("Spawn Cap","number","spawnCap",{min: 0, max: 100},"Amount of snakes allowed to spawn here. (Can be 0)",1,2,{
            valueFromId: 1,
            isNumber: true,
            onActiveSetValue: {
                value: 3,
            },
        })
        r = createGamemodeSetting("Spawn Priority","number","priority",{min: 0, max: 100},"Should snakes spawn here first or last? (Higher Number = Higher Priority");
        f = createGamemodeSetting("Alternate Spawning","toggle","alternate",{},"When spawning at the start of the game, should we alternate between this zone and others?");
    }

    e = createGamemodeSetting("Active","toggle","active",{},"Is this zone active at the start of the game");
    i = createGamemodeSetting("Active On Board Status","toggle","activateWhenBoardStatus",{setTrueIfValueIsObject: true,whenCheckedSet: {
        source: "activateWhenBoardStatus",
        value: {
            status: "red",
            count: 1,
        },
    }, whenUncheckedSet: {
        source: "activateWhenBoardStatus",
        value: false,
    }},"Allow a status to actiate this board.",2,1);
    m = createGamemodeSetting("Activation Status","status","activateWhenBoardStatus",{showNumber: true,readAs: "object",statusMenuOptions: ["status","count","submit"]},"Activate zone when board status is met",2,2,{
        valueFromId: 1,
        isObject: true,
        onActiveSetValue: {
            value: {
                status: "red",
                count: 1,
            },
        },
    })
    j = createGamemodeSetting("Deactive On Board Status","toggle","deactivateWhenBoardStatus",{setTrueIfValueIsObject: true,whenCheckedSet: {
        source: "deactivateWhenBoardStatus",
        value: {
            status: "red",
            count: 1,
        },
    }, whenUncheckedSet: {
        source: "deactivateWhenBoardStatus",
        value: false,
    }},"Allow a status to deactiate this board.",3,1);
    n = createGamemodeSetting("Deactivation Status","status","deactivateWhenBoardStatus",{showNumber: true,readAs: "object",statusMenuOptions: ["status","count","submit"]},"Deactivate zone when board status is met",3,2,{
        valueFromId: 1,
        isObject: true,
        onActiveSetValue: {
            value: {
                status: "red",
                count: 1,
            },
        },
    })
    k = createGamemodeSetting("Activate When Time Passes","toggle","activateWhenTimePassed",{setTrueIfValueIsNumber: true,whenCheckedSet: {
        source: "activateWhenTimePassed",
        value: 60,
    }, whenUncheckedSet: {
        source: "activateWhenTimePassed",
        value: false,
    }},"Allow a status to deactiate this board.",4,1);
    o = createGamemodeSetting("Time (Seconds)","number","activateWhenTimePassed",{},"Activate zone after this many seconds.",4,2,{
        valueFromId: 1,
        isNumber: true,
        onActiveSetValue: {
            value: 60,
        },
    })
    l = createGamemodeSetting("Deactivate When Time Passes","toggle","deactivateWhenTimePassed",{setTrueIfValueIsNumber: true,whenCheckedSet: {
        source: "deactivateWhenTimePassed",
        value: 60,
    }, whenUncheckedSet: {
        source: "deactivateWhenTimePassed",
        value: false,
    }},"Allow a status to deactiate this board.",5,1);
    p = createGamemodeSetting("Time (Seconds)","number","deactivateWhenTimePassed",{},"Deactivate zone after this many seconds.",5,2,{
        valueFromId: 1,
        isNumber: true,
        onActiveSetValue: {
            value: 60,
        },
    })

    let grid = [
        [a,b,c,d],
        [q,f,g,h],
        [e,r,s,t],
        [i,j,k,l],
        [m,n,o,p]
    ]

    createGamemodeGrid(content,4,5,grid,zone,"zones");
}

$(".me_ob_tab").on("click",function() {
    setObjectTab(this.innerHTML);
    $(".me_ob_tab").classRemove("me_ob_tab_selected");
    this.classAdd("me_ob_tab_selected");
})
$(".me_ob_sz_tr_tab").on("click",function() { //Player Zones / Item Zones Tabs On Click
    $(".me_ob_sz_tr_tab").classRemove("me_ob_sz_tr_tab_selected");
    this.classAdd("me_ob_sz_tr_tab_selected");
    let zone = this.id.subset(0,"_\\before");

    onlyShowZone(zone);

    if (zone == "item") generateZoneListings("item",savedSelectingZoneItem,currentBoard.spawnZones.items);
    if (zone == "player") generateZoneListings("player",savedSelectingZonePlayer,currentBoard.spawnZones.players);
    if (zone == "special") generateZoneListings("special",savedSelectingZoneSpecial,currentBoard.spawnZones.special);

})
function generateZoneListings(type,selectingIndex,zoneList) {
    $(".me_sz_zoneList").innerHTML = "";
    if (zoneList.length > 0) {
        selectedZone = {
            type: type,
            zoneIndex: selectingIndex,
            zone: zoneList[selectingIndex],
        }
    } else {
        selectedZone = {
            type: type,
            zoneIndex: false,
            zone: false,
        }
    }
    for (let i = 0; i < zoneList.length; i++) {
        makeSpawnZoneListing(type,selectingIndex,zoneList,$(".me_sz_zoneList"),zoneList[i],i);
    }
}

function setObjectTab(type) {
    currentTab = type;
    selectedObjectTab = type;
    $(".me_ob_column").hide();
    if (type == "Items" || type == "Tiles") $(".me_ob_itemsTiles").show("flex");
    if (type == "Spawn Zones") $(".me_ob_spawnZones").show("flex");

    if (type == "Items") {
        loadTagsList(localAccount.allowedItemIds,items,selectedItemTags);
        selectedItem = {
            type: "item",
            content: getItemById(savedSelectingItem),
            canEdit: true,
            path: false,
            cell: structuredClone(getItemById(savedSelectingItem)),
        }
        loadObjectMenu();
        $(".me_canvasHolder").classRemove("verticalResizeCursor");
        $(".me_canvasHolder").classRemove("horizontalResizeCursor");
        $(".me_canvasHolder").classRemove("nsCursor");
        $(".me_canvasHolder").classRemove("ewCursor");
        $(".me_canvasHolder").classRemove("grabCursor");
        $(".me_canvasHolder").classRemove("moveCursor");
        $(".me_s_holder_tools").show("flex");
        if (tool !== "select" || selectedCells.selecting)
            $(".me_s_holder_subtool").show("flex");
        deselectAllShowingZones();
    }
    if (type == "Tiles") {
        loadTagsList(localAccount.allowedTileIds,tiles,selectedTileTags);
        selectedItem = {
            type: "tile",
            content: getTileById(savedSelectingTile),
            canEdit: true,
            path: false,
            cell: structuredClone(getTileById(savedSelectingTile)),
        }
        loadObjectMenu();
        $(".me_canvasHolder").classRemove("verticalResizeCursor");
        $(".me_canvasHolder").classRemove("horizontalResizeCursor");
        $(".me_canvasHolder").classRemove("nsCursor");
        $(".me_canvasHolder").classRemove("ewCursor");
        $(".me_canvasHolder").classRemove("grabCursor");
        $(".me_canvasHolder").classRemove("moveCursor");
        $(".me_s_holder_tools").show("flex");
        if (tool !== "select" || selectedCells.selecting)
            $(".me_s_holder_subtool").show("flex");
        deselectAllShowingZones();
    }
    if (type == "Spawn Zones") {
        $(".me_sz_zoneList").innerHTML = "";
        $(".me_ob_sz_tr_tab").classRemove("me_ob_sz_tr_tab_selected");
        $("player_zone").classAdd("me_ob_sz_tr_tab_selected");
        generateZoneListings("player",0,currentBoard.spawnZones.players);
        $(".me_s_holder_tools").hide();
        $(".me_s_holder_subtool").hide();
        onlyShowZone("player");
    }
}
function loadTagsList(allowedIds,itemList,tagList) {
    let tags = [];
    for (let i = 0; i < itemList.length; i++) {
        let item = itemList[i];
        if (!allowedIds.includes(item.id)) continue;
        for (let j = 0; j < item.tags.length; j++) {
            if (!tags.includes(item.tags[j])) tags.push(item.tags[j]);
        }
    }

    let tagHolder = $(".me_obj_it_br_tagList");
    tagHolder.innerHTML = "";

    for (let i = 0; i < tags.length; i++) {
        let div = tagHolder.create("div.tagHolder");
        div.className = "tagHolder hover playButtonSounds";
        div.innerHTML = tags[i];

        if (tagList.includes(div.innerHTML)) {
            div.classAdd("tagSelected");
            div.selected = true;
        } else {
            div.selected = false;
        }

        div.on("click",function() {
            if (this.selected) {
                this.selected = false;
                this.classRemove("tagSelected")
                for (let i = 0; i < tagList.length; i++) {
                    if (tagList[i] == this.innerHTML) tagList.splice(i,1);
                }
            } else {
                this.selected = true;
                this.classAdd("tagSelected");
                tagList.push(this.innerHTML);
            }
            updateItemList(allowedIds,itemList,tagList);
        })
        
    }

    updateItemList(allowedIds,itemList,tagList);
}
function updateItemList(allowedIds,itemList,tagList) {
    let holder = $(".me_ob_it_br_itemsList");
    holder.innerHTML = "";

    let itemListOrdered = [];
    for (let i = 0; i < itemList.length; i++) {
        let item = itemList[i];
        if (!item.showInEditor) continue;
        if (allowedIds.includes(item.id)) {
            itemListOrdered.unshift(item);
        } else {
            itemListOrdered.push(item);
        }
    }
    itemList = itemListOrdered;

    for (let i = 0; i < itemList.length; i++) {
        let item = itemList[i];
        let hasAllowedTag = false;
        if (tagList.length == 0) hasAllowedTag = true;
        for (let j = 0; j < item.tags.length; j++) {
            if (tagList.includes(item.tags[j])) hasAllowedTag = true;
        }
        if (!hasAllowedTag) continue;

        let div = holder.create("div");
        div.className = "me_itemHolder hover";
        if (savedSelectingItem === item.id && item.type == "item") div.classAdd("me_itemHolder_selected")
        if (savedSelectingTile === item.id && item.type == "tile") div.classAdd("me_itemHolder_selected")
        

        let img = div.create("img");
        img.className = "me_itemImage";
        img.src = getImage(item,"src");

        if (!allowedIds.includes(item.id)) {
            div.classAdd("redScale");
            continue;
        }
        div.on("click",function() {
            if (item.type == "item") savedSelectingItem = item.id;
            if (item.type == "tile") savedSelectingTile = item.id;

            $(".me_itemHolder").classRemove("me_itemHolder_selected");
            this.classAdd("me_itemHolder_selected");
            selectedItem = {
                type: item.type,
                content: getById(item.type,item.id),
                canEdit: true,
                path: false,
                cell: structuredClone(getById(item.type,item.id)),
            }
            if (isSelectingOneCell()) {
                clearSelection();
            }
            loadObjectMenu();
        })
    }
}
function getById(type,id) {
    if (type == "item") return getItemById(id);
    if (type == "tile") return getTileById(id);
}
function getItemById(id) {
    for (let i = 0;i < items.length; i++) {
        if (items[i].id == id) return items[i];
    }
    return false;
}
function getTileById(id) {
    for (let i = 0;i < tiles.length; i++) {
        if (tiles[i].id == id) return tiles[i];
    }
    return false;
}
function showStatusMenu(showing,funcs,defaults = {}) {
    //Showing can equal ["status","playerStatus"]
    $(".status_popup_option").hide();
    for (let i = 0; i < showing.length; i++) {
        $(".status_popup_" + showing[i]).show("flex");
    }

    $(".nonPlayer").css({
        border: "2px solid black", 
    });

    if (defaults.number) {
        $(".popup_status_number").value = defaults.number;
    }
    if (defaults.status) {
        if (defaults.status === "white" || defaults.status == "*P") {

        } else {
            $(".statusOption_" + defaults.status).style.border = "2px solid blue";
        }
    }

    $(".statusSelectionScreen").funcs = funcs;
    $(".statusSelectionScreen").removeStatus = function() {
        if ($(".statusSelectionScreen").funcs.status) {
            $(".statusSelectionScreen").funcs.status("white");
        }
    }

    $(".statusSelectionScreen").show("flex");
}
$(".me_sz_addButton").on("click",function() {
    if (selectedZone.type == "special") {
        currentBoard.spawnZones.special.push({
            id: "special" + (currentBoard.spawnZones.special.length+1),
            pos1: {
                x: Math.round(currentBoard.width/4),
                y: Math.round(currentBoard.height/4),
            },
            pos2: {
                x: Math.round(currentBoard.width/4) + Math.round(currentBoard.width/4),
                y: Math.round(currentBoard.height/4) + Math.round(currentBoard.height/4),
            },
            giveStatusOnEnter: true,
            giveStatus: "*P",
            giveStatusFrom: "Largest Team",
            giveStatusType: "set",
            giveStatusDelay: 5,
            repeatStatusType: "Repeat",
            giveStatusWhenOccupiedBy: "Solo Team",
            displayStatusStats: true,

            visible: true,
            active: true,
            activateWhenBoardStatus: false,
            deactivateWhenBoardStatus: false,
            activateWhenTimePassed: false, //Seconds
            deactivateWhenTimePassed: false, //Seconds
        })

        savedSelectingZoneSpecial = currentBoard.spawnZones.special.length-1;
        selectedZone = {
            type: "special",
            zoneIndex: savedSelectingZoneSpecial,
            zone: currentBoard.spawnZones.special[savedSelectingZoneSpecial],
        }
        generateZoneListings("special",savedSelectingZoneSpecial,currentBoard.spawnZones.special);
    }
    if (selectedZone.type == "player") {
        currentBoard.spawnZones.players.push({
                id: "player" + (currentBoard.spawnZones.players.length+1),
                pos1: {
                    x: Math.round(currentBoard.width/4),
                    y: Math.round(currentBoard.height/4),
                },
                pos2: {
                    x: Math.round(currentBoard.width/4) + Math.round(currentBoard.width/4),
                    y: Math.round(currentBoard.height/4) + Math.round(currentBoard.height/4),
                },
                team: "white",
                spawnCap: false,
                respawnHere: true,
                priority: 0,
                alternate: true,

                visible: false,
                active: true,
                activateWhenBoardStatus: false,
                deactivateWhenBoardStatus: false,
                activateWhenTimePassed: false, //Seconds
                deactivateWhenTimePassed: false, //Seconds
            })

        savedSelectingZonePlayer = currentBoard.spawnZones.players.length-1;
        selectedZone = {
            type: "player",
            zoneIndex: savedSelectingZonePlayer,
            zone: currentBoard.spawnZones.players[savedSelectingZonePlayer],
        }
        generateZoneListings("player",savedSelectingZonePlayer,currentBoard.spawnZones.players);
    }
    if (selectedZone.type == "item") {
        currentBoard.spawnZones.items.push({
            id: "item" + (currentBoard.spawnZones.items.length+1),
            pos1: {
                x: Math.round(currentBoard.width/4),
                y: Math.round(currentBoard.height/4),
            },
            pos2: {
                x: Math.round(currentBoard.width/4) + Math.round(currentBoard.width/4),
                y: Math.round(currentBoard.height/4) + Math.round(currentBoard.height/4),
            },
            itemsThatCantSpawnHere: [],

            visible: false,
            active: true,
            activateWhenBoardStatus: false,
            deactivateWhenBoardStatus: false,
            activateWhenTimePassed: false, //Seconds
            deactivateWhenTimePassed: false, //Seconds
        })

        savedSelectingZoneItem = currentBoard.spawnZones.items.length-1;
        selectedZone = {
            type: "item",
            zoneIndex: savedSelectingZoneItem,
            zone: currentBoard.spawnZones.items[savedSelectingZoneItem],
        }
        generateZoneListings("item",savedSelectingZoneItem,currentBoard.spawnZones.items);
    }
    renderZoneCanvas();
})
$(".closeBoardSettings").on("click",function() {
    this.$P().hide();
})
function loadItemSpawning() {
    let holder = $(".me_itemSpawning_list");
    holder.innerHTML = "";

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (!localAccount.allowedItemIds.includes(item.id)) continue;

        let div = holder.create("div");
        div.className = "me_itemHolder2 hover";

        let img = div.create("img");
        img.className = "me_itemImage2";
        img.src = getImage(item,"src");

        if (!selectedZone.zone.itemsThatCantSpawnHere.includes(item.id)) {
            div.classRemove("notAllowedItem")
        } else {
            div.classAdd("notAllowedItem")
        }

        div.on("click",function() {
            if (this.classList.contains("notAllowedItem")) {
                this.classRemove("notAllowedItem")
                for (let i = 0; i < selectedZone.zone.itemsThatCantSpawnHere.length; i++) {
                    if (selectedZone.zone.itemsThatCantSpawnHere[i] === item.id) selectedZone.zone.itemsThatCantSpawnHere.splice(i,1);
                }
            } else {
                this.classAdd("notAllowedItem")
                selectedZone.zone.itemsThatCantSpawnHere.push(item.id);
            }
        })
    }
    $(".me_itemSpawning_popup").show("flex");
}
$(".status_button_remove").on("click",function() {
    $(".statusSelectionScreen").removeStatus();
})
$(".status_button_close").on("click",function() {
    $(".statusSelectionScreen").hide();
})
function pianoPopUp(value) {
    if (!value) allPianoKeys = [];
    if (value) $(".pianoSelectionPopUp").show("flex");
    let whiteKeysHolder = $(".whiteKeys");
    whiteKeysHolder.innerHTML = "";
    whiteKeysHolder.chosenValue = value;

    let keys = ["C","D","E","F","G","A","B"];

    //Building White Keys
    for (let i = 0; i < 40; i++) {
        let keysHolder = whiteKeysHolder.create("div.key_holder");
        let whiteKey = keysHolder.create("div.key_whiteKey");
        whiteKey.id = "key_white";
        whiteKey.classAdd("hover2");
        let keyText = whiteKey.create("div.key_text");
        keyText.id = "key_white";

        let key = keys[i % 7];
        let octive = Math.floor(i/7)+1;

        keyText.innerHTML = key + octive;
        if (!value) allPianoKeys.push(key + octive);

        if (keyText.innerHTML == value) whiteKey.classAdd("key_selected");

        let blackKey;
        if (["A","B","D","E","G"].includes(key)) {
            blackKey = keysHolder.create("div.key_blackKey");
            blackKey.id = "key_black";
            blackKey.classAdd("hover2");
            let blackKeyText = blackKey.create("div.key_text2");
            blackKeyText.id = "key_black";
            blackKeyText.innerHTML = key + "b" + octive;
            if (!value) allPianoKeys.push(key + "b" + octive);

            if (blackKeyText.innerHTML == value) blackKey.classAdd("key_selected");
            
            blackKey.on("click",function() {
                $(".key_chosen").classRemove("key_chosen");
                blackKey.classAdd("key_chosen");
                playAudio("./sounds/piano/piano_" + key + "b" + octive + "_1.mp3","sfx");
                whiteKeysHolder.chosenValue = key + "b" + octive;
            })
        }

        whiteKey.on("click",function(e) {
            $(".key_chosen").classRemove("key_chosen");
            whiteKey.classAdd("key_chosen");
            playAudio("./sounds/piano/piano_" + key + octive + "_1.mp3","sfx");
            whiteKeysHolder.chosenValue = key + octive;
        })

    }
}
$(".closePianoPopUp").on("click",function() {
    setValue(isSelectingOneCell(),selectedItem.cell,selectedItem.path,$(".whiteKeys").chosenValue);
    checkRenderThenRender();
    loadObjectMenu();
})

//Generating Piano Keys
pianoPopUp(false)
function shuffleArray(arr) {  
    return arr.map((v, i) => [v, Math.sin(i) * 10000 % 1])  
              .sort((a, b) => a[1] - b[1])  
              .map(v => v[0]);  
}  

function generateKeyMapping(keys) {  
    let shuffled = shuffleArray(keys);  
    return Object.fromEntries(shuffled.map((key, i) => [key, (360 / keys.length) * i]));  
}  
keyMapping = generateKeyMapping(allPianoKeys);  
function loadBoardGameModes(gameModesHolder,gameModes,sentFrom) {
    gameModesHolder.innerHTML = "";

    function generateGameMode(gameMode,index) {
        let holder = gameModesHolder.create("div.me_gm_holder");

        let name = holder.create("div.me_gm_name");
        name.innerHTML = gameMode.name;

        let rightOptions = holder.create("div.me_gm_right");

        function addSetting(src,func) {
            let imgHolder = rightOptions.create("div.me_gm_imgHolder");
            let img = imgHolder.create("img.me_gm_img");
            img.src = "img/menuIcons/" + src + ".png";
            imgHolder.on("click",func);
        }

        if (sentFrom == "mapEditor") {
            addSetting("edit",() => {
                editGameMode(gameMode,false,() => {
                    loadBoardGameModes(gameModesHolder,gameModes,sentFrom);
                });
            })
            if (gameModes.length > 1) {
                addSetting("delete",() => {
                    gameModes.splice(index,1);
                    loadBoardGameModes(gameModesHolder,gameModes,sentFrom);
                })
                if (index !== gameModes.length-1) {
                    addSetting("selectDown",() => {
                        let removedGameMode = gameModes.splice(index,1)[0];
                        gameModes.splice(index+1,0,removedGameMode);
                        loadBoardGameModes(gameModesHolder,gameModes,sentFrom);
                    })
                }
                if (index !== 0) {
                    addSetting("selectUp",() => {
                        let removedGameMode = gameModes.splice(index,1)[0];
                        gameModes.splice(index-1,0,removedGameMode);
                        loadBoardGameModes(gameModesHolder,gameModes,sentFrom);
        
                    })
                }
            }
        }
        if (sentFrom == "lobby") {
            addSetting("select",() => {
                gameModesHolder.hide();
                socket.emit("changeServerGameMode",gameModes[index]);
            })
        }
        
    }

    for (let i = 0; i < gameModes.length; i++) {
        generateGameMode(gameModes[i],i);
    }

    if (sentFrom == "mapEditor") {
        if (gameModes.length < 5) {
            let plus = gameModesHolder.create("div.me_gm_plus");
            plus.innerHTML = "+";
    
            plus.on("click",() => {
                gameModes.push(structuredClone(presetGameModes[0]));
                loadBoardGameModes(gameModesHolder,gameModes,sentFrom);
            })
        }
    }

} 





let customizeZone_isDragging = false;
let customizeZone_offsetX = 0;
let customizeZone_offsetY = 0;
$(".zcp_topRow").on('mousedown', (e) => {
    customizeZone_isDragging = true;
    const rect = $(".zoneCustomizePopup").getBoundingClientRect();
    customizeZone_offsetX = e.clientX - rect.left;
    customizeZone_offsetY = e.clientY - rect.top;
});
document.on('mousemove', (e) => {
    if (!customizeZone_isDragging) return;
    $(".zoneCustomizePopup").style.left = `${e.clientX - customizeZone_offsetX}px`;
    $(".zoneCustomizePopup").style.top = `${e.clientY - customizeZone_offsetY}px`;
});
document.addEventListener('mouseup', () => {
    customizeZone_isDragging = false;
});
$(".zcp_closeIcon").on("click",function() {
    $(".zoneCustomizePopup").hide();
})
$(".zcp_backIcon").on("click",function() {
    this.goBack();
})
function loadCustomizeZonePopup() {
    if (!selectedZone.zone.display) {
        selectedZone.zone.display = [
            getZoneDisplayObject("background"),
            getZoneDisplayObject("textBox")
        ];
        if (selectedZone.type == "item") {
            selectedZone.zone.display[0].backgroundColor = "white";
            selectedZone.zone.display[0].border.color = "#bfbfbf";
        }
    }

    let holder = $(".zcp_list");
    holder.innerHTML = "";
    $(".zcp_tr_title").innerHTML = "Zone Elements";
    $(".zcp_backIcon").goBack = function() {
        $(".zoneCustomizePopup").hide();
        editZonePopup(selectedZone.type,selectedZone.zone);
    }

    let displayList = selectedZone.zone.display;
    for (let i = 0; i < displayList.length; i++) {
        let addNewOption = holder.create("div.zcp_displayOption");
        let addNewText = addNewOption.create("div.zcp_displayOption_text");
        addNewText.innerHTML = standardizeText(displayList[i].type);

        addNewOption.on("click",function(e) {
            if (e.target.classList.contains("zcp_displayOption_deleteIcon")) return;
            loadCustomizeZoneSettings(displayList[i],i);
        })

        if (displayList[i].type !== "background") {
            let deleteElement = addNewOption.create("img.zcp_displayOption_deleteIcon");
            deleteElement.src = "img/tool_delete.png";
            deleteElement.on("click",function() {
                selectedZone.zone.display.splice(i,1);
                loadCustomizeZonePopup();
                $("saveStatus").innerHTML = "Board Is Not Saved";
            })
        }
    }

    if (displayList.length > 10) return;

    let addNewOption = holder.create("div.zcp_displayOption");
    let leftHolder = addNewOption.create("div.zcp_displayOption_leftHolder"); 
    let addNewImage = leftHolder.create("img.zcp_displayOption_add");
    addNewImage.src = "img/menuIcons/add.png";
    let addNewText = leftHolder.create("div.zcp_displayOption_text");
    addNewText.innerHTML = "Add New";
    addNewOption.on("click",function() {
        addNewCustomizeZoneOption();
    })

    holder.create("div");
}
function loadCustomizeZoneSettings(settings,index) {
    $(".zcp_tr_title").innerHTML = "Customize Element";
    let holder = $(".zcp_list");
    holder.innerHTML = "";
    $(".zcp_backIcon").goBack = function() {
        loadCustomizeZonePopup();
    }

    let listOptions = Object.keys(settings);

    function addSetting(holder,title,type,extra) {
        let settingHolder = holder.create("div.zcp_customizeHolder_settingHolder");
        let settingTitle = settingHolder.create("div.zcp_customizeHolder_settingHolder_title");
        settingTitle.innerHTML = standardizeText(title) + ":";

        let input, value = getNestedValue(settings,title);

        if (type == "list") {
            input = settingHolder.create("select.zcp_customizeHolder_settingHolder_" + type);
            input.value = value;
            
            extra.forEach(optionText => {
                const option = document.createElement('option');
                option.value = optionText;
                option.text = standardizeText(optionText);
                input.appendChild(option);
            });
            input.addEventListener("change",function() {
                setNestedValue(settings,title,this.value);
                $("saveStatus").innerHTML = "Board Is Not Saved";
                renderZoneCanvas();
            })
        }
        if (type == "number") {
            input = settingHolder.create("input.zcp_customizeHolder_settingHolder_" + type);
            input.type = "number";
            input.value = value;
            input.storedValue;
            input.on("click",function() {
                this.storedValue = this.value;
                this.value = "";
                this.placeholder = this.value;
            })
            input.on("blur",function() {
                this.value = this.storedValue;
            })
            input.on("change",function() {
                let value = Number(this.value);
                if (extra?.min) if (value < extra.min) value = extra.min;
                if (extra?.max) if (value > extra.max) value = extra.max;
                this.storedValue = value;
                console.log(settings,title,value)
                setNestedValue(settings,title,value);
                $("saveStatus").innerHTML = "Board Is Not Saved";
                renderZoneCanvas();
            })

        }
        if (type == "text") {
            input = settingHolder.create("input.zcp_customizeHolder_settingHolder_" + type);
            input.value = value;
            input.storedValue;
            input.on("click",function() {
                this.storedValue = this.value;
                this.value = "";
                this.placeholder = this.value;
            })
            input.on("blur",function() {
                this.value = this.storedValue;
            })
            input.on("change",function() {
                let value = profanity.clean(this.value);
                this.storedValue = value;
                setNestedValue(settings,title,value);
                $("saveStatus").innerHTML = "Board Is Not Saved";
                renderZoneCanvas();
            })
        }
        if (type == "slider") {
            input = settingHolder.create("input.zcp_customizeHolder_settingHolder_" + type);
            input.type = "range";
            input.min = extra.min;
            input.max = extra.max;
            input.value = value;
            input.on("change",function() {
                setNestedValue(settings,title,this.value);
                $("saveStatus").innerHTML = "Board Is Not Saved";
                renderZoneCanvas();
            })
        }
    }

    let settingHolder
    //Generic
    settingHolder = holder.create("div.zcp_customizeHolder");
    if (listOptions.includes("display")) {
        addSetting(settingHolder,"display","list",["foreground","background"]);
    }
    if (listOptions.includes("position")) {
        addSetting(settingHolder,"position.location","list",["topLeft","topCenter","topRight","leftCenter","center","rightCenter","bottomLeft","bottomCenter","bottomRight"]);
        addSetting(settingHolder,"position.offSetX","number");
        addSetting(settingHolder,"position.offsetY","number");
        addSetting(settingHolder,"position.rotation","slider",{min: 0, max: 360});
    }
    //Element Specific
    if (listOptions.includes("border")) {
        settingHolder = holder.create("div.zcp_customizeHolder")
        addSetting(settingHolder,"border.color","text");
        addSetting(settingHolder,"border.width","number");
        addSetting(settingHolder,"border.radius","slider",{min: 0, max: 200});
    }

    if (listOptions.includes("text") || listOptions.includes("font"))
        settingHolder = holder.create("div.zcp_customizeHolder")
    if (listOptions.includes("text")) {
        addSetting(settingHolder,"text","text");
    }
    if (listOptions.includes("font")) {
        addSetting(settingHolder,"font.family","text");
        addSetting(settingHolder,"font.color","text");
        addSetting(settingHolder,"font.size","number",{mix: 0, max: 100});
        addSetting(settingHolder,"font.textAlign","list",["center","left","right"]);
        addSetting(settingHolder,"font.textBaseline","list",["top","middle","bottom","alphabetic","hanging"]);
    }
    if (listOptions.includes("timerFormat")) {
        settingHolder = holder.create("div.zcp_customizeHolder")
        addSetting(settingHolder,"timerFormat","text");
    }
    
    if (listOptions.includes("backgroundColor") || listOptions.includes("foregroundColor"))
        settingHolder = holder.create("div.zcp_customizeHolder")
    if (listOptions.includes("backgroundColor")) {
        addSetting(settingHolder,"backgroundColor","text");
    }
    if (listOptions.includes("foregroundColor")) {
        addSetting(settingHolder,"foregroundColor","text");
    }

}
function addNewCustomizeZoneOption() {
    let type = selectedZone.type;

    let availableOptions = ["background","textBox"];

    if (type == "special") {
        availableOptions = availableOptions.concat(["textTimer","barTimer","circleTimer","statusList"]);
    }
    if (type == "player") {
        availableOptions = availableOptions.concat([]);
    }
    if (type == "item") {
        availableOptions = availableOptions.concat(["allowedItems","notAllowedItems"]);
    }

    let holder = $(".zcp_list");
    holder.innerHTML = "";
    $(".zcp_backIcon").goBack = function() {
        loadCustomizeZonePopup();
    }

    $(".zcp_tr_title").innerHTML = "Add Zone Element";

    for (let i = 0; i < availableOptions.length; i++) {
        let container = holder.create("div.zcp_addOption");
        container.innerHTML = standardizeText(availableOptions[i]);
        container.on("click",function() {
            selectedZone.zone.display.push(getZoneDisplayObject(availableOptions[i]));
            $("saveStatus").innerHTML = "Board Is Not Saved";
            loadCustomizeZoneSettings(selectedZone.zone.display[selectedZone.zone.display.length-1],selectedZone.zone.display.length-1);
        })
    }
}
function getZoneDisplayObject(text) {
    switch (text) {
        case "background": return {
            type: "background",
            display: "background", 
            backgroundColor: ".team",
            border: {
                color: ".team.darken(20)",
                width: 3,
                radius: 0,
            },
        }
        case "textBox": return {
            type: "textbox",
            display: "background",
            text: ".id",
            font: {
                family: "VT323",
                color: "black",
                size: 20,
                textAlign: "center",
                textBaseline: "middle",
            },
            position: {
                offSetX: 0,
                offSetY: 0,
                rotation: 0,
                location: "center",
            }
        }
        case "textTimer": return {
            type: "textTimer",
            display: "foreground",
            timerFormat: "MM:SS",
            font: {
                family: "VT323",
                color: "black",
                size: 20,
                textAlign: "center",
                textBaseline: "middle",
            },
            position: {
                offSetX: 0,
                offSetY: 0,
                rotation: 0,
                location: "topCenter",
            }
        }
        case "barTimer": return {
            type: "barTimer",
            display: "foreground",
            position: {
                offSetX: 0,
                offSetY: 0,
                rotation: 0,
                location: "topCenter",
            },
            backgroundColor: "white",
            foregroundColor: "lightblue",
            border: {
                color: "black",
                width: 2,
                radius: 0,
            },
        }
        case "circleTimer": return {
            type: "circleTimer",
            display: "foreground",
            position: {
                offSetX: 0,
                offSetY: 0,
                rotation: 0,
                location: "topCenter",
            },
            backgroundColor: "white",
            foregroundColor: "lightblue",
            border: {
                color: "black",
                width: 2,
                radius: 0,
            },
        }
        case "statusList": return {
            type: "circleTimer",
            display: "foreground",
            position: {
                offSetX: 0,
                offSetY: 0,
                rotation: 0,
                location: "topCenter",
            },
        }
        case "allowedItems": return {
            type: "allowedItems",
            display: "foreground",
            position: {
                offSetX: 0,
                offSetY: 0,
                rotation: 0,
                location: "topCenter",
            },
        }
        case "notAllowedItems": return {
            type: "notAllowedItems",
            display: "foreground",
            position: {
                offSetX: 0,
                offSetY: 0,
                rotation: 0,
                location: "topCenter",
            },
        }
    }
}