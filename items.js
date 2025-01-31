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
        },
        playSound: ["die",2], //Write the name of sound, and how many different Files there are.
        spawnRandomItem: true, //When eaten will it attempt to spawn in from item pool?
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
    soundFolder: "mouse",
    playSounds: true, //If Item should be muted or not;
    onSpawn: { //When item spawns run these
        playSound: ["spawn",1], //Write the name of sound, and how many different Files there are.
    },

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    id: 1,
    pack: "Food",//Which Item Pack Does This Group To (For Map Editor)
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
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    id: 2,
    pack: "Food",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "turbo",
    id: 3,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Power Ups",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "wall",
    id: 4,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    soundFolder: "rock",
    onSpawn: { //When item spawns run these
        playSound: ["spawn",1], //Write the name of sound, and how many different Files there are.
    },

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 1, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Barriers",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "wall2",
    id: 5,
    img: "rock2.png",
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    canEat: false,
    pickUp: false,
    playSounds: true, //If Item should be muted or not;
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
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 2, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Barriers",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "bronzeShield", //(string) Name Of Item
    id: 6,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Power Ups",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "silverShield",
    id: 7,
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
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Power Ups",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "goldShield",
    id: 8,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 5,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    
    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Power Ups",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "lamp", //(string) Name Of Item
    id: 9,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 1,
    teleport: false,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Hidden",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "snakeHole", //(string) Name Of Item
    id: 10,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 4,
    visible: true, //If show when playing
    teleport: 0, //Teleport ID
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    
    destructible: [false], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Tunnels",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "snakeHole2", //(string) Name Of Item
    id: 11,
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
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    teleport: 1, //Teleport ID
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: [false], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Tunnels",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "snakeHole3", //(string) Name Of Item
    id: 12,
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
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    teleport: 2, //Teleport ID
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: [false], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Tunnels",//Which Item Pack Does This Group To (For Map Editor)
})

items.push({
    name: "spawn", //(string) Name Of Item
    id: 13,
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
    playSounds: true, //If Item should be muted or not;
    visible: false, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: true, //Spawn players on this tile
    spawnPlayerID: "player", //Tells which player to spawn here. "player" for all players

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Mechanics",//Which Item Pack Does This Group To (For Map Editor)
})

