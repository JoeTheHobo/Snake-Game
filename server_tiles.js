/* BLANK TILE

tiles.push({
    displayName: "",
    description: "",
    type: "tile",
    name: "",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1,
    id: ##,
    visible: true,
    showInEditor: true,
    tags: [""],
})


*/

let tiles = [];
/*
    Save Names Of Tile And Items Like
    type_name_skin_mods....png
*/
tiles.push({
    displayName: "Grass",
    description: "",
    type: "tile",
    name: "grass",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 1,
    whileOn: {
        playerCanMove: true,
    },
    visible: true,
    showInEditor: true,
    tags: ["Normal Speed"],
})
tiles.push({
    displayName: "Sand",
    description: "Snakes Move Slower On This Tile",
    type: "tile",
    name: "sand",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 0.5, //Player Speed Times This Number
    id: 2,
    whileOn: {
        playerCanMove: true,
    },
    visible: true,
    showInEditor: true,
    tags: ["Slow Speed"],
})
tiles.push({
    displayName: "Clear",
    description: "See Through The Ground",
    type: "tile",
    name: "clear",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 3,
    whileOn: {
        playerCanMove: true,
    },
    visible: true,
    showInEditor: true,
    tags: ["Normal Speed"],
})
tiles.push({
    displayName: "Pathway",
    description: "Snakes Move Faster On This Tile",
    type: "tile",
    name: "pathway",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1.5, //Player Speed Times This Number
    id: 4,
    whileOn: {
        playerCanMove: true,
    },
    showInEditor: true,
    visible: true,
    tags: ["Fast Speed"],
})
tiles.push({
    displayName: "Planks",
    description: "Decoritive Tile",
    type: "tile",
    name: "planks",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 5,
    whileOn: {
        playerCanMove: true,
    },
    visible: true,
    showInEditor: true,
    tags: ["Normal Speed"],
})
tiles.push({
    displayName: "Water",
    description: "Snakes Move Slowly Through Water",
    type: "tile",
    name: "water",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: ["1"],
    renderImages: [["1","2"]],
    changePlayerSpeed: 0.5, //Player Speed Times This Number
    id: 6,
    visible: true,
    tags: ["Slow Speed"],
    events: {
        animateBackground: {
            switchBaseImgTag: { //Switch Between these images using Base Img
                index: 0,
                switch: ["1","2"],
            },
        }
    },
    whileOn: {
        playerCanMove: true,
    },
    showInEditor: true,
    timeEvents: [{
        time: 1, //In Seconds
        repeat: true, //Repeat or finish this time event
        event: "animateBackground",
    }]
})
tiles.push({
    displayName: "Flower",
    description: "",
    type: "tile",
    name: "flower",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 7,
    whileOn: {
        playerCanMove: true,
    },
    visible: true,
    showInEditor: true,
    tags: ["Normal Speed"],
})
tiles.push({
    displayName: "Dirt",
    description: "Decoritive Tile",
    type: "tile",
    name: "dirt",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 8,
    whileOn: {
        playerCanMove: true,
    },
    visible: true,
    showInEditor: true,
    tags: ["Normal Speed"],
})

tiles.push({
    displayName: "Music Tile",
    description: "Move Over Tile To Play Music!",
    type: "tile",
    name: "piano",
    skin: "basic",
    availableSkins: ["basic","disco"],
    baseImgTags: ["unlit"],
    renderImages: [["unlit","lit"]],
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 9,
    filter: {
        type: "piano",
        src: ".onCollision.playSound[0]",
    }, 
    onCollision: {
        setBaseImgTag: {
            index: 0,
            value: "lit",
        }, //Change base image tag.
        playSound: ["A3",1,"music"],
    },
    offCollision: {
        setBaseImgTag: {
            index: 0,
            value: "unlit",
        }, //Change base image tag.
    },
    whileOn: {
        playerCanMove: true,
    },
    visible: true,
    showInEditor: true,
    soundFolder: "piano",
    playSounds: true, //If Item should be muted or not;
    tags: ["Special"],
})

tiles.push({
    displayName: "Ice",
    description: "You can't move on ice",
    type: "tile",
    name: "ice",
    skin: "basic",
    availableSkins: ["basic"],
    showInEditor: true,
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    whileOn: {
        playerCanMove: false,
    },
    id: 10,
    visible: true,
    tags: ["Special"],
})

tiles.push({
    displayName: "Speed Tile",
    description: "Speed Players This Direction",
    type: "tile",
    name: "speed",
    skin: "basic",
    availableSkins: ["basic"],
    showInEditor: true,
    baseImgTags: [".onCollision.forcePlayerMove"],
    renderImages: [["left","right","up","down"]],
    changePlayerSpeed: 2, //Player Speed Times This Number
    whileOn: {
        playerCanMove: false,
    },
    onCollision: {
        forcePlayerMove: "right",
    },
    id: 11,
    visible: true,
    tags: ["Special"],
})


tiles.push({
    displayName: "Canvas",
    description: "Walk accross this tile to make art!",
    type: "tile",
    name: "canvas",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: ["white"],
    renderImages: [["*colors2"]],
    changePlayerSpeed: 1,
    id: 12,
    visible: true,
    showInEditor: true,
    tags: ["Special"],

    onCollision: {
        setBaseImgTag: {
            index: 0,
            value: "*P",
        }
    }
})


//Paste New Items Above this line of code
module.exports = { tiles };