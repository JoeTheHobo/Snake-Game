let map = [];
let items = [];
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
            map[rnd(gridY)-1][rnd(gridX)-1] = items[i];
            specialItemManager();
            return;
        }
              
    }
};
