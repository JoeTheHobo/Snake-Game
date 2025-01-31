ls.setID("snakegame");

let forceReset = 7;
let needsToBeReset = ls.get("reset" + forceReset,true);
if (needsToBeReset) {
    ls.clear();
    ls.save("reset" + forceReset,false);
}
let forceGMReset = 8;
needsToBeReset = ls.get("resetGM" + forceGMReset,true);
if (needsToBeReset) {
    ls.save("gameModes",[]);
    ls.save("resetGM" + forceGMReset,false);
}

let activePlayerCount = ls.get("activePlayerCount",[]);
let showPerformance = false;

let updateCells = [];
let updateSnakeCells = [];
let players = ls.get("players",[]);
let activePlayers;
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
    }
}
let currentBoardIndex = ls.get("currentBoardIndex",0);
if (currentBoardIndex > boards.length - 1) currentBoardIndex = 0;
let currentBoard = boards[currentBoardIndex];


let gameModes = ls.get("gameModes",presetGameModes);
if (gameModes == "") gameModes = presetGameModes;
let activeGameMode = ls.get("activeGameMode",0);
if (!gameModes[activeGameMode]) activeGameMode = 0;
ls.save("activeGameMode",activeGameMode);
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

let backgrounds = ["background.jpg"];
let currentBackground = backgrounds[0];

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
ls.save("gameModes",gameModes);

//Setting Up Canvas
let canvas_background = $("render_background");
let ctx_background = canvas_background.getContext("2d");
let canvas_tiles = $("render_tiles");
let ctx_tiles = canvas_tiles.getContext("2d");
let canvas_items = $("render_items");
let ctx_items = canvas_items.getContext("2d");
let canvas_players = $("render_players");
let ctx_players = canvas_players.getContext("2d");
let canvas_overhangs = $("render_overhangs");
let ctx_overhangs = canvas_players.getContext("2d");

let me_canvas = $("me_canvas");
let me_ctx = me_canvas.getContext("2d");
let me2_canvas = $("me_canvas2");
let me2_ctx = me2_canvas.getContext("2d");

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

