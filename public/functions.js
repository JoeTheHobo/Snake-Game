ls.setID("snakegame");

let killSwitch = false;


let showPerformance = false;

let updateCells = [];
let updateSnakeCells = [];
let updateZones = [];
let existingZones = [];

let activePlayers;
let activePlayerCount = [];
let oldBoardStatus = [];
//End Players

let timer, gameEnd;
let gamePaused = false;
let isActiveGame = false;
let doColorRender = false;
let snakeSkins = ["classic"];
let snakeSkinCanvasObj = {};
let bodyParts = ["body","tail","turn","head"];
for (let i = 0; i < snakeSkins.length; i++) {
    for (let j = 0; j < bodyParts.length; j++) {
        let img = $(".imageHolder").create("img");
        img.src = `img/snakeSkins/${snakeSkins[i]}/snake_${snakeSkins[i]}_${bodyParts[j]}.png`;
        img.id = `img_snakeSkin_${snakeSkins[i]}_${bodyParts[j]}`;
        let imgOutline = $(".imageHolder").create("img");
        imgOutline.src = `img/snakeSkins/${snakeSkins[i]}/snake_${snakeSkins[i]}_${bodyParts[j]}_outline.png`;
        imgOutline.id = `img_snakeSkin_${snakeSkins[i]}_${bodyParts[j]}_outline`;
    }
}
setTimeout(function() {
    loadSnakeSkins();
},3000);
//Setting up colors

function getColorFromTeam(color) {
    if (color == "white") return "#ffffff";
    if (color == "aquamarine") return "#61f3cc";
    if (color == "blue") return "#25008f";
    if (color == "buff") return "#f7d082";
    if (color == "coral") return "#f07a7d";
    if (color == "crimsonpurple") return "#e33bf1";
    if (color == "gold") return "#ccbb00";
    if (color == "green") return "#3e9000";
    if (color == "lemon") return "#e0ff00";
    if (color == "lime") return "#6ff600";
    if (color == "magenta") return "#85008f";
    if (color == "orange") return "#f29900";
    if (color == "pink") return "#e8006f";
    if (color == "red") return "#ee0013";
    if (color == "skyblue") return "#85d0ff";
    if (color == "slateblue") return "#7564ff";
    if (color == "venom") return "#6b7a00";
}
//End Colors


let gridSize;
function setResolution(gridx, gridy) {
    let height = $(".game_cc_game").getBoundingClientRect().height-10;
    gridSize = Math.floor(height/gridy);

    //setGridSize(cameraFollowPlayer === false ? .17 : .32);
    adjustCanvasSize(gridx,gridy,1);
}

function setGridSize(size) {
    const getPPI = () => {
        // Screen dimensions in inches (calculated using screen width and height in pixels and the screen diagonal in inches)
        const screenWidth = window.screen.width; // Screen width in pixels
        const screenHeight = window.screen.height; // Screen height in pixels
        const screenDiagonalInches = 15.6; // Example for a 15.6-inch screen diagonal. Replace with actual size if known.
      
        const screenDiagonalPixels = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
        return screenDiagonalPixels / screenDiagonalInches;
      };
      const inchesToPixels = (inches, ppi) => inches * ppi;
      const setPhysicalSize = (sizeInInches) => {
        const ppi = getPPI();
        const sizeInPixels = inchesToPixels(sizeInInches, ppi);
        return sizeInPixels;
      };
    
      gridSize = Math.floor(setPhysicalSize(size));
}
setGridSize(.17);
  

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;

//Setting Up Canvas
$(".local_bottom_canvas").width = 142;
$(".local_bottom_canvas").height = 80;
let canvas_background = $("render_background");
let ctx_background = canvas_background.getContext("2d");
let canvas_emote_background = $("render_emote_background");
let ctx_emote_background = canvas_emote_background.getContext("2d");
let canvas_tiles = $("render_tiles");
let ctx_tiles = canvas_tiles.getContext("2d");
let canvas_items = $("render_items");
let ctx_items = canvas_items.getContext("2d");
let canvas_players = $("render_players");
let ctx_players = canvas_players.getContext("2d");
let canvas_overhangs = $("render_overhangs");
let ctx_overhangs = canvas_overhangs.getContext("2d");
let canvas_top = $("render_top");
let ctx_top = canvas_top.getContext("2d");

let me_canvas_background = $("me_canvas_background");
let me_ctx_background = me_canvas_background.getContext("2d");
let me_canvas_tiles = $("me_canvas_tiles");
let me_ctx_tiles = me_canvas_tiles.getContext("2d");
let me_canvas_emote_background = $("me_canvas_emote_background");
let me_ctx_emote_background = me_canvas_emote_background.getContext("2d");
let me_canvas_items = $("me_canvas_items");
let me_ctx_items = me_canvas_items.getContext("2d");
let me_canvas_emote_foreground = $("me_canvas_emote_foreground");
let me_ctx_emote_foreground = me_canvas_emote_foreground.getContext("2d");
let me_canvas_top = $("me_canvas_top");
let me_ctx_top = me_canvas_top.getContext("2d");

let canvas_firstPerson_tl = $(".firstPersonCanvas_tl");
let ctx_firstPerson_tl = canvas_firstPerson_tl.getContext("2d");
let canvas_firstPerson_tm = $(".firstPersonCanvas_tm");
let ctx_firstPerson_tm = canvas_firstPerson_tm.getContext("2d");
let canvas_firstPerson_tr = $(".firstPersonCanvas_tr");
let ctx_firstPerson_tr = canvas_firstPerson_tr.getContext("2d");
let canvas_firstPerson_lm = $(".firstPersonCanvas_lm");
let ctx_firstPerson_lm = canvas_firstPerson_lm.getContext("2d");
let canvas_firstPerson_rm = $(".firstPersonCanvas_rm");
let ctx_firstPerson_rm = canvas_firstPerson_rm.getContext("2d");
let canvas_firstPerson_bl = $(".firstPersonCanvas_bl");
let ctx_firstPerson_bl = canvas_firstPerson_bl.getContext("2d");
let canvas_firstPerson_bm = $(".firstPersonCanvas_bm");
let ctx_firstPerson_bm = canvas_firstPerson_bm.getContext("2d");
let canvas_firstPerson_br = $(".firstPersonCanvas_br");
let ctx_firstPerson_br = canvas_firstPerson_br.getContext("2d");
let canvas_firstPerson_master = $(".firstPersonCanvas_master");
let ctx_firstPerson_master = canvas_firstPerson_master.getContext("2d");

let allCanvas = [me_canvas_background,me_canvas_tiles,me_canvas_emote_background,me_canvas_emote_foreground,me_canvas_items,me_canvas_top,canvas_emote_background,canvas_background,canvas_tiles,canvas_items,canvas_players,canvas_overhangs,canvas_top,canvas_firstPerson_tl,
    canvas_firstPerson_tm,canvas_firstPerson_tr,canvas_firstPerson_lm,canvas_firstPerson_rm,canvas_firstPerson_bl,canvas_firstPerson_bm,canvas_firstPerson_br,canvas_firstPerson_master,
]

function adjustCanvasSize(gridx,gridy,zoom = 1) {
    const width = Math.ceil(gridx * gridSize * zoom);
    const height = Math.ceil(gridy * gridSize * zoom);

    // Set the canvas dimensions in device pixels
    for (let i = 0; i < allCanvas.length; i++) {
        allCanvas[i].width = width;
        allCanvas[i].height = height;
        allCanvas[i].css({
            width: width + "px",
            height: height + "px",
        })
    }

    //Fix Board Status Position
    let offset = $(".game_canvas")[0].getBoundingClientRect();
    
}
function updateCanvasPositionToPlayer(player) {
    let playerX = player.pos.x;
    let playerY = player.pos.y;

    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    let actualPlayerX = (playerX * gridSize) + (gridSize/2);
    let actualPlayerY = (playerY * gridSize) + (gridSize/2);

    let xDif = centerX - actualPlayerX;
    let yDif = centerY - actualPlayerY;

    let addY = 0;
    let addX = 0;

    if (cameraQuickZoom) {
        $(".game_canvas").css({ transition: "none" });
    
        // Force a reflow before applying new left/top
        $(".game_canvas")[0].offsetHeight; 

        function calculateResult(movementSpeed) {
            return -0.4 * movementSpeed + 1.10;
        }
        let xAxisSpeed = calculateResult(currentBoard.map[player.pos.y][player.pos.x].tile.changePlayerSpeed);

        if (cameraQuickZoom == "bottom") {
            addY = gridSize/0.59;
            addX = 0;
        }
        if (cameraQuickZoom == "top") {
            addY = -(gridSize/0.59);
            addX = 0;
        }
        if (cameraQuickZoom == "left") {
            addY = 0;
            addX = gridSize/-(xAxisSpeed);
        }
        if (cameraQuickZoom == "right") {
            addY = 0;
            addX = -(gridSize/-(xAxisSpeed));
        }
        if (cameraQuickZoom == "tunnel") {
            addY = 0;
            addX = 0;
        }
        
    }
    
    $(".game_canvas").css({
        left: (xDif+addX) + "px",
        top: (yDif+addY) + "px",
    });
    
    if (cameraQuickZoom) {
        // Force a reflow before applying new left/top
        $(".game_canvas")[0].offsetHeight; 
        $(".game_canvas").css({ transition: "all .4s ease" });
        cameraQuickZoom = false;
    }
}
//End Load All Item Images
let itemCanvas = [];
function loadAllCanvas(list) {
    for (let i = 0; i < list.length; i++) {
        let item = list[i];

        function loadAllCanvasHelper(item) {
            let url = `${item.type}_${item.name}_`;

            function combineStrings(arrays, prefix = "", index = 0) {
                if (index === arrays.length) {
                    processCombination(prefix); // Call the function with the combined string
                    return;
                }
            
                for (let item of arrays[index]) {
                    combineStrings(arrays, prefix + "_" + item, index + 1);
                }
            }
            function processCombination(combination) {
                addItemCanvas(item,combination);
            }
            function loopTags(item,url) {
                if (item.renderImages.length > 0) {
                    for (let j = 0; j < item.renderImages.length; j++) {
                        if (item.renderImages[0] == "*colors") item.renderImages[0] = [
                            "aquamarine","blue","buff","coral","crimsonpurple","gold","green","lemon","lime","magenta","orange","pink","red","skyblue","slateblue","venom",
                        ]
                        if (item.renderImages[0] == "*colors2") item.renderImages[0] = [
                            "white","aquamarine","blue","buff","coral","crimsonpurple","gold","green","lemon","lime","magenta","orange","pink","red","skyblue","slateblue","venom",
                        ]
                    }
                    combineStrings(item.renderImages,url);
                } else {
                    addItemCanvas(item,url)
                }
                
            }
            function loopSkins(item,url) {
                for (let j = 0; j < item.availableSkins.length; j++) {
                    loopTags(item,url + item.availableSkins[j]);
                }
            }
    
            loopSkins(item,url);
        }

        requestIdleCallback(function() {
            loadAllCanvasHelper(item);
        })
        
    }
}
function makeItemCanvas(image,filter = "",player) {
    let html_itemCanvasHolder = $("itemCanvasHolder");

    let itemCanvas = html_itemCanvasHolder.create("canvas");
    let itemCtx = itemCanvas.getContext("2d");

    if (filter == "*P") {
        filter = getColorFilter(player.colorID);
    }

    itemCanvas.width = image.width;
    itemCanvas.height = image.height;
    itemCtx.drawImage(image,0,0);

    if (filter !== "") {
        itemCtx.filter = filter;
        itemCtx.drawImage(image,0,0);
    }
    return itemCanvas;
}
function addItemCanvas(item,url,filter = "",player) {
    if ($(url)) return;

    let img = $(".imageHolder").create("img");
    img.src = "img/" + item.type + "s/" + url + ".png";
    img.id = url;

    img.onload = function() {
        let obj = {
            url: url,
            canvas: makeItemCanvas($(url),filter,player),
            type: item.type,
        }
        itemCanvas.push(obj);
        
        global_loading++;
        doLoadingAnimation();
    }

}

