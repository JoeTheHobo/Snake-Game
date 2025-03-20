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
    visible: true,
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
    visible: true,
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
    visible: true,
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
    visible: true,
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
    visible: true,
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
    visible: true,
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
    onOver: {
        playSound: ["A3",1], //Write the name of sound, and how many different Files there are.
    },
    visible: true,
    soundFolder: "piano",
    playSounds: true, //If Item should be muted or not;
    tags: ["Normal Speed"],
})





module.exports = { tiles };