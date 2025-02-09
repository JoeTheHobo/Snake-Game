function cloneObject(object) {
    try {
        return structuredClone(object);
    } catch {
        console.warn("Structed Clone Failed On:",object);
    }
}
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
    items: cloneObject(items),
    snakeVanishOnDeath: false,
    respawn: false,
    respawnTimer: 5,
    respawnGrowth: 50, //Percent
    snakeCollision: true,
    teamCollision: true,
}
let presetGameModes = [
    {
        name: "Classic",
        cantEdit: true,
        howManyItemsCanPlayersUse: 2,
        mode_usingItemType: "scroll",
        mode_whenInventoryFullWhereDoItemsGo: "select",
        atStartSpawnIn: [{
            name: "pellet",
            count: 3,
        }],
        items: cloneObject(items),
        snakeVanishOnDeath: false,
        respawn: false,
        respawnTimer: 5,
        respawnGrowth: 50, //Percent
        snakeCollision: true,
        teamCollision: true,
    },
    {
        name: "Rocky",
        cantEdit: true,
        howManyItemsCanPlayersUse: 2,
        mode_usingItemType: "scroll",
        mode_whenInventoryFullWhereDoItemsGo: "select",
        atStartSpawnIn: [{
            name: "pellet",
            count: 3,
        }],
        items: cloneObject(items), // Unique copy for Rocky
        snakeVanishOnDeath: false,
        respawn: false,
        respawnTimer: 5,
        respawnGrowth: 50, //Percent
        snakeCollision: true,
        teamCollision: true,
    }
];

for (let i = 0; i < presetGameModes[1].items.length; i++) {
    let item = presetGameModes[1].items[i];
    if (item.name == "wall") {
        item.onStartSpawn = 25;
    }
}