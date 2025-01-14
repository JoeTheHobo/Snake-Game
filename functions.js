ls.setID("snakegame");

let map = [];
let updateCells = [];
let players = ls.get("players",[]);
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
let isActiveGame = false;
let showPerformance = false;

//Setting Up Canvas
let canvas = $("game");
let ctx = canvas.getContext("2d");
function adjustCanvasSize() {
    const width = gridX * gridSize;
    const height = gridY * gridSize;

    // Set the canvas dimensions in device pixels
    canvas.width = width;
    canvas.height = height;

    // Scale the canvas visually for the screen
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
}

function setResolution() {
    const screenHeight = window.innerHeight; // Available screen height
    const screenWidth = window.innerWidth;   // Available screen width

    const heightLimit = screenHeight - 250;  // Maximum canvas height
    const widthLimit = screenWidth - 500;    // Maximum canvas width

    // Calculate the largest `gridSize` that fits within the limits
    const maxGridSizeWidth = Math.floor(widthLimit / gridX);
    const maxGridSizeHeight = Math.floor(heightLimit / gridY);

    // Use the smaller of the two to ensure the grid fits
    gridSize = Math.min(maxGridSizeWidth, maxGridSizeHeight);

    // Enforce a minimum grid size for usability
    gridSize = Math.max(gridSize, 19); // Change 10 to a reasonable minimum size for your use case

    adjustCanvasSize();
}
window.on("resize",setResolution)
setResolution();

let keyBindVariable = [
    ["s","w","a","d","q","e","r"],
    ["5","8","4","6","7","9","+"],
    ["k","i","j","l","u","o","p"],
    ["g","t","f","h","r","y","z"],
    ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Alt","Control","0"],
    ["z","z","z","z","z","z","z"],
    ["z","z","z","z","z","z","z"],
    ["z","z","z","z","z","z","z"],
];

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