items.push({
    name: "clear", //(string) Name Of Item
    id: 14,
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
    playSounds: true, //If Item should be muted or not;
    visible: false, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Mechanics",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "blueKey", //(string) Name Of Item
    id: 15,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "redKey", //(string) Name Of Item
    id: 16,
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tiledestructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    
    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "greenKey", //(string) Name Of Item
    id: 17,
    img: "greenKey.png", //(string) Image name
    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    onEat: {
        addStatus: ["greenKey"],
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
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    destructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0, //How much damage to inflict to play when collided with
    onDelete: { //Ran when item is destroyed
        removeStatus: [], //Remove any status
    },
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "blueLock", //(string) Name Of Item
    id: 18,
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
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    playSounds: true, //If Item should be muted or not;
    onDelete: {
        removeStatus: ["blueKey"],

    },
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "redLock", //(string) Name Of Item
    id: 19,
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
    playSounds: true, //If Item should be muted or not;
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: ["redKey"],

    },
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "greenLock", //(string) Name Of Item
    id: 20,
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
    playSounds: true, //If Item should be muted or not;

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
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: ["greenKey"],

    },
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "stoneWall", //(string) Name Of Item
    id: 21,
    img: "stoneWall.jpg", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
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
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Barriers",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "switch", //(string) Name Of Item
    id: 22,
    img: "switchOff.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    playSounds: true, //If Item should be muted or not;
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

    canCollide: true, //If You should look at any colliding properties
    onCollision: { //When collisionType collides do these
        switchImage: "switchOn.png", //Switch Between these images
        switchBoardStatus: "switch", //Switch Between giving these status'
    },

    destructible: [false],
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: ["onCollision","switchBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Status Changers",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "button", //(string) Name Of Item
    id: 23,
    img: "button.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    playSounds: true, //If Item should be muted or not;
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

    canCollide: true, //If You should look at any colliding properties
    onCollision: { //When collisionType collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        removeBoardStatus: "button", //Add a status To the Board;
    },

    destructible: [false],
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: ["onCollision","removeBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Status Changers",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "buttonAdd", //(string) Name Of Item
    id: 24,
    img: "buttonAdd.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
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

    canCollide: true, //If You should look at any colliding properties
    onCollision: { //When collisionType collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: "button", //Add a status To the Board;
    },

    destructible: [false],
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: ["onCollision","addBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Status Changers",//Which Item Pack Does This Group To (For Map Editor)
})

items.push({
    name: "crown", //(string) Name Of Item
    id: 25,
    img: "crown.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    teleport: false, //Teleport ID
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    canEat: true, //(true/false) Can the player consume item? If So it allows onEat_func
    pickUp: false, //(true/false) Does the item go into thep players inventory or is it used immediently
    onEat: {
        winGame: true, //When Picked Up Does Game End?
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

    canCollide: false, //If You should look at any colliding properties
    onCollision: { //When collisionType collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: false, //Add a status To the Board;
        removeBoardStatus: false, //Remove a status To the Board;
    },

    destructible: [false],
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Mechanics",//Which Item Pack Does This Group To (For Map Editor)
})

items.push({
    name: "flag", //(string) Name Of Item
    id: 26,
    img: "flag.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
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
        winGame: false, //When Picked Up Does Game End?
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

    soundFolder: "flag",
    canCollide: true, //If You should look at any colliding properties
    onCollision: { //When collisionType collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: false, //Add a status To the Board;
        removeBoardStatus: false, //Remove a status To the Board;
        setBoardStatus: "player", //Sets its world status to this, can only send out one status
        changeHue: "player", //Change hue to this.
        playSound: ["set",1],
    },

    destructible: [false],
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: ["onCollision","setBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Status Changers",//Which Item Pack Does This Group To (For Map Editor)
})

items.push({
    name: "preassurePlate", //(string) Name Of Item
    id: 27,
    img: "pressureplate.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
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
        winGame: false, //When Picked Up Does Game End?
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

    canCollide: true, //If You should look at any colliding properties
    onCollision: { //When snake collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: "preassurePlate", //Add a status To the Board;
        removeBoardStatus: false, //Remove a status To the Board;
        setBoardStatus: false, //Sets its world status to this, can only send out one status
        changeHue: false, //Change hue to this.
    },
    offCollision: { //When snake leaves item
        removeBoardStatus: "preassurePlate", //Remove a status To the Board;
    },

    destructible: [false],
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: ["onCollision","addBoardStatus"], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: true, //When Destructible status is met do I delete myself?
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Status Changers",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "lockedCell", //(string) Name Of Item
    id: 28,
    img: "lockedCell.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
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
        winGame: false, //When Picked Up Does Game End?
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

    canCollide: false, //If You should look at any colliding properties
    onCollision: { //When snake collides do these
        switchImage: false, //Switch Between Main Image and This Image
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: false, //Add a status To the Board;
        removeBoardStatus: false, //Remove a status To the Board;
        setBoardStatus: false, //Sets its world status to this, can only send out one status
        changeHue: false, //Change hue to this.
    },
    offCollision: { //When snake leaves item
        removeBoardStatus: false, //Remove a status To the Board;
    },


    destructible: ["player_0"],
    boardDestructible: ["yes"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: ["destructible"], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: false,
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Status Changers",//Which Item Pack Does This Group To (For Map Editor)
})
items.push({
    name: "boardLockedCell", //(string) Name Of Item
    id: 29,
    img: "boardLockedCell.png", //(string) Image name
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
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
        winGame: false, //When Picked Up Does Game End?
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

    canCollide: false, //If You should look at any colliding properties
    onCollision: { //When snake collides do these
        switchImage: false, //Switch Between Main Image and This Image
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: false, //Add a status To the Board;
        removeBoardStatus: false, //Remove a status To the Board;
        setBoardStatus: false, //Sets its world status to this, can only send out one status
        changeHue: false, //Change hue to this.
    },
    offCollision: { //When snake leaves item
        removeBoardStatus: false, //Remove a status To the Board;
    },


    destructible: ["yes"], //Leave Blank If Nothing can Destroy This. "yes" - Anyone can destroy this
    boardDestructible: ["switch"], //What Status the world needs to destroy this. "yes" - Destroy no matter what
    renderStatusPath: ["boardDestructible"], //Path to which status to render on top of item, leave blank if no render
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    deleteOnDestruct: false,
    damage: 0,
    onDelete: {
        removeStatus: [],

    },
    pack: "Status Changers",//Which Item Pack Does This Group To (For Map Editor)
})