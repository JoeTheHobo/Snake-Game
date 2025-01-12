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
        addPlayerStatus(player,"turbo");
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
    name: "bronzeShield", //(string) Name Of Item
    color: "blue", //(string) OutDated No Point In Using
    img: "bronzeShield.png", //(string) Image name
    onEat_deleteMe: true, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: true, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: ["silverShield"], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat_func: function(player) { //(func(player)) When player uses item run this function
        player.shield = 1;
        addPlayerStatus(player,"bronzeShield");
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
        removePlayerStatus(player,"bronzeShield");
        addPlayerStatus(player,"silverShield");
    },
})
