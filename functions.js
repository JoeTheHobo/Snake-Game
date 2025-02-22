ls.setID("snakegame");

let forceReset = 27;
let needsToBeReset = ls.get("reset" + forceReset,true);
if (needsToBeReset) {
    ls.delete("gameModes");
    ls.save("reset" + forceReset,false);
}

let backgrounds = ["colors","water","space","clear"];
let currentBackground = backgrounds[0];

let showPerformance = false;

let updateCells = [];
let updateSnakeCells = [];

//Players
let playerNames1 = [
    "Squabbling", "Terrifying", "Witty", "Sassy", "Mysterious",
    "Jolly", "Spunky", "Clumsy", "Grumpy", "Cheeky",
    "Funky", "Zesty", "Breezy", "Quirky", "Snarky",
    "Boisterous", "Goofy", "Rambunctious", "Vivacious", "Frolicking"
];
let playerNames2 = [
    "Cheesecake", "Martian", "Taco", "Wombat", "Penguin",
    "Sasquatch", "Narwhal", "Donut", "Giraffe", "Unicorn",
    "Robot", "Ostrich", "Dragon", "Platypus", "Sloth",
    "Cactus", "Llama", "Cupcake", "Blobfish", "Banana"
];
let players = ls.get("players",[]);
if (players.length == 0) newPlayer();
let activePlayers;
let activePlayerCount = ls.get("activePlayerCount",[]);
if (activePlayerCount.length == 0) {
    players[0].active = true;
    activePlayerCount = [players[0]];
}
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


let gs_playerCount = players.length > 0 ? players.length : 1;
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
function newPlayer() {
    let gameCrashed = false;
    if (gameCrashed) {
        console.log("Game Crashed")
        return;
    }
    
    let player = {
        downKey: "s",
        upKey: "w",
        leftKey: "a",
        rightKey: "d",
        useItem1: "q",
        useItem2: "e",
        fireItem: "r",
        name: playerNames1.rnd() + playerNames2.rnd(),
        color: rnd(360), //Hue
        color2: 0, //Brightness
        color3: 100, //Contrast
        moving: false,
        growTail: 0,
        isDead: false,
        pos: {
            x: 0,
            y: 0, 
        },
        tail: [],
        moveQueue: [],
        prevMove: "start",
        id: Date.now(),
        whenInventoryIsFullInsertItemsAt: 0,
        moveTik: 0,
        moveSpeed: 6,
        longestTail: 0,
        timeSurvived: 0,
        turboDuration: 0,
        turboActive: false,
        shield: 0,
        items: [],
        status: [],
        active: false, 
    }
    players.push(player);
    ls.save("players",players);
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
                    let distance = calculateDistance(players[j].pos.x,activePlayers[j].pos.y,x,y);
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
function calculateDistance(x1, y1, x2, y2, boardLength, boardHeight) {
    boardLength = currentBoard.map[0].length;
    boardHeight = currentBoard.map.length;
    let dx = Math.min(Math.abs(x1 - x2), boardLength - Math.abs(x1 - x2));
    let dy = Math.min(Math.abs(y1 - y2), boardHeight - Math.abs(y1 - y2));
    return dx + dy;
}
function hideScenes() {
    $(".scene").hide();
}
function setScene(scene) {
    hideScenes();
    $("scene_" + scene).show("flex");
}

if (players.length == 0) {
    for (let i = 0; i < gs_playerCount; i++){
        newPlayer(i);
    }
}


function pauseGame(displayPopup = true) {
    gamePaused = true;
    let html = $(".pauseGamePopup");
    if (displayPopup) html.show("flex");
    
}
function drawPlayerBox(player) {
    let index = player.index;
    if ($("card" + index)) $("card" + index).remove();

    let itemBoxHolderSize = 50;
    if (cameraFollowPlayer) {
        itemBoxHolderSize+=15;
    }
    let borderSize = 2;
    if (cameraFollowPlayer) borderSize = 4;
    let cardWidth;
    cardWidth = currentGameMode.howManyItemsCanPlayersUse * itemBoxHolderSize;
    if (cameraFollowPlayer) cardWidth += ((borderSize)*currentGameMode.howManyItemsCanPlayersUse);
    if (currentGameMode.howManyItemsCanPlayersUse > 5) {
        cardWidth = (index == 4 || index == 7) ? currentGameMode.howManyItemsCanPlayersUse*itemBoxHolderSize : 5 * itemBoxHolderSize;
    }


    let card = $("playerCardsHolder").create("div");
    card.id = "card" + index;
    card.css({
        display: "flex",
        width: cardWidth,
        height: "max-content",
        background: "#444",
        flexDirection: "column",
        position: "absolute",
        zIndex: 500,
    })

    let itemBoxesHolder = card.create("div");
    itemBoxesHolder.css({
        width: "100%",
        background: "black",
        
    })


    for (let i = 0; i < currentGameMode.howManyItemsCanPlayersUse; i++) {
        let itemHolder = itemBoxesHolder.create("div");

        let borderColor = borderSize + "px solid black";
        if (currentGameMode.mode_whenInventoryFullWhereDoItemsGo == "recycle" && player.whenInventoryIsFullInsertItemsAt == i && !player.items.includes("empty")) borderColor = borderSize + "px solid blue";  
        if (player.selectingItem == i && currentGameMode.mode_usingItemType !== "direct") borderColor = borderSize + "px solid gold";


        itemHolder.css({
            width: itemBoxHolderSize - 4,
            height: itemBoxHolderSize - 4,
            border: borderColor,
            background: "white",
            display: "inline-block",
        })

        if (player.items[i] !== "empty") {
            let img = itemHolder.create("img");
            img.src = "img/" + player.items[i].img;
            img.css({
                width: "100%",
                height: "100%",
            })
        }
    }
    if (!cameraFollowPlayer) {
        let playerImageHolder = card.create("div");
        playerImageHolder.css({
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "-" + (itemBoxHolderSize/1.1) + "px",
            marginLeft: "auto",
            marginRight: "auto",
            background: player.isDead ? "red" : "white",
            border: "3px solid black",
            borderRadius: "50px",
            width: itemBoxHolderSize + "px",
            height: itemBoxHolderSize + "px",
        })
        let playerImage = playerImageHolder.create("img");
        playerImage.src = "img/snakeHead.png";
        playerImage.css({
            width: "100%",
            height: "100%",
            filter: `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`,
        })
    }
    

    let cardTop = "", cardLeft = "", cardRight = "", cardBottom = "";
    let statusTop = "", statusLeft = "", statusRight = "", statusBottom = "", statusFlex = "column";
    //Set Card Position
    if (cameraFollowPlayer) index = 7;
    switch(index) {
        case 0 :
            cardTop = 5;
            cardLeft = 5;
            statusTop = 5;
            statusLeft = card.offsetWidth;
            break;
        case 1:
            cardTop = 5;
            cardRight = 5;
            statusTop = 5;
            statusRight = card.offsetWidth;
            break;
        case 2:
            cardBottom = 5 + (itemBoxHolderSize* 0.9);
            cardLeft = 5;
            statusTop = 5;
            statusLeft = card.offsetWidth;
            break;
        case 3:
            cardBottom = 5 + (itemBoxHolderSize* 0.9);
            cardRight = 5;
            statusTop = 5;
            statusRight = card.offsetWidth;
            break;
        case 4:
            cardTop = 5;
            cardLeft = (window.innerWidth / 2) - (card.offsetWidth/2);
            statusFlex = "row";
            statusTop = 5 + itemBoxHolderSize;
            statusLeft = 5;
            break;
        case 5:
            cardTop = (window.innerHeight / 2) - (card.offsetHeight/2);
            cardLeft = 5;
            statusTop = 5;
            statusLeft = card.offsetWidth;
            break;
        case 6:
            cardTop = (window.innerHeight / 2) - (card.offsetHeight/2);
            cardRight = 5;
            statusTop = 5;
            statusRight = card.offsetWidth;
            break;
        case 7:
            cardBottom = 5 + (itemBoxHolderSize* 0.9) - (cameraFollowPlayer ? (itemBoxHolderSize* 0.9) : 0);
            cardLeft = (window.innerWidth / 2) - (card.offsetWidth/2);
            statusFlex = "row";
            statusTop = 5 + itemBoxHolderSize;
            statusLeft = 5;
            break;
    }
    card.css({
        top: cardTop,
        left: cardLeft,
        right: cardRight,
        bottom: cardBottom,
    })

    let statusHolder = card.create("div");
    statusHolder.css({
        position: "absolute",
        width: "100px",
        display: "flex",
        flexDirection: statusFlex,
        top: statusTop,
        left: statusLeft,
        bottom: statusBottom,
        right: statusRight,
    })

    let length = statusHolder.create("div");
    length.css({
        fontSize: "20px",
    })
    length.innerHTML = "Size: " + (player.tail.length + 1); 

    for (let i = 0; i < player.status.length; i++) {
        if (player.status[i].subset(0,6) == "status_") {
            let statusImage = statusHolder.create("img");
            statusImage.src = "img/status/status_team_" + player.status[i].subset("_\\after","end") + ".png";
            statusImage.css({
                width: "20px",
            })
            continue;
        }

        let statusImage = statusHolder.create("img");
        statusImage.src = "img/" + getRealItem(player.status[i]).img;
        statusImage.css({
            width: "20px",
        })
    }
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
    loadBoardsScreen()
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
function getImageFromItem(item,returnCanvas = true) {
    let image;
    if (item.baseImg) {
        image = item.name + "_";
        for (let i = 0; i < item.baseImgTags.length; i++) {
            image += getBaseImgFromTag(item,item.baseImgTags[i])
        }
        if (!returnCanvas) return image;
        image = getItemCanvas(image);
    } else {
        image = getItemCanvas(item.name);
    }
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
    drawPlayerBox(player);
}