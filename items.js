items.push({
    name: "pellet",
    color: "yellow",
    img: "snakeFood.png",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: false,
    onEat_func: function(player) {
        growPlayer(player,1);
        spawn("pellet");
    },
})
items.push({
    name: "air",
    img: "background.png",
    color: "#6bd2fe",
    pickUp: false,
})
items.push({
    name: "super_pellet",
    color: "green",
    img: "snakeSuper.png",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: false,
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
    pickUp: true,
    onEat_func: function(player) {
        player.turboActive = true;
        player.turboDuration = 50;
        player.moveSpeed = 3;
    },
})
items.push({
    name: "wall",
    img: "rock.png",
    color: "black",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: false,
    onEat_func: function(player,playerIndex) {
        deletePlayer(playerIndex, player);
    },
})
items.push({
    name: "bronzeShield",
    color: "blue",
    img: "bronzeShield.png",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: true,
    onEat_func: function(player) {
        player.shield = 1;
    },
})
items.push({
    name: "silverShield",
    color: "blue",
    img: "silverShield.png",
    pickUp: true,
    onEat_deleteMe: true,
    canEat: true,
    onEat_func: function(player) {
        player.shield = 2;
    },
})
