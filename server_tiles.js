let tiles = [];
tiles.push({
    name: "grass",
    baseImg: "tiles/background",
    baseImgTags: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    type: "tile",
    id: 1,
    visible: true,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "sand",
    baseImg: "tiles/sand",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 0.5, //Player Speed Times This Number
    id: 2,
    visible: true,
    tags: ["Slow Speed"],
})
tiles.push({
    name: "clear",
    baseImg: "tiles/clear",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 3,
    visible: true,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "pathway",
    baseImg: "tiles/path",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1.5, //Player Speed Times This Number
    id: 4,
    visible: true,
    tags: ["Fast Speed"],
})
tiles.push({
    name: "planks",
    baseImg: "tiles/tileplanks",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 5,
    visible: true,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "water",
    baseImg: "tiles/tilewater",
    baseImgTags: ["1"],
    renderImages: [["1","2"]],
    type: "tile",
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
    name: "flower",
    baseImg: "tiles/flower",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 7,
    visible: true,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "Dirt",
    baseImg: "tiles/dirtTile",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 8,
    visible: true,
    tags: ["Normal Speed"],
})

tiles.push({
    name: "Piano",
    baseImg: "tiles/tile_piano",
    baseImgTags: [],
    type: "tile",
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