function newPlayer() {
    let playerNumber = players.length;
    let foundSpace = false;
    let startx,starty;
    let counter = 0;
    let gameCrashed = false;
    while (foundSpace == false)  {
        startx = rnd(gridX) - 1;
        starty = rnd(gridY) - 1;

        let foundPlayer = false;
        findingPlayer: for (let i = 0; i < players.length; i++) {
            if (players[i].pos.x == startx && players[i].pos.y == starty) {
                foundPlayer = true;
                break findingPlayer;
            }
        }
        if (!foundPlayer) {
            foundSpace = true;
        }
        counter++;
        if (counter > gridX * gridY) {
            //Table is full
            foundSpace = true;
            gameCrashed = true;
        }
    }
    if (gameCrashed) {
        console.log("Game Crashed")
        return;
    }

    
    let player = {
        downKey: keyBindVariable[playerNumber][0],
        upKey: keyBindVariable[playerNumber][1],
        leftKey: keyBindVariable[playerNumber][2],
        rightKey: keyBindVariable[playerNumber][3],
        useItem1: keyBindVariable[playerNumber][4],
        useItem2: keyBindVariable[playerNumber][5],
        fireItem: keyBindVariable[playerNumber][6],
        name: playerNames1.rnd() + playerNames2.rnd(),
        color: rnd(360), //Hue
        color2: 0, //Brightness
        color3: 100, //Contrast
        moving: false,
        growTail: 0,
        isDead: false,
        pos: {
            x: startx,
            y: starty, 
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
    }
    players.push(player);
    ls.save("players",players);
}
function spawn(name,generateRandomItem = true) { 
    for (let i = 0; i < currentGameMode.items.length; i++) {
        if (currentGameMode.items[i].name == name) {

            let counter = 0;
            let foundSpot = false;
            let x,y;
            while (foundSpot == false) {

                x = rnd(gridX)-1;
                y = rnd(gridY)-1

                if (map[y][x].name == "air") {
                    foundSpot = true;
                    checkingDistanceFromPlayersHead: for (let j = 0; j < players.length; j++) {
                        let distance = calculateDistance(players[j].pos.x,players[j].pos.y,x,y);
                        if (distance < 5) {
                            foundSpot = false;
                            break checkingDistanceFromPlayersHead;
                        }
                        for (let p = 0; p < players[j].tail.length; p++) {
                            if (players[j].tail[p].x == x && players[j].tail[p].y == y) {
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

            if (foundSpot == "couldn't find any") {
                findingAnySpot: for (let k = 0; k < gridY; k++) {
                    for (let j = 0; j < gridX; j++) {
                        if (map[k][j].name == "air") {
                            let foundGoodSpot = true;
                            checkingDistanceFromPlayersHead: for (let j = 0; j < players.length; j++) {
                                let distance = calculateDistance(players[j].pos.x,players[j].pos.y,x,y);
                                if (distance < 5) {
                                    foundGoodSpot = false;
                                    break checkingDistanceFromPlayersHead;
                                }
                                for (let p = 0; p < players[j].tail.length; p++) {
                                    if (players[j].tail[p].x == x && players[j].tail[p].y == y) {
                                        foundGoodSpot = false;
                                        break checkingDistanceFromPlayersHead;
                                    }
                                }
                            }
                            if (foundGoodSpot) {{
                                x = j;
                                y = k;
                                break findingAnySpot;
                            }}
                        }
                    }
                }
            }

            map[y][x] = currentGameMode.items[i];
            updateCells.push({
                x: x,
                y: y,
            })
            if (generateRandomItem) specialItemManager();
            return;
        }
              
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
    })

    if (gs_playerCount < 8) {
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
            cursor: "pointer",
            borderRadius: "3px",
        })
        html_newPlayerButton.on("click",function() {
            gs_playerCount++;
            newPlayer(gs_playerCount-1);
            editPlayerScreen(players[gs_playerCount-1])
        })
    }
    

    for (let i = 0; i < players.length; i++) {
        let player = players[i];

        let html_playerHolder = html_playersHolder.create("div");
        html_playerHolder.css({
            width: "97%",
            padding: "5px",
            marginBottom: "5px",
            background: "black",
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

        let html_editSnake = html_playerHolder.create("div");
        html_editSnake.css({
            background: "#333",
            borderRadius: "5px",
            width: "38px",
            height: "38px",
            cursor: "pointer",
            marginLeft: "auto",
        })
        html_editSnake.playerID = i;
        html_editSnake.on("click",function() {
            editPlayerScreen(players[this.playerID])
        })
        let html_editImage = html_editSnake.create("img");
        html_editImage.src = "img/edit.png";
        html_editImage.css({
            width: "100%",
            height: "100%",
        })

        let html_deleteSnake = html_playerHolder.create("div");
        html_deleteSnake.css({
            background: "#333",
            borderRadius: "5px",
            width: "38px",
            height: "38px",
            marginLeft: "5px",
            cursor: "pointer",
        })
        html_deleteSnake.playerID = i;
        html_deleteSnake.on("click",function() {
            players.splice(this.playerID,1);
            gs_playerCount--;
            for (let i = 0; i < players.length; i++) {
                players[i].id = i;
            }
            loadPlayers();
        })
        let html_deleteImage = html_deleteSnake.create("img");
        html_deleteImage.src = "img/delete.png";
        html_deleteImage.css({
            width: "100%",
            height: "100%",
        })


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
        cursor: "pointer",
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
            cursor: "pointer",
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
        statusImage.src = "img/" + player.status[i];
        statusImage.css({
            width: "100%",
        })
    }
}

function loadGameModes() {
    let html_gameModesHolder = $(".gameModesHolder");
    html_gameModesHolder.innerHTML = `
        <div class="button" id="gameModes_newGame">New Game Mode</div>
        <div class="gameModesDiv"></div>
    `;

    $("gameModes_newGame").on("click",function() {
        gameModes.push({
            name: "Untitled",
            howManyItemsCanPlayersUse: 2,
            mode_usingItemType: "scroll",
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
                ls.save("gameModes",gameModes)
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


    let html_onSpawnHolder = $(".onSpawnHolder");
    let allItems = html_onSpawnHolder.create("div");
    allItems.className = "allItems";
    let itemEditor = html_onSpawnHolder.create("div");
    itemEditor.className = "itemEditorHolder";
    for (let i = 0; i < gameMode.items.length; i++) {
        let item = gameMode.items[i];

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
    
    
    addSetting("Can Player Eat","dropdown",item.canEat,function(value) {
        item.canEat = value == "true" ? true : false;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
    },["true","false"]);
    if (item.canEat == true) {
        addSetting("Delete On Eaten","dropdown",item.onEat_deleteMe,function(value) {
        item.onEat_deleteMe = value == "true" ? true : false;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        },["true","false"]);
    }
    if (item.canEat == true) {
        addSetting("Pick Up Item","dropdown",item.pickUp,function(value) {
        item.pickUp = value == "true" ? true : false;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        },["true","false"]);
    }
    /*
    if (item.pickUp == true && item.canEat) {
        addSetting("Cant Use If Status","dropdown",item.cantUseIfStatus,function(value) {
        item.cantUseIfStatus = value == "true" ? true : false;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        },["true","false"]);
    }
    */
    if (item.canEat == true) {
        addSetting("Grow Player","number",item.onEat.growPlayer,function(value) {
        item.onEat.growPlayer = value;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        });
    }
    if (item.canEat == true) {
        addSetting("Give Shield","number",item.onEat.shield,function(value) {
        item.onEat.shield = value;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        });
    }
    if (item.canEat == true) {
        addSetting("Give Turbo","dropdown",item.onEat.giveturbo,function(value) {
        item.onEat.giveturbo = value == "true" ? true : false;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        },["true","false"]);
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Duration","number",item.onEat.turbo.duration,function(value) {
        if (value < 0) return;
        item.onEat.turbo.duration = value;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        });
    }
    if (item.canEat == true && item.onEat.giveturbo) {
        addSetting("Turbo Speed","number",item.onEat.turbo.moveSpeed,function(value) {
        if (value < 0) return;
        item.onEat.turbo.moveSpeed = value;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        });
    }
    if (item.canEat == true) {
        addSetting("Kill Player","dropdown",item.onEat.deletePlayer,function(value) {
        item.onEat.deletePlayer = value == "true" ? true : false;
        ls.save("gameModes",gameModes);
        editGameMode(gameMode);
        },["true","false"]);
    }
}