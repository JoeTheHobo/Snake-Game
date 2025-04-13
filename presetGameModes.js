let presetGameModes = [];

presetGameModes.push({
    name: "Classic",
    description: "",
    howManyItemsCanPlayersUse: 2,
    mode_usingItemType: "scroll",
    itemAlterations: [],
    whenSnakesDie: "remain", //vanish, remain, become food 
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    respawnProtection: 3, //Seconds
    snakeCollision: true,
    teamCollision: true,
    setFoodRate: 50,
})
presetGameModes.push({
    name: "Rocky",
    howManyItemsCanPlayersUse: 2,
    mode_usingItemType: "scroll",
    itemAlterations: [
        {
            name: "wall",
            alterations: [["specialSpawnWeight",40],["onStartSpawn",30]],
        },
        {
            name: "wall2",
            alterations: [["specialSpawnWeight",20],["onStartSpawn",20]],
        },
    ],
    whenSnakesDie: "remain", //vanish, remain, become food 
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    respawnProtection: 3, //Seconds
    snakeCollision: true,
    teamCollision: true,
    setFoodRate: 50,
})

module.exports = { presetGameModes };