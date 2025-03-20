let gameTips = [];

function showGameTips() {
    let holder = $(".gameTipHolder");
    holder.classRemove("show");
    holder.classAdd("hide");

    let tip = gameTips.rnd();
    let obj,imgSrc;
    if (tip.type == "items") {
        obj = getRealItem(tip.name);
    }
    if (tip.type == "tiles") {
        obj = getTile(tip.name);
    }
    imgSrc = getImage(obj,"src");

    $(".gameTip_img").src = imgSrc;
    $(".gameTip_name").innerHTML = tip.name;
    $(".gameTip_tip").innerHTML = tip.tip;
    
    setTimeout(function() {
        holder.classRemove("hide");
        holder.classAdd("show");

        setTimeout(function() {
            holder.classRemove("show");
            holder.classAdd("hide");
            if (!showingGameTips) return;
            setTimeout(showGameTips,1000)
        },15000);
    },3000);
}

function generateGameTips() {
    for (let i = 0; i < items.length; i++) {
        if (items[i].showInEditor === false) continue;
        gameTips.push({
            type: "items",
            name: items[i].displayName,
            tip: items[i].description,
        })
    }
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].showInEditor === false) continue;
        gameTips.push({
            type: "tiles",
            name: tiles[i].displayName,
            tip: tiles[i].description,
        })
    }
}
