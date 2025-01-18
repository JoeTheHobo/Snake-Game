ls.setID("snakegame");

let showPerformance = false;

let updateCells = [];
let updateSnakeCells = [];
let players = ls.get("players",[]);
let activePlayers;

let boards = ls.get("boards",[]);
let realBoards = [];
for (let i = 0; i < boards.length; i++) {
    if (boards[i].cantEdit !== true) realBoards.push(boards[i]);
}
boards = realBoards;
boards = presetBoards.concat(boards);
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
let gridX = 50;
let gridY = 30;
let gridSize = 20;
let circleWalls = true;
let specialItemLowChance = 1;
let specialItemHighChance = 6;
let specialItemActiveChance = 4;
let specialItemIteration = 0;
let totalSpecialItems = 1;
let timer, gameEnd;
let gamePaused = false;
let isActiveGame = false;
let currentBackground = "background.jpg";
let doColorRender = false;

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
function adjustCanvasSize() {
    const width = gridX * gridSize;
    const height = gridY * gridSize;

    // Set the canvas dimensions in device pixels
    canvas_background.width = width;
    canvas_background.height = height;
    canvas_tiles.width = width;
    canvas_tiles.height = height;
    canvas_items.width = width;
    canvas_items.height = height;
    canvas_players.width = width;
    canvas_players.height = height;
    canvas_overhangs.width = width;
    canvas_overhangs.height = height;
    me_canvas.width = width;
    me_canvas.height = height;

    // Scale the canvas visually for the screen
    canvas_background.style.width = `${width}px`;
    canvas_background.style.height = `${height}px`;
    canvas_tiles.style.width = `${width}px`;
    canvas_tiles.style.height = `${height}px`;
    canvas_items.style.width = `${width}px`;
    canvas_items.style.height = `${height}px`;
    canvas_players.style.width = `${width}px`;
    canvas_players.style.height = `${height}px`;
    canvas_overhangs.style.width = `${width}px`;
    canvas_overhangs.style.height = `${height}px`;
    me_canvas.style.width = `${width}px`;
    me_canvas.style.height = `${height}px`;
}

