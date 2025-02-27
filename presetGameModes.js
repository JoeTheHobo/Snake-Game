let presetGameModes = [];

presetGameModes.push({
    name: "Classic",
    howManyItemsCanPlayersUse: 2,
    mode_usingItemType: "scroll",
    mode_whenInventoryFullWhereDoItemsGo: "select",
    itemAlterations: [],
    snakeVanishOnDeath: false,
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    snakeCollision: true,
    teamCollision: true,
})
presetGameModes.push({
    name: "Rocky",
    howManyItemsCanPlayersUse: 2,
    mode_usingItemType: "scroll",
    mode_whenInventoryFullWhereDoItemsGo: "select",
    itemAlterations: [
        {
            name: "wall",
            alterations: [["specialSpawnWeight",40],["onStartSpawn",20]],
        },
        {
            name: "wall2",
            alterations: [["specialSpawnWeight",20],["onStartSpawn",10]],
        },
    ],
    snakeVanishOnDeath: false,
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    snakeCollision: true,
    teamCollision: true,
})

module.exports = { presetGameModes };