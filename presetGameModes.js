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
    winningConditions: [{
        condition: "survive x minutes",
        x: 5,
        whoWins: false,
        value: "number",
    },false,false,false,false],
})

module.exports = { presetGameModes };