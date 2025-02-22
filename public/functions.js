ls.setID("snakegame");

let killSwitch = false;

let backgrounds = ["colors","water","space","clear"];
let currentBackground = backgrounds[0];

let showPerformance = false;

let updateCells = [];
let updateSnakeCells = [];

let activePlayers;
let activePlayerCount = [];
let showingGameTips = false;
//End Players


let boards = ls.get("boards",[]);
if (_type(boards).type == "string") {
    compressed = JSON.parse(boards);
    boards = JSON.parse(pako.ungzip(compressed, { to: 'string' }));
}
let realBoards = [];
for (let i = 0; i < boards.length; i++) {
    if (boards[i].cantEdit !== true) realBoards.push(boards[i]);
}
boards = realBoards;
boards = presetBoards.concat(boards);
if (boards.length) {
    for (let i = 0; i < boards.length; i++) {
        boards[i] = fixBoard(boards[i]);

        if (!boards[i].minPlayers) boards[i].minPlayers = 1;
        if (!boards[i].maxPlayers) boards[i].maxPlayers = 8;
        if (!boards[i].background) boards[i].backgrounds = backgrounds[0];
        if (!boards[i].recommendedGameMode) boards[i].recommendedGameMode = false;
        if (!boards[i].gameMode) boards[i].gameMode = false;
    }
}
let currentBoardIndex = ls.get("currentBoardIndex",0);
if (currentBoardIndex > boards.length - 1) currentBoardIndex = 0;
let currentBoard = boards[currentBoardIndex];


let gameModes = ls.get("gameModes",presetGameModes);
if (_type(gameModes).type == "string") gameModes = unZip(gameModes);
let activeGameMode = ls.get("activeGameMode",0);
if (!gameModes[activeGameMode]) activeGameMode = 0;
ls.save("activeGameMode",activeGameMode);

//Fix GameModes
function mergeGameModes(basedGameMode, currentGameMode) {
    for (const key in basedGameMode) {
        if (basedGameMode.hasOwnProperty(key)) {
            if (typeof basedGameMode[key] === 'object' && basedGameMode[key] !== null) {
                // If the property is an object and not null, ensure currentGameMode has it as an object
                if (!currentGameMode.hasOwnProperty(key) || typeof currentGameMode[key] !== 'object') {
                    currentGameMode[key] = {};
                }
                // Recursively merge nested objects
                mergeGameModes(basedGameMode[key], currentGameMode[key]);
            } else {
                // If the property is missing, copy it over
                if (!currentGameMode.hasOwnProperty(key)) {
                    currentGameMode[key] = basedGameMode[key];
                }
            }
        }
    }
}
for (let i = 0; i < gameModes.length; i++) {
    mergeGameModes(basedGameMode,gameModes[i]);
}

let currentGameMode = gameModes[activeGameMode];

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

//Setting up colors

let global_gameColors = [
    ["white","#ffffff"],
    ["aquamarine","#61f3cc"],
    ["blue","#25008f"],
    ["buff","#f7d082"],
    ["coral","#f07a7d"],
    ["crimsonpurple","#e33bf1"],
    ["gold","#ccbb00"],
    ["green","#3e9000"],
    ["lemon","#e0ff00"],
    ["lime","#6ff600"],
    ["magenta","#85008f"],
    ["orange","#f29900"],
    ["pink","#e8006f"],
    ["red","#ee0013"],
    ["skyblue","#85d0ff"],
    ["slateblue","#7564ff"],
    ["venom","#6b7a00"],
]
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

//Fix game Modes
for (let i = 0; i < gameModes.length; i++) {
    for (let j = 0; j < gameModes[i].items.length; j++) {
        let item = gameModes[i].items[j];
        let realItem = getRealItem(item.name);
        for (const [key, value] of Object.entries(realItem)) {
            if (item[key] === undefined) {
                item[key] = value;
            }
        }

        
    }
    for (let k = 0; k < items.length; k++) {
        let realItem = items[k];
        let found = false;
        finding: for (let p = 0; p < gameModes[i].items.length; p++) {
            let item = gameModes[i].items[p];
            if (item.name == realItem.name) {
                found = true;
                break finding;
            }
        }
        if (!found) {
            gameModes[i].items.push(realItem);
        }
    }
}
saveAllGameModes()

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

