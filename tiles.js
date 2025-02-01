let tiles = [];
tiles.push({
    name: "grass",
    img: "background.png",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 1,
    pack: "Regular Speed",//Which Item Pack Does This Group To (For Map Editor)
})
tiles.push({
    name: "sand",
    img: "tilesand.png",
    changePlayerSpeed: 0.5, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 2,
    pack: "Slow Speed",//Which Item Pack Does This Group To (For Map Editor)
})
tiles.push({
    name: "clear",
    img: "clear.png",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 3,
    pack: "Regular Speed",//Which Item Pack Does This Group To (For Map Editor)
})
tiles.push({
    name: "pathway",
    img: "path.png",
    changePlayerSpeed: 1.5, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 4,
    pack: "Fast Speed",//Which Item Pack Does This Group To (For Map Editor)
})
tiles.push({
    name: "planks",
    img: "tileplanks.png",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 5,
    pack: "Regular Speed",//Which Item Pack Does This Group To (For Map Editor)
})
tiles.push({
    name: "water",
    img: "tilewater.png",
    changePlayerSpeed: 0.5, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 6,
    pack: "Slow Speed",//Which Item Pack Does This Group To (For Map Editor)
})
tiles.push({
    name: "flower",
    img: "flower.png",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 7,
    pack: "Regular Speed",//Which Item Pack Does This Group To (For Map Editor)
})
tiles.push({
    name: "Dirt",
    img: "dirtTile.jpg",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 8,
    pack: "Regular Speed",//Which Item Pack Does This Group To (For Map Editor)
})

tiles.push({
    name: "Piano",
    img: "tile_piano.jpg",
    changePlayerSpeed: 1, //Player Speed Times This Number
    canSpawn: true, //If Items can spawn on tile
    id: 9,
    pack: "Regular Speed",//Which Item Pack Does This Group To (For Map Editor)
    onOver: {
        playSound: ["a3",1,["a3","a-3","a4","a-4","a5","a-5","b3","b4","b5","c3","c-3","c4","c-4","c5","c-5","c6","d3","d-3","d4","d-4","d5","d-5","e3","e4","e5","f3","f-3","f4","f-4","f5","f-5","g3","g-3","g4","g-4","g5","g-5"]], //Write the name of sound, and how many different Files there are.
    },
    soundFolder: "piano",
    playSounds: true, //If Item should be muted or not;
})




