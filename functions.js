let map = [];
let items = [];
let updateCells = [];

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
                            x = j;
                            y = k;
                            break findingAnySpot;
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


function hideScenes() {
    $(".scene").hide();
}
function setScene(scene) {
    hideScenes();
    $("scene_" + scene).show("flex");
}