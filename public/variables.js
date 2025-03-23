let items = [];
let basedGameMode;
let itemList;
let presetBoards;
let currentBoard;
let currentBoardIndex = ls.get("currentBoardIndex",0);
let backgrounds;
let tiles = [];
let updateTiles;
let renderMapsInServersTab = false;
let allPianoKeys = [];
let keyMapping;
let global_scene;
let accessedBattlePasses;
let currentAudio = null;

let global_musicVolume = 100;
let global_sfxVolume = 100;

let global_gameColors = [
    ["white","#ffffff"],
    ["aquamarine","#61f3cc"],
    ["blue","#25008f"],
    ["buff","#f7d082"],
    ["coral","#f07a7d"],
    ["crimsonpurple","#e33bf1"],
    ["gold","#ccbb00"],
    ["green","#3e9000"],
    ["lemon","#e0ff00"],
    ["lime","#6ff600"],
    ["magenta","#85008f"],
    ["orange","#f29900"],
    ["pink","#e8006f"],
    ["red","#ee0013"],
    ["skyblue","#85d0ff"],
    ["slateblue","#7564ff"],
    ["venom","#6b7a00"],
];

let showingGameTips = false;