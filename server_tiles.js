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
    baseImg: "clear",
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
        time: 2, //In Seconds
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
        playSound: ["a3",1,["a3","a-3","a4","a-4","a5","a-5","b3","b4","b5","c3","c-3","c4","c-4","c5","c-5","c6","d3","d-3","d4","d-4","d5","d-5","e3","e4","e5","f3","f-3","f4","f-4","f5","f-5","g3","g-3","g4","g-4","g5","g-5"]], //Write the name of sound, and how many different Files there are.
    },
    visible: true,
    soundFolder: "piano",
    playSounds: true, //If Item should be muted or not;
    tags: ["Normal Speed"],
})





module.exports = { tiles };