for (let i = 0; i < tiles.length; i++) {
    if (!tiles[i].img) continue;

    let img = $(".imageHolder").create("img");
    img.src = "img/" + tiles[i].img;
    img.id = "tile_" + tiles[i].name;
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
        if (!item.baseImg) {
            addItemCanvas(items[i],items[i].img,items[i].name);
            continue;
        }

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
}
function makeItemCanvas(image,filter = "",player) {
    let html_itemCanvasHolder = $("itemCanvasHolder");

    let itemCanvas = html_itemCanvasHolder.create("canvas");
    let itemCtx = itemCanvas.getContext("2d");

    if (filter == "*P") {
        filter = `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`;
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
setUpItemCanvas();
function getItemCanvas(itemName) {
    for (let i = 0; i < itemCanvas.length; i++) {
        if (itemCanvas[i].name === itemName) return itemCanvas[i].canvas;
    }
}




function setResolution(gridx, gridy) {
    setGridSize(cameraFollowPlayer === false ? .17 : .32);
    adjustCanvasSize(gridx,gridy,1);
}



function newMap(width,height) {
    _newMap = [];
    for (let i = 0; i < height; i++) {
        let arr = [];
        for (let j = 0; j < width; j++) {
            arr.push({
                tile: getTile("grass"),
                item: false,
            })
        }
        _newMap.push(arr);
    }
    return _newMap;
}


function getRealItem(name) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].name == name) {
            return cloneObject(items[i]);
        }
    }
}
function getItem(name) {
    for (let i = 0; i < currentGameMode.items.length; i++) {
        if (currentGameMode.items[i].name == name) {
            return cloneObject(currentGameMode.items[i]);
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
        for (let i = 0; i < currentGameMode.items.length; i++) {
            if (currentGameMode.items[i].name == name) {
                itemIndex = i;
                item = currentGameMode.items[i];
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

                let playerTeam = findPlayersTeam(name);
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
            runItemFunction(sendPlayer,currentGameMode.items[itemIndex],"onSpawn",{x:x,y:y},{playAudio: playAudio});
            currentBoard.map[y][x].item = cloneObject(currentGameMode.items[itemIndex]);
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
function createBoard(name,width,height) {
    width = Number(width);
    height = Number(height);
    boards.push({
        name: name,
        width: width,
        height: height,
        minPlayers: 1,
        maxPlayers: 8,
        background: backgrounds[0],
        recommendedGameMode: false,
        gameMode: currentGameMode,
        map: newMap(width,height),
        id: Date.now() + "_" + rnd(1000),
        mouseOver: false,
    })

    currentBoardIndex = boards.length - 1;
    currentBoard = boards[currentBoardIndex];
    currentBoard.originalMap = currentBoard.map;

    ls.save("currentBoardIndex",currentBoardIndex);
    saveBoards();
    
    openMapEditor(currentBoard);
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
function zip(what) {
    const encoder = new TextEncoder();
    const shortenResult = gameModes;

    if (!shortenResult) {
        throw new Error('shortenBoard(this.board) returned invalid data.');
    }

    const jsonString = JSON.stringify(shortenResult);
    const encodedText = encoder.encode(jsonString);

    const compressed = pako.gzip(encodedText);

    return JSON.stringify(compressed);
}
function unZip(what) {
    compressed = JSON.parse(what);
    return JSON.parse(pako.ungzip(compressed, { to: 'string' }));
}
function saveAllGameModes() {
    ls.save("gameModes",zip(gameModes));
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

function loadBoardStatus(index) {
    let holder = $(".boardStatusHolder");
    holder.innerHTML = "";

    let statusSize = cameraFollowPlayer ? 40 : 25;

    let statusGroups = [];
    for (let i = 0; i < currentBoard.boardStatus.length; i++) {
        let foundStatus = false;
        for (let j = 0; j < statusGroups.length; j++) {
            if (statusGroups[j][0] === currentBoard.boardStatus[i]) {
                statusGroups[j].push(currentBoard.boardStatus[i]);
                foundStatus = true;
            }    
        }
        if (foundStatus) continue;
        statusGroups.push([currentBoard.boardStatus[i]]);
    }

    for (let i = 0; i < statusGroups.length; i++) {
        let status = statusGroups[i][0];
        let count = statusGroups[i].length;


        let contentHolder = holder.create("div");
        contentHolder.css({
            width: "max-content",
            minWidth: "20px",
            textAlign: "center",
            paddingLeft: "3px",
            paddingRight: "3px",
            height: statusSize + "px",
            margin: "2px",
            borderRadius: "5px",
            border: "2px solid black",
            background: getColorFromTeam(status),
            fontFamily: "VT323",
        })

        if (count > 1) {
            let text = contentHolder.create("div");
            text.innerHTML = count; 
            text.css({
                width: "100%",
                color: "black",
                fontWeight: "bold",
                fontSize: statusSize+ "px",
                lineHeight: statusSize + "px",
                textAlign: "center",
                fontFamily: "VT323",
            })
        }
        

        
    }

    updateStatusCells();
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
            if (change.length == 4) {
                pos[change[0]][change[1]][change[2]] = change[3];
            }
            if (change.length == 3) {
                pos[change[0]][change[1]] = change[2];
            }
            if (change.length == 2) {
                pos[change[0]] = change[1];
            }
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

function forceAllCellsToBeTheirOwn(map) {
    let newMap = [];
    for (let i = 0; i < map.length; i++) {
        let row = [];
        for (let j = 0; j < map[i].length; j++) {
            row.push(cloneObject(map[i][j]));
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
                
                let image;
                if (cell.item.baseImg) {
                    image = cell.item.name + "_";
                    for (let i = 0; i < cell.item.baseImgTags.length; i++) {
                        image += getBaseImgFromTag(cell.item,cell.item.baseImgTags[i])
                    }
                    image = getItemCanvas(image);
                } else {
                    image = getItemCanvas(cell.item.name);
                }
                if (!image) return;
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

function findPlayersTeam(player) {
    for (let i = 0; i < player.status.length; i++) {
        if (player.status[i].subset(0,5) == "status") return player.status[i].subset("_\\after","end");
    }
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
function getImageFromItem(item,returnType) {
    let image;
    if (item.baseImg) {
        image = item.name + "_";
        for (let i = 0; i < item.baseImgTags.length; i++) {
            image += getBaseImgFromTag(item,item.baseImgTags[i])
        }
    } else {
        image = item.name;
    }

    if (returnType == "canvas") image = getItemCanvas(image);
    if (returnType == "src") image = $("item_" + image).src;
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
    let team = findPlayersTeam(player);
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
    for (let i = 0; i < count.length; i++) {
        let img = holder.create("img");
        img.className = "gmae_cc_pi_wall";
        img.src = global_wallImage;
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
        playerImg.style.filter = `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`;
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

    if (whatToUpdate == "all" || whatToUpdate == "team") cardHolder.$("playercard_teamImg").src = `img/status/playerCard_${findPlayersTeam(player)}_${cardHolder.direction}.png`;

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
        image.src = getImageFromItem(item,"src");
    }
}


function updateLobbyPage(lobby) {
    if (localAccount.id == lobby.hostID) {
        $(".hostOnly").show();
        $(".hostFlex").show("flex");

        if (lobby.board.recommendedGameMode) {
            $("sc_boards_recommendedGameMode").show();
            $("sc_boards_recommendedGameMode").innerHTML = "Recommended Game Mode: " + lobby.board.gameMode.name;

            $(".sdd_title").innerHTML = lobby.serverType;
            
        } else $("sc_boards_recommendedGameMode").hide();

        if (lobby.serverType == "Public") $(".lobbyCode").hide();
        else $(".lobbyCode").show()
        
    }
    else {
        $(".hostOnly").hide();
    }


    localAccount.lobbyBoard = lobby.board;
    currentBoard = lobby.board;

    $(".lobbyCode").innerHTML = lobby.code;
    $("sc_playerCount").innerHTML = `Players (${lobby.players.length}/${lobby.playerMax})`;
    
    $(".sc_tb_lobbyName").innerHTML = lobby.hostName + lobby.hostTag + "'s Lobby";

    $("sc_boards_boardName").innerHTML = "Board: " + lobby.board.name;

    $(".sc_gmb_gameModeName").innerHTML = "Gamemode: " + lobby.gameMode.name;

    let player;
    let playersHolder = $(".sc_players_playersList");
    playersHolder.innerHTML = "";
    let isHost = lobby.hostID === localAccount.id;
    if (lobby.activePlayers) {
        for (let i = 0; i < lobby.activePlayers.length; i++) {
            let isYou = false;
            if (lobby.activePlayers[i].accountID === localAccount.id)  {
                player = lobby.activePlayers[i];
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
                    image.style.filter = `hue-rotate(${filter.color}deg) sepia(${filter.color2}%) contrast(${filter.color3}%)`
                }
                imageHolder.on("click",function() {
                    func(player);
                })
    
            }
            makeImage(holder,"lobbySnakeImageHolder","img/snakeHead.png",lobby.activePlayers[i]);
            
            let snakeName = holder.create("div");
            snakeName.className = "lobbySnakeName";
            snakeName.innerHTML = isYou ? "You" : lobby.activePlayers[i].accountName + lobby.activePlayers[i].accountTag;
            if (lobby.hostID == lobby.activePlayers[i].accountID) snakeName.innerHTML += " (Host)";
    
            if (isYou) continue;
    
            let rightContent = holder.create("div");
            rightContent.className = "lobbyPlayersRight";
            
            //Friends to Be Added Later
            //makeImage(rightContent,"lobbyFriendsIcon","img/menuIcons/friend.png");
            if (isHost) makeImage(rightContent,"lobbyEditPlayerIcon","img/menuIcons/edit.png",false,function(player) {
                makePopUp([
                    {type: "title",color: "white",text: "Player Options: " + player.accountName},
                    {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "none",className: "hoverBorderBlue",border: "3px solid white",text:"Make Host",onClick: function() {
                        socket.emit("setLobbyHost",lobby.activePlayers[i]);
                    }},
                    {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", width: "100%",background: "none",className: "hoverBorderBlue", border: "3px solid white",text:"Kick Player",onClick: function() {
                        socket.emit("kickPlayerFromLobby",lobby.activePlayers[i]);
                    }},
                    [
                        {type: "text",text: "Allow Board Submissions",color: "white"},
                        {type: "checkbox",value: lobby.activePlayers[i].canSubmitBoards,onClick: function(a,b,div) {
                            socket.emit("setPlayerBoardSubbmisionStatus",lobby.activePlayers[i],div.checked);
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
    
    if (player) {
        $(".sc_bb_snakeImg").style.filter = `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`; 

        if (player.canSubmitBoards) {
            $(".canAddSubbmisionsOnly").show();
        } else {
            $(".canAddSubbmisionsOnly").hide();
        }
    }
    

    let chatHolder = $(".sc_chatHolder");
    chatHolder.innerHTML = "";
    for (let i = 0; i < lobby.chats.length; i++) {
        let holder = chatHolder.create("div");
        holder.className = "lobby_chatHolder";
        let name = holder.create("div");
        name.innerHTML = lobby.chats[i].account === null ? "" : lobby.chats[i].account + ": " ;
        name.style.color = lobby.chats[i].color || "gray";
        name.style.marginRight = "5px";
        let text = holder.create("div");
        text.innerHTML = lobby.chats[i].message;
        if (name === "") holder.style.color = "#696969";
        else holder.style.color = "white";
    }

    logGameModeChanges($(".sc_gameModeChanges"),lobby.gameMode,false);

    setTimeout(function() {
        $(".sc_boards_canvas").width = $(".sc_boards_canvas").clientWidth;
        $(".sc_boards_canvas").height = $(".sc_boards_canvas").clientHeight; 
        drawBoardToCanvas(lobby.board.originalMap,$(".sc_boards_canvas"),true);
    },200);
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
    for (let i = 0; i < boards.length; i++) {
        let board = boards[i];
        if (type == "preset" && board.cantEdit) generateBoard(parent,board);
        if (type == "personal" && !board.cantEdit) generateBoard(parent,board);
    }
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
function loadGameModesToPopup(func) {
    let parent = $(".cgm_list");
    parent.innerHTML = "";
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

function logGameModeChanges(holder,gameMode,logAll) {
    holder.innerHTML = "";

    let alterations = [];

    let loggingSelectKeys = ["howManyItemsCanPlayersUse","mode_usingItemType","mode_whenInventoryFullWhereDoItemsGo","snakeVanishOnDeath","respawn","snakeCollision","teamCollision"];
    let loggingAllKeys = ["respawnTimer","respawnGrowth"];

    function formatString(input) {
        input = input.replaceAll("mode_","");
        return input
            .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
            .trim()                      // Remove leading space if any
            .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize each word
    }

    let useArr = loggingSelectKeys;
    if (logAll) useArr = loggingSelectKeys.concat(loggingAllKeys)

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
    if (alterations.length == 0) {
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