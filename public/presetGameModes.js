let basedGameMode = {
    name: "Untitled",
    cantEdit: false,
    howManyItemsCanPlayersUse: 2,
    mode_usingItemType: "scroll",
    mode_whenInventoryFullWhereDoItemsGo: "select",
    atStartSpawnIn: [{
        name: "pellet",
        count: 3,
    }],
    items: structuredClone(items),
    snakeVanishOnDeath: false,
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    snakeCollision: true,
    teamCollision: true,
}