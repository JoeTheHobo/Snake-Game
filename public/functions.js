ls.setID("snakegame");

let killSwitch = false;


let showPerformance = false;

let updateCells = [];
let updateSnakeCells = [];

let activePlayers;
let activePlayerCount = [];
let oldBoardStatus = [];
//End Players

let circleWalls = true;
let specialItemLowChance = 1;
let specialItemHighChance = 6;
let specialItemActiveChance = 4;
let specialItemIteration = 0;
let totalSpecialItems = 1;
let timer, gameEnd;
let gamePaused = false;
let isActiveGame = false;
let doColorRender = false;
let snakeSkins = ["classic"];
let bodyParts = ["body","tail","turn","head"];
for (let i = 0; i < snakeSkins.length; i++) {
    for (let j = 0; j < bodyParts.length; j++) {
        let img = $(".imageHolder").create("img");
        img.src = `snakeSkins/${snakeSkins[i]}/snake_${snakeSkins[i]}_${bodyParts[j]}`;
        img.id = `img_snakeSkin_${snakeSkins[i]}_${bodyParts[j]}`;
        let imgOutline = $("imageHolder").create("img");
        imgOutline.src = `snakeSkins/${snakeSkins[i]}/snake_${snakeSkins[i]}_${bodyParts[j]}_outline`;
        imgOutline.id = `img_snakeSkin_${snakeSkins[i]}_${bodyParts[j]}_outline`;
    }
}
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

let me_canvas = $("me_canvas");
let me_ctx = me_canvas.getContext("2d");
let me2_canvas = $("me_canvas2");
let me2_ctx = me2_canvas.getContext("2d");
let me_canvas_background = $("me_canvas_background");
let me_ctx_background = me_canvas_background.getContext("2d");

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

