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
            let x = rnd(gridX)-1;
            let y = rnd(gridY)-1

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