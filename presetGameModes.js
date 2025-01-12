let presetGameModes = [
    {
        name: "Classic",
        canDelete: false,
        howManyItemsCanPlayersUse: 2,
        mode_usingItemType: "scroll",
        mode_whenInventoryFullWhereDoItemsGo: "select",
        atStartSpawnIn: [{
            name: "pellet",
            count: 3,
        }],
        items: cloneWithoutFunctions(items),
    },
    {
        name: "Rocky",
        canDelete: false,
        howManyItemsCanPlayersUse: 2,
        mode_usingItemType: "scroll",
        mode_whenInventoryFullWhereDoItemsGo: "select",
        atStartSpawnIn: [{
            name: "pellet",
            count: 3,
        }],
        items: cloneWithoutFunctions(items), // Unique copy for Rocky
    }
];

for (let i = 0; i < presetGameModes[1].items.length; i++) {
    let item = presetGameModes[1].items[i];
    if (item.name == "wall") {
        item.onStartSpawn = 25;
    }
}

function cloneWithoutFunctions(obj) {
    if (Array.isArray(obj)) {
        return obj.map(cloneWithoutFunctions); // Recursively clone arrays
    } else if (obj && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            // Only include non-function properties
            if (typeof value !== 'function') {
                acc[key] = cloneWithoutFunctions(value); // Recursively clone nested objects
            }
            return acc;
        }, {});
    }
    // Return value directly for primitives
    return obj;
}