function getItemCanvas(url,type) {
    for (let i = 0; i < itemCanvas.length; i++) {
        if (itemCanvas[i].url === url && itemCanvas[i].type == type) return itemCanvas[i].canvas;
    }
}
for (let i = 0; i < global_gameColors.length; i++) {
    let color = global_gameColors[i][0];
    if (color == "white") continue;

    let img = $(".imageHolder").create("img");
    img.src = "img/gameUI/hotAir_" + color + ".png"
    img.id = "loadHotAir_" + color;
}









function getRealItem(name) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].name == name) {
            return structuredClone(items[i]);
        }
    }
}
function getItem(name) {
    for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].name == name) {
            return structuredClone(itemList[i]);
        }
    }
}
function getTile(name) {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].name == name) {
            return structuredClone(tiles[i]);
        }
    }
}

function calculateDistance(x1, y1, x2, y2) {
    boardLength = currentBoard.map[0].length;
    boardHeight = currentBoard.map.length;
    let dx = Math.min(Math.abs(x1 - x2), boardLength - Math.abs(x1 - x2));
    let dy = Math.min(Math.abs(y1 - y2), boardHeight - Math.abs(y1 - y2));
    return dx + dy;
}
function hideScenes() {
    $(".scene").hide();
}
function setScene(scene,lobby) {
    hideScenes();
    $("scene_" + scene).show("flex");
    global_scene = scene;
    localAccount.isInMapEditor = false;
    showingGameTips = false;

    if (scene == "loading") {
        global_loading = 0;
        global_loading_total = 200;
        doLoadingAnimation();
    }
    if (scene == "mapEditor") {
        localAccount.isInMapEditor = true;
    }
    if (scene == "newMenu") {
        loadServersHTML();
        $(".account_name").innerHTML = localAccount.username + "#" + localAccount.tag; 
        $(".sc_bb_snakeImg").css({
            filter: getColorFilter(localAccount.serverSnake.colorID),
        });
        $(".newMenu_statPoints").innerHTML = localAccount.battlePassPoints;

        if (localAccount.loggedIn) {
            $(".signinLink").hide();
            $(".hideIfGuest").show("flex");
        } else {
            $(".signinLink").show();
            $(".hideIfGuest").hide();
        }
        
    }
    if (scene == "waiting"){
        if (localAccount.id != lobby.host){
            $("button_startGame").hide();
        }
    }
    if (scene == "lobby") {
        showingGameTips = true;
        showGameTips();
    }
    if (scene === "tree") {
        playMenuMusic("sounds/Tech Tree/menuTheme.mp3",25);
    } else {
        stopMenuMusic();
    }
}



function pauseGame(displayPopup = true) {
    gamePaused = true;
    let html = $(".pauseGamePopup");
    if (displayPopup) html.show("flex");
    
}
function downloadTextFile(filename, text) {
    // Create a Blob with the text
    const blob = new Blob([text], { type: 'text/plain' });
    
    // Create a link element
    const link = document.createElement('a');
    
    // Set the download attribute with the filename
    link.download = filename;
    
    // Create a URL for the Blob and set it as the href of the link
    link.href = window.URL.createObjectURL(blob);
    
    // Programmatically click the link to trigger the download
    link.click();
    
    // Clean up the URL object after the download is triggered
    window.URL.revokeObjectURL(link.href);
}

function readFileContent(file) {
    const reader = new FileReader();

    // Event listener to handle the load event (file reading completed)
    reader.onload = function(event) {
        const content = event.target.result; // The file content as a string
        importMap(content); // Display the content
};

// Read the file as text
reader.readAsText(file);
}
function importMap(textFile) {
    let board = JSON.parse(textFile);
    let decompressed = pako.ungzip(board, { to: 'string' });
    board = JSON.parse(decompressed);
    board = fixBoard(board);
    board.cantEdit = false;

    boards.push(board);
    currentBoardIndex = boards.length - 1;
    currentBoard = boards[currentBoardIndex];

    saveBoards();
    ls.save("currentBoardIndex",currentBoardIndex);
    if (!localAccount.isInLobby) loadBoardMenu()
    else {
        socket.emit("changeServerBoard",pako.deflate(JSON.stringify(shortenBoard(board)), { to: 'string' }));
    }
    try {
    } catch {
        console.warn("Incorect File")
    }
}
function saveBoards() {
    let newBoards = [];
    for (let i = 0; i < boards.length; i++) {
        if (!boards[i].cantEdit) {
            newBoards.push(shortenBoard(boards[i]));
        }
    }
    if (newBoards.length > 0) {
        const encoder = new TextEncoder();
        const shortenBoardResult = newBoards;
    
        if (!shortenBoardResult) {
        throw new Error('shortenBoard(this.board) returned invalid data.');
        }
    
        const jsonString = JSON.stringify(shortenBoardResult);
        const encodedText = encoder.encode(jsonString);
    
    
        const compressed = pako.gzip(encodedText);

        newBoards = JSON.stringify(compressed);
    }
}
function shortenBoard(oldBoard) {
    oldBoard.map = [];
    let board = structuredClone(oldBoard);

    let _newMap = [];
    for (let i = 0; i < board.originalMap.length; i++) {
        let row = [];
        for (let j = 0; j < board.originalMap[i].length; j++) {
            let cell = board.originalMap[i][j];
            let newCell = {
                mouseOver: false,
                tile: cell.tile.id,
                item: cell.item?.id || 0,
            }
            row.push(newCell);
        }
        _newMap.push(row);
    }
    board.originalMap = _newMap;

    board.originalMap = shortenMap(board.originalMap)

    return board;
}
function fixBoard(oldBoard) {
    if (_type(oldBoard.originalMap[0][0]).type !== "array") return oldBoard;

    let board = structuredClone(oldBoard);
    board.map = [];

    board.originalMap = decompressMap(board.originalMap);

    return board;
}

function shortenMap(map) {
    let _newMap = [];
    for (let i = 0; i < map.length; i++) {
        let row = [];
        let s_tiles = [];
        let s_items = [];
        for(let j = 0; j < map[i].length; j++) {
            s_tiles.push(map[i][j].tile);
            s_items.push(map[i][j].item);
        }

        function combineCells(array) {
            let newTiles = [];
            let current = false;
            let count;
            for (let i = 0; i < array.length; i++) {
                if (current === false) {
                    current = array[i];
                    count = 1;
                    continue;
                }
                if (array[i] !== current) {
                    newTiles.push([current,count]);
                    current = array[i];
                    count = 1;
                    continue;
                }
                if (array[i] === current) {
                    count++;
                    continue;
                }
            }
            newTiles.push([current,count]);

            return newTiles;
        }

        s_tiles = combineCells(s_tiles);
        s_items = combineCells(s_items);


        row.push(s_tiles);
        row.push(s_items);
        _newMap.push(row);
    }
    return _newMap;
}
function decompressMap(map) {
    let _newMap = [];
    for (let i = 0; i < map.length; i++) {
        let row = [];

        let _tiles = [];
        let _items = [];

        for (let j = 0; j < map[i][0].length; j++) {
            for (let k = 0; k < map[i][0][j][1]; k++) {
                _tiles.push(map[i][0][j][0]);
            }
        }
        for (let j = 0; j < map[i][1].length; j++) {
            for (let k = 0; k < map[i][1][j][1]; k++) {
                _items.push(map[i][1][j][0]);
            }
        }

        for (let j = 0; j < _tiles.length; j++) {
            row.push({
                mouseOver: false,
                tile: getByID(_tiles[j],tiles),
                item: getByID(_items[j],items),
            })
        }

        _newMap.push(row);
    }
    return _newMap;
}

function getByID(id,type) {
    let toReturn = false;
    searching: for (let i = 0; i < type.length; i++) {
        if (type[i].id === id) {
            toReturn = type[i];
            break searching;
        }
    }
    return toReturn;
}
function findItemDifferences(map) {
    let allDifferences = [];
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            let item = map[i][j].item;
            if (!item) continue;

            let realItem = getRealItem(item.name);
            let differences = compareObjects(realItem,item);
            if (differences.length == 0) continue;

            allDifferences.push([differences,j,i]);
        }
    }
    return allDifferences;
}
function findTileDifferences(map) {
    let allDifferences = [];
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            let tile = map[i][j].tile;
            if (!tile) continue;

            let realTile = getTile(tile.name);
            let differences = compareObjects(realTile,tile);
            if (differences.length == 0) continue;

            allDifferences.push([differences,j,i]);
        }
    }
    return allDifferences;
}
function compareObjects(obj1, obj2, path = []) {
    let differences = [];
  
    // Check keys in obj1
    for (let key in obj1) {
      if (Object.prototype.hasOwnProperty.call(obj1, key)) {
        if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
          differences.push([...path, key, undefined]); // Key missing in obj2
        } else if (typeof obj1[key] === "object" && obj1[key] !== null && typeof obj2[key] === "object" && obj2[key] !== null) {
          // Recursively check nested objects
          differences = differences.concat(compareObjects(obj1[key], obj2[key], [...path, key]));
        } else if (obj1[key] !== obj2[key]) {
          differences.push([...path, key, obj2[key]]);
        }
      }
    }
    // Check keys in obj2 that aren't in obj1
    for (let key in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, key) && !Object.prototype.hasOwnProperty.call(obj1, key)) {
        differences.push([...path, key, obj2[key]]);
        }
    }

    return differences;
}
function fixItemDifferences(map) {
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
            setNestedValue(pos,change,"_LAST_");
        }
        map[d.y][d.x].item = pos;
        for (let i = 0; i < currentBoard.location_spawns.length; i++) {
            if (d.y == currentBoard.location_spawns[i].y && currentBoard.location_spawns[i].x == d.x) {
                currentBoard.location_spawns[i].item = map[d.y][d.x].item;
            }
        }
        let item = map[d.y][d.x].item;
        
        if (item.message) {
            if (item.message == ".status" && item.boardDestructibleCountRequired > 1) {
                new messageEmote(item,"x" + item.boardDestructibleCountRequired,{showIfPlayerDis: 5,hideIfBoardStatusPass: true,messagePadding: 5})
            }
        }
    }
}
function fixTileDifferences(map) {
    if (!currentBoard.tileDifferences) return;
    for (let i = 0; i < currentBoard.tileDifferences.length; i++) {
        let e = currentBoard.tileDifferences[i];
        let d = {
            differences: e[0],
            x: e[1],
            y: e[2],
        }
        let pos = structuredClone((map[d.y][d.x].tile));
        if (!pos) continue;
        for (let j = 0; j < d.differences.length; j++) {
            let change = d.differences[j];
            setNestedValue(pos,change,"_LAST_");
        }
        map[d.y][d.x].tile = pos;
    }
}

function forceAllCellsToBeTheirOwn(map) {
    let newMap = [];
    for (let i = 0; i < map.length; i++) {
        let row = [];
        for (let j = 0; j < map[i].length; j++) {
            row.push(structuredClone(map[i][j]));
        }
        newMap.push(row);
    }
    return newMap;
}



