let decorations = [];
/*
    Save Names Of Tile And Items Like
    type_name_skin_mods....png
*/
decorations.push({
    displayName: "Purple Flower",
    description: "A Flower To Add To The Scenery",
    type: "tile",
    name: "grass",
    skin: "basic",
    availableSkins: ["basic"],
    baseImgTags: [],
    renderImages: [],
    changePlayerSpeed: 1, //Player Speed Times This Number
    id: 1,
    visible: true,
    tags: ["Normal Speed"],
})



module.exports = { decorations };