let allCanvas = [canvas_background,canvas_tiles,canvas_items,canvas_players,canvas_overhangs,canvas_top,me_canvas,me2_canvas,canvas_firstPerson_tl,
    canvas_firstPerson_tm,canvas_firstPerson_tr,canvas_firstPerson_lm,canvas_firstPerson_rm,canvas_firstPerson_bl,canvas_firstPerson_bm,canvas_firstPerson_br,canvas_firstPerson_master,me_canvas_background
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
    if (cameraFollowPlayer) {
        $(".boardStatusHolder").css({
            top: "5px",
            left: "5px",
            width: "100%",
        })
    } else {
        $(".boardStatusHolder").css({
            top: offset.bottom + "px",
            left: offset.left + "px",
            width: width,
        })
    }
    
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
function setUpItemCanvas() {
    let html_itemCanvasHolder = $("itemCanvasHolder");
    html_itemCanvasHolder.innerHTML = "";

    for (let i = 0; i < items.length; i++) {
        let item = items[i];

        function combineStrings(arrays, prefix = "", index = 0) {
            if (index === arrays.length) {
                processCombination(prefix); // Call the function with the combined string
                return;
            }
        
            for (let item of arrays[index]) {
                combineStrings(arrays, prefix + item, index + 1);
            }
        }
        
        function processCombination(combination) {
            addItemCanvas(items[i],items[i].baseImg + combination + ".png",items[i].name + "_" + combination);
        }
        
        if (item.renderImages) {
            for (let j = 0; j < item.renderImages.length; j++) {
                if (item.renderImages[0] == "*colors") item.renderImages[0] = [
                    "aquamarine","blue","buff","coral","crimsonpurple","gold","green","lemon","lime","magenta","orange","pink","red","skyblue","slateblue","venom",
                ]
                if (item.renderImages[0] == "*colors2") item.renderImages[0] = [
                    "white","aquamarine","blue","buff","coral","crimsonpurple","gold","green","lemon","lime","magenta","orange","pink","red","skyblue","slateblue","venom",
                ]
            }
            combineStrings(item.renderImages);
        } 
        else {
            addItemCanvas(item,item.baseImg + ".png",item.name)
        }
    }
}
function makeItemCanvas(image,filter = "",player) {
    let html_itemCanvasHolder = $("itemCanvasHolder");

    let itemCanvas = html_itemCanvasHolder.create("canvas");
    let itemCtx = itemCanvas.getContext("2d");

    if (filter == "*P") {
        filter = getPlayerFilter(player);
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
function addItemCanvas(item,itemImg,name,filter = "",player) {
    if ($("item_" + name)) return;

    let img = $(".imageHolder").create("img");
    img.src = "img/" + itemImg;
    img.id = "item_" + name;

    img.onload = function() {
        let obj = {
            name: name,
            canvas: makeItemCanvas($("item_" + name),filter,player),
        }
        itemCanvas.push(obj);
    }

}

function getItemCanvas(itemName) {
    for (let i = 0; i < itemCanvas.length; i++) {
        if (itemCanvas[i].name === itemName) return itemCanvas[i].canvas;
    }
}
for (let i = 0; i < global_gameColors.length; i++) {
    let color = global_gameColors[i][0];
    if (color == "white") continue;

    let img = $(".imageHolder").create("img");
    img.src = "img/gameUI/hotAir_" + color + ".png"
    img.id = "loadHotAir_" + color;
}




function setResolution(gridx, gridy) {
    setGridSize(cameraFollowPlayer === false ? .17 : .32);
    adjustCanvasSize(gridx,gridy,1);
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

function spawn(name,generateRandomItem = true,counting = false,playAudio = true) {
    let isPlayer = name.isPlayer;
    let itemIndex = false;
    let item;
    if (!isPlayer) {
        for (let i = 0; i < itemList.length; i++) {
            if (itemList[i].name == name) {
                itemIndex = i;
                item = itemList[i];
            }
        }
        if (item.spawnCount == undefined) item.spawnCount = 1;
        if (counting == false) {
            for (let i = 0; i < item.spawnCount; i++) {
                spawn(name,generateRandomItem,true,playAudio);
            }
            return;
        }
        if (item.spawnLimit !== false) item.spawnLimit--;
    }
        
    let counter = 0;
    let foundSpot = false;
    let x,y,team = "white";
    let allSpawns = currentBoard.location_spawns.shuffle();
    while (foundSpot == false) {
        if (isPlayer) {
            findingSpawner: for (let k = 0; k < allSpawns.length; k++) {
                let playerOnIt = false;
                for (let i = 0; i < activePlayers.length; i++) {
                    if (activePlayers[i].pos.x == allSpawns[k].x && activePlayers[i].pos.y == allSpawns[k].y) playerOnIt = true;
                }
                if (playerOnIt) continue;

                let playerTeam = name.team;
                let spawnTeam = allSpawns[k].item.spawnPlayerTeam || "white";

                if (playerTeam !== "white" && spawnTeam !== playerTeam) continue;
                
                x = allSpawns[k].x;
                y = allSpawns[k].y;
                team = playerTeam !== "white" ? playerTeam : spawnTeam;
                foundSpot = true;
                break findingSpawner;
            }
        }
        
        if (foundSpot === false) {
            x = rnd(currentBoard.map[0].length)-1;
            y = rnd(currentBoard.map.length)-1;
            if (currentBoard.map[y][x].item == false && currentBoard.map[y][x].tile.canSpawn) {
                foundSpot = true;
                checkingDistanceFromPlayersHead: for (let j = 0; j < activePlayers.length; j++) {
                    let distance = calculateDistance(activePlayers[j].pos.x,activePlayers[j].pos.y,x,y);
                    if (distance < 5) {
                        foundSpot = false;
                        break checkingDistanceFromPlayersHead;
                    }
                    for (let p = 0; p < activePlayers[j].tail.length; p++) {
                        if (activePlayers[j].tail[p].x == x && activePlayers[j].tail[p].y == y) {
                            foundSpot = false;
                            break checkingDistanceFromPlayersHead;
                        }
                    }
                }
            }
            counter++;
            if (counter > (currentBoard.map.length * currentBoard.map[0].length) ) {
                foundSpot = "couldn't find any";
            }
        }
    }

    if (foundSpot == "couldn't find any") {
        findingAnySpot: for (let k = 0; k < currentBoard.map.length; k++) {
            for (let j = 0; j < currentBoard.map[0].length; j++) {
                if (currentBoard.map[k][j].item == false && currentBoard.map[k][j].tile.canSpawn) {
                    let foundGoodSpot = true;
                    checkingDistanceFromPlayersHead: for (let j = 0; j < activePlayers.length; j++) {
                        let distance = calculateDistance(activePlayers[j].pos.x,activePlayers[j].pos.y,x,y);
                        if (distance < 5) {
                            foundGoodSpot = false;
                            break checkingDistanceFromPlayersHead;
                        }
                        for (let p = 0; p < activePlayers[j].tail.length; p++) {
                            if (activePlayers[j].tail[p].x == x && activePlayers[j].tail[p].y == y) {
                                foundGoodSpot = false;
                                break checkingDistanceFromPlayersHead;
                            }
                        }
                    }
                    if (foundGoodSpot) {{
                        x = j;
                        y = k;
                        foundSpot = true;
                        break findingAnySpot;
                    }}
                }
            }
        }
    }

    if (foundSpot == true) {
        if (isPlayer) {
            name.pos.x = x;
            name.pos.y = y;
            addPlayerStatus(name,"status_" + team);
        } else {
            let sendPlayer = false;
            if (cameraFollowPlayer) sendPlayer = activePlayers[0];
            runItemFunction(sendPlayer,itemList[itemIndex],"onSpawn",{x:x,y:y},{playAudio: playAudio});
            currentBoard.map[y][x].item = structuredClone(itemList[itemIndex]);
            currentBoard.map[y][x].item.pos = {
                x: x,
                y: y,
            }
            updateCells.push({
                x: x,
                y: y,
            })
            if (item.pack == "Tunnels") {
                currentBoard.location_tunnels.push(
                    {
                        x: x,
                        y: y,
                        name: item.name,
                    }
                )
            }
            if (generateRandomItem && item.onEat?.spawnRandomItem) specialItemManager();
        }
    } else {
        console.log("No Available Spot To Spawn");
    }
};
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
    if (scene == "newMenu") {
        loadServersHTML();
        $(".account_name").innerHTML = localAccount.id; 
        $(".sc_bb_snakeImg").css({
            filter: getPlayerFilter(localAccount.serverSnake),
        });
    }
    if (scene == "waiting"){
        if (localAccount.id != lobby.host){
            $("button_startGame").hide();
        }
    }
    if (scene == "lobby") {
        showingGameTips = true;
        showGameTips();
    } else {
        showingGameTips = false;
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
    if (!localAccount.isInLobby) loadBoardsScreen()
    else {
        socket.emit("changeServerBoard",JSON.stringify(shortenBoard(board)));
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
    ls.save("boards",newBoards)
}
function shortenBoard(oldBoard) {
    oldBoard.map = [];
    structuredClone(oldBoard);
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



function drawBoardToCanvas(board,canvas,forceHeight) {
    let ctx = canvas.getContext("2d");
    let gs;

    if (board.length > board[0].length) {
        gs = Math.round(canvas.height / board.length);

    } else {
        gs = Math.round(canvas.width / board[0].length);

    } 
    if (forceHeight) gs = Math.round(canvas.height / board.length);

    let width = Math.round(board[0].length * gs);
    let height = Math.round(board.length * gs);

    canvas.height = height;
    canvas.width = width;
    canvas.css({
        width: width + "px",
        height: height + "px",
    })


    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let cell = board[i][j];

            let Xpos = (j * gs);
            let Ypos = (i * gs);
            
            if (cell.tile) {
                ctx.drawImage($("tile_" + cell.tile.name),Xpos,Ypos,(gs),(gs));
            }
            if (cell.item) {
                let image = getImageFromItem("item",cell.item,"canvas");
                if (!image) continue;
                ctx.drawImage(image,Xpos,Ypos,(gs),(gs));
            }

        }
    }
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

function getBaseImgFromTag(item,tag) {
    if (tag.charAt(0) == ".") {
        return getItemValueFromList(item,tag.split("."));
    } else {
        return tag;
    }
}
function getItemValueFromList(item,list) {
    let value = item;
    for (let i = 1; i < list.length; i++) {
        value = value[list[i]];
    }
    return value;
}
function getImageFromItem(type,item,returnType) {
    let image;
    if (item.baseImg) {
        image = item.name;
        if (item.baseImgTags?.length > 0) image += "_";
        for (let i = 0; i < item.baseImgTags.length; i++) {
            image += getBaseImgFromTag(item,item.baseImgTags[i])
        }
    } else {
        image = item.name;
    }

    if (returnType == "canvas") image = getItemCanvas(image);
    if (returnType == "src") image = $(type + "_" + image).src;
    return image;
}
function respawnPlayer(player,growthPercentage) {
    let length = Math.round((growthPercentage/100) * player.tail.length);

    //Delete Old Tail
    for (let i = 0; i < player.tail.length; i++) {
        updateSnakeCells.push({
            x: player.tail[i].x,
            y: player.tail[i].y,
            player: player
        })
    }
    updateSnakeCells.push({
        x: player.pos.x,
        y: player.pos.y,
        player: player
    })

    player.isDead = false;
    player.tail = [];
    player.items = [];
    for (let j = 0; j < currentGameMode.howManyItemsCanPlayersUse; j++) {
        player.items.push("empty");
    }
    let team = player.team;
    player.status = ["status_" + team];
    player.justDied = false;
    player.bodyArmor = 1;
    player.justTeleported = false;
    player.moveQueue = [];
    player.moveTik = 0;
    player.moveSpeed = 6;
    player.turboDuration = 0;
    player.turboActive = false;
    player.shield = 0;


    spawn(player);
    growPlayer(player,length);
    updatePlayerCard(player);
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
        img2.src = "img/gameUI/windowBackground.png";

        let itemImg = div.create("img");
        itemImg.className = "game_cc_pi_item_img";
        itemImg.src = "img/backgrounds/clear.png";

    }

    //Clear All Status'
    $(".game_c2_extra").innerHTML = "";

    //Setting Player Snake Color
    $(".game_c1_snakeHead").style.filter = getPlayerFilter(player);

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
        clone.$(".pc_c1_img").style.filter = getPlayerFilter(player);

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
        flag.$("pc_c2_headImg").src = getImageFromItem("item",player.equiped.head,"src");
    } else {
        flag.$("pc_c2_headImg").src = "img/backgrounds/clear.png";
    }
    if (player.equiped.body) {
        flag.$("pc_c2_bodyImg").src = getImageFromItem("item",player.equiped.body,"src");
    } else {
        flag.$("pc_c2_bodyImg").src = "img/backgrounds/clear.png";
    }
    if (player.equiped.tail) {
        flag.$("pc_c2_tailImg").src = getImageFromItem("item",player.equiped.tail,"src");
    } else {
        flag.$("pc_c2_tailImg").src = "img/backgrounds/clear.png";
    }
}
function updateGameScene(player) {

    if ($(".game_cc_pi_item_wallIMG2")) {
        $(".game_cc_pi_item_wallIMG2").css({
            filter: "none",
        })
        //Updating Inventory
        for (let i = 0; i < player.items.length; i++) {
            let holder = $("inventory_slot_" + i);
            let item = player.items[i];
    
            if (player.selectingItem === i) holder.$(".game_cc_pi_item_wallIMG2").css({
                filter: "brightness(1.5)",
            })
    
            if (item == "empty") {
                holder.$(".game_cc_pi_item_img").src = "img/backgrounds/clear.png";
                continue;
            }
    
            holder.$(".game_cc_pi_item_img").src = getImageFromItem("item",item,"src");
        }
    }
    
    //Updating Player Stats
    if ($(".game_c2_playerStatus").src !== `img/gameUI/activePlayerInfo_${player.team}.png`)
        $(".game_c2_playerStatus").src = `img/gameUI/activePlayerInfo_${player.team}.png`;
    $("game_c2_points").innerHTML = 0;
    $("game_c2_length").innerHTML = player.tailLength;
    $("game_c2_kills").innerHTML = player.playerKills;
    $("game_c2_minutes").innerHTML = "00";
    $("game_c2_seconds").innerHTML = "00";
    $(".game_c2_c1_tail").src = "img/backgrounds/clear.png";
    $(".game_c2_c1_head").src = "img/backgrounds/clear.png";
    $(".game_c2_c1_body").src = "img/backgrounds/clear.png";

    //updating player equiped
    if (player.equiped.head) {
        $(".game_c2_c1_head").src = getImageFromItem("item",player.equiped.head,"src")
        $(".game_c2_c1_text_head").innerHTML = player.equiped.head.whenEquiped.protect;
    } else {
        $(".game_c2_c1_head").src = "img/backgrounds/clear.png";
        $(".game_c2_c1_text_head").innerHTML = "";
    }
    if (player.equiped.body) {
        $(".game_c2_c1_body").src = getImageFromItem("item",player.equiped.body,"src")
        $(".game_c2_c1_text_body").innerHTML = player.equiped.head.whenEquiped.protect;
    } else {
        $(".game_c2_c1_body").src = "img/backgrounds/clear.png";
        $(".game_c2_c1_text_body").innerHTML = "";
    }
    if (player.equiped.tail) {
        $(".game_c2_c1_tail").src = getImageFromItem("item",player.equiped.tail,"src")
        $(".game_c2_c1_text_body").innerHTML = player.equiped.head.whenEquiped.protect;
    } else {
        $(".game_c2_c1_tail").src = "img/backgrounds/clear.png";
        $(".game_c2_c1_text_tail").innerHTML = "";
    }
}

function generatePlayerCards(players) {
    return;
    let playerCardsHolder = $("playerCardsHolder");
    playerCardsHolder.innerHTML = "";
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        let playerCard = playerCardsHolder.create("div");
        playerCard.id = "playercard_" + player.name +"_"+ player.id;
        playerCard.className = "playercard_holder";

        let cardDirection;
        let isLeft;
        if (i < 4) {
            cardDirection = "left";
            isLeft = true;
        } else {
            cardDirection = "right";
            isLeft = false;
        }
        playerCard.direction = cardDirection;


        if (isLeft) {
            playerCard.style.left = 0;
        } else {
            playerCard.style.right = 0;
        }
        let cardWidth = ((window.innerWidth - canvas_background.width) / 2);
        let cardHeight = ((cardWidth*2432)/5312);

        let topPosition = i * (cardHeight + ((window.innerHeight-(cardHeight*4))/4));
        playerCard.css({
            top: topPosition + "px",
            width: cardWidth + "px",
            height: cardHeight + "px",
        })

        let backgroundImage = playerCard.create("img");
        backgroundImage.className = "playercard_background";
        backgroundImage.id = "playercard_teamImg";

        let leftStats = playerCard.create("div");
        leftStats.className = "playercard_leftStats";
        leftStats.style.marginLeft = "14%";
        leftStats.style.width = "35%";
        leftStats.style.marginTop = 0.00734186746 + "%";
        leftStats.style.height = "85%";

        let playerName = leftStats.create("div");
        playerName.innerHTML = player.name;
        playerName.className = "playercard_text";

        let leftStatsRow1 = leftStats.create("div");
        leftStatsRow1.className = "playercard_left_row1";

        let playerImgHolder = leftStatsRow1.create("div");
        playerImgHolder.className = "playercard_playerImgHolder";
        let playerImg = playerImgHolder.create("img");
        playerImg.src = "img/snakeHead.png";
        playerImg.style.filter = getPlayerFilter(player);
        playerImg.className = "playercard_playerImg";
        playerImg.id = "playercard_img";

        let sizeCol = leftStatsRow1.create("div");
        sizeCol.className = "playercard_left1_col_size";
        let sizeTitle = sizeCol.create("div");
        sizeTitle.innerHTML = "Size";
        sizeTitle.className = "playercard_text";
        let sizeText = sizeCol.create("div");
        sizeText.className = "playercard_text";
        sizeText.id = "playercard_size";
        
        if (currentGameMode.howManyItemsCanPlayersUse > 0) {
            let inventoryTitle = leftStats.create("div");
            inventoryTitle.innerHTML = "Inventory";
            inventoryTitle.className = "playercard_text";

            let inventoryHolder = leftStats.create("div");
            inventoryHolder.className = "playercard_inventory";
            
            if (currentGameMode.howManyItemsCanPlayersUse > 5) {

            }
            let firstRow = inventoryHolder.create("div");
            firstRow.className = "playercard_inventory_row";
            let secondRow, lessThan, greaterThan;
            if (currentGameMode.howManyItemsCanPlayersUse > 5) {
                secondRow = inventoryHolder.create("div");
                secondRow.className = "playercard_inventory_row";
                lessThan = Math.ceil(currentGameMode.howManyItemsCanPlayersUse/2);
                greaterThan = lessThan-1;
            }
            function addInventoryItem(parent,index) {
                let holder = parent.create("div");
                holder.id = "slot_" + index;
                let className = "playercard_inventory_slot";
                if (currentGameMode.mode_usingItemType) {
                    if (player.selectingItem == index) className += " playercard_invetory_slot_selected";
                }
                holder.className = className;

                let image = holder.create("img");
                image.className = "playercard_inventory_image";
            }
            for (let i = 0; i < currentGameMode.howManyItemsCanPlayersUse; i++) {
                if (currentGameMode.howManyItemsCanPlayersUse < 6) addInventoryItem(firstRow,i);
                else {
                    if (i < lessThan) addInventoryItem(firstRow,i);
                    if (i > greaterThan) addInventoryItem(secondRow,i);
                }
            }
        }
        
        updatePlayerCard(player);
    }
}
function updatePlayerCard(player,whatToUpdate = "all") {
    return;
    if (!player) return;

    let cardHolder = $("playercard_" + player.name +"_"+ player.id);

    if (whatToUpdate == "all" || whatToUpdate == "team") cardHolder.$("playercard_teamImg").src = `img/status/playerCard_${player.team}_${cardHolder.direction}.png`;

    if (whatToUpdate == "all" || whatToUpdate == "size") cardHolder.$("playercard_size").innerHTML = player.tailLength;
    
    if (whatToUpdate !== "all" && whatToUpdate !== "inventory") return;

    cardHolder.$(".playercard_inventory_slot").classRemove("playercard_invetory_slot_selected");
    cardHolder.$("slot_" + player.selectingItem).classAdd("playercard_invetory_slot_selected");

    for (let i = 0; i < player.items.length; i++) {
        let image = cardHolder.$("slot_" + i).$(".playercard_inventory_image");
        if (player.items[i] == "empty") {
            image.src = "img/backgrounds/clear.png";
            continue;
        }


        let item = player.items[i];
        image.src = getImageFromItem("item",item,"src");
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

            if (lobby.board.recommendedGameMode) {
                $("sc_boards_recommendedGameMode").show();
                $("sc_boards_recommendedGameMode").innerHTML = "Recommended Game Mode: " + lobby.board.gameMode.name;
            } else $("sc_boards_recommendedGameMode").hide();
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
    if (type == "board" && localAccount.id === extra) {
        if (lobby.recommendedGameMode) {
            $("sc_boards_recommendedGameMode").show();
            $("sc_boards_recommendedGameMode").innerHTML = "Recommended Game Mode: " + lobby.gameMode.name;
        } else $("sc_boards_recommendedGameMode").hide();
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
                        image.style.filter = getPlayerFilter(filter);
                    }
                    if (func) {
                        imageHolder.on("click",function() {
                            func(player);
                        })
                    }
                }
                makeImage(holder,"lobbySnakeImageHolder","img/snakeSkins/snake_" + reference[i].snakeSkin + "_head.png",reference[i]);
                
                let snakeName = holder.create("div");
                snakeName.className = "lobbySnakeName";
                snakeName.innerHTML = isYou ? "You" : reference[i].accountName + reference[i].accountTag;
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
                        }},
                        [
                            {type: "text",text: "Allow Board Submissions",color: "white"},
                            {type: "checkbox",value: reference[i].canSubmitBoards,onClick: function(a,b,div) {
                                socket.emit("setPlayerBoardSubbmisionStatus",reference[i],div.checked);
                            }},
                        ],
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
            filter: getPlayerFilter(player),
        }); 
    }
    
    if (type == "all" || type == "submissionStatus") {
        if (player.canSubmitBoards && !isHost) {
            $(".canAddSubbmisionsOnly").show();
        } else {
            $(".canAddSubbmisionsOnly").hide();
        }
    }
    
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

    if (type == "all" || type == "gameMode") logGameModeChanges($(".sc_gameModeChanges"),(type == "all" ? lobby.gameMode : lobby),false);

    if (type == "all" || type == "board") {
        requestAnimationFrame(() => {
            $(".sc_boards_canvas").width = $(".sc_canvas_holder").clientWidth;
            $(".sc_boards_canvas").height = $(".sc_canvas_holder").clientHeight; 
            drawBoardToCanvas(localAccount.lobbyBoard.originalMap,$(".sc_boards_canvas"),true);
        });
    }
}
function generateBoardsPopup(type) {
    let parent = $(".cbp_boardsList");

    parent.innerHTML = "";

    function generateBoard(parent,board) {
        let holder = parent.create("div");
        holder.className = "cbp_board_holder";

        let canvas = holder.create("canvas");
        canvas.className = "cbp_board_canvas";
        setTimeout(function() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            drawBoardToCanvas(board.originalMap,canvas,true);
        },1)
        

        let title = holder.create("div");
        title.className = "cbp_board_title";
        title.innerHTML = board.name;

        holder.board = board;
        holder.on("click",function() {
            $(".chooseBoardPopup").hide();
            $(".chooseBoardPopup").func(this.board);
        })
    }

    if (type == "lobby") {
        for (let i = 0; i < localAccount.lobbyBoards.length; i++) {
            let board = localAccount.lobbyBoards[i];
            generateBoard(parent,board);
        }
        return;
    }
    if (type == "personal") {
        for (let i = 0; i < localAccount.boards.length; i++) {
            generateBoard(parent,localAccount.boards[i]);
        }
    }
    if (type == "preset") {
        for (let i = 0; i < presetBoards.length; i++) {
            generateBoard(parent,presetBoards[i]);
        }
    }
    /*
    if (type == "personal") {
        let holder = parent.create("div");
        holder.className = "cbp_board_holder";

        let title = holder.create("div");
        title.className = "cbp_board_import";
        title.innerHTML = "+";

        holder.board = board;
        holder.on("click",function() {
            // Create an input element of type file
            const input = document.createElement('input');
            input.type = 'file';

            // When the user selects a file
            input.addEventListener('change', (event) => {
                const file = event.target.files[0]; // Get the first selected file
                if (file) {
                    readFileContent(file); // Read the content of the file
                    $(".chooseBoardPopup").hide();
                } else {
                alert('No file selected!');
                }
            });

            // Programmatically click the input to open the file dialog
            input.click();
        })
    }*/
}
function selectTabInBoardMenu(tab) {
    $(".cbp_tab").classRemove("cbp_tab_selected");
    $("cbp_" + tab).classAdd("cbp_tab_selected");

    generateBoardsPopup(tab);

}
function showBoardMenu(func) {
    selectTabInBoardMenu("preset");
    $(".chooseBoardPopup").func = func;
    $(".chooseBoardPopup").show("flex");
    socket.emit("askForLobbyBoards");
}
function loadGameModesToPopup(tab,func) {
    $(".cbp_tab").classRemove("cbp_tab_selected");
    $("cgm_" + tab).classAdd("cbp_tab_selected");

    let parent = $(".cgm_list");
    parent.innerHTML = "";

    let gameModes;
    if (tab == "preset") gameModes = presetGameModes;
    if (tab == "personal") gameModes = localAccount.gameModes;

    for (let i = 0; i < gameModes.length; i++) {
        let holder = parent.create("div");
        holder.className = "cgm_gameMode_holder";
        holder.innerHTML = gameModes[i].name;

        holder.gameMode = gameModes[i];
        holder.on("click",function() {
            $(".chooseGameModePopup").hide()
            func(this.gameMode);
        })
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
    $(".endScreenContent").style.transition = "none";
    $(".endScreenContent").style.opacity = "0";
    $(".endScreenContent").clientWidth;
    $(".endScreenContent").style.transition = "all .8s ease";

    
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
        $(".endScreenContent").style.opacity = "1";
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

function logGameModeChanges(holder,gameMode) {
    holder.innerHTML = "";

    let alterations = [];

    let loggingSelectKeys = ["howManyItemsCanPlayersUse","mode_usingItemType","mode_whenInventoryFullWhereDoItemsGo","whenSnakesDie","respawn","snakeCollision","teamCollision","respawnTimer","respawnGrowth","respawnProtection"];

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
        if (basedGameMode[key] !== gameMode[key]) alterations.push({
            key: formatString(key),
            oldValue: basedGameMode[key],
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
        let itemName = gameMode.itemAlterations[i].name;
        for (let j = 0; j < gameMode.itemAlterations[i].alterations.length; j++) {
            let altList = gameMode.itemAlterations[i].alterations[j];
            let realValue = getRealItem(itemName);

            let altHolder = holder.create("div.gm_alt_holder");
            let itemHolder = altHolder.create("div.gm_alt_item_holder");
            let itemImage = itemHolder.create("img.gm_alt_item");
            itemImage.src = getImageFromItem("item",realValue,"src");

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
    sound.play();
}
$(".playButtonSounds").forEach(button => {
    button.addEventListener("mouseenter", () => playSound(hoverSound)); // Hover sound
    button.addEventListener("click", () => playSound(clickSound)); // Click sound
});

function getPlayerFilter(player) {
    return `hue-rotate(${player.color}deg) saturate(${player.color2}%) brightness(${player.color3}%)`;
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
        socket.emit("saveBoardToIndex",JSON.stringify(shortenBoard(currentBoard)),index,"changeServerBoard");
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
function setNestedValue(obj, path, value, toReturn = false) {
    let lastKey = path.pop(); // Remove and store the last key
    if (value === "_LAST_") {
        value = lastKey; // If value is "_LAST_", use the last key as the value
        lastKey = path.pop(); // Get the new last key
    }
    
    let target = path.reduce((acc, key) => {
        if (acc && acc.hasOwnProperty(key)) return acc[key];
        return undefined; // Exit early if the path doesn't exist
    }, obj);

    if (target === undefined || !target.hasOwnProperty(lastKey)) return; // Do nothing if path is invalid

    if (toReturn) {
        return target[lastKey]; // Return the value instead of setting it
    } else {
        target[lastKey] = value; // Set the value if not in return mode
    }
}