function drawTunnelCanvas(canvas,pos) {
    let x = pos.x*gridSize;
    let y = pos.y*gridSize;

    let extra = gridSize*4;

    canvas.width = 200;
    canvas.height = 200;
    

    let ctx = canvas.getContext("2d");
    ctx.drawImage($(".firstPersonCanvas_master"),x-extra,y-extra,extra*2,extra*2,0,0,200,200);
}
function getNestedValue(item, string) {
    if (string.charAt(0) == ".") string = string.subset(1,"end");

    let value = structuredClone(item); // Clone to avoid modifying the original object
    let regex = /(\w+)|\[(\d+)\]/g; // Matches property names and array indices

    let matches = [...string.matchAll(regex)]; // Extract all matches from the string

    for (let match of matches) {
        let key = match[1] !== undefined ? match[1] : match[2]; // Choose property name or array index
        if (value === undefined) return undefined; // Prevent errors on missing properties
        value = value[key];
    }
    return value;
}
function getBaseImgFromTag(item,tag,mapEditor = false) {
    if (tag.charAt(0) == ".") {
        return getItemValueFromList(item,tag.split("."),mapEditor);
    } else {
        return tag;
    }
}
function getItemValueFromList(item,list,mapEditor = false) {
    let value = item;
    for (let i = 1; i < list.length; i++) {
        value = value[list[i]];
    }
    if (value == "*P") value = mapEditor ? "white" : localAccount.player.team;
    return value;
}
function getImage(item,returnType,mapEditor = false) {
    if (!item) {
        console.log("Nothing found");
        return;
    };
    let type = item.type;
    let url = type + "_" + item.name + "_" + item.skin;
    if (item.baseImgTags?.length > 0) url += "_";
    for (let i = 0; i < item.baseImgTags.length; i++) {
        url += getBaseImgFromTag(item,item.baseImgTags[i],mapEditor)
    }
    if (returnType == "canvas") return getItemCanvas(url,type);
    if (returnType == "src") return $(url).src;
}

let global_wallImage = new Image();
    global_wallImage.src = "img/gameUI/repeatableWall.png";
function setGameScene(players) {

    let player;
    for (let i = 0; i < players.length; i++) {
        if (players[i].accountID == localAccount.id) {
            player = players[i];
            break;
        }
    }

    let holder;
    //Making Item Inventory
    holder = $(".game_cc_pi_wall_holder");
    holder.innerHTML = "";
    let holder_width = holder.offsetWidth;
    let holder_height = holder.offsetHeight;

    let aspectRatio = global_wallImage.width / global_wallImage.height;
    global_wallImage.height = holder_height;
    global_wallImage.width = holder_height * aspectRatio;

    let count = Math.ceil(holder_width / global_wallImage.width);
    for (let i = 0; i < count; i++) {
        let img = holder.create("img");
        img.className = "gmae_cc_pi_wall";
        img.src = global_wallImage.src;
        img.css({
            width: global_wallImage.width + "px",
            height: global_wallImage.height + "px",
        })
    }
    //Making Item Containers
    holder = $(".game_cc_pi_items_holder");
    holder.innerHTML = "";
    for (let i = 0; i < currentGameMode.howManyItemsCanPlayersUse; i++) {
        let selectingThis = player.selectingItem == i;
        let div = holder.create("div");
        div.className = "game_cc_pi_item_holder";
        div.id = "inventory_slot_" + i;
        div.css({
            height: (.83*global_wallImage.height) + "px",
            aspectRatio: "102/95",
        })

        let img = div.create("img");
        img.className = "game_cc_pi_item_wallIMG";
        img.src = "img/gameUI/WallItemWindow.png";
        let img2 = div.create("img");
        img2.className = "game_cc_pi_item_wallIMG2";
        if (selectingThis) img2.src = "img/gameUI/windowBackgroundSelected.png";
        else img2.src = "img/gameUI/windowBackground.png";

        let itemImg = div.create("img");
        itemImg.className = "game_cc_pi_item_img";
        itemImg.src = "img/backgrounds/clear.png";

        let textField = div.create("div.game_cc_pi_item_text");

    }

    //Clear All Status'
    $(".game_c2_extra").innerHTML = "";

    //Setting Player Snake Color
    $(".game_c1_snakeHead").style.filter = getColorFilter(player.colorID);

    //Setting Up Other Player flags
    let flagHolder = $("playerCardsHolder");
    flagHolder.innerHTML = "";
    const original = $(".pc_original");
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player.accountID == localAccount.id) continue;
        let clone = original.cloneNode(true);
        clone.id = "playercard_" + player.index;

        clone.style.display = "flex";
        clone.style.width = ($("playerCardsHolder").offsetWidth-5) + "px";

        let playersTeam = player.team;
        clone.$(".pc_banner").src = "img/status/playerCard_" + playersTeam + "_left.png";
        clone.$(".pc_c1_img").style.filter = getColorFilter(player.colorID);

        clone.$("pc_c1_minutes").innerHTML = "00";
        clone.$("pc_c1_seconds").innerHTML = "00";
        clone.$(".pc_c1_name").innerHTML = player.accountName;
        clone.$("pc_c1_points").innerHTML = 0;
        clone.$("pc_c1_length").innerHTML = 1;
        clone.$("pc_c1_kills").innerHTML = 0;

        clone.$("pc_c2_headImg").src = "img/backgrounds/clear.png";
        clone.$("pc_c2_bodyImg").src = "img/backgrounds/clear.png";
        clone.$("pc_c2_tailImg").src = "img/backgrounds/clear.png";
        

        flagHolder.appendChild(clone);
    }

    //Setting Up Active Snakes Stats
    $(".game_c2_playerStatus").src = `img/gameUI/activePlayerInfo_${player.team}.png`;
    $(".game_c2_name").innerHTML = player.accountName;

    $("game_c2_points").innerHTML = 0;
    $("game_c2_length").innerHTML = 1;
    $("game_c2_kills").innerHTML = 0;
    $("game_c2_minutes").innerHTML = "00";
    $("game_c2_seconds").innerHTML = "00";
    $(".game_c2_c1_tail").src = "img/backgrounds/clear.png";
    $(".game_c2_c1_head").src = "img/backgrounds/clear.png";
    $(".game_c2_c1_body").src = "img/backgrounds/clear.png";


}
function updateBoardStatusTracker(statusList) {
    let holder = $(".game_c2_extra");

    let allStatus = {
        aquamarine: {
            count: 0,
            location: false,
        },
        blue: {
            count: 0,
            location: false,
        },
        buff: {
            count: 0,
            location: false,
        },
        coral: {
            count: 0,
            location: false,
        },
        crimsonpurple: {
            count: 0,
            location: false,
        },
        gold: {
            count: 0,
            location: false,
        },
        green: {
            count: 0,
            location: false,
        },
        lemon: {
            count: 0,
            location: false,
        },
        lime: {
            count: 0,
            location: false,
        },
        magenta: {
            count: 0,
            location: false,
        },
        orange: {
            count: 0,
            location: false,
        },
        pink: {
            count: 0,
            location: false,
        },
        red: {
            count: 0,
            location: false,
        },
        skyblue: {
            count: 0,
            location: false,
        },
        slateblue: {
            count: 0,
            location: false,
        },
        venom: {
            count: 0,
            location: false,
        },
    }

    for (let i = 0; i < statusList.length; i++) {
        allStatus[statusList[i]].count++;
    }
    localAccount.boardStatus = allStatus;

    let addStatus = [];
    let removeStatus = [];
    let updateStatus = [];
    let availableSpots = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    availableSpots = availableSpots.shuffle();
    for (let i = 0; i < global_gameColors.length; i++) {
        let color = global_gameColors[i][0];
        if (color == "white") continue;

        if (oldBoardStatus[color].count === 0 && allStatus[color].count > 0) addStatus.push(color);
        if (allStatus[color].count === 0 && oldBoardStatus[color].count > 0) removeStatus.push(color);
        if (allStatus[color].count !== oldBoardStatus[color].count) updateStatus.push(color);

        allStatus[color].location = oldBoardStatus[color].location;
        if (allStatus[color].location !== false) {
            for (let j = 0; j < availableSpots.length; j++) {
                if (availableSpots[j] === allStatus[color].location) availableSpots.splice(j,1);
            }
        }
    }

    for (let i = 0; i < addStatus.length; i++) {
        let location = availableSpots[0];
        availableSpots.splice(0,1);
        allStatus[addStatus[i]].location = location;

        let hotAirHolder = holder.create("div");
        hotAirHolder.className = `hotAirHolder`;
        hotAirHolder.id = "hotAir_" + addStatus[i];
        let img = hotAirHolder.create("img");
        img.className = "hotAirImg";
        img.src = $("loadHotAir_" + addStatus[i]).src;
        let text = hotAirHolder.create("div");
        text.className = "hotAirText";
        text.innerHTML = allStatus[addStatus[i]].count;

        setTimeout(function() {
            hotAirHolder.classAdd(`hotAirPos${location}`);
        },100)
    }
    for (let i = 0; i < updateStatus.length; i++) {
        let hotAirHolder = $("hotAir_" + updateStatus[i]);
        hotAirHolder.$(".hotAirText").innerHTML = allStatus[updateStatus[i]].count;
    }
    for (let i = 0; i < removeStatus.length; i++) {
        let hotAirHolder = $("hotAir_" + removeStatus[i]);
        hotAirHolder.classAdd("hotAirHide");
        setTimeout(function() {
            hotAirHolder.remove();
        },1000);
    }

    oldBoardStatus = allStatus;
}
function updateGameFlags(player) {
    let flag = $("playercard_" + player.index);

    let playersTeam = player.team;
    if (flag.$(".pc_banner").src !== "img/status/playerCard_" + playersTeam + "_left.png")
        flag.$(".pc_banner").src = "img/status/playerCard_" + playersTeam + "_left.png";

    flag.$("pc_c1_minutes").innerHTML = "00";
    flag.$("pc_c1_seconds").innerHTML = "00";
    flag.$("pc_c1_points").innerHTML = 0;
    flag.$("pc_c1_length").innerHTML = player.tailLength;
    flag.$("pc_c1_kills").innerHTML = player.playerKills;
    if (player.equiped.head) {
        flag.$("pc_c2_headImg").src = getImage(player.equiped.head,"src");
    } else {
        flag.$("pc_c2_headImg").src = "img/backgrounds/clear.png";
    }
    if (player.equiped.body) {
        flag.$("pc_c2_bodyImg").src = getImage(player.equiped.body,"src");
    } else {
        flag.$("pc_c2_bodyImg").src = "img/backgrounds/clear.png";
    }
    if (player.equiped.tail) {
        flag.$("pc_c2_tailImg").src = getImage(player.equiped.tail,"src");
    } else {
        flag.$("pc_c2_tailImg").src = "img/backgrounds/clear.png";
    }
}
function updateGameScene(player) {

    if ($(".game_cc_pi_item_wallIMG2")) {

        //Updating Inventory
        for (let i = 0; i < player.items.length; i++) {
            let holder = $("inventory_slot_" + i);
            let item = player.items[i];
    
            if (player.selectingItem === i) holder.$(".game_cc_pi_item_wallIMG2").src = "img/gameUI/windowBackgroundSelected.png";
            else {
                holder.$(".game_cc_pi_item_wallIMG2").src = "img/gameUI/windowBackground.png";
            }
    
            if (item == "empty") {
                holder.$(".game_cc_pi_item_img").src = "img/backgrounds/clear.png";
                holder.$(".game_cc_pi_item_text").innerHTML = "";
                continue;
            }
    
            holder.$(".game_cc_pi_item_img").src = getImage(item,"src");
            if (item.whenEquiped?.protect) {
                holder.$(".game_cc_pi_item_text").innerHTML = item.whenEquiped.protect;
            } else {
                holder.$(".game_cc_pi_item_text").innerHTML = "";
            }
        }
    }
    
    //Updating Player Stats
    if ($(".game_c2_playerStatus").src !== `img/gameUI/activePlayerInfo_${player.team}.png`)
        $(".game_c2_playerStatus").src = `img/gameUI/activePlayerInfo_${player.team}.png`;
    $("game_c2_points").innerHTML = 0;
    $("game_c2_length").innerHTML = player.tailLength;
    $("game_c2_kills").innerHTML = player.playerKills;

    let totalSeconds = Math.floor(player.timeAlive / 1000);
    let minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    let seconds = (totalSeconds % 60).toString().padStart(2, '0');

    $("game_c2_minutes").innerHTML = minutes;
    $("game_c2_seconds").innerHTML = seconds;
    $(".game_c2_c1_tail").src = "img/backgrounds/clear.png";
    $(".game_c2_c1_head").src = "img/backgrounds/clear.png";
    $(".game_c2_c1_body").src = "img/backgrounds/clear.png";

    //updating player equiped
    if (player.equiped.head) {
        $(".game_c2_c1_head").src = getImage(player.equiped.head,"src")
        $(".game_c2_c1_text_head").innerHTML = player.equiped.head.whenEquiped.protect;
    } else {
        $(".game_c2_c1_head").src = "img/backgrounds/clear.png";
        $(".game_c2_c1_text_head").innerHTML = "";
    }
    if (player.equiped.body) {
        $(".game_c2_c1_body").src = getImage(player.equiped.body,"src")
        $(".game_c2_c1_text_body").innerHTML = player.equiped.head.whenEquiped.protect;
    } else {
        $(".game_c2_c1_body").src = "img/backgrounds/clear.png";
        $(".game_c2_c1_text_body").innerHTML = "";
    }
    if (player.equiped.tail) {
        $(".game_c2_c1_tail").src = getImage(player.equiped.tail,"src")
        $(".game_c2_c1_text_body").innerHTML = player.equiped.head.whenEquiped.protect;
    } else {
        $(".game_c2_c1_tail").src = "img/backgrounds/clear.png";
        $(".game_c2_c1_text_tail").innerHTML = "";
    }
}


