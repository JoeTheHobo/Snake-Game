let items = [];
items.push({
    name: "pellet",
    color: "yellow",
    img: "snakeFood.png",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: false,
    onEat: {
        growPlayer: 1,
        spawn: [{
            name: "pellet",
            count: 1,
        }],
        shield: 0,
        addStatus: [],
        removeStatus: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        deletePlayer: false,
    },
    onStartSpawn: 3,
    gameModeMenu_selectedItem: false,
})
items.push({
    name: "air",
    img: "background.png",
    color: "#6bd2fe",
    pickUp: false,
    onEat: {
        growPlayer: 0,
        spawn: [],
        shield: 0,
        addStatus: [],
        removeStatus: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        deletePlayer: false,
    },
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
})
items.push({
    name: "super_pellet",
    color: "green",
    img: "snakeSuper.png",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: false,
    onEat: {
        growPlayer: 5,

        spawn: [],
        shield: 0,
        addStatus: [],
        removeStatus: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        deletePlayer: false,
    },
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
})
items.push({
    name: "turbo",
    color: "pink",
    img: "speedPowerUp.png",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: true,
    onEat: {
        giveturbo: true,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        addStatus: ["turbo"],

        growPlayer: 0,
        spawn: [],
        shield: 0,
        removeStatus: [],
        deletePlayer: false,
    },
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
})
items.push({
    name: "wall",
    img: "rock.png",
    color: "black",
    onEat_deleteMe: true,
    canEat: true,
    pickUp: false,
    onEat: {
        deletePlayer: true,

        growPlayer: 0,
        spawn: [],
        shield: 0,
        addStatus: [],
        removeStatus: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
    },
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
})
items.push({
    name: "bronzeShield", //(string) Name Of Item
    color: "blue", //(string) OutDated No Point In Using
    img: "bronzeShield.png", //(string) Image name
    onEat_deleteMe: true, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: true, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: ["silverShield"], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        shield: 1,
        addStatus: ["bronzeShield"],

        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        deletePlayer: false,
    },
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
})
items.push({
    name: "silverShield",
    color: "blue",
    img: "silverShield.png",
    pickUp: true,
    onEat_deleteMe: true,
    canEat: true,
    onEat: {
        shield: 2,
        addStatus: ["silverShield"],
        removeStatus: ["bronzeShield"],

        growPlayer: 0,
        spawn: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        deletePlayer: false,
    },
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
})
