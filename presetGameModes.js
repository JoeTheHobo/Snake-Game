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
    respawnCount: -1,
    setFoodRate: 50,
    winningConditions: [{
        condition: "Last One Standing",
        x: false,
        whoWins: "Player",
        type: false,
    },{
        condition: "Touch Item X",
        x: 25,
        whoWins: "Player",
        type: "item",
    },false,false,false],
})

module.exports = { presetGameModes };