function updateLobbyPage(lobby,type = "all",extra,extra2,extra3) {
    if (type == "settings") {
        if (extra !== localAccount.id) return;
        localAccount.lobby.code = lobby.code;
        localAccount.lobby.serverType = lobby.serverType; 
    }
    if (type == "all") {
        localAccount.lobby = lobby;
        if (localAccount.id == lobby.hostID) {
            localAccount.isHost = true;
            $(".hostOnly").show();
            $(".hostFlex").show("flex");
            $(".sc_tb_lobbyName").classAdd("cursorSelector");

        }
        else {
            localAccount.isHost = false;
            $(".sc_tb_lobbyName").classRemove("cursorSelector");
            $(".hostOnly").hide();
        }
    }
    if (type == "all" || type == "lobbyName") {
        $(".sc_tb_lobbyName").innerHTML = type == "all" ? lobby.lobbyName : lobby;
    }

    if (type == "all" || type == "board") localAccount.lobbyBoard = type == "all" ? lobby.board : lobby;
    if (type == "all" || type == "gameMode") localAccount.lobbyGamemode = type == "all" ? lobby.gameMode : lobby;
    if (type == "all") currentBoard = lobby.board;

    if (type == "all" || type == "players") $("sc_playerCount").innerHTML = `Players (${type == "all" ? lobby.players.length : extra2}/${type == "all" ? lobby.playerMax : extra3})`;

    if (type == "all" || type == "board") $("sc_boards_boardName").innerHTML = "Board: " + localAccount.lobbyBoard.name;
    if (type == "all" || type == "board") {
        if (localAccount.lobbyBoard.boardAuthors.length == 1) $("sc_boards_boardRemixAuthor").hide(); 
        else {
            $("sc_boards_boardRemixAuthor").show();
            $("sc_boards_boardRemixAuthor").innerHTML = "Remixed By: " + localAccount.lobbyBoard.boardAuthors[localAccount.lobbyBoard.boardAuthors.length-1].username;
        }
        $("sc_boards_boardOriginalCreator").innerHTML = "Original Creator: " + localAccount.lobbyBoard.boardAuthors[0].username;
    }
    
    
    if (type == "all" || type == "gameMode") $(".sc_gmb_gameModeName").innerHTML = "Gamemode: " + localAccount.lobbyGamemode.name;
    
    let player, isHost;
    if (type == "all" || type == "submissionStatus" || type == "players") {
        let reference;
        if (type == "submissionStatus") reference = lobby;
        if (type == "all") reference = lobby.activePlayers;
        if (type == "players") reference = lobby;

        if (reference) {
            for (let i = 0; i < reference.length; i++) {
                if (reference[i].accountID === localAccount.id)  {
                    player = reference[i];
                    break;
                }
            }
        }
        isHost = extra === localAccount.id;
    }
    

    if (type == "all" || type == "players") {
        let reference;
        if (type == "players") reference = lobby;
        if (type == "all") reference = lobby.activePlayers;

        let playersHolder = $(".sc_players_playersList");
        playersHolder.innerHTML = "";
        if (reference) {
            for (let i = 0; i < reference.length; i++) {
                let isYou = false;
                if (reference[i].accountID === localAccount.id)  {
                    isYou = true;
                }
                let holder = playersHolder.create("div");
                holder.className = "lobbyPlayerCard";
        
                if (i % 2 == 0) holder.style.background = "#696969";
        
                function makeImage(holder,className,src,filter = false,func) {
                    let imageHolder = holder.create("div");
                    imageHolder.className = className;
                    let image = imageHolder.create("img");
                    image.className = "lobbyImage";
                    image.src = src;
        
                    if (filter) {
                        image.style.filter = getColorFilter(filter.colorID);
                    }
                    if (func) {
                        imageHolder.on("click",function() {
                            func(player);
                        })
                    }
                }
                makeImage(holder,"lobbySnakeImageHolder","img/snakeSkins/" + reference[i].snakeSkin + "/snake_" + reference[i].snakeSkin + "_head.png",reference[i]);
                
                let snakeName = holder.create("div");
                snakeName.className = "lobbySnakeName";
                snakeName.innerHTML = isYou ? "You" : reference[i].accountName + reference[i].accountTag;
                let nameColor = local_nameColors[reference[i].chatNameColor];
                if (!nameColor) nameColor = "white";
                snakeName.style.color = nameColor;
                if (extra == reference[i].accountID) snakeName.innerHTML += " (Host)";
        
                if (isYou) continue;
        
                let rightContent = holder.create("div");
                rightContent.className = "lobbyPlayersRight";
                
                //Friends to Be Added Later
                //makeImage(rightContent,"lobbyFriendsIcon","img/menuIcons/friend.png");
                if (isHost) makeImage(rightContent,"lobbyEditPlayerIcon","img/menuIcons/edit.png",false,function(player) {
                    makePopUp([
                        {type: "title",color: "white",text: "Player Options: " + player.accountName},
                        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "none",className: "hoverBorderBlue",border: "3px solid white",text:"Make Host",onClick: function() {
                            socket.emit("setLobbyHost",reference[i]);
                        }},
                        {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "none",className: "hoverBorderBlue", border: "3px solid white",text:"Kick Player",onClick: function() {
                            socket.emit("kickPlayerFromLobby",reference[i]);
                        }}
                        /*
                        [
                            {type: "text",text: "Allow Board Submissions",color: "white"},
                            {type: "checkbox",value: reference[i].canSubmitBoards,onClick: function(a,b,div) {
                                socket.emit("setPlayerBoardSubbmisionStatus",reference[i],div.checked);
                            }},
                        ],*/
                    ],{
                        exit: {
                            cursor: "url('./img/pointer.cur'), auto",
                        },
                        id: "playerOptions",
                    })
                });
        
            }
        }
    }
    if (type == "all" || type == "players") {
        $(".sc_bb_snakeImg").css({
            filter: getColorFilter(player.colorID),
        }); 
    }
    
    /*
    if (type == "all" || type == "submissionStatus") {
        if (player.canSubmitBoards && !isHost) {
            $(".canAddSubbmisionsOnly").show();
        } else {
            $(".canAddSubbmisionsOnly").hide();
        }
    }
        */
    
    if (type == "all" || type == "chats") {
        if (type == "chats") reference = lobby;
        if (type == "all") reference = lobby.chats;

        let chatHolder = $(".sc_chatHolder");
        chatHolder.innerHTML = "";
        for (let i = 0; i < reference.length; i++) {
            let holder = chatHolder.create("div");
            holder.className = "lobby_chatHolder";
            let name = holder.create("div");
            name.innerHTML = reference[i].account === null ? "" : reference[i].account + ": " ;
            name.style.color = reference[i].color || "gray";
            name.style.marginRight = "5px";
            let text = holder.create("div");
            text.innerHTML = reference[i].message;
            if (name === "") holder.style.color = "#696969";
            else holder.style.color = "white";
        }
    
        chatHolder.scrollTo({ top: chatHolder.scrollHeight, behavior: 'smooth' })
    }

    if (type == "all" || type == "gameMode") {
        let gamemode = (type == "all" ? lobby.gameMode : lobby);
        logAllWinningConditions($(".sc_winningConditions"),gamemode);
        logGameModeChanges($(".sc_gameModeChanges"),gamemode,false);
        $(".sc_description").innerHTML = gamemode.description;
    }

    if (type == "all" || type == "board") {
        requestAnimationFrame(() => {
            $(".sc_boards_canvas").width = $(".sc_canvas_holder").clientWidth;
            $(".sc_boards_canvas").height = $(".sc_canvas_holder").clientHeight; 
            drawBoardToCanvas(localAccount.lobbyBoard.originalMap,$(".sc_boards_canvas"),true);
        });
    }
}

function getBoardImage(board,func) {
    let canvas = document.createElement("canvas");
    let map = board.originalMap;
    let ctx = canvas.getContext("2d");
    let grid_size = 19;

    let width = Math.round(map[0].length * grid_size);
    let height = Math.round(map.length * grid_size);

    canvas.height = height;
    canvas.width = width;


    let backgroundImage = new Image();
    backgroundImage.src = "img/backgrounds/" + board.background + ".png";
    backgroundImage.onload = function() {
        ctx.drawImage(backgroundImage,0,0,width,height);

        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                let cell = map[i][j];
    
                let Xpos = (j * grid_size);
                let Ypos = (i * grid_size);
                
                ctx.drawImage(getImage(cell.tile,"canvas"),Xpos,Ypos,(grid_size),(grid_size));
    
                if (cell.item) {
                    let image = getImage(cell.item,"canvas");
                    if (!image) continue;
                    ctx.drawImage(image,Xpos,Ypos,(grid_size),(grid_size));
                }
    
            }
        }

        let imageData = canvas.toDataURL("image/jpeg",0.7);
        func(imageData)
        canvas.remove(); // Clean up
    }
}
function drawBoardToCanvas(board,canvas) {
    let ctx = canvas.getContext("2d");
    let grid_size;

    if (board.length > board[0].length) {
        grid_size = Math.round(canvas.getBoundingClientRect().height / board.length);
    } else {
        grid_size = Math.round(canvas.getBoundingClientRect().width / board[0].length);
    } 

    let width = Math.round(board[0].length * grid_size);
    let height = Math.round(board.length * grid_size);

    canvas.height = height;
    canvas.width = width;


    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let cell = board[i][j];

            let Xpos = (j * grid_size);
            let Ypos = (i * grid_size);
            
            ctx.drawImage(getImage(cell.tile,"canvas"),Xpos,Ypos,(grid_size),(grid_size));

            if (cell.item) {
                let image = getImage(cell.item,"canvas");
                if (!image) continue;
                ctx.drawImage(image,Xpos,Ypos,(grid_size),(grid_size));
            }

        }
    }
}

