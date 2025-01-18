let selectedItem = {
    type: "item",
    content: getRealItem("pellet"),
    canEdit: true,
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

function openMapEditor(boardComingIn) {
    board = boardComingIn;
    setScene("mapEditor");
    $("me_name").value = board.name;

    me_loadDropdown($(".me_itemsContent"),items,"item_");
    me_loadDropdown($(".me_tilesContent"),tiles,"tile_");

    setResolution(board.width,board.height);
    renderMapEditorCanvas();

    saveBoard();
    saveInterval = setInterval(function() {
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
        itemHolder.content = group[i];
        itemHolder.id = "me_" + name + group[i].name;
        itemHolder.on("click",function() {
            selectedItem = {
                type: this.type,
                content: this.content,
                canEdit: true,
            }

            $(".me_itemHolder").classRemove("me_goldBorder");
            this.classList.add("me_goldBorder");
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
            if (selectedItem.content.name === items[i].name && selectedItem.type == "item") selectedItem.canEdit = false;
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
        me_ctx.drawImage($("item_" + cell.item.name),gridSize*x,gridSize*y,gridSize,gridSize);
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
    
    if ((mouseDown || rightMouse) && selectedItem) {
        if (rightMouse) {
            board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
        } else if (selectedItem.canEdit) {
            board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.content;
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

    board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
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
        board.originalMap[mouseY][mouseX][selectedItem.type] = selectedItem.content;
        renderMapEditorCanvas();
        $("saveStatus").innerHTML = "Board Is Not Saved";
    }
})
$("me_canvas").on("mouseleave",function(e) {
    mouseDown = false;
    rightMouse = false;
})
document.on('keydown', (e) => {
    // Check if Ctrl and S are pressed
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault(); // Prevent the default save action
        saveBoard();
    }
    
    shiftDown = e.shiftKey;
    if (shiftDown) renderMapEditorCanvas();
});
document.on("keyup",function(e) {
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
            else board.originalMap[i][j][selectedItem.type] = selectedItem.content;
        }
    }

    renderMapEditorCanvas();
    
    fill = {
        pointA: false,
        pointB: false,
        delete: false,
    }
}
function saveBoard() {
    let html_saveStatus = $("saveStatus");
    ls.save("boards",boards);

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
    ls.save("boards",boards);
})