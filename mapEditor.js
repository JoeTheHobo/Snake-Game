let selectedItem = {
    type: "item",
    content: getRealItem("pellet"),
}
let board;
let mouseDown = false;
let rightMouse = false;
let mouseX;
let mouseY;

function openMapEditor(boardComingIn) {
    board = boardComingIn;
    setScene("mapEditor");

    me_loadDropdown($(".me_itemsContent"),items,"item_");
    me_loadDropdown($(".me_tilesContent"),tiles,"tile_");

    setResolution(board.width,board.height);
    renderMapEditorCanvas();
}
function me_loadDropdown(holder,group,name) {
    holder.innerHTML = "";
    for (let i = 0; i < group.length; i++) {
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
        itemHolder.on("click",function() {
            selectedItem = {
                type: this.type,
                content: this.content,
            }

            $(".me_itemHolder").classRemove("me_goldBorder");
            this.classList.add("me_goldBorder");
        })
    }
}
function renderMapEditorCanvas() {
    me_ctx.clearRect(0,0,me_canvas.width,me_canvas.height)
    for (let i = 0; i < board.map.length; i++) {
        for (let j = 0; j < board.map[i].length; j++) {
            me_updateCell(j,i)
        }
    }
}
function me_updateCell(x,y) {
    let cell = board.map[y][x];

    if (cell.tile) {
        me_ctx.drawImage($("tile_" + cell.tile.name),gridSize*x,gridSize*y,gridSize,gridSize);
    }
    if (cell.item) {
        me_ctx.drawImage($("item_" + cell.item.name),gridSize*x,gridSize*y,gridSize,gridSize);
    }

    if (cell.mouseOver) {
        me_ctx.strokeStyle = "blue";
        me_ctx.strokeRect(gridSize*x,gridSize*y,gridSize,gridSize);
    }

    ls.save("boards",boards);
}
$("me_canvas").on("mousemove",function(e) {
    let rect = me_canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    mouseX = Math.floor(x/gridSize);
    mouseY = Math.floor(y/gridSize);

    for (const row of board.map) {
        for (const cell of row) {
            cell.mouseOver = false;
        }
    }

    if (!board.map[mouseY]) return;
    else if (!board.map[mouseY][mouseX]) return;

    board.map[mouseY][mouseX].mouseOver = true;

    if ((mouseDown || rightMouse) && selectedItem) {
        if (rightMouse) {
            board.map[mouseY][mouseX][selectedItem.type] = selectedItem.type == "tile" ? getTile("clear") : false;
        } else {
            board.map[mouseY][mouseX][selectedItem.type] = selectedItem.content;
        }
        me_updateCell(mouseX,mouseY);
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
$("me_canvas").on("click",function(e) {
    if (selectedItem) {
        board.map[mouseY][mouseX][selectedItem.type] = selectedItem.content;
        renderMapEditorCanvas();
    }
})
$("me_canvas").on("mouseleave",function(e) {
    mouseDown = false;
    rightMouse = false;
})