function showEndScreen() {
    $(".endScreenStats").show("flex");
    playEndScreenAnimation();
}
function playEndScreenAnimation() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let extra = (height*.2);
    let snakeHeightNoExt = (height/3);
    let snakeHeight = (height/3)+extra;
    $(".endScreen_hideContent").style.transition = "none";
    $(".endScreen_hideContent").style.opacity = "0";
    $(".endScreen_hideContent").clientWidth;
    $(".endScreen_hideContent").style.transition = "all .8s ease";

    
    for (let i = 1; i < 4; i++) {
        let snake = $("endScreenSnake" + i);
        snake.hide();
        snake.style.transition = "none"; 

        snake.offsetHeight; // This forces the browser to apply the CSS changes

        snake.css({
            height: snakeHeight,
            width: "auto",
            top: (((i-1)*snakeHeightNoExt)-(extra/2)) + "px",
            
        })
    }


    for (let i = 1; i < 4; i++) {
        let snake = $("endScreenSnake" + i);
        if (i % 2 == 0) {
            snake.show();
            snake.css({
                right: (snake.clientWidth*-1) + "px",
            })
            snake.offsetHeight; // This forces the browser to apply the CSS changes
            snake.style.transition = "all 2s ease"; 

            snake.offsetHeight; // This forces the browser to apply the CSS changes

            setTimeout(function() {
                snake.css({
                    right: "0px",
                })
            },(i-1)*700);
        } else {
            snake.show();
            snake.style.left = (snake.clientWidth * -1) + "px";
            snake.offsetHeight; // This forces the browser to apply the CSS changes

            snake.style.transition = "all 2s ease"; 
            snake.offsetHeight; // This forces the browser to apply the CSS changes

            setTimeout(function() {
                snake.style.left = "0px";
            },(i-1)*700);
        }
    }

    setTimeout(function() {
        $(".endScreen_hideContent").style.opacity = "1";
    },2700)
}
function getAverageCanvasColor(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let r = 0, g = 0, b = 0;
    let totalPixels = pixels.length / 4; // Each pixel has 4 values (R, G, B, A)

    for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];     // Red
        g += pixels[i + 1]; // Green
        b += pixels[i + 2]; // Blue
    }

    // Get the average
    r = Math.round(r / totalPixels);
    g = Math.round(g / totalPixels);
    b = Math.round(b / totalPixels);

    return `rgb(${r}, ${g}, ${b})`; // Return as RGB string
}

function logAllWinningConditions(holder,gamemode) {
    holder.innerHTML = "";
    for (let i = 0; i < gamemode.winningConditions.length; i++) {
        let condition = gamemode.winningConditions[i];

        if (!condition) continue;
        let div = holder.create("div.gm_alt_holder");
        let whoWins = condition.whoWins;
        let howToWin;

        if (whoWins !== "Players Team" && whoWins !== "Player" && whoWins !== "Everyone" && whoWins !== "Highest Value" && whoWins !== "No One"&& whoWins !== "Board Status") {
            whoWins =  `<img class="gm_alt_team" src="img/items/item_flag_basic_${whoWins}.png"> ${whoWins.format("A")} Team`;
        }
        if (whoWins == "Everyone") {
            whoWins = `<img class="gm_alt_team" src="img/menuIcons/publish.png"> Everyone`;
        }
        if (whoWins == "No One") {
            whoWins = `<img class="gm_alt_team" src="img/menuIcons/skull.png"> No One`;
        }

        if (whoWins == "Highest Value") {
            whoWins = "Player With Highest " + condition.highestValue.format("A");
        }

        let teamPrefix = condition.pullTeamStats ? "Their Team" : "They";

        if (condition.condition == "All Dead") {
            howToWin = "Everyones Dead";
        }
        if (condition.condition == "Last One Standing") {
            howToWin = teamPrefix + " Are The Last One Standing";
        }
        if (condition.condition == "Last Team Standing") {
            howToWin = teamPrefix + " Are The Last Team Standing";
        }
        if (condition.condition == "Survive X Minutes") {
            howToWin = teamPrefix + ` Survive ${condition.x} Minutes`;
        }
        if (condition.condition == "Kill X Snakes") {
            howToWin = teamPrefix + ` Kill ${condition.x} Snakes`;
        }
        if (condition.condition == "Reach Snake Size Of X") {
            howToWin = teamPrefix + ` Reach A Snake Size Of ${condition.x}`;
        }
        if (condition.condition == "Touch Zone X") {
            howToWin = teamPrefix + ` Touch Zone ${condition.x}`;
        }
        if (condition.condition == "Touch Item X") {
            howToWin = teamPrefix + ` Touch Item  <img src="${getImage(getById(condition.type,condition.x),"src")}" class="gm_alt_team">`;
        }
        if (condition.condition == "Touch Tile X") {
            howToWin = teamPrefix + ` Touch Tile  <img src="${getImage(getById(condition.type,condition.x),"src")}" class="gm_alt_team">`;
        }
        if (condition.condition == "X Minutes Pass") {
            howToWin = `The Game Ends In ${condition.x} Minutes`;
        }
        if (condition.condition == "Board Status") {
            let status = condition.x.status;
            if (status == "*P") status = "Of Any";
            howToWin = `The Board Reaches ${condition.x.count} ${status.format("A")} Status'`;
        }


        div.innerHTML = whoWins + " Wins When " + howToWin;

        
    }
}
function logGameModeChanges(holder,gameMode) {
    holder.innerHTML = "";

    let alterations = [];

    let loggingSelectKeys = ["setFoodRate","howManyItemsCanPlayersUse","mode_usingItemType","mode_whenInventoryFullWhereDoItemsGo","whenSnakesDie","respawn","snakeCollision","teamCollision","respawnTimer","respawnGrowth","respawnProtection","respawnCount"];

    function formatString(input) {
        input = input.replaceAll("mode_","");
        return input
            .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
            .trim()                      // Remove leading space if any
            .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize each word
    }

    let useArr = loggingSelectKeys;

    for (let i = 0; i < useArr.length; i++) {
        let key = useArr[i];
        if (gameMode[key] === undefined) gameMode[key] = basedGameMode[key];
        let oldKey = basedGameMode[key];
        if (oldKey == "-1") oldKey = "infinite";
        if (basedGameMode[key] !== gameMode[key]) alterations.push({
            key: formatString(key),
            oldValue: oldKey,
            newValue: gameMode[key],
        })
    }
    for (let i = 0; i < alterations.length; i++) {
        let alt = alterations[i];
        let altHolder = holder.create("div.gm_alt_holder");

        let altKey = altHolder.create("div.gm_alt_key");
        altKey.innerHTML = alt.key + ":";

        let altNewValue = altHolder.create("div.gm_alt_newValue");
        altNewValue.innerHTML = alt.newValue;

        let altOldValue = altHolder.create("div.gm_alt_oldValue");
        altOldValue.innerHTML = alt.oldValue;
    }
    for (let i = 0; i < gameMode.itemAlterations.length; i++) {
        let itemName = gameMode.itemAlterations[i].displayName;
        for (let j = 0; j < gameMode.itemAlterations[i].alterations.length; j++) {
            let altList = gameMode.itemAlterations[i].alterations[j];
            let realValue = getRealItem(gameMode.itemAlterations[i].name);

            let altHolder = holder.create("div.gm_alt_holder");
            let itemHolder = altHolder.create("div.gm_alt_item_holder");
            let itemImage = itemHolder.create("img.gm_alt_item");
            itemImage.src = getImage(realValue,"src");

            let key = itemName + ": ";
            for (let k = 0; k < altList.length-1; k++) {
                key += altList[k] + ": ";
                realValue = realValue[altList[k]];
            }
            let value = altList[altList.length-1];



            let altKey = altHolder.create("div.gm_alt_key");
            altKey.innerHTML = key;

            let altNewValue = altHolder.create("div.gm_alt_newValue");
            altNewValue.innerHTML = value;

            let altOldValue = altHolder.create("div.gm_alt_oldValue");
            altOldValue.innerHTML = realValue;


        }
    }
    if (alterations.length == 0 && gameMode.itemAlterations.length == 0) {
        let altHolder = holder.create("div.gm_alt_holder");

        let altKey = altHolder.create("div.gm_alt_key");
        altKey.innerHTML = "No Game Mode Alterations";
    }
}


const hoverSound = new Audio("sounds/menuSounds/buttonHover.mp3");
const clickSound = new Audio("sounds/menuSounds/buttonClick.mp3");
function playSound(sound) {
    sound.currentTime = 0; // Reset audio to start
    adjustVolume(sound,"sfx");
    sound.play();
}
$(".playButtonSounds").forEach(button => {
    button.addEventListener("mouseenter", () => playSound(hoverSound)); // Hover sound
    button.addEventListener("click", () => playSound(clickSound)); // Click sound
});
function getColorFilter(id) {
    return getPlayerFilter(local_snakeColors[id]);
}
function getPlayerFilter(player) {
    if (!player) return "";
    return `hue-rotate(${player.hue}deg) saturate(${player.saturation}%) brightness(${player.brightness}%)`;
}

// Client: Send ping every second
setInterval(() => {
    const start = Date.now();

    socket.emit("ping", () => {
        const duration = Date.now() - start;
        production.ping.times.push(duration);
    });
}, 1000);

function selectAllPlayerBoardsPopUp(sendTo) {
    let holder = $(".apb_list");
    holder.innerHTML = "";

    function generateBoard(grandParent,parent,board,func,index,text = undefined) {
        let holder = parent.create("div");
        holder.className = "cbp_board_holder";

        if (board !== false) {
            let canvas = holder.create("canvas");
            canvas.className = "cbp_board_canvas";
            requestAnimationFrame(function() {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                drawBoardToCanvas(board.originalMap,canvas,true);
            });
    
            let title = holder.create("div");
            title.className = "cbp_board_title";
            title.innerHTML = board.name;
        }
        if (board === false && text !== undefined) {
            let title = holder.create("div");
            title.className = "cbp_board_import";
            title.innerHTML = text;
        }

        holder.board = board;
        holder.index = index;
        holder.on("click",function() {
            if (grandParent) grandParent.hide();
            func(this.board,this.index);
        })
    }

    let boardClicked = function(board,index) {
        socket.emit("saveBoardToIndex",pako.deflate(JSON.stringify(shortenBoard(currentBoard)), { to: 'string' }),index,"changeServerBoard");
    }

    for (let i = 0; i < localAccount.boardLimit; i++) {
        if (localAccount.boards[i]) generateBoard($(".allPlayerBoardsPopup"),holder,localAccount.boards[i],boardClicked,i);
        else if (i < localAccount.boardLimit - 1) {
            generateBoard($(".allPlayerBoardsPopup"),holder,false,boardClicked,i,"+");
            break;
        }
    }

    $(".allPlayerBoardsPopup").show("flex");
}
function setNestedValue(obj, path, value, toReturn = false, forceSet = false) {
    if (_type(path).type == "string") path = path.split(".");

    let usePath = structuredClone(path);
    let lastKey = usePath.pop();

    if (value === "_LAST_") {
        value = lastKey;
        lastKey = usePath.pop();
    }

    let target = obj;
    for (let key of usePath) {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
            if (forceSet) {
                target[key] = {};
            } else {
                return undefined; // Exit early if path doesn't exist
            }
        }
        target = target[key];
    }

    if (toReturn) {
        return target?.[lastKey];
    } else {
        if (forceSet || Object.prototype.hasOwnProperty.call(target, lastKey)) {
            target[lastKey] = value;
        }
    }
}
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

