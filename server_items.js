let items = [];
items.push({
    name: "pellet",
    baseImg: "items/snakeFood",
    baseImgTags: [],
    type: "item",
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
            name: "pellet",
            count: 1,
        }],
        playSound: ["die",2], //Write the name of sound, and how many different Files there are.
        spawnRandomItem: true, //When eaten will it attempt to spawn in from item pool?
    },

    renderStatusPath: [], //Path to which status to render on top of item, leave blank if no render
    id: 1,
})
items.push({
    name: "super_pellet",
    baseImg: "items/snakeSuper",
    baseImgTags: [],
    type: "item",
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
    id: 2,
})
items.push({
    name: "turbo",
    id: 3,
    baseImg: "items/speedPowerUp",
    baseImgTags: [],
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
    name: "wall",
    id: 4,
    baseImg: "items/rock",
    baseImgTags: [],
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
    name: "wall2",
    id: 5,
    baseImg: "items/rock2",
    baseImgTags: [],
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
    name: "bronzeShield", //(string) Name Of Item
    id: 6,
    baseImg: "items/bronzeShield",
    baseImgTags: [],
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
    name: "silverShield",
    id: 7,
    baseImg: "items/silverShield",
    baseImgTags: [],
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
    name: "goldShield",
    id: 8,
    baseImg: "items/goldShield",
    baseImgTags: [],
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
    name: "lamp", //(string) Name Of Item
    id: 9,
    baseImg: "items/Lamp",
    baseImgTags: [],
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
    name: "snakeHole", //(string) Name Of Item
    id: 10,
    baseImg: "items/snakeHole1",
    baseImgTags: [],
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
    name: "snakeHole2", //(string) Name Of Item
    id: 11,
    baseImg: "items/snakeHole2",
    baseImgTags: [],
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
    name: "snakeHole3", //(string) Name Of Item
    id: 12,
    baseImg: "items/snakeHole3",
    baseImgTags: [],
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
    name: "clear", //(string) Name Of Item
    id: 14,
    baseImg: "items/noZone",
    baseImgTags: [],
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
    name: "blueKey", //(string) Name Of Item
    id: 15,
    baseImg: "items/blueKey",
    baseImgTags: [],
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
    name: "redKey", //(string) Name Of Item
    id: 16,
    baseImg: "items/redKey",
    baseImgTags: [],
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
    name: "greenKey", //(string) Name Of Item
    id: 17,
    baseImg: "items/greenKey",
    baseImgTags: [],
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
    name: "blueLock", //(string) Name Of Item
    id: 18,
    baseImg: "items/blueLock",
    baseImgTags: [],
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
    name: "redLock", //(string) Name Of Item
    id: 19,
    baseImg: "items/redLock",
    baseImgTags: [],
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
    name: "greenLock", //(string) Name Of Item
    id: 20,
    baseImg: "items/greenLock",
    baseImgTags: [],
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
    name: "stoneWall", //(string) Name Of Item
    id: 21,
    baseImg: "items/stoneWall",
    baseImgTags: [],
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
    name: "switch", //(string) Name Of Item
    id: 22,
    type: "item",
    baseImg: "items/item_switch_",
    baseImgTags: [".onCollision.switchBoardStatus","_off"],
    renderImages: [["*colors"],["_on","_off"]],
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
            switch: ["_on","_off"],
        },
        switchBoardStatus: "red", //Switch Between giving these status'
    },

    renderStatusPath: ["onCollision","switchBoardStatus"], //Path to which status to render on top of item, leave blank if no render    boardDestructibleCountRequired: 1, //How many of these world status does it need 
    renderStatusColor: "white", //Type To Render Color;
    tags: ["Mechanics"],
})
items.push({
    name: "button", //(string) Name Of Item
    id: 23,
    type: "item",
    baseImg: "items/item_buttonSubtract_", //BaseImgTags Will add to this, to say which image to use
    baseImgTags: [".onCollision.removeBoardStatus"], 
    renderImages: [["*colors"]], //All Variations it can be

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
    name: "buttonAdd", //(string) Name Of Item
    id: 24,
    type: "item",
    baseImg: "items/item_buttonAdd_", //BaseImgTags Will add to this, to say which image to use
    baseImgTags: [".onCollision.addBoardStatus"], 
    renderImages: [["*colors"]], //All Variations it can be

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
    name: "crown", //(string) Name Of Item
    id: 25,
    type: "item",
    baseImg: "items/crown",
    baseImgTags: [],
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
    name: "flag", //(string) Name Of Item
    id: 26,
    type: "item",
    baseImg: "items/item_flag_",
    baseImgTags: [".onCollision.setBoardStatus"],
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
    name: "preassurePlate", //(string) Name Of Item
    id: 27,
    type: "item",
    baseImg: "items/item_pressurePlate_",
    baseImgTags: [".onCollision.addBoardStatus"],
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
    name: "lockedCell", //(string) Name Of Item
    id: 28,
    type: "item",
    baseImg: "items/item_playerLocked_",
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
    name: "boardLockedCell", //(string) Name Of Item
    id: 29,
    type: "item",
    baseImg: "items/item_boardLocked_",
    baseImgTags: [".onCollision.checkStatus.check.boardStatus.name"],
    renderImages: [["*colors"]],
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
    name: "Yellow_Key", //(string) Name Of Item
    id: 30,
    type: "item",
    baseImg: "items/yellowKey",
    baseImgTags: [],
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
    name: "Yellow_lock", //(string) Name Of Item
    id: 31,
    type: "item",
    baseImg: "items/yellowLock",
    baseImgTags: [],
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
    name: "Snake_Size_Gate", //(string) Name Of Item
    id: 32,
    type: "item",
    baseImg: "items/Snake_Size_Gate",
    baseImgTags: [],
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
    name: "Weighted_Preassure_Plate", //(string) Name Of Item
    id: 33,
    type: "item",
    baseImg: "items/item_weightedPlate_",
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
    name: "deadSnake",
    baseImg: "items/food",
    baseImgTags: [],
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
    id: 34,
    tags: ["Food"],
})

module.exports = { items };