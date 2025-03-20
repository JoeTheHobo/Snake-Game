let items = [];
items.push({
    id: 1,
    displayName: "Mouse",
    description: "Eat Mice To Grow!",
    type: "item",
    name: "snakefood",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    tags: ["Food"],
    showInEditor: true,
    onStartSpawn: 3,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    soundFolder: "mouse",
    playSounds: true, //If Item should be muted or not;
    onSpawn: { //When item spawns run these
        //playSound: ["spawn",1], //Write the name of sound, and how many different Files there are.
    },
    onCollision: {
        deleteMe: true,
        growPlayer: 1,
        spawn: [{
            id: 1,
            count: 1,
        }],
        playSound: ["die",2], //Write the name of sound, and how many different Files there are.
        spawnRandomItem: true, //When eaten will it attempt to spawn in from item pool?
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
})
items.push({
    id: 2,
    displayName: "Bunch Of Mice",
    description: "Eat And Grow Very Large",
    type: "item",
    name: "snakesuper",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    tags: ["Food"],
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 50,
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    
    onCollision: {
        deleteMe: true,
        growPlayer: 5,
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    onDelete: { //Ran when item is destroyed
    },
})
items.push({
    id: 3,
    displayName: "Turbo",
    description: "Pickup And Use To Go FAST!",
    skin: "basic",
    availableSkins: ["basic"],
    name: "speedpowerup",
    baseImg: "items/speedPowerUp",
    baseImgTags: [],
    renderImages: [],
    type: "item",
    tags: ["Power Up","Collectables"],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    onActivate: {
        giveTurbo: {
            duration: 35,
            moveSpeed: 1.5,
        },
    },
    onCollision: {
        checkStatus: {
            check: {
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            }
        },
    },
})
items.push({
    id: 4,
    displayName: "Rock",
    description: "Weak Rock, Can Be Broken",
    name: "rock",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    soundFolder: "rock",
    onSpawn: { //When item spawns run these
        playSound: ["spawn",1], //Write the name of sound, and how many different Files there are.
    },
    
    onCollision: {
        deleteMe: true,
        dealDamage: 1,
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Barriers"],
})
items.push({
    id: 5,
    displayName: "Strong Rock",
    description: "Takes More To Destroy This Rock",
    name: "rock2",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 10,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    
    soundFolder: "rock",
    onSpawn: { //When item spawns run these
        playSound: ["spawn",1], //Write the name of sound, and how many different Files there are.
    },
    onCollision: {
        deleteMe: true,
        dealDamage: 2,
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Barriers"],
})
items.push({
    id: 6,
    displayName: "Bronze Shield",
    description: "Equip To Protect Yourself (Weak)",
    name: "bronzeshield", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 20,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    whenEquiped: {
        protect: 2, //How much it protects
        absorb: 0, //How much item Absorbs before breaking it'self
    },
    onActivate: {
        equip: "head",
    },
    onCollision: {
        checkStatus: {
            check: {
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            },
        },
    },
    tags: ["Shields","Collectables"],
})
items.push({
    id: 7,
    displayName: "Silver Shield",
    description: "Equip To Protect Yourself (Medium)",
    name: "silvershield",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 10,
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    whenEquiped: {
        protect: 3, //How much it protects
        absorb: 0, //How much item Absorbs before breaking it'self
    },
    onActivate: {
        equip: "head",
    },
    onCollision: {
        checkStatus: {
            check: {
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            },
        },
    },
    tags: ["Shields","Collectables"],
})
items.push({
    id: 8,
    displayName: "Gold Shield",
    description: "Equipt To Protect Yourself (Strong)",
    name: "goldshield",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 5,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    whenEquiped: {
        protect: 4, //How much it protects
        absorb: 0, //How much item Absorbs before breaking it'self
    },
    onActivate: {
        equip: "head",
    },
    onCollision: {
        checkStatus: {
            check: {
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            },
        },
    },
    tags: ["Shields","Collectables"],
})
items.push({
    id: 9,
    displayName: "Lamp",
    description: "You shouldn't be reading this...",
    name: "lamp", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: false,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 1,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    onCollision: {
        deleteMe: true,
        canvasFilter: {
            filter: "invert(100%)",
            duration: 5, //In Seconds
            target: "@a",
        }
    },
    tags: [],
})
items.push({
    id: 10,
    displayName: "Snake Hole 1",
    description: "Move Between These Holes",
    name: "snakehole1", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    onCollision: {
        teleport: 10,
    },
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 4,
    visible: true, //If show when playing
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Tunnels"],
})
items.push({
    id: 11,
    displayName: "Snake Hole 2",
    description: "Move Between These Holes",
    name: "snakehole2", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    onCollision: {
        teleport: 11,
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 4,
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Tunnels"],
})
items.push({
    id: 12,
    displayName: "Snake Hole 3",
    description: "Move Between These Holes",
    name: "snakehole3", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    onCollision: {
        teleport: 12,
    },
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 4,
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    spawnCount: 2, //How Many To Spawn In When Spawning
    spawnLimit: 1, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Tunnels"],
})

items.push({
    id: 14,
    displayName: "No Spawn Zone",
    description: "Makes Items Not Able To Spawn Here",
    name: "nozone", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    playSounds: true, //If Item should be muted or not;
    visible: false, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Mechanics"],
})
items.push({
    id: 15,
    displayName: "Blue Key",
    description: "Have In Inventory To Access Blue Lock",
    name: "bluekey", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            },
            fail: {
            }
        },
    },
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Mechanics"],
})
items.push({
    id: 16,
    displayName: "Red Key",
    description: "Have In Inventory To Access Red Lock",
    name: "redkey", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            },
            fail: {
            }
        },
    },
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tiledestructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Mechanics"],
})
items.push({
    id: 17,
    displayName: "Green Key",
    description: "Have In Inventory To Access Blue Lock",
    name: "greenkey", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            },
            fail: {
            }
        },
    },
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Mechanics"],
})
items.push({
    id: 18,
    displayName: "Blue Lock",
    description: "Requires Blue Key To Access",
    name: "bluelock", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: false,
                playerHasItem: [{
                    name: "blueKey",
                    count: 1,
                }],
            },
            pass: {
                deleteMe: true,
                removePlayerItem: [{
                    name: "blueKey",
                    count: 1,
                }]
            },
            fail: {
                killPlayer: true,
            }
        },
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    playSounds: true, //If Item should be muted or not;
    tags: ["Mechanics","Barriers"],
})
items.push({
    id: 19,
    displayName: "Red Lock",
    description: "Requires Red Key To Access",
    name: "redlock", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: false,
                playerHasItem: [{
                    name: "redKey",
                    count: 1,
                }],
            },
            pass: {
                deleteMe: true,
                removePlayerItem: [{
                    name: "redKey",
                    count: 1,
                }]
            },
            fail: {
                killPlayer: true,
            }
        },
    },

    playSounds: true, //If Item should be muted or not;
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Mechanics","Barriers"],
})
items.push({
    id: 20,
    displayName: "Green Lock",
    description: "Requires Green Key To Access",
    name: "greenlock", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    cantUseIfStatus: [], //([itemName,itemName,...]) When player attempts to use item don't allow them if their status includes anything from this list.
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    playSounds: true, //If Item should be muted or not;

    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: false,
                playerHasItem: [{
                    name: "greenKey",
                    count: 1,
                }],
            },
            pass: {
                deleteMe: true,
                removePlayerItem: [{
                    name: "greenKey",
                    count: 1,
                }]
            },
            fail: {
                killPlayer: true,
            }
        },
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Mechanics","Barriers"],
})
items.push({
    id: 21,
    displayName: "Wall",
    description: "Nothing Can Destroy This Wall",
    name: "stonewall", //(string) Name Of Item
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    
    onCollision: {
        killPlayer: true,
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Barriers"],
})
items.push({
    id: 22,
    displayName: "Switch",
    description: "Turn Board Status Off And On",
    name: "switch", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [".onCollision.switchBoardStatus","_off"],
    renderImages: [["*colors"],["on","off"]],
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    playSounds: true, //If Item should be muted or not;
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: { //When collisionType collides do these
        switchBaseImgTag: { //Switch Between these images using Base Img
            index: 1,
            switch: ["on","off"],
        },
        switchBoardStatus: "red", //Switch Between giving these status'
    },

    renderStatusPath: ["onCollision","switchBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need 
    renderStatusColor: "white", //Type To Render Color;
    tags: ["Mechanics"],
})
items.push({
    id: 23,
    displayName: "Subtracting Button",
    description: "Remove A Board Status",
    name: "buttonsubtract", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [".onCollision.removeBoardStatus"], 
    renderImages: [["*colors2"]], //All Variations it can be

    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    playSounds: true, //If Item should be muted or not;
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: { //When collisionType collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        removeBoardStatus: "red", //Add a status To the Board;
    },

    renderStatusPath: ["onCollision","removeBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    renderStatusColor: "white", //Type To Render Color;
    tags: ["Mechanics"],
})
items.push({
    id: 24,
    displayName: "Adding Button",
    description: "Add A Board Status",
    name: "buttonadd", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [".onCollision.addBoardStatus"], 
    renderImages: [["*colors2"]], //All Variations it can be

    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: { //When collisionType collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: "red", //Add a status To the Board;
    },

    renderStatusPath: ["onCollision","addBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    renderStatusColor: "white", //Type To Render Color;
    tags: ["Mechanics"],
})

items.push({
    id: 25,
    displayName: "Crown",
    description: "Touch To Win The Game!",
    name: "crown", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: {
        winGame: true,
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    boardDestructibleCountRequired: 1, //How many of these world status does it need
    tags: ["Mechanics"],
})

items.push({
    id: 26,
    displayName: "Flag",
    description: "Set A Board Status",
    name: "flag", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: ["white"],
    renderImages: [["*colors2"]],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    tie: [[".onCollision.setBoardStatus",".onCollision.setBaseImgTag.value"]],

    soundFolder: "flag",
    onCollision: { //When collisionType collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: false, //Add a status To the Board;
        removeBoardStatus: false, //Remove a status To the Board;
        setBoardStatus: "*P", //Sets its world status to this, can only send out one status
        setBaseImgTag: {
            index: 0,
            value: "*P",
        }, //Change base image tag.
        playSound: ["set",1],
        
    },

    renderStatusPath: ["onCollision","setBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need
    renderStatusColor: "white", //Type To Render Color;
    tags: ["Mechanics"],
})

items.push({
    id: 27,
    displayName: "Pressure Plate",
    description: "Set A Board Status While On The Plate",
    name: "pressureplate", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [".onCollision.addBoardStatus"],
    renderImages: [["*colors2"]],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    tie: [[".onCollision.addBoardStatus",".offCollision.removeBoardStatus"]],

    onCollision: { //When snake collides do these
        switchImage: false, //Switch Between these images
        switchBoardStatus: false, //Switch Between giving these status
        addBoardStatus: "red", //Add a status To the Board;
        removeBoardStatus: false, //Remove a status To the Board;
        setBoardStatus: false, //Sets its world status to this, can only send out one status
        changeHue: false, //Change hue to this.
        
    },
    offCollision: { //When snake leaves item
        removeBoardStatus: "red", //Remove a status To the Board;
    },

    renderStatusPath: ["onCollision","addBoardStatus"], //Path to which status to render on top of item, leave blank if no render
    renderStatusColor: "white", //Type To Render Color;
    tags: ["Mechanics"],
})
items.push({
    id: 28,
    displayName: "Team Locked Wall",
    description: "Requires Player Be On The Right Team To Access",
    name: "playerlocked", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [".onCollision.checkStatus.check.playerTeamStatus"],
    renderImages: [["*colors"]],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    hideWhen: [
        {
            value: ".onCollision.checkStatus.check.playerTeamStatus",
            equals: "@P.team",
        }
    ],
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: { //When snake collides do these
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: "red",
                playerStatusIncludes: false,
                snakeSize: false,
                playerHasEmptySlot: false,
                playerHasItem: false,
            },
            pass: {

            },
            fail: {
                killPlayer: true,
            }
        },
    },
    offCollision: { //When snake leaves item
        removeBoardStatus: false, //Remove a status To the Board;
    },

    renderStatusPath: ["onCollision","checkStatus","check","playerTeamStatus"], //Path to which status to render on top of item, leave blank if no render
    tags: ["Mechanics","Barriers"],
})
items.push({
    id: 29,
    displayName: "Board Locked Wall",
    description: "Required Board To Have Unique Status",
    name: "boardlocked", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [".onCollision.checkStatus.check.boardStatus.name"],
    renderImages: [["*colors2"]],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    hideWhen: [
        {
            value: ".onCollision.checkStatus.check.boardStatus.count",
            subtract: ["boardStatusCount",".onCollision.checkStatus.check.boardStatus.name"],
            equals: 0,
        }
    ],
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: { //When snake collides do these
        checkStatus: {
            check: {
                boardStatus: {
                    name: "red",
                    count: 3,
                },
                playerTeamStatus: false,
                playerStatusIncludes: false,
                snakeSize: false,
                playerHasEmptySlot: false,
                playerHasItem: false,
            },
            pass: {
                
            },
            fail: {
                killPlayer: true,
            }
        },
    },

    renderStatusPath: ["onCollision","checkStatus","check","boardStatus","name"], //Path to which status to render on top of item, leave blank if no render
    renderStatusNumber: {
        value: ".onCollision.checkStatus.check.boardStatus.count",
        subtract: ["boardStatusCount",".onCollision.checkStatus.check.boardStatus.name"],
    },
    updateOn: ["boardStatus"],
    tags: ["Mechanics","Barriers"],
})

items.push({
    id: 30,
    displayName: "Yellow Key",
    description: "Have In Inventory To Access Yellow Lock",
    name: "yellowkey", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tiledestructible: ["yes"], //Array Of Status that can destroy this item. Or simply put "yes" if you want it to always be destroyed on touch
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)

    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: true,
            },
            pass: {
                pickUp: true,
            },
            fail: {
            }
        },
    },
    tags: ["Mechanics"],
})
items.push({
    id: 31,
    displayName: "Yellow Lock",
    description: "Requires Yellow Key To Access",
    name: "yellowlock", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    playSounds: true, //If Item should be muted or not;
    pack: "Locks",//Which Item Pack Does This Group To (For Map Editor)
    onCollision: {
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: false,
                playerHasEmptySlot: false,
                playerHasItem: [{
                    name: "Yellow_Key",
                    count: 1,
                }],
            },
            pass: {
                deleteMe: true,
                removePlayerItem: [{
                    name: "Yellow_Key",
                    count: 1,
                }]
            },
            fail: {
                killPlayer: true,
            }
        },
    },
    tags: ["Mechanics","Barriers"],
})
items.push({
    id: 32,
    displayName: "Snake Size Gate",
    description: "Snake Needs To Reach Certain Size To Access",
    name: "snakesizegate", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    hideWhen: [
        {
            value: ".onCollision.checkStatus.check.snakeSize",
            lessOrEqual: "@P.tailLength",
        }
    ],
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile

    onCollision: { //When snake collides do these
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: 10,
                playerHasEmptySlot: false,
                playerHasItem: false,
            },
            pass: {
                
            },
            fail: {
                killPlayer: true,
            }
        },
    },

    renderStatusPath: ["onCollision","checkStatus","check","snakeSize"], //Path to which status to render on top of item, leave blank if no render
    renderStatusColor: "white", //Type To Render Color;
    renderStatusNumber: {
        value: ".onCollision.checkStatus.check.snakeSize",
        subtract: ["playerSnakeSize"],
    },
    updateOn: ["playerGrows"],
    tags: ["Mechanics","Barriers"],
})