async function playAudio(url, type = "sfx") {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create GainNode for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = (type === "music" ? global_musicVolume : global_sfxVolume) / 100;

    // Connect the source → gainNode → destination
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
}

function checkItemFilter(item) {
    if (!item.filter) return false;
    let src;

    if (item.filter.src) src = getNestedValue(item,item.filter.src);

    if (item.filter.type == "piano") {
        return `hue-rotate(${keyMapping[src]}deg)`;
    }
}

window.on("resize",function() {
    if (!localAccount.isInGame) return;
    setAllCanvasToRightSize();
})
function setAllCanvasToRightSize() {
    let width = $(".game_cc_game").clientWidth;
    let canvasWidth = $(".game_canvas")[0].clientWidth;
    let ratio = width/canvasWidth;

    return;
    $(".game_canvas").css({
        transform: `scale(${ratio})`,
    })
}


function _getById(id,type) {
    let list = type == "item" ? items : tiles;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
    }
}
function loadAllBattlePasses() {
    let holder = $(".techTreesHolder");
    holder.innerHTML = "";
    for (let i = 0; i < localAccount.battlePasses.length; i++) {
        let laBattlePass = localAccount.battlePasses[i];
        let battlePass = accessedBattlePasses[laBattlePass.name];
        let passHolder = holder.create("div.newMenu_statHolder");
        passHolder.classAdd("flexEnd")
        passHolder.classAdd("statHolderPurple");
        let passImg = passHolder.create("img.wholeImage");
        passImg.src = "img/techTrees/techTree_" + laBattlePass.name + ".png";

        passHolder.on("click",function() {
            loadTechTree(battlePass);
        })
    }
}
function playMenuMusic(url, volume = 100) {
    let targetVolume = volume / 100; // Convert to 0-1 range

    // If the same music is already playing at the same volume, do nothing
    if (currentAudio && currentAudio.src.includes(url) && currentAudio.volume === targetVolume) return;

    // Fade out existing music if playing
    if (currentAudio) {
        fadeOut(currentAudio, 1000, () => {
            currentAudio.pause();
            currentAudio = null;
            startNewMusic(url, targetVolume);
        });
    } else {
        startNewMusic(url, targetVolume);
    }
}
function startNewMusic(url, targetVolume) {
    currentAudio = new Audio(url);
    currentAudio.loop = true;
    currentAudio.volume = 0; // Start at 0 volume
    currentAudio.play();

    // Fade in new music to the desired volume
    fadeIn(currentAudio, 1000, targetVolume*(global_musicVolume/100));
}

function stopMenuMusic() {
    if (currentAudio) {
        fadeOut(currentAudio, 1000, () => {
            currentAudio.pause();
            currentAudio = null;
        });
    }
}
function fadeIn(audio, duration, targetVolume = 1) {
    let volume = 0;
    let step = targetVolume / (duration / 50); // Adjust step based on target volume

    let fade = setInterval(() => {
        if (volume < targetVolume) {
            volume = Math.min(volume + step, targetVolume);
            audio.volume = volume;
        } else {
            clearInterval(fade);
        }
    }, 50);
}

function fadeOut(audio, duration, callback) {
    let volume = audio.volume;
    let step = volume / (duration / 50); // Gradual decrease

    let fade = setInterval(() => {
        if (volume > 0) {
            volume = Math.max(volume - step, 0);
            audio.volume = volume;
        } else {
            clearInterval(fade);
            callback();
        }
    }, 50);
}
function adjustVolume(audioElement, type, adj = 1) {
    if (type === "music") {
      audioElement.volume = adj*(global_musicVolume / 100); // Convert to 0-1 range
    } else if (type === "sfx") {
      audioElement.volume = adj*(global_sfxVolume / 100);
    }
  }

  function updateAllVolumes() {
    document.querySelectorAll("audio").forEach(audio => {
      if (audio.dataset.type === "music") {
        audio.volume = global_musicVolume / 100;
      } else if (audio.dataset.type === "sfx") {
        audio.volume = global_sfxVolume / 100;
      }
    });
  }

  function loginLoad(type) {
    $(".loginRegisterDiv").hide();
    $("." + type + "Div").show("flex");

    $(".lrd_warning").hide();
    $(".lrd_input").value = "";
    $(".lrd_input_password").value = "";
    if (type == "login") {
        $(".lrd_loginPassword").type == "password";
        $(".lrd_passwordImg").src = "img/menuIcons/passwordHidden.png";
        $(".lrd_staySignedIn").checked = false;
    }
    if (type == "signup") {
        $(".lrd_signUpPassword1").type == "password";
        $(".lrd_signUpPassword2").type == "password";
        $(".lrd_signup_password_img_1").src = "img/menuIcons/passwordHidden.png";
        $(".lrd_signup_password_img_2").src = "img/menuIcons/passwordHidden.png";
    }
    if (type == "forgotPassword") {

    }
  }
  $(".lrd_inputImg").on("click",function() {
    let inputHTML = this.$P().$P().$(".lrd_input_password"); 
    if (inputHTML.type === "password") {
        inputHTML.type = "input";
        this.src = "img/menuIcons/passwordVisible.png";
    } else {
        inputHTML.type = "password";
        this.src = "img/menuIcons/passwordHidden.png";
    }
  })
  function loginFunction() {
    let warning = false;
    let emailValue = $(".lrd_emailInput").value;
    let passwordValue = $(".lrd_loginPassword").value;
    let staySignedIn = $(".lrd_staySignedInBox").checked;

    if (emailValue == "") warning = "Email Requied";
    if (passwordValue == "") warning = "Password Required";

    if (warning) {
        $(".lrd_warning_signin").show();
        $(".lrd_warning_signin").innerHTML = warning;
        return;
    }

    socket.emit("user_login",emailValue,passwordValue,staySignedIn);
    //Send To Server
  }
  $(".lrd_loginButton").on("click",function() {
    loginFunction();
  })
  $(".lrd_signin_forgotPassword").on("click",function() {
    loginLoad("forgotPassword");
  })
  $(".lrd_GoToSignIN").on("click",function() {
    loginLoad("login")
  })
  $(".lrd_closeForm").on("click",function() {
    setScene("newMenu");
  }) 
  $(".lrd_signupButton").on("click",function() {
    loginLoad("signup")
  })
  function signupFunction() {
    
    let warning = false;
    let emailField = $(".lrd_signup_email").value;
    let usernameField = $(".lrd_signup_username").value;
    let password1Field = $(".lrd_signUpPassword1").value;
    let password2Field = $(".lrd_signUpPassword2").value;

    if (emailField == "") warning = "Email Requied";
    if (usernameField == "") warning = "Username Requied";
    if (password1Field == "" || password2Field == "") warning = "Password Requied";
    if (usernameField.length > 32) warning = "Username Is To Long";
    if (password1Field.length > 100 || password2Field.length > 100) warning = "Password Is Too Long";
    if (password1Field !== password2Field) warning = "Passwords Don't Match";

    if (warning) {
        $(".lrd_warning_signup").show();
        $(".lrd_warning_signup").innerHTML = warning;
        return;
    }

    //Send To Server
    socket.emit("user_signup",emailField,usernameField,password1Field);
  }
  $(".lrd_submitButton").on("click",function() {
    signupFunction();
  })
  $(".lrd_forgot_password_submit").on("click",function() {
    let warning = false;
    let emailField = $(".lrd_forgot_password_email").value;
    
    if (emailField == "") warning = "Email Requied";

    if (warning) {
        $(".lrd_warning_forgot_password").show();
        $(".lrd_warning_forgot_password").innerHTML = warning;
        return;
    }

    //Send To Server
})
function doLoadingAnimation() {
    let width = $(".loading_bar").getBoundingClientRect().width;
    let barWidth = (global_loading * width) / global_loading_total;

    $(".loading_percentage").style.width = barWidth + "px";
}
function decompressObject(compressedData, callback) {
    try {
        // Inflate (decompress) the gzip compressed data
        const decompressedBuffer = pako.inflate(compressedData, { to: 'string' });

        // Parse the decompressed JSON string
        const jsonString = decompressedBuffer;
        const parsedObject = JSON.parse(jsonString);

        // Call the callback with the decompressed object
        callback(null, parsedObject);
    } catch (err) {
        // Handle any errors (e.g., if decompression fails)
        callback(err, null);
    }
}
function adminTools() {
    setScene("adminTools");
    at_setTab("database");
}

