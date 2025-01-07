items.push({
    name: "pellet",
    color: "yellow",
    img: "snakeFood.png",
    onEat_deleteMe: true,
    canEat: true,
    onEat_func: function(player) {
        growPlayer(player,1);
        spawn("pellet");
    },
})
items.push({
    name: "air",
    color: "#564f32",
})
items.push({
    name: "super_pellet",
    color: "green",
    img: "snakeSuper.png",
    onEat_deleteMe: true,
    canEat: true,
    onEat_func: function(player) {
        growPlayer(player,5);
    },
})
items.push({
    name: "turbo",
    color: "pink",
    img: "speedPowerUp.png",
    onEat_deleteMe: true,
    canEat: true,
    onEat_func: function(player) {
        player.turboActive = true;
        player.turboDuration = 50;
        player.moveSpeed = 3;
    },
})
items.push({
    name: "wall",
    color: "black",
    onEat_deleteMe: true,
    canEat: true,
    onEat_func: function(player,playerIndex) {
        deletePlayer(playerIndex, player);
    },
})
items.push({
    name: "shield",
    color: "blue",
    img: "shieldPowerUp.png",
    onEat_deleteMe: true,
    canEat: true,
    onEat_func: function(player) {
        player.shield = true;
    },
})
