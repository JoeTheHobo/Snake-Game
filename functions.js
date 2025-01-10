let map = [];
let items = [];
let updateCells = [];
let players = [];
let gs_playerCount = 2;
let gridX = 50;
let gridY = 30;
let gridSize = 20;
let circleWalls = true;
let specialItemLowChance = 1;
let specialItemHighChance = 6;
let specialItemActiveChance = 4;
let specialItemIteration = 0;
let totalSpecialItems = 1;

let keyBindVariable = [
    ["s","w","a","d","q","e"],
    ["5","8","4","6","7","9"],
    ["k","i","j","l","u","o"],
    ["g","t","f","h","r","y"],
    ["z","z","z","z","z","z"],
    ["z","z","z","z","z","z"],
    ["z","z","z","z","z","z"],
    ["z","z","z","z","z","z"],
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


function getItem(name) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].name == name) {
            return items[i];
        }
    }
}

function newPlayer(playerNumber) {
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
        name: playerNames1.rnd() + playerNames2.rnd(),
        color: rnd(360),
        moving: false,
        growTail: 0,
        pos: {
            x: startx,
            y: starty, 
        },
        tail: [],
        moveQueue: [],
        prevMove: "start",
        moveTik: 0,
        moveSpeed: 6,
        turboDuration: 0,
        turboActive: false,
        shield: false,
    }
    players.push(player);
}
function spawn(name) { 
    for (let i = 0; i < items.length; i++) {
        if (items[i].name == name) {

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

            map[y][x] = items[i];
            updateCells.push({
                x: x,
                y: y,
            })
            specialItemManager();
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


class FrameRateCounter {
    constructor() {
        this.frames = 0;
        this.lastTime = performance.now();
        this.fps = 0;
    }

    /**
     * Updates the frame count and calculates FPS if needed.
     */
    update() {
        this.frames++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;

        // Update FPS every second
        if (deltaTime >= 1000) {
            this.fps = (this.frames / deltaTime) * 1000;
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }

    /**
     * Returns the current FPS.
     * @returns {number} The current frames per second.
     */
    getFPS() {
        return this.fps;
    }
}

const frameRateCounter = new FrameRateCounter();
const fpsCounterElement = document.getElementById("fps-counter");

function render() {
    // Update the frame rate counter
    frameRateCounter.update();

    // Update the displayed FPS
    fpsCounterElement.textContent = `FPS: ${frameRateCounter.getFPS().toFixed(2)}`;

    // Call render recursively
    requestAnimationFrame(render);
}

// Start the animation loop
render();



for (let i = 0; i < gs_playerCount; i++){
    newPlayer(i);
}
function loadPlayers() {
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
            filter: `hue-rotate(${player.color}deg)`,
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
        filter: `hue-rotate(${player.color}deg)`,
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
            filter: `hue-rotate(${this.player.color}deg)`,
        })
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
    })
    input_name.css({
        width: "90%",
        height: "40px",
        fontSize: "20px",
        outline: "none",
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
    let html_title = flex_row.create("div");
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
            }
        })
    }

    addKeyBind("Down Key","downKey",1);
    addKeyBind("Up Key","upKey",1);
    addKeyBind("Right Key","rightKey",1);
    addKeyBind("Left Key","leftKey",1);
    addKeyBind("Use Item 1","useItem1",2);
    addKeyBind("Use Item 2","useItem2",2);
    


}