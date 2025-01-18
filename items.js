let items = [];
items.push({
    name: "pellet",
    img: "snakeFood.png",
    canEat: true,
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "super_pellet",
    img: "snakeSuper.png",
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "turbo",
    img: "speedPowerUp.png",
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "wall",
    img: "rock.png",
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    canEat: false,
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 1, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "wall2",
    img: "rock2.png",
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    canEat: false,
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 2, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "bronzeShield", //(string) Name Of Item
    color: "blue", //(string) OutDated No Point In Using
    img: "bronzeShield.png", //(string) Image name
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: true, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: ["bronzeShield","silverShield"], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "silverShield",
    color: "blue",
    img: "silverShield.png",
    pickUp: true,
    canEat: true,
    cantUseIfStatus: ["goldShield","silverShield"], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "goldShield",
    img: "goldShield.png",
    pickUp: true,
    onEat_deleteMe: true,
    canEat: true,
    cantUseIfStatus: ["goldShield"], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
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
    specialSpawnWeight: 5,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    
    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "lamp", //(string) Name Of Item
    img: "Lamp.png", //(string) Image name
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "snakeHole", //(string) Name Of Item
    img: "snakeHole1.png", //(string) Image name
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
    
    destructible: [false], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "snakeHole2", //(string) Name Of Item
    img: "snakeHole2.png", //(string) Image name
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
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: [false], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "snakeHole3", //(string) Name Of Item
    img: "snakeHole3.png", //(string) Image name
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

    destructible: [false], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})

items.push({
    name: "spawn", //(string) Name Of Item
    img: "spawn.png", //(string) Image name
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})

items.push({
    name: "clear", //(string) Name Of Item
    img: "noZone.png", //(string) Image name
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

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "blueKey", //(string) Name Of Item
    img: "blueKey.png", //(string) Image name
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: ["blueKey"],
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
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "redKey", //(string) Name Of Item
    img: "redKey.png", //(string) Image name
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: ["redKey"],
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
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tiledestructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    
    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "greenKey", //(string) Name Of Item
    img: "greenKey.png", //(string) Image name
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: ["blueKey"],
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
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    }
})
items.push({
    name: "blueLock", //(string) Name Of Item
    img: "blueLock.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: true,
        canvasFilter: false,
    },

    destructible: ["blueKey"],
    damage: 0,
    onDelete: {
        removeStatus: ["blueKey"],

    }
})
items.push({
    name: "redLock", //(string) Name Of Item
    img: "redLock.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: true,
        canvasFilter: false,
    },

    destructible: ["redKey"],
    damage: 0,
    onDelete: {
        removeStatus: ["redKey"],

    }
})
items.push({
    name: "greenLock", //(string) Name Of Item
    img: "greenLock.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: true,
        canvasFilter: false,
    },

    destructible: ["greenKey"],
    damage: 0,
    onDelete: {
        removeStatus: ["greenKey"],

    }
})
items.push({
    name: "stoneWall", //(string) Name Of Item
    img: "stoneWall.jpg", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    canEat: false, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    onEat: {
        addStatus: [],
        shield: 0,
        growPlayer: 0,
        spawn: [],
        removeStatus: [],
        giveturbo: false,
        turbo: false,
        deletePlayer: true,
        canvasFilter: false,
    },

    destructible: [],
    damage: 0,
    onDelete: {
        removeStatus: ["greenKey"],

    }
})