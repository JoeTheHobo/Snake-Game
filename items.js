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
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 3,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
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
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 50,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
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
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
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
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})
items.push({
    name: "wall2",
    img: "rock2.png",
    onEat_deleteMe: 2,
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
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 10,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
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
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
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
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 10,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})
items.push({
    name: "goldShield",
    img: "goldShield.png",
    pickUp: true,
    onEat_deleteMe: true,
    canEat: true,
    onEat: {
        shield: 3,
        addStatus: ["goldShield"],
        removeStatus: ["bronzeShield","silverShield"],

        growPlayer: 0,
        spawn: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        deletePlayer: false,
        canvasFilter: {
            active: false,
            filter: false,
            duration: false,
        }
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 5, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})
items.push({
    name: "lamp", //(string) Name Of Item
    img: "Lamp.png", //(string) Image name
    onEat_deleteMe: true, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: {
            duration: 50,
            moveSpeed: 3,
        },
        deletePlayer: false,
        canvasFilter: {
            active: true,
            filter: "invert(100%)",
            duration: 5000,
        }
    },
    showInEditor: false,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 1,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})
items.push({
    name: "snakeHole", //(string) Name Of Item
    img: "snakeHole1.png", //(string) Image name
    onEat_deleteMe: false, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: false,
        canvasFilter: false,
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 4,
    visible: true, //If show when playing
    teleport: 0, //Teleport ID
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})
items.push({
    name: "snakeHole2", //(string) Name Of Item
    img: "snakeHole2.png", //(string) Image name
    onEat_deleteMe: false, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: false,
        canvasFilter: false,
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 4,
    visible: true, //If show when playing
    teleport: 1, //Teleport ID
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})
items.push({
    name: "snakeHole3", //(string) Name Of Item
    img: "snakeHole3.png", //(string) Image name
    onEat_deleteMe: false, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: false,
        canvasFilter: false,
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 4,
    visible: true, //If show when playing
    teleport: 2, //Teleport ID
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})

items.push({
    name: "spawn", //(string) Name Of Item
    img: "spawn.png", //(string) Image name
    onEat_deleteMe: false, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: false,
        canvasFilter: false,
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: false, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: true, //Spawn players on this tile
})

items.push({
    name: "clear", //(string) Name Of Item
    img: "noZone.png", //(string) Image name
    onEat_deleteMe: false, //(true/false) If A player Collides with Item Either Delete it or Keep it on board
    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: false,
        canvasFilter: false,
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: false, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
})