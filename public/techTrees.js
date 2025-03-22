function loadTechTree(tree) {
    $("scene_tree").innerHTML = "";
    let canvas = $("scene_tree").create("canvas.techTree_background");
    let vignette = $("scene_tree").create("div.techTree_vignette");
    generateStarBackground(canvas);

    drawTree(tree);

    setScene("tree");
}
function drawTree(point) {
    let rewardsDiv = getRewardsDiv(point);

}
function getRewardsDiv(point) {
    let rewards = point.rewards;
    let holder = $("scene_tree").create("div");
    for (let i = 0; i < rewards.length; i++) {
        let reward = rewards[i];
        let rewardDiv;
        if (["item","tile"].includes(reward.type)) rewardDiv = holder.create("img.techTree_reward");
        if (["text"].includes(reward.type)) rewardDiv = holder.create("div.techTree_reward");

        if (point.unlocked) rewardDiv.classAdd("techTree_unlocked");
        else rewardDiv.classAdd("techTree_locked");

        if (reward.type == "text") {
            rewardDiv.classAdd("techTree_reward_text");
            rewardDiv.innerHTML = reward.text;
        }
        if (reward.type == "item" || reward.type == "tile") {
            rewardDiv.classAdd("techTree_reward_img");
            let item = getById(reward.id,reward.type);
            rewardDiv.src = getImage(item,"src");
        }
        if (reward.type == "coins") {
            rewardDiv.classAdd("techTree_reward_img");
            rewardDiv.src = "img/techTrees/coins.png";
            let amountText = rewardDiv.create("div.techTree_reward_miniText");
            amountText.innerHTML = "x" + reward.count;
        }
    }
    return holder;
}
function generateStarBackground(canvas) {
    let ctx = canvas.getContext("2d");
    
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    canvas.width = viewWidth;
    canvas.height = viewHeight;

    const spaceSize = 25000; // Huge space
    const starCount = Math.floor((spaceSize*15000)/4000); // Number of stars
    const dragSpeed = 0.5;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * spaceSize,
            y: Math.random() * spaceSize,
            size: Math.random() * 2,
            brightness: Math.random() * 255,
        });
    }

    let offsetX = (spaceSize - viewWidth) / 2;
    let offsetY = (spaceSize - viewHeight) / 2;
    let drag = false, startX, startY;

    function drawStars() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, viewWidth, viewHeight);

        ctx.fillStyle = "white";
        for (let star of stars) {
            const x = star.x - offsetX;
            const y = star.y - offsetY;
            if (x >= 0 && x < viewWidth && y >= 0 && y < viewHeight) {
            ctx.fillStyle = `rgb(${star.brightness}, ${star.brightness}, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
            }
        }
    }
    document.body.on("mousedown", (e) => {
        if (global_scene !== "tree") return;
        drag = true;
        startX = e.clientX;
        startY = e.clientY;
    });
    document.body.on("mouseup", (e) => {
        if (global_scene !== "tree") return;
        drag = false;

    });
    document.body.on("mousemove", (e) => {
        if (global_scene !== "tree") return;
        if (drag) {
            offsetX -= (e.clientX - startX)*dragSpeed;
            offsetY -= (e.clientY - startY)*dragSpeed;
            startX = e.clientX;
            startY = e.clientY;
            drawStars();
        }
    });
    drawStars();
}


let techTree_beta = {
    rewards: [{
        type: "text",
        text: "Beta",
    }],
    unlocked: false,
    branches: [
        {
            unlocked: false,
            cost: 2,
            rewards: [
                {
                    type: "item",
                    id: 0,
                },
                {
                    type: "coins",
                    count: 5,
                },
                {
                    type: "",
                    count: 5,
                },
            ],
            branches: [],
        }
    ]
}

loadTechTree(techTree_beta);