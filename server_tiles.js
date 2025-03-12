let tiles = [];
tiles.push({
    name: "grass",
    baseImg: "tiles/background",
    baseImgTags: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    type: "tile",
    canSpawn: true, //If Items can spawn on tile
    id: 1,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "sand",
    baseImg: "tiles/sand",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 0.5, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 2,
    tags: ["Slow Speed"],
})
tiles.push({
    name: "clear",
    baseImg: "clear",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 3,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "pathway",
    baseImg: "tiles/path",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1.5, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 4,
    tags: ["Fast Speed"],
})
tiles.push({
    name: "planks",
    baseImg: "tiles/tileplanks",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 5,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "water",
    baseImg: "tiles/tilewater",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 0.5, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 6,
    tags: ["Slow Speed"],
})
tiles.push({
    name: "flower",
    baseImg: "tiles/flower",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 7,
    tags: ["Normal Speed"],
})
tiles.push({
    name: "Dirt",
    baseImg: "tiles/dirtTile",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 8,
    tags: ["Normal Speed"],
})

tiles.push({
    name: "Piano",
    baseImg: "tiles/tile_piano",
    baseImgTags: [],
    type: "tile",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 9,
    onOver: {
        playSound: ["a3",1,["a3","a-3","a4","a-4","a5","a-5","b3","b4","b5","c3","c-3","c4","c-4","c5","c-5","c6","d3","d-3","d4","d-4","d5","d-5","e3","e4","e5","f3","f-3","f4","f-4","f5","f-5","g3","g-3","g4","g-4","g5","g-5"]], //Write the name of sound, and how many different Files there are.
    },
    soundFolder: "piano",
    playSounds: true, //If Item should be muted or not;
    tags: ["Normal Speed"],
})





module.exports = { tiles };