items.push({
    id: 33,
    displayName: "Snake Size Pressure Plate",
    description: "Snake Needs To Be A Certain Size To Use Plate",
    name: "weightedplate", //(string) Name Of Item
    type: "item",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [".onCollision.checkStatus.pass.addBoardStatus"],
    renderImages: [["*colors"]],
    showInEditor: true,
    onStartSpawn: 0,
    playSounds: true, //If Item should be muted or not;
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    tie: [
        [".onCollision.checkStatus.pass.addBoardStatus",".offCollision.checkStatus.pass.removeBoardStatus"],
        [".onCollision.checkStatus.check.snakeSize",".offCollision.checkStatus.check.snakeSize"]
    ],

    onCollision: { //When snake collides do these
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: 10,
                playerHasEmptySlot: false,
                playerHasItem: false,
            },
            pass: {
                addBoardStatus: "blue",
            },
            fail: {
                
            }
        },
    },
    offCollision: { //When snake leaves item
        checkStatus: {
            check: {
                boardStatus: false,
                playerTeamStatus: false,
                snakeSize: 10,
                playerHasEmptySlot: false,
                playerHasItem: false,
            },
            pass: {
                removeBoardStatus: "blue",
            },
            fail: {
                
            }
        }
    },

    renderStatusPath: ["onCollision","checkStatus","check","snakeSize"], //Path to which status to render on top of item, leave blank if no render
    renderStatusNumber: {
        value: ".onCollision.checkStatus.check.snakeSize",
        subtract: ["playerSnakeSize"],
        dontRenderIfValueEquals: 0,
    },
    updateOn: ["playerGrows"],
    renderStatusColor: "red", //Type To Render Color;
    tags: ["Mechanics"],
})
items.push({
    id: 34,
    displayName: "Dead Snake Cell",
    description: "Remnants Of A Past Snake",
    name: "deadsnake",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    type: "item",
    showInEditor: true,
    onStartSpawn: 0,
    gameModeMenu_selectedItem: false,
    specialSpawnWeight: 0,
    visible: true, //If show when playing
    spawnCount: 1, //How Many To Spawn In When Spawning
    spawnLimit: false, //How many times can spawn durring session
    spawnPlayerHere: false, //Spawn players on this tile
    soundFolder: false,
    playSounds: false, //If Item should be muted or not;
    onSpawn: { //When item spawns run these

    },
    onCollision: {
        deleteMe: true,
        growPlayer: 1,
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    tags: ["Food"],
})

module.exports = { items };