let beenAdjusted = false;
function showBoardMenu(allBoards) {
    $(".chooseBoardPopup").show("flex");
    //boardVariables
    let type;
    let page;
    let displayOnScreen = 10;
    let likedList = [];
    if (allBoards !== false) {
        for (let i = 0; i < allBoards.liked.length; i++) {
            for (let j = 0; j < allBoards.published.length; j++) {
                if (allBoards.published[j].id === allBoards.liked[i].id) {
                    likedList.push(allBoards.published[j])
                }
            }
        }
        allBoards.liked = likedList;
    }
    //Declare HTML Variables

    let html_search_input = $(".cbp_tr_mc_input");
    let html_search_button = $(".cbp_tr_mc_searchHolder");

    let html_page_left = $("boardMenu_left");
    let html_page_text = $("boardMenu_text");
    let html_page_right = $("boardMenu_right");

    let html_board_content = $(".cbp_boardList");

    html_page_left = removeAllEventListeners(html_page_left);
    html_page_right = removeAllEventListeners(html_page_right);
    html_search_button = removeAllEventListeners(html_search_button);
    html_search_input = removeAllEventListeners(html_search_input);

    //Reset Top Row
    $(".board_tab").classRemove("modernPopup_topRow_image_selected");
    $(".board_tab").on("click",function() {
        selectFilter(this.id.subset("_\\after","end"));
    })

    html_search_input.value = "";


    html_search_input.on("keydown",function(e) {
        if (e.key == "Enter") dispalyBoards();
    })
    html_search_input.on("change",function() {
        dispalyBoards();
    })
    html_search_button.on("click",function() {
        dispalyBoards();
    })

    //Reset Bottom Row
    html_page_left.on("click",function() {
        if (this.classList.contains("cbp_br_rc_pageTurner_on")) {
            page--;
            dispalyBoards();
        }
    })
    html_page_right.on("click",function() {
        if (this.classList.contains("cbp_br_rc_pageTurner_on")) {
            page++;
            dispalyBoards();
        }
    })

    //Reset Board List
    html_board_content.innerHTML = "";

    function setLikedList() {
        likedList = [];
        for (let i = 0; i < allBoards.liked.length; i++) {
            likedList.push(allBoards.liked[i].id);
        }
    }
    function selectFilter(name,adjustSize = false) {
        $(".board_tab").classRemove("modernPopup_topRow_image_selected")
        $("boardMenu_" + name).classAdd("modernPopup_topRow_image_selected");
        type = name;
        page = 1;
        dispalyBoards(adjustSize);
    }

    function generateBoardCard(card,adjust = false) {
        let cardHolder = html_board_content.create("div.bc_holder");
        let cardImageHolder = cardHolder.create("div.bc_imageHolder");
        let canvas = cardImageHolder.create("canvas.bc_canvas");
        drawBoardToCanvas(card.board.originalMap,canvas);


        let boardName = cardHolder.create("div.bc_boardName");
        boardName.innerHTML = card.board.name;
        let boardAuthor = cardHolder.create("div.bc_boardAuthor");
        boardAuthor.innerHTML = "Creator: " + card.username;
        let boardDescription = cardHolder.create("div.bc_boardDescription");
        boardDescription.innerHTML = card.board.description || "";

        let bottomRow = cardHolder.create("div.bc_bottomRow");
        let playButton = bottomRow.create("div.bc_playButton");
        playButton.innerHTML = "Play Board";
        let likedCounter = bottomRow.create("div.bc_likeCounter");
        likedCounter.innerHTML = card.likeCount + " Likes";

        playButton.on("click",function() {
            $(".chooseBoardPopup").hide();
            socket.emit("changeServerBoard",card.id);
        })

        if (type !== "personal") {
            let likedImage = cardImageHolder.create("img.bc_likedImage");
            likedImage.src = "img/menuIcons/star_active.png";
            if (likedList.includes(card.id)) likedImage.classAdd("bc_likedImage_liked");
            likedImage.on("click",function() {
                if (this.classList.contains("bc_likedImage_liked")) {
                    this.classRemove("bc_likedImage_liked");
                    socket.emit("userDislikesBoard",card.id);
                    for (let i = 0; i < allBoards.liked.length; i++) {
                        if (allBoards.liked[i].id === card.id) allBoards.liked.splice(i,1);
                    }
                    likedCounter.innerHTML = (Number(likedCounter.innerHTML.subset(0," "))-1) + " Likes";

                } else {
                    this.classAdd("bc_likedImage_liked");
                    socket.emit("userLikesBoard",card.id);
                    allBoards.liked.push(card);
                    likedCounter.innerHTML = (Number(likedCounter.innerHTML.subset(0," "))+1) + " Likes";
                }
                setLikedList();
            })

            let playsText = cardHolder.create("div.bc_playCounter");
            let plays = card.plays;
            if (!plays) plays = 0;
            playsText.innerHTML = plays + " Plays";
        }
        

        if (adjust && !beenAdjusted) {
            beenAdjusted = true;
            let rect = cardHolder.getBoundingClientRect();
            let width = (rect.width * Math.ceil(displayOnScreen/2)) + (Math.ceil(displayOnScreen/2)*10) + 20;
            let height = 45 + 50 + (rect.height*2) + 20 + 20 + 20;
            $(".chooseBoardPopup").css({
                width: width + "px",
                height: height + "px",
            })
        }

        
    }
    function dispalyBoards(adjustSize = false) {
        if (!allBoards) return;
        let searchValue = html_search_input.value;
        let boardList = searchValue !== "" ? getSimilarNames(searchValue,allBoards[type]) : allBoards[type];
        html_board_content.innerHTML = "";

        if (boardList.length == 0) {
            let noBoards = html_board_content.create("div.cbp_bc_noBoard");
            noBoards.innerHTML = "No Boards Found";
            return;
        }

        let pages = Math.ceil(boardList.length/displayOnScreen);

        html_page_text.innerHTML = `Page ${page}/${pages}`;
        if (page == 1) {
            html_page_left.classRemove("cbp_br_rc_pageTurner_on")
            html_page_left.classAdd("cbp_br_rc_pageTurner_off")
        } else {
            html_page_left.classAdd("cbp_br_rc_pageTurner_on")
            html_page_left.classRemove("cbp_br_rc_pageTurner_off")
        } 
        if (page == pages) {
            html_page_right.classRemove("cbp_br_rc_pageTurner_on")
            html_page_right.classAdd("cbp_br_rc_pageTurner_off")
        } else {
            html_page_right.classAdd("cbp_br_rc_pageTurner_on")
            html_page_right.classRemove("cbp_br_rc_pageTurner_off")
        } 

        for (let i = 0; i < boardList.length; i++) {
            if (i < ((page-1)*displayOnScreen)) continue;
            if (i > ((page-1)*displayOnScreen)+displayOnScreen) continue;

            let adjust = false;
            if (i == 0 && adjustSize) adjust = true;
            generateBoardCard(boardList[i],adjust);
        }



    }

    if (allBoards === false) {
        let spinner = html_board_content.create("img.cbp_spinner");
        spinner.src = "img/loading.png";
    } else {
        setLikedList();
        selectFilter("published",true)
    }
}
function removeAllEventListeners(el) {
    const clone = el.cloneNode(true); // true = deep clone (with children)
    el.parentNode.replaceChild(clone, el);
    return clone; // return the new element so you can use it
  }
function getSimilarNames(input, objList) {
    const similarity = (a, b) => {
      const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
      return 1 - distance / Math.max(a.length, b.length);
    };
  
    const levenshteinDistance = (a, b) => {
      const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  
      for (let i = 0; i <= a.length; i++) dp[i][0] = i;
      for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          if (a[i - 1] === b[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
          } else {
            dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
          }
        }
      }
  
      return dp[a.length][b.length];
    };
  
    return objList
      .map(obj => {
        const score = similarity(input, obj.board.name);
        return { ...obj, similarity: score };
      })
      .filter(obj => obj.similarity >= 0.5)
      .sort((a, b) => b.similarity - a.similarity);
  }
  function chooseItemPopup(type,returnFunc) {
    let group = type == "tile" ? tiles : items;
    $(".chooseItemPopup").show("flex");
    let list = $(".cip_list");
    list.innerHTML = "";
    $(".cip_title").innerHTML = "Choose a " + type;

    for (let i = 0; i < group.length; i++) {
        if (!group[i].showInEditor) continue;

        let holder = list.create("div.gmItems_imageHolder");
        let img = holder.create("img.fullImage");
        img.src = getImage(group[i],"src");

        holder.on("click",function() {
            returnFunc(group[i]);
            $(".chooseItemPopup").hide();
        })
    }
  }
  
function createGamemodeSetting(title,type,valueString,typeSettings,description,familyID = false,myID = false,showWhen = false,editFunc = () => {}) {
    return {
        title: title,
        type: type,
        valueString: valueString,
        typeSettings: typeSettings,
        description: description,
        familyID: familyID,
        myID: myID,
        showWhen: showWhen,
        editFunc: editFunc,
    }
}
$(".snc_keyBindInput").on("keydown",function(e) {
    e.preventDefault(); // Prevent default key action like tabbing away
    let key = e.key; // Or use e.code for physical key
    if (e.key == " ") key = "Spacebar";
    this.value = key;
    this.prevValue = key;
    this.blur(); // Optional: blur to finalize the selection
    $(".customizeSnakePopupV2").setKeyBind(e.key,this.id.subset("_\\after","end"));
})
$(".snc_keyBindInput").on("click",function() {
    this.prevValue = this.value;
    this.value = "";
})
$(".snc_keyBindInput").on("blur",function() {
    this.value = this.prevValue;
})
function loadSnakeCustomizationPopup() {
    let html_snakeImage = $(".snc_snakeImage");
    let html_snakeName = $(".snc_snakeName");
    let html_snakeColorList = $("colorOptions_snakeColor");
    let html_nameColorList = $("colorOptions_nameColor");
    let html_keyBindLeft = $("keyBind_leftKey");
    let html_keyBindRight = $("keyBind_rightKey");
    let html_keyBindUp = $("keyBind_upKey");
    let html_keyBindDown = $("keyBind_downKey");
    let html_keyBindUseItem = $("keyBind_fireItem");
    let html_keyBindDropItem = $("keyBind_dropItem");
    let html_keyBindToggleTeams = $("keyBind_toggleTeamsKey");
    let html_keyBindToggleNames = $("keyBind_toggleNamesKey");

    let player = localAccount.serverSnake;

    //Reset Menu
    html_snakeColorList.innerHTML = "";
    html_nameColorList.innerHTML = "";

    //Set Menu
    html_snakeImage.style.filter = getColorFilter(player.colorID);
    html_snakeName.innerHTML = localAccount.username;
    let nameColor = local_nameColors[player.chatNameColor];
    if (!nameColor) nameColor = "white";
    html_snakeName.style.color = nameColor;
    html_keyBindLeft.value = player.leftKey || "a";
    if (html_keyBindLeft.value == " ") html_keyBindLeft.value = "Spacebar";
    html_keyBindRight.value = player.rightKey || "d";
    if (html_keyBindRight.value == " ") html_keyBindRight.value = "Spacebar";
    html_keyBindUp.value = player.upKey || "w";
    if (html_keyBindUp.value == " ") html_keyBindUp.value = "Spacebar";
    html_keyBindDown.value = player.downKey || "s";
    if (html_keyBindDown.value == " ") html_keyBindDown.value = "Spacebar";
    html_keyBindUseItem.value = player.fireItem || "r";
    if (html_keyBindUseItem.value == " ") html_keyBindUseItem.value = "Spacebar";
    html_keyBindDropItem.value = player.dropItem || "f";
    if (html_keyBindDropItem.value == " ") html_keyBindDropItem.value = "Spacebar";
    html_keyBindToggleNames.value = player.toggleNamesKey || "Tab";
    if (html_keyBindToggleNames.value == " ") html_keyBindToggleNames.value = "Spacebar";
    html_keyBindToggleTeams.value = player.toggleTeamsKey || "Shift";
    if (html_keyBindToggleTeams.value == " ") html_keyBindToggleTeams.value = "Spacebar";

    function generateColor(holder,type,color,index,playerColorID,func) {
        let colorHolder = holder.create("div.snc_color_colorHolder");
        let colorDiv = colorHolder.create("div.snc_color_color");
        if (playerColorID === index) colorHolder.classAdd("snc_color_selected")

        if (type == "filter") {
            colorDiv.style.background = "#06470B";
            colorDiv.style.filter = color;
        }
        if (type == "set") {
            colorDiv.style.background = color;
        }

        colorHolder.on("click",()=> {
            func(index);
        })
    }

    for (let i = 0; i < localAccount.allowedSnakeColors.length; i++) {
        generateColor(html_snakeColorList,"filter",getColorFilter(localAccount.allowedSnakeColors[i]),localAccount.allowedSnakeColors[i],player.colorID,function(id) {
            localAccount.serverSnake.colorID = id;
            saveServerSnake();
            loadSnakeCustomizationPopup();
        });
    }
    for (let i = 0; i < localAccount.allowedNameColors.length; i++) {
        generateColor(html_nameColorList,"set",local_nameColors[localAccount.allowedNameColors[i]],localAccount.allowedNameColors[i],player.chatNameColor,function(id) {
            localAccount.serverSnake.chatNameColor = id;
            saveServerSnake();
            loadSnakeCustomizationPopup();
        });
    }

    $(".customizeSnakePopupV2").setKeyBind = function(key,where) {
        localAccount.serverSnake[where] = key;
        saveServerSnake();
    }
    $(".customizeSnakePopupV2").show("flex");
}
function standardizeText(text) {
    return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')          // camelCase → camel Case
        .replace(/[_\.]/g, ' ')                       // underscores/dots → spaces
        .toLowerCase()                                // make everything lowercase first
        .replace(/\b\w/g, char => char.toUpperCase()); // capitalize first letter of each word
}



