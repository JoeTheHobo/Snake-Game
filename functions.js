let map = [];
let items = [];
let updateCells = [];
let players = [];

function getItem(name) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].name == name) {
            return items[i];
        }
    }
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