function setResolution(gridx = gridX, gridy = gridY) {
    const screenHeight = window.innerHeight; // Available screen height
    const screenWidth = window.innerWidth;   // Available screen width

    const heightLimit = screenHeight - 250;  // Maximum canvas height
    const widthLimit = screenWidth - 500;    // Maximum canvas width

    // Calculate the aspect ratio of the grid
    const aspectRatio = gridx / gridy;

    // Calculate the largest `gridSize` that fits within the limits
    let maxGridSizeWidth = Math.floor(widthLimit / gridx);
    let maxGridSizeHeight = Math.floor(heightLimit / gridy);

    // Match the scaling to preserve the aspect ratio
    if (maxGridSizeWidth / maxGridSizeHeight > aspectRatio) {
        maxGridSizeWidth = Math.floor(maxGridSizeHeight * aspectRatio);
    } else {
        maxGridSizeHeight = Math.floor(maxGridSizeWidth / aspectRatio);
    }

    // Use the smaller of the two to ensure the grid fits
    gridSize = Math.min(maxGridSizeWidth, maxGridSizeHeight);

    // Enforce a minimum and maximum grid size for usability
    gridSize = Math.max(gridSize, 19); // Set a reasonable minimum
    gridSize = Math.min(gridSize, 100); // Set a reasonable maximum for wide screens

    adjustCanvasSize();
}
playerCardsHolder
window.on("resize",setResolution)
setResolution();

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
function newMap(width,height) {
    newMap = [];
    for (let i = 0; i < height; i++) {
        let arr = [];
        for (let j = 0; j < width; j++) {
            arr.push({
                tile: getTile("grass"),
                item: false,
            })
        }
        newMap.push(arr);
    }
    return newMap;
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
        id: playerNumber,
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
        active: true, 
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
            findingSpawner: for (let k = 0; k < gridY; k++) {
                for (let j = 0; j < gridX; j++) {
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
        
        if (foundSpot === false) {
            x = rnd(gridX)-1;
            y = rnd(gridY)-1;
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
            if (counter > (gridX * gridY) ) {
                foundSpot = "couldn't find any";
            }
        }
    }

    if (foundSpot == "couldn't find any") {
        findingAnySpot: for (let k = 0; k < gridY; k++) {
            for (let j = 0; j < gridX; j++) {
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
            if (generateRandomItem) specialItemManager();
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
function loadPlayers() {
    ls.save("players",players);

    let html_playersHolder = $(".playersHolder");
    html_playersHolder.innerHTML = "";
    html_playersHolder.css({
        padding: "5px",
        overflowY: "scroll",
        overflowX: "hidden",
    })

    let html_newPlayerButton = html_playersHolder.create("div");
    html_newPlayerButton.innerHTML = "Add Player";
    html_newPlayerButton.css({
        padding: "5px",
        marginBottom: "5px",
        fontSize: "20px",
        userSelect: "none",
        color: "white",
        background: "black",
        width: "max-content",
        cursor: "url('./img/pointer.cur'), auto;",
        borderRadius: "3px",
    })
    html_newPlayerButton.on("click",function() {
        gs_playerCount++;
        newPlayer(gs_playerCount-1);
        if (gs_playerCount > 8) players[gs_playerCount-1].active = false;
        editPlayerScreen(players[gs_playerCount-1])
    })
    

    for (let i = 0; i < players.length; i++) {
        let player = players[i];

        if (player.active !== true && player.active !== false) player.active = true;

        let html_playerHolder = html_playersHolder.create("div");
        html_playerHolder.css({
            width: "97%",
            padding: "5px",
            marginBottom: "5px",
            background: player.active ? "black" : "rgb(70, 69, 69)",
            height: "40px",
            borderRadius: "3px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        })

        let html_playerSnakeHolder = html_playerHolder.create("div");
        html_playerSnakeHolder.css({
            background: "white",
            borderRadius: "5px",
            width: "38px",
            height: "38px",
        })

        let html_snakeImage = html_playerSnakeHolder.create("img");
        html_snakeImage.src = "img/snakeHead.png";
        html_snakeImage.css({
            width: "100%",
            height: "100%",
            filter: `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`,
        })

        let html_playerName = html_playerHolder.create("div");
        html_playerName.innerHTML = player.name;
        html_playerName.css({
            margin: "10px",
            userSelect: "none",
            fontSize: "20px",
            color: "white",
        })

        let buttonsRight = html_playerHolder.create("div");
        buttonsRight.className = "gm_buttonsRight";

        function makeRightButton(src,func) {
            let html_editSnake = buttonsRight.create("div");
            html_editSnake.className = "gm_imgHolder";
            html_editSnake.playerID = i;
            html_editSnake.on("click",function() {
                func(this.playerID);
            })
            let html_editImage = html_editSnake.create("img");
            html_editImage.src = "img/" + src;
            html_editImage.className = "gm_img";
        }

        makeRightButton("arrowDown.png",function(playerID) {
            let player = players.splice(playerID,1);
            players.insert(playerID+1,player[0]);
            loadPlayers();
        });
        makeRightButton("arrow.png",function(playerID) {
            let player = players.splice(playerID,1);
            players.insert(playerID-1,player[0]);
            loadPlayers();
        });
        makeRightButton("edit.png",function(playerID) {
            editPlayerScreen(players[playerID])
        });
        makeRightButton("delete.png",function(playerID) {
            players.splice(playerID,1);
            gs_playerCount--;
            for (let i = 0; i < players.length; i++) {
                players[i].id = i;
            }
            loadPlayers();
        });
        if (player.active) {
            makeRightButton("eyeOpen.png",function(playerID) {
                players[playerID].active = false;
                loadPlayers();
            });
        } else {
            makeRightButton("eyeClosed.png",function(playerID) {
                let activePlayers = 0;
                for (let i = 0; i < players.length; i++) {
                    if (players[i].active) activePlayers++;
                }
                if (activePlayers == 8) return;

                players[playerID].active = true;
                loadPlayers();
            });
        }
    }
}
function editPlayerScreen(player) {
    let html_playersHolder = $(".playersHolder");
    html_playersHolder.innerHTML = "";
    html_playersHolder.css({
        padding: "5px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    })



    let flex_row = html_playersHolder.create("div");
    flex_row.css({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: "30px",
    })
    let html_backArrow = flex_row.create("div");
    html_backArrow.on("click",function() {
        loadPlayers();
    })
    html_backArrow.innerHTML = "<--";
    html_backArrow.css({
        padding: "5px",
        marginBottom: "5px",
        fontSize: "20px",
        userSelect: "none",
        color: "white",
        background: "black",
        width: "30px",
        textAlign: "center",
        cursor: "url('./img/pointer.cur'), auto;",
        borderRadius: "3px",
    })

    flex_row = html_playersHolder.create("div");
    flex_row.css({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: "max-content",
    })
    let flex_column = flex_row.create("div");
    flex_column.css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "5px",
        width: "50%",
        height: "max-content",
    })
    let html_playerSnakeHolder = flex_column.create("div");
    html_playerSnakeHolder.css({
        background: "white",
        borderRadius: "5px",
        width: "80%",
        height: "auto",
    })
    let html_snakeImage = html_playerSnakeHolder.create("img");
    html_snakeImage.src = "img/snakeHead.png";
    html_snakeImage.css({
        width: "100%",
        height: "100%",
        filter: `hue-rotate(${player.color}deg) sepia(${player.color2}%) contrast(${player.color3}%)`,
    })

    flex_column = flex_row.create("div");
    flex_column.css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "5px",
        width: "50%",
        height: "max-content",
        height: "100%",
    })
    let input_name = flex_column.create("input");
    input_name.value = player.name;
    input_name.player = player;
    input_name.on("input",function() {
        if (this.value !== "")
            this.player.name = this.value;
        
        ls.save("players",players);
    })
    input_name.css({
        width: "90%",
        height: "40px",
        fontSize: "20px",
        outline: "none",
    })


    let html_title = flex_column.create("div");
    html_title.innerHTML = "Hue";
    html_title.css({
        color: "white",
        fontSize: "25px",
    })
    let input_slider = flex_column.create("input");
    input_slider.type = "range",
    input_slider.min = 0,
    input_slider.max = 360,
    input_slider.css({
        width: "80%",
    })
    input_slider.value = player.color;
    input_slider.player = player;
    input_slider.alter = html_snakeImage;
    input_slider.on("input",function() {
        this.player.color = this.value;
        this.alter.css({
            filter: `hue-rotate(${this.player.color}deg) sepia(${this.player.color2}%) contrast(${this.player.color3}%)`,
        })
        ls.save("players",players);
    })

    html_title = flex_column.create("div");
    html_title.innerHTML = "Sepia";
    html_title.css({
        color: "white",
        fontSize: "25px",
    })
    input_slider = flex_column.create("input");
    input_slider.type = "range",
    input_slider.min = 0,
    input_slider.max = 100,
    input_slider.css({
        width: "80%",
    })
    input_slider.value = player.color2;
    input_slider.player = player;
    input_slider.alter = html_snakeImage;
    input_slider.on("input",function() {
        this.player.color2 = this.value;
        this.alter.css({
            filter: `hue-rotate(${this.player.color}deg) sepia(${this.player.color2}%) contrast(${this.player.color3}%)`,
        })
        ls.save("players",players);
    })

    html_title = flex_column.create("div");
    html_title.innerHTML = "Contrast";
    html_title.css({
        color: "white",
        fontSize: "25px",
    })
    input_slider = flex_column.create("input");
    input_slider.type = "range",
    input_slider.min = 0,
    input_slider.max = 200,
    input_slider.css({
        width: "80%",
    })
    input_slider.value = player.color3;
    input_slider.player = player;
    input_slider.alter = html_snakeImage;
    input_slider.on("input",function() {
        this.player.color3 = this.value;
        this.alter.css({
            filter: `hue-rotate(${this.player.color}deg) sepia(${this.player.color2}%) contrast(${this.player.color3}%)`,
        })
        ls.save("players",players);
    })



    flex_row = html_playersHolder.create("div");
    flex_row.css({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "30px",
    })
    html_title = flex_row.create("div");
    html_title.innerHTML = "Key Binds";
    html_title.css({
        color: "white",
        fontSize: "30px",
    })

    flex_row = html_playersHolder.create("div");
    flex_row.css({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    })
    flex_column = flex_row.create("div");
    flex_column.css({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "5px",
        width: "50%",
        height: "max-content",
    })
    flex_column2 = flex_row.create("div");
    flex_column2.css({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "5px",
        width: "50%",
        height: "max-content",
    })

    
    function addKeyBind(title,keyBind,column) {
        let html_keyBindHolder = column == 1 ? flex_column.create("div") : flex_column2.create("div");
        html_keyBindHolder.css({
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        })
        let html_keyBindTitle = html_keyBindHolder.create("div");
        html_keyBindTitle.innerHTML = title;
        html_keyBindTitle.css({
            color: "#ddd",
            fontSize: "25px",
            width: "100px",
        })
        let input_keyBind = html_keyBindHolder.create("input");
        
        switch(keyBind) {
            case "downKey":
                input_keyBind.value = player.downKey;
                break;
            case "upKey":
                input_keyBind.value = player.upKey;
                break;
            case "rightKey":
                input_keyBind.value = player.rightKey;
                break;
            case "leftKey":
                input_keyBind.value = player.leftKey;
                break;
            case "useItem1":
                input_keyBind.value = player.useItem1;
                break;
            case "useItem2":
                input_keyBind.value = player.useItem2;
                break;
            case "fireItem":
                input_keyBind.value = player.fireItem;
                break;
        }
        input_keyBind.css({
            width: "80px",
            height: "30px",
            marginLeft: "5px",
            fontSize: "20px",
            textAlign: "center",
            outlineColor: "blue",
            caretColor: "transparent",
            cursor: "url('./img/pointer.cur'), auto;",
        })
        input_keyBind.player = player;
        input_keyBind.on("keydown",function(e) {
            e.preventDefault();
            this.value = e.key;
            switch(keyBind) {
                case "downKey":
                    this.player.downKey = this.value;
                    break;
                case "upKey":
                    this.player.upKey = this.value;
                    break;
                case "rightKey":
                    this.player.rightKey = this.value;
                    break;
                case "leftKey":
                    this.player.leftKey = this.value;
                    break;
                case "useItem1":
                    this.player.useItem1 = this.value;
                    break;
                case "useItem2":
                    this.player.useItem2 = this.value;
                    break;
                case "fireItem":
                    this.player.fireItem = this.value;
                    break;
            }
            ls.save("players",players);
        })
    }

    addKeyBind("Left Key","leftKey",1);
    addKeyBind("Down Key","downKey",1);
    addKeyBind("Right Key","rightKey",1);
    addKeyBind("Up Key","upKey",1);
    addKeyBind("Use Item 1","useItem1",2);
    addKeyBind("Use Item 2","useItem2",2);
    addKeyBind("Fire Item","fireItem",2);
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
        let statusImage = statusHolder.create("img");
        statusImage.src = "img/" + getRealItem(player.status[i]).img;
        statusImage.css({
            width: "100%",
        })
    }
}

function loadGameModes() {
    let html_gameModesHolder = $(".gameModesHolder");
    html_gameModesHolder.innerHTML = `
        <div class="button" id="gameModes_newGame">New Game Mode</div>
        <div class="gameModesDiv listHolderDiv"></div>
    `;

    $("gameModes_newGame").on("click",function() {
        gameModes.push({
            name: "Untitled",
            howManyItemsCanPlayersUse: 2,
            mode_usingItemType: "scroll",
            snakeVanishOnDeath: true,
            mode_whenInventoryFullWhereDoItemsGo: "select",
            atStartSpawnIn: [{
                name: "pellet",
                count: 3,
            }],
            items: cloneWithoutFunctions(items),
        })
        editGameMode(gameModes[gameModes.length-1]);
        activeGameMode = gameModes.length - 1;
        currentGameMode = gameModes[activeGameMode];
        ls.save("activeGameMode",activeGameMode)
        ls.save("gameModes",gameModes)
    })

    for (let i = 0; i < gameModes.length; i++) {
        let holder = $(".gameModesDiv").create("div");
        holder.className = "gm_holder" + " " + (activeGameMode == i ? "gm_activeGameMode" : "");
        holder.i = i;
        holder.on("click",function(e) {
            activeGameMode = this.i;
            ls.save("activeGameMode",activeGameMode);
            if (e.target.className !== "gm_img")
                loadGameModes();
            currentGameMode = gameModes[activeGameMode];
        })

        let title = holder.create("div");
        title.className = "gm_title";
        title.innerHTML = gameModes[i].name;

        let buttonsRight = holder.create("div");
        buttonsRight.className = "gm_buttonsRight";

        if (gameModes[i].canDelete !== false) {
            let edit = buttonsRight.create("div");
            edit.className = "gm_imgHolder";
            let editImg = edit.create("img");
            editImg.className = "gm_img";
            editImg.src = "img/edit.png";
            edit.gameMode = gameModes[i];
            edit.on("click",function() {
                editGameMode(this.gameMode);
            })

            let deleteHolder = buttonsRight.create("div");
            deleteHolder.className = "gm_imgHolder";
            let deleteImg = deleteHolder.create("img");
            deleteImg.className = "gm_img";
            deleteImg.src = "img/delete.png";
            deleteHolder.i = i;
            deleteHolder.on("click",function() {
                gameModes.splice(this.i,1);
                activeGameMode = 0;
                currentGameMode = gameModes[activeGameMode];

                ls.save("gameModes",gameModes)
                ls.save("activeGameMode",activeGameMode)
                loadGameModes();
            })
        }

        
    }
    


}
function editGameMode(gameMode) {
    let html_gameModesHolder = $(".gameModesHolder");
    html_gameModesHolder.innerHTML = `
        <div class="backarrow" id="gameModes_backArrow"><--</div>
        <div class="settingsHolder"></div>
        <div class="onSpawnHolder"></div>
    `;

    $("gameModes_backArrow").on("click",loadGameModes)
    
    function addSetting(title,type,value,func,list) {
        let holder = $(".settingsHolder").create("div");
        holder.className = "settingHolder";
        let settingsTitle = holder.create("div");
        settingsTitle.className = "settingTitle";
        settingsTitle.innerHTML = title;
        
        let settingsInput;
        if (type == "input" || type == "number") {
            settingsInput = holder.create("input");
            settingsInput.className = type == "input" ? "settingsInputFull" : "settingInput";
            settingsInput.value = value;
            settingsInput.id = "gm_" + title.toLowerCase().subset(0,"end","trim\\ ");
            if (type == "number") settingsInput.type = "number";
        }
        if (type == "dropdown") {
            settingsInput = holder.create("div");
            settingsInput.className = "dropdown";

            let button = settingsInput.create("button");
            button.className = "dropbtn";
            button.innerHTML = value;

            let content = settingsInput.create("div");
            content.className = "dropdown-content";

            for (let i = 0; i < list.length; i++) {
                let setting = content.create("div");
                setting.button = button;
                setting.innerHTML = list[i];
                setting.on("click",function() {
                    this.button.innerHTML = this.innerHTML;
                    func(this.innerHTML);
                })
            }
        }
        settingsInput.on("input",function() {
            func(this.value,this);
        })
        
    }
    addSetting("Game Mode Name","input",gameMode.name,function(value,input) {
        if (value !== "")
        gameMode.name = value;
        ls.save("gameModes",gameModes);
    });
    addSetting("Inventory Slots","number",gameMode.howManyItemsCanPlayersUse,function(value,input) {
        if (value < 0) input.value = 0;
        if (value > 10) input.value = 10;

        gameMode.howManyItemsCanPlayersUse = value;
        ls.save("gameModes",gameModes);
    });
    addSetting("Using Items Type","dropdown",gameMode.mode_usingItemType,function(value) {
        gameMode.mode_usingItemType = value;
        if (value == "direct") {
            $("gm_inventoryslots").value = 2;
            gameMode.howManyItemsCanPlayersUse = 2;
        }
        ls.save("gameModes",gameModes);
    },["direct","scroll"]);
    addSetting("Full Inventory","dropdown",gameMode.mode_whenInventoryFullWhereDoItemsGo,function(value) {
        gameMode.mode_whenInventoryFullWhereDoItemsGo = value;
        ls.save("gameModes",gameModes);
    },["noPickUp","select","recycle"]);
    addSetting("Snake Vanish On Death","dropdown",gameMode.snakeVanishOnDeath,function(value) {
        gameMode.snakeVanishOnDeath = value == "true" ? true : false;
        ls.save("gameModes",gameModes);
    },["true","false"]);


    let html_onSpawnHolder = $(".onSpawnHolder");
    let allItems = html_onSpawnHolder.create("div");
    allItems.className = "allItems";
    let itemEditor = html_onSpawnHolder.create("div");
    itemEditor.className = "itemEditorHolder";
    for (let i = 0; i < gameMode.items.length; i++) {
        let item = gameMode.items[i];

        if (!item.showInEditor) continue;

        let holder = allItems.create("div");
        holder.className = "spawn_holder";
        let imgHolder = holder.create("div");
        imgHolder.className = "spawn_imageHolder" + " " + (item.gameModeMenu_selectedItem ? "spawn_itemSelected" : "");
        let img = imgHolder.create("img");
        img.className = "spawn_image";
        img.src = "img/" + item.img;

        imgHolder.gameMode = gameMode;
        imgHolder.item = item;
        imgHolder.on("click",function() {
            for (let i = 0; i < this.gameMode.items.length; i++) {
                this.gameMode.items[i].gameModeMenu_selectedItem = false;
            }
            this.item.gameModeMenu_selectedItem = true;
            editGameMode(this.gameMode);
        })

        let name = holder.create("div");
        name.className = "spawn_title";
        name.innerHTML = item.name;

        let input = holder.create("input");
        input.className = "spawn_input";
        input.type = "number";
        input.value = Number(item.onStartSpawn);
        input.item = item;

        input.on("input",function() {
            if (this.value < 0) this.value = 0;
            item.onStartSpawn = Number(this.value);
            ls.save("gameModes",gameModes);
        })

        if (item.gameModeMenu_selectedItem) {
            gameMode_editItem(item,itemEditor,gameMode);
        }
    }
}
function gameMode_editItem(item,html_holder,gameMode) {
    html_holder.innerHTML = "";

    function addSetting(title,type,value,func,list) {
        let holder = html_holder.create("div");
        holder.className = "settingHolder";
        let settingsTitle = holder.create("div");
        settingsTitle.className = "settingTitle";
        settingsTitle.innerHTML = title;
        
        let settingsInput;
        if (type == "input" || type == "number") {
            settingsInput = holder.create("input");
            settingsInput.className = "settingInput";
            settingsInput.value = value;
            settingsInput.id = "gm_" + title.toLowerCase().subset(0,"end","trim\\ ");
            if (type == "number") settingsInput.type = "number";
        }
        if (type == "dropdown") {
            settingsInput = holder.create("div");
            settingsInput.className = "dropdown";

            let button = settingsInput.create("button");
            button.className = "dropbtn";
            button.innerHTML = value;

            let content = settingsInput.create("div");
            content.className = "dropdown-content";

            for (let i = 0; i < list.length; i++) {
                let setting = content.create("div");
                setting.button = button;
                setting.innerHTML = list[i];
                setting.on("click",function() {
                    this.button.innerHTML = this.innerHTML;
                    func(this.innerHTML);
                })
            }
        }
        settingsInput.on("input",function() {
            func(this.value,this);
        })
        
    }

    addSetting("Spawn Rate","number",item.specialSpawnWeight,function(value) {
        item.specialSpawnWeight = Number(value);
        if (value < 0) return;
        ls.save("gameModes",gameModes);
    });

    if (item.canEat == true && item.onEat.growPlayer > 0 ) {
        addSetting("Grow Player","number",item.onEat.growPlayer,function(value) {
            if (value < 0) return;
            item.onEat.growPlayer = Number(value);
            ls.save("gameModes",gameModes);
        });
    }
    if (item.canEat == true && item.onEat.shield > 0) {
        addSetting("Give Shield","number",item.onEat.shield,function(value) {
            item.onEat.shield = Number(value);
            ls.save("gameModes",gameModes);
        });
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Duration","number",item.onEat.turbo.duration,function(value) {
        if (value < 0) return;
        item.onEat.turbo.duration = Number(value);
        ls.save("gameModes",gameModes);
        });
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Speed","number",item.onEat.turbo.moveSpeed,function(value) {
        if (value < 0) return;
        item.onEat.turbo.moveSpeed = value;
        ls.save("gameModes",gameModes);
        });
    }
}