function renderZone(backgroundCanvas,foregroundCanvas,zone,zoom = 1,boardWidth,boardHeight) {
    let elementList = zone.display;
    if (!elementList) return;

    let backgroundCtx = backgroundCanvas.getContext("2d");
    let foregroundCtx = foregroundCanvas.getContext("2d");

    let x = zone.pos1.x * gridSize * zoom;
    let y = zone.pos1.y * gridSize * zoom;
    let width = ((zone.pos2.x + 1) * gridSize * zoom) - x;
    let height = ((zone.pos2.y + 1) * gridSize * zoom) - y;
    boardWidth = (boardWidth*gridSize*zoom);
    boardHeight = boardHeight*gridSize*zoom;

    for (let i = 0; i < elementList.length; i++) {

        let settings = elementList[i];
        let ctx = settings.display == "background" ? backgroundCtx : foregroundCtx;
        let type = settings.type;

        if (type.toLowerCase() == "circletimer") {
            let max = zone.max;
            let min = zone.min;
    
            if (_type(min).type !== "number" || _type(max).type !== "number") {
                continue;
            }

            let percentage = min/max;
            
            

        }
        if (type.toLowerCase() == "bartimer") {
            let max = zone.max;
            let min = zone.min;
    
            if (_type(min).type !== "number" || _type(max).type !== "number") {
                continue;
            }

            let percentage = min/max;

            let direction = settings?.direction?.toLowerCase() || "horizontal";
            let xy = renderZone_findPosition(x,y,width,height,settings.position,boardWidth,boardHeight);

            let barWidth = settings?.width || "100%";
            barWidth = parseSize(barWidth,width,boardWidth,settings?.position?.renderFrom || "zone");
            let barHeight = settings?.height || "25px";
            barHeight = parseSize(barHeight,height,boardHeight,settings?.position?.renderFrom || "zone");
            let barColor = renderZone_color(zone,settings.backgroundColor,settings);


            let statusWidth = direction == "horizontal" ? percentage * barWidth : barWidth;
            let statusHeight = direction == "horizontal" ? barHeight : barHeight * percentage;
            let statusColor = renderZone_color(zone,settings.foregroundColor,settings);


            renderZone_drawBox(ctx,zone,settings,{
                x: xy.x,
                y: xy.y,
                width: barWidth,
                height: barHeight,
            },barColor,false,settings.position.rotation,settings.xAlign,settings.yAlign)
            renderZone_drawBox(ctx,zone,settings,{
                x: xy.x,
                y: xy.y,
                width: statusWidth,
                height: statusHeight,
            },statusColor,false,settings.position.rotation,settings.xAlign,settings.yAlign)
            renderZone_drawBox(ctx,zone,settings,{
                x: xy.x,
                y: xy.y,
                width: barWidth,
                height: barHeight,
            },"#00000000",settings.border,settings.position.rotation,settings.xAlign,settings.yAlign)
        }
        if (type.toLowerCase() == "texttimer") {
            let timerFormat = settings.timerFormat || "MM:SS";
            let max = zone.max;
            let min = zone.min;

            if (_type(min).type !== "number" || _type(max).type !== "number") {
                continue;
            }

            let xy = renderZone_findPosition(x,y,width,height,settings.position,boardWidth,boardHeight);
            let text = new _time((max-min)*1000,"duration").format(timerFormat);
            renderZone_drawText(zone,settings,text,ctx,xy);
        }
        if (type.toLowerCase() == "background") {
            let xy = renderZone_findPosition(x,y,width,height,settings.position,boardWidth,boardHeight);
            let backgroundWidth = settings?.width || "100%";
            backgroundWidth = parseSize(backgroundWidth,width,boardWidth,settings?.position?.renderFrom || "zone");
            let backgroundHeight = settings?.height || "100%";
            backgroundHeight = parseSize(backgroundHeight,height,boardHeight,settings?.position?.renderFrom || "zone");
            let xAlign = settings?.xAlign || "center";
            let yAlign = settings?.yAlign || "middle";

            renderZone_drawBox(ctx,zone,settings,{
                x: xy.x,
                y: xy.y,
                width: backgroundWidth,
                height: backgroundHeight,
            },renderZone_color(zone,settings.backgroundColor || "white",settings),settings.border,0,xAlign,yAlign)
        }
        if (type.toLowerCase() == "textbox") {
            let xy = renderZone_findPosition(x,y,width,height,settings.position,boardWidth,boardHeight);
            let text = renderZone_checkForValue(zone,settings.text || ".id");
            renderZone_drawText(zone,settings,text,ctx,xy);
        }
    }
}
function renderZone_drawBox(ctx, zone, settings, pos, color, borderSettings, rotation = 0, xAlign = "left",yAlign = "top") {
    xAlign = xAlign.toLowerCase();
    yAlign = yAlign.toLowerCase();
    let x = pos.x;
    let y = pos.y;
    const width = pos.width;
    const height = pos.height;

    if (xAlign === "center") {
        x -= width / 2;
    } else if (xAlign === "right") {
        x -= width;
    }
    if (yAlign == "middle") {
        y -= height / 2;
    }
    if (yAlign == "bottom") {
        y -= height;
    }

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(settings.border.radius, width / 2, height / 2);

    // Reset the transform and apply the rotation around the center point
    const radians = rotation * (Math.PI / 180);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    ctx.setTransform(
        cos,  sin,
    -sin,  cos,
        centerX - cos * width / 2 + sin * height / 2,
        centerY - sin * width / 2 - cos * height / 2
    );

    // Draw the rounded box as usual
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    if (borderSettings) {
        ctx.strokeStyle = renderZone_color(zone, borderSettings.color, settings);
        let lineWidth = borderSettings.width ?? 3;
        ctx.lineWidth = lineWidth;
        if (lineWidth > 0)
            ctx.stroke();
    }

    // Reset transform for future drawing
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function renderZone_drawText(zone, settings, text, ctx, pos) {
    // Set font and styles
    ctx.fillStyle = renderZone_color(zone, settings.font.color, settings);
    let italic = settings.font.italic || false;
    italic = italic === true ? "italic" : "";
    let bold = settings.font.bold || false;
    bold = bold === true ? "bold" : "";
    ctx.font = `${italic} ${bold} ${settings.font.size * zoom}px ${settings.font.family}`;
    ctx.textAlign = settings.font.textAlign || "center";
    ctx.textBaseline = settings.font.textBaseline || "middle";

    const rotation = Number(settings.position.rotation) || 0;
    const radians = rotation * Math.PI / 180;

    // Compute rotation matrix components
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    // Apply transform to rotate around (pos.x, pos.y)
    ctx.setTransform(
        cos, sin,         // a, b
       -sin, cos,         // c, d
        pos.x, pos.y      // e, f (translation)
    );

    // Draw the text at the new origin
    ctx.fillText(text, 0, 0);

    // Reset transform to identity matrix for following drawing calls
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function renderZone_findPosition(zoneX, zoneY, zoneWidth, zoneHeight, settings,boardWidth,boardHeight) {
    let renderFrom = settings?.renderFrom?.toLowerCase() || "zone";
    let location = settings?.location || "center";
    let offSetX = settings?.offSetX || 0;
    let offSetY = settings?.offSetY || 0;

    console.log(renderFrom,location,offSetX,offSetY);

    if (renderFrom == "board") {
        zoneX = 0;
        zoneY = 0;
        zoneWidth = boardWidth;
        zoneHeight = boardHeight;
    }


    let x, y;

    if (location == "topLeft") {
        x = zoneX;
        y = zoneY;
    }

    if (location == "topCenter") {
        x = zoneX + zoneWidth / 2;
        y = zoneY;
    }

    if (location == "topRight") {
        x = zoneX + zoneWidth;
        y = zoneY;
    }

    if (location == "leftCenter") {
        x = zoneX;
        y = zoneY + zoneHeight / 2;
    }

    if (location == "center") {
        x = zoneX + zoneWidth / 2;
        y = zoneY + zoneHeight / 2;
    }

    if (location == "rightCenter") {
        x = zoneX + zoneWidth;
        y = zoneY + zoneHeight / 2;
    }

    if (location == "bottomLeft") {
        x = zoneX;
        y = zoneY + zoneHeight;
    }

    if (location == "bottomCenter") {
        x = zoneX + zoneWidth / 2;
        y = zoneY + zoneHeight;
    }

    if (location == "bottomRight") {
        x = zoneX + zoneWidth;
        y = zoneY + zoneHeight;
    }

    return { 
        x: x + offSetX,
        y: y + offSetY
    };
}
function renderZone_color(zone,value,settings) {
    let colorResults = renderZone_checkForValue(zone,value);
    if (!colorResults) colorResults = "white";
    if (colorResults.toLowerCase() == "none") colorResults = "#00000000";

    let opacity = Number(settings.opacity) ?? 0.4;
    return _color(colorResults,opacity).color;
}
function renderZone_checkForValue(zone,value) {
    if (value.charAt(0) == ".") {
        if (value.subset(1,"end").split("").includes(".")) {
            let color = zone[value.subset(1,".\\before")];
            let secondOption = value.split(".")[2];
            if (secondOption.subset(0,5) == "darken") {
                return _color(color).darken(Number(secondOption.subset("(\\after",")\\before"))).ogColor;
            }
        }
        return zone[value.subset(1,"end")];
    }
    return value;
}
function addZonesToRender(zoneList) {
    for (let i = 0; i < zoneList.players.length; i++) {
        if (zoneList.players[i].visible) {
            zone = zoneList.players[i];
            zone.render = function() {
                renderZone(canvas_emote_background,canvas_top,this,1,currentBoard.width,currentBoard.height);
            }
            zone.type = "zone";
            zone.min = false;
            emotesToRender.push(zone);
        }
    }
    for (let i = 0; i < zoneList.items.length; i++) {
        if (zoneList.items[i].visible) {
            zone = zoneList.items[i];
            zone.render = function() {
                renderZone(canvas_emote_background,canvas_top,this,1,currentBoard.width,currentBoard.height);
            }
            zone.type = "zone";
            zone.min = false;
            emotesToRender.push(zone);
        }
    }
    for (let i = 0; i < zoneList.special.length; i++) {
        if (zoneList.special[i].visible) {
            zone = zoneList.special[i];
            zone.render = function() {
                renderZone(canvas_emote_background,canvas_top,this,1,currentBoard.width,currentBoard.height);
            }
            zone.type = "zone";
            zone.min = false;
            emotesToRender.push(zone);
        }
    }
}
function parseSize(value, size,boardSize,renderFrom = "zone") {
    if (renderFrom.toLowerCase() == "board") size = boardSize;
    if (typeof value === 'number') return value;
  
    if (typeof value !== 'string') return 0;
  
    value = value.trim();
  
    // Handle calc() expression
    if (value.startsWith('calc(') && value.endsWith(')')) {
      const expr = value.slice(5, -1);
      return evaluateCalc(expr, size);
    }
  
    if (value.endsWith('%')) {
      const percent = parseFloat(value.slice(0, -1));
      return (percent / 100) * size;
    }
  
    if (value.endsWith('px')) {
      return parseFloat(value.slice(0, -2));
    }
  
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  
  function evaluateCalc(expr, size) {
    // Very basic parser that replaces `100%` and `50px` with values and evaluates math
    const safeExpr = expr
      .replace(/([0-9.]+)%/g, (_, p) => ((parseFloat(p) / 100) * size))
      .replace(/([0-9.]+)px/g, (_, p) => parseFloat(p));
  
    try {
      return new Function(`return ${safeExpr}`)();
    } catch (e) {
      return 0;
    }
  }