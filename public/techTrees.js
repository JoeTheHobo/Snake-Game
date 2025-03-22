let movingPoints = [];
function loadTechTree(tree) {
    $("scene_tree").innerHTML = "";
    let canvas = $("scene_tree").create("canvas.techTree_background");
    let vignette = $("scene_tree").create("div.techTree_vignette");
    generateStarBackground(canvas);

    drawTree(tree,"start");

    setScene("tree");
}
function drawTree(point,comeFromPoint,parentDiv) {
    let rewardsDiv = getRewardsDiv(point);

    let x,y;

    if (comeFromPoint === "start") {
        x = 0;
        y = 0;
    } else {
        x = comeFromPoint.x;
        y = comeFromPoint.y;
    }
    const ogX = x;
    const ogY = y;


    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    x += windowWidth/2;
    y += windowHeight/2;
    let divWidth = rewardsDiv.getBoundingClientRect().width;
    let divHeight = rewardsDiv.getBoundingClientRect().height; 
    x -= divWidth/2;
    y -= divHeight/2;

    rewardsDiv.css({
        left: x + "px",
        top: y + "px",
    })

    movingPoints.push({
        div: rewardsDiv,
        x: x,
        y: y,
    })

    if (comeFromPoint !== "start") requestAnimationFrame(function() {
        drawLine(rewardsDiv,parentDiv);
    });

    // **Spread out the branches**
    let numBranches = point.branches.length;
    let radius = 225; // Distance from parent to child (adjustable)
    
    for (let i = 0; i < numBranches; i++) {
        let spreadAngle = Math.PI / 2; // Default: start downward (90 degrees)
    
        if (numBranches > 1) {
            spreadAngle = Math.PI / 3; // Spread within a 120-degree arc
            let angle = ((i / (numBranches - 1)) - 0.5) * spreadAngle;
            newX = ogX + Math.cos(angle) * radius;
            newY = ogY + Math.sin(angle) * radius;
        } else {
            newX = ogX;
            newY = ogY - radius; // Single child directly below
        }
    
        drawTree(point.branches[i], { x: newX, y: newY },rewardsDiv);
    }
}
function drawLine(div1,div2) {
    const line = $("scene_tree").create("div.techTree_line");

    // Get the positions of the divs
    const div1Rect = div1.getBoundingClientRect();
    const div2Rect = div2.getBoundingClientRect();

    // Calculate the start and end points of the line
    const startX = (div1Rect.left + div1Rect.width) / 2;
    const startY = (div1Rect.top + div1Rect.height) / 2;
    const endX = (div2Rect.left + div2Rect.width) / 2;
    const endY = (div2Rect.top + div2Rect.height) / 2;


    // Calculate the distance and angle for the line
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

    // Set the position and rotation of the line
    line.style.width = distance + 'px';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = startX - (distance / 2) + 'px';
    line.style.top = startY - 1 + 'px';  // Adjust the y position to center the line
}
function getRewardsDiv(point) {
    let rewards = point.rewards;
    let holder = $("scene_tree").create("div.textTree_rewards");
    for (let i = 0; i < rewards.length; i++) {
        let reward = rewards[i];
        let rewardDiv;
        if (["item","tile","coins"].includes(reward.type)) rewardDiv = holder.create("img.techTree_reward");
        if (["text"].includes(reward.type)) rewardDiv = holder.create("div.techTree_reward");

        if (point.unlocked) rewardDiv.classAdd("techTree_unlocked");
        else rewardDiv.classAdd("techTree_locked");

        if (reward.type == "text") {
            rewardDiv.classAdd("techTree_reward_text");
            rewardDiv.innerHTML = reward.text;
        }
        if (reward.type == "item" || reward.type == "tile") {
            rewardDiv.classAdd("techTree_reward_img");
            let item = _getById(reward.id,reward.type);
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
    const elementDragSpeed = 0.8;
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

            for (let i = 0; i < movingPoints.length; i++) {
                movingPoints[i].x += (e.clientX - startX)*elementDragSpeed;
                movingPoints[i].y += (e.clientY - startY)*elementDragSpeed;
                movingPoints[i].div.css({
                    top: movingPoints[i].y + "px",
                    left: movingPoints[i].x + "px",
                })
            }

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
                    id: 20,
                },
                {
                    type: "coins",
                    count: 5,
                },
            ],
            branches: [],
        }
    ]
}