function loadBoards() {
    $(".boardSettings").hide();
    let html_boardList = $(".boardListHolder");
    html_boardList.innerHTML = `
        <div class="lb_row">
            <div class="button2" id="gameModes_newBoard">New Board</div>
            <div class="button2" id="gameModes_import">Import World</div>
        </div>
    `;
    $(".lb_row").css({
        display: "flex",
        flexDirection: "row",
    })
    $("gameModes_newBoard").on("click",function() {
        boardSettings();
    })
    $("gameModes_import").on("click",function() {
         // Create an input element of type file
      const input = document.createElement('input');
      input.type = 'file';

      // When the user selects a file
      input.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Get the first selected file
        if (file) {
          readFileContent(file); // Read the content of the file
        } else {
          alert('No file selected!');
        }
      });

      // Programmatically click the input to open the file dialog
      input.click();
    })

    let masterHolder = html_boardList.create("div");
    masterHolder.className = "listHolderDiv";
    for (let i = 0; i < boards.length; i++) {
        
        let holder = masterHolder.create("div");
        holder.className = "gm_holder" + " " + (currentBoardIndex == i ? "gm_activeGameMode" : "");
        holder.i = i;
        holder.on("click",function(e) {
            currentBoardIndex = this.i;
            currentBoard = boards[currentBoardIndex];
            ls.save("currentBoardIndex",currentBoardIndex);
            saveBoards();
            if (e.target.className !== "gm_img")
                loadBoards();

        })

        let title = holder.create("div");
        title.className = "gm_title";
        title.innerHTML = boards[i].name;

        let buttonsRight = holder.create("div");
        buttonsRight.className = "gm_buttonsRight";

        if (boards[i].cantEdit !== true) {
            
            let share = buttonsRight.create("div");
            share.className = "gm_imgHolder";
            let shareImg = share.create("img");
            shareImg.className = "gm_img";
            shareImg.src = "img/share.png";
            share.board = boards[i];
            share.on("click",function() {
                this.board.map = [];
                downloadTextFile(this.board.name,JSON.stringify(this.board));
            })

            let edit = buttonsRight.create("div");
            edit.className = "gm_imgHolder";
            let editImg = edit.create("img");
            editImg.className = "gm_img";
            editImg.src = "img/edit.png";
            edit.board = boards[i];
            edit.on("click",function() {
                openMapEditor(this.board);
            })
    
            let deleteHolder = buttonsRight.create("div");
            deleteHolder.className = "gm_imgHolder";
            let deleteImg = deleteHolder.create("img");
            deleteImg.className = "gm_img";
            deleteImg.src = "img/delete.png";
            deleteHolder.i = i;
            deleteHolder.on("click",function() {
                currentBoardIndex = 0;
                currentBoard = boards[currentBoardIndex];
                boards.splice(this.i,1);
                saveBoards();
                ls.save("currentBoardIndex",currentBoardIndex);
                loadBoards();
            })
        }

    }
}
function boardSettings() {
    $(".settingsInputHeight").value = 30;
    $(".settingsInputWidth").value = 50;
    $(".boardSettings").show("flex");
}
function createBoard() {
    let width = $(".settingsInputWidth").value;
    let height = $(".settingsInputHeight").value;
    boards.push({
        name: $(".settingsInputName").value,
        width: width,
        height: height,
        background: false,
        map: newMap(width,height),

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
    try {
        let board = JSON.parse(textFile);
        boards.push(board);
        currentBoardIndex = boards.length - 1;
        currentBoard = boards[currentBoardIndex];
        saveBoards();
        ls.save("currentBoardIndex",currentBoardIndex);
        loadBoards();
    } catch {
        console.warn("Incorect File")
    }
  }
  function saveBoards() {
    let newBoards = [];
    for (let i = 0; i < boards.length; i++) {
        if (!boards[i].cantEdit) {
            boards[i].map = [];
            newBoards.push(boards[i]);
        }
    }
    ls.save("boards",newBoards)
  }