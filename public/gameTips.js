let gameTips = [];

function showGameTips() {
    let holder = $(".gameTipHolder");
    holder.classRemove("show");
    holder.classAdd("hide");

    let tip = gameTips.rnd();
    let obj,imgSrc;
    if (tip.type == "items") {
        obj = getRealItem(tip.name);
        imgSrc = getImageFromItem(obj,"src");
    }
    if (tip.type == "tiles") {
        obj = getTile(tip.name);
        imgSrc = $("tile_" + tip.name).src;
    }

    $(".gameTip_img").src = imgSrc;
    $(".gameTip_name").innerHTML = tip.name;
    $(".gameTip_tip").innerHTML = tip.tip;
    
    setTimeout(function() {
        holder.classRemove("hide");
        holder.classAdd("show");

        setTimeout(function() {
            holder.classRemove("show");
            holder.classAdd("hide");
            if (showingGameTips) showGameTips();
        },15000);
    },3000);
}

gameTips.push({
    type: "items",
    name: "pellet",
    tip: "Eat Pellets To Grow Your Tail!",
})
gameTips.push({
    type: "items",
    name: "turbo",
    tip: "Pick up Turbo And Activate To Speed Up Your Snake!",
})
gameTips.push({
    type: "items",
    name: "wall",
    tip: "Don't Hit Rocks! You'll Die!",
})
gameTips.push({
    type: "items",
    name: "bronzeShield",
    tip: "Pick Up Shield And Activate To Protect Yourself!",
})
gameTips.push({
    type: "items",
    name: "snakeHole",
    tip: "You can move between snake holes of similar type.",
})
gameTips.push({
    type: "items",
    name: "blueKey",
    tip: "Keys let you open locks of the same color.",
})
gameTips.push({
    type: "items",
    name: "blueLock",
    tip: "You'll need a key of the same color to open this lock.",
})
gameTips.push({
    type: "items",
    name: "stoneWall",
    tip: "Shields won't protect you against this wall.",
})
gameTips.push({
    type: "items",
    name: "crown",
    tip: "Grab the crown to win the game!",
})
gameTips.push({
    type: "items",
    name: "flag",
    tip: "You can set the flag to your team color!",
})
gameTips.push({
    type: "tiles",
    name: "sand",
    tip: "Sand tiles slow you down",
})
gameTips.push({
    type: "tiles",
    name: "water",
    tip: "Water tiles slow you down",
})
gameTips.push({
    type: "tiles",
    name: "pathway",
    tip: "Pathway tiles slow you down",
})
gameTips.push({
    type: "tiles",
    name: "Piano",
    tip: "You can play music with piano tiles!",
})