let allCanvas = [canvas_background,canvas_tiles,canvas_items,canvas_players,canvas_overhangs,me_canvas,me2_canvas,canvas_firstPerson_tl,
    canvas_firstPerson_tm,canvas_firstPerson_tr,canvas_firstPerson_lm,canvas_firstPerson_rm,canvas_firstPerson_bl,canvas_firstPerson_bm,canvas_firstPerson_br,canvas_firstPerson_master
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
    $(".boardStatusHolder").css({
        top: offset.bottom + "px",
        left: offset.left + "px",
        width: width,
    })
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
        addY = gridSize+(gridSize/4)+15;
        addX = (-gridSize/10)+5;
    }
    
    $(".game_canvas").css({
        left: (xDif+addX) + "px",
        top: (yDif+addY) + "px",
    });
    
    if (cameraQuickZoom) {
        cameraQuickZoom = false;
        setTimeout(() => {
            $(".game_canvas").css({ transition: "all .4s ease" });
        }, 0);
    }
}
//End Load All Item Images
let itemCanvas = [];
function setUpItemCanvas() {
    let html_itemCanvasHolder = $("itemCanvasHolder");
    html_itemCanvasHolder.innerHTML = "";

    for (let i = 0; i < items.length; i++) {
        addItemCanvas(items[i],items[i].img,items[i].name);

        if (items[i].onCollision) {
            if (items[i].onCollision.switchImage) {
                addItemCanvas(items[i],items[i].onCollision.switchImage,items[i].name + "_switch");
            }
        }
    }
}
function makeItemCanvas(image,filter = "",player) {
    let html_itemCanvasHolder = $("itemCanvasHolder");

    let itemCanvas = html_itemCanvasHolder.create("canvas");
    let itemCtx = itemCanvas.getContext("2d");

    if (filter == "player") {
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

function getRealItem(name) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].name == name) {
            return items[i];
        }
    }
}
function getItem(name) {
    for (let i = 0; i < currentGameMode.items.length; i++) {
        if (currentGameMode.items[i].name == name) {
            return currentGameMode.items[i];
        }
    }
}
function getTile(name) {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].name == name) {
            return tiles[i];
        }
    }
}
function newPlayer() {
    let playerNumber = players.length;
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
function spawn(name,generateRandomItem = true,counting = false) {
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
                spawn(name,generateRandomItem,true);
            }
            return;
        }
        if (item.spawnLimit !== false) item.spawnLimit--;
    }
        

    let counter = 0;
    let foundSpot = false;
    let x,y;
    while (foundSpot == false) {
        if (isPlayer) {
            
            findingExactSpawner: for (let k = 0; k < currentBoard.map.length; k++) {
                for (let j = 0; j < currentBoard.map[0].length; j++) {
                    if (currentBoard.map[k][j].item === false) continue;
                    if (currentBoard.map[k][j].item.spawnPlayerHere !== true) continue;
                    if (currentBoard.map[k][j].item.spawnPlayerID == "player" || currentBoard.map[k][j].item.spawnPlayerID === undefined) continue;
                    if (Number(currentBoard.map[k][j].item.spawnPlayerID.subset("_\\after","end")) !== Number(name.id)) continue;

                    let playerOnIt = false;
                    for (let i = 0; i < activePlayers.length; i++) {
                        if (activePlayers[i].pos.x == j && activePlayers[i].pos.y == k) playerOnIt = true;
                    }
                    if (playerOnIt) continue;

                    x = j;
                    y = k;
                    foundSpot = true;
                    break findingExactSpawner;
                    
                }
            }
            if (!foundSpot) {

                findingSpawner: for (let k = 0; k < currentBoard.map.length; k++) {
                    for (let j = 0; j < currentBoard.map[0].length; j++) {
                        if (currentBoard.map[k][j].item === false) continue;
                        if (currentBoard.map[k][j].item.spawnPlayerHere !== true) continue;
                        if (currentBoard.map[k][j].item.spawnPlayerID !== "player") continue;
                        
                        let playerOnIt = false;
                        for (let i = 0; i < activePlayers.length; i++) {
                            if (activePlayers[i].pos.x == j && activePlayers[i].pos.y == k) playerOnIt = true;
                        }
                        if (playerOnIt) continue;
                        
                        x = j;
                        y = k;
                        foundSpot = true;
                        break findingSpawner;
                    }
                }

                
                if (!foundSpot) {
                    findingSpawner: for (let k = 0; k < currentBoard.map.length; k++) {
                        for (let j = 0; j < currentBoard.map[0].length; j++) {
                            if (currentBoard.map[k][j].item === false) continue;
                            if (currentBoard.map[k][j].item.spawnPlayerHere !== true) continue;
                            let playerOnIt = false;
                            for (let i = 0; i < activePlayers.length; i++) {
                                if (activePlayers[i].pos.x == j && activePlayers[i].pos.y == k) playerOnIt = true;
                            }
                            if (playerOnIt) continue;
        
                            x = j;
                            y = k;
                            foundSpot = true;
                            break findingSpawner;
                        }
                    }
                }
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
        } else {
            currentBoard.map[y][x].item = currentGameMode.items[itemIndex];
            updateCells.push({
                x: x,
                y: y,
            })
            if (generateRandomItem && item.onEat?.spawnRandomItem) specialItemManager();
        }
    } else {
        console.log("No Available Spot To Spawn");
    }
};
function calculateDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
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
    let index = player.id;
    if ($("card" + index)) $("card" + index).remove();

    let itemBoxHolderSize = 50;
    let cardWidth;
    cardWidth = currentGameMode.howManyItemsCanPlayersUse * itemBoxHolderSize;
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

        let borderColor = "2px solid black";
        if (currentGameMode.mode_whenInventoryFullWhereDoItemsGo == "recycle" && player.whenInventoryIsFullInsertItemsAt == i && !player.items.includes("empty")) borderColor = "2px solid blue";  
        if (player.selectingItem == i && currentGameMode.mode_usingItemType !== "direct") borderColor = "2px solid gold";

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

    let cardTop = "", cardLeft = "", cardRight = "", cardBottom = "";
    let statusTop = "", statusLeft = "", statusRight = "", statusBottom = "", statusFlex = "column";
    //Set Card Position
    switch(index) {
        case 0:
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
            cardBottom = 5 + (itemBoxHolderSize* 0.9);
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
        width: "20px",
        display: "flex",
        flexDirection: statusFlex,
        top: statusTop,
        left: statusLeft,
        bottom: statusBottom,
        right: statusRight,
    })
    for (let i = 0; i < player.status.length; i++) {
        if (player.status[i].subset(0,6) == "player_") continue;

        let statusImage = statusHolder.create("img");
        statusImage.src = "img/" + getRealItem(player.status[i]).img;
        statusImage.css({
            width: "100%",
        })
    }
}

function createBoard(name,width,height) {
    boards.push({
        name: name,
        width: width,
        height: height,
        background: false,
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

function loadBoardStatus() {
    let holder = $(".boardStatusHolder");
    holder.innerHTML = "";

    for (let i = 0; i < currentBoard.boardStatus.length; i++) {
        let status = currentBoard.boardStatus[i];
        let imgHolder = holder.create("div");
        imgHolder.css({
            width: "25px",
            height: "25px",
            margin: "2px",
            borderRadius: "5px",
            border: "2px solid black",
            background: "white",
        })

        if (status.subset(0,5) == "player") {
            if (status.subset(0,6) == "player_") {
                let text = imgHolder.create("div");
                text.innerHTML = "P" + status.subset("_\\after","end"); 
                text.css({
                    width: "100%",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "25px",
                    lineHeight: "50px",
                    textAlign: "center",
                })
            }
            if (status == "player") {
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
            img.src = "img/" + getRealItem(status).img;
            img.css({
                width: "100%",
                height: "100%",
            })
        }

        
    }
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
        let pos = (map[d.y][d.x].item);
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
function cloneObject(object) {
    try {
        return structuredClone(object);
    } catch {
        console.warn("Structed Clone Failed On:",object);
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



function drawBoardToCanvas(board,canvas) {
    let ctx = canvas.getContext("2d");
    let gs;

    if (board.length > board[0].length) {
        gs = Math.round(canvas.height / board.length);

    } else {
        gs = Math.round(canvas.width / board[0].length);

    } 

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
                ctx.drawImage(getItemCanvas(cell.item.name),Xpos,Ypos,(gs),(gs));
            }

        }
    }


}