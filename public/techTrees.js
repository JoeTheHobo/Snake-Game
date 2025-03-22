let movingPoints = [];
function loadTechTree(tree) {
    $("scene_tree").innerHTML = "";
    let canvas = $("scene_tree").create("canvas.techTree_background");
    let vignette = $("scene_tree").create("div.techTree_vignette");
    let infoCard = $("scene_tree").create("div.techTree_infoCard")
    generateStarBackground(canvas);

    drawTree(tree,"start");

    setScene("tree");
}
function drawTree(point,comeFromPoint,parentDiv, parentAngle = 0) {
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
        drawLine(parentDiv,rewardsDiv);
    });

    
    
    // **Spread out the branches**
    let numBranches = point.branches.length;
    let radius = 225; // Distance from parent to child (adjustable)

    // Symmetry calculation for the angle spread
    let spreadAngle = comeFromPoint === "start" ? Math.PI : 200 * (Math.PI / 180); // 200 degrees in radians

    if (numBranches > 1) {
        // Calculate the positions symmetrically
        let angleStep = spreadAngle / (numBranches - 1);
        let startAngle = -spreadAngle / 2; // Start from the leftmost branch

        for (let i = 0; i < numBranches; i++) {
            // Adjust the angle based on the parent angle and branch index
            let angle = startAngle + i * angleStep + parentAngle;
            let newX = ogX + Math.cos(angle) * radius;
            let newY = ogY + Math.sin(angle) * radius;

            // Recursive call for the next branch, passing the current angle
            drawTree(point.branches[i], { x: newX, y: newY }, rewardsDiv, angle);
        }
    } else if (numBranches == 1) {
        // Single child directly below the parent (no spread)
        let newX = ogX;
        let newY = ogY - radius; // Single child directly below
        drawTree(point.branches[0], { x: newX, y: newY }, rewardsDiv, parentAngle);
    }
}
function drawLine(parentDiv, childDiv) {
    // Get the position and size of the parent and child divs
    const parentRect = parentDiv.getBoundingClientRect();
    const childRect = childDiv.getBoundingClientRect();
  
    // Calculate the center points of the parent and child divs
    const parentCenterX = parentRect.left + parentRect.width / 2;
    const parentCenterY = parentRect.top + parentRect.height / 2;
    const childCenterX = childRect.left + childRect.width / 2;
    const childCenterY = childRect.top + childRect.height / 2;
  
    // Calculate the distance between the centers
    const deltaX = childCenterX - parentCenterX;
    const deltaY = childCenterY - parentCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
    // Calculate the angle in radians
    const angle = Math.atan2(deltaY, deltaX);
  
    // Create a new line div
    const lineDiv = $("scene_tree").create('div.techTree_line');
  
    // Style the line div
    lineDiv.style.width = `${distance}px`; // Set the width of the line to the calculated distance
    lineDiv.style.top = `${parentCenterY - 1}px`; // Adjust the top position for the line
    lineDiv.style.left = `${parentCenterX - 1}px`; // Adjust the left position for the line
    lineDiv.style.transformOrigin = '0 50%'; // Set the line's rotation origin to the left side of the line
    lineDiv.style.transform = `rotate(${angle}rad)`; // Rotate the line by the calculated angle

    movingPoints.push({
        div: lineDiv,
        x: parentCenterX - 1,
        y: parentCenterY - 1,
    })
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
            rewardDiv.on("click",function(){
                $(".techTree_reward").classRemove("techTree_reward_selected");
                this.classAdd("techTree_reward_selected");
                openInfoCard("item",item,this);
            })
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
function openInfoCard(type,thingToOpen,parent) {
    const margin = 10;
    let card = $(".techTree_infoCard");
    card.innerHTML = "";
    card.css({
        left: "",
        top: "",
        bottom: "",
        right: "",
    })
    if (type == "item") {
        card.innerHTML = thingToOpen.description;
    }

    console.log(parent)

    let cardRect = card.getBoundingClientRect();
    let parentRect = parent.getBoundingClientRect();

    if (parentRect.top > window.innerHeight/2) {
        card.style.bottom = parentRect.top - margin;
    }
    if (parentRect.bottom < window.innerHeight/2) {
        card.style.top = parentRect.bottom + margin;
    }
    if (parentRect.left > window.innerWidth/2) {
        card.style.right = parentRect.left - margin;
    }
    if (parentRect.right > window.innerWidth/2) {
        card.style.left = parentRect.right + margin;
    }


    card.show("flex");
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
        if (!e.target.classList.contains("textTree_rewards")) $(".techTree_infoCard").hide();
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
    unlocked: true,
    branches: [
        {
            unlocked: true,
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
            branches: [{
                unlocked: true,
                cost: 2,
                rewards: [
                    {
                        type: "item",
                        id: 14,
                    },
                    {
                        type: "coins",
                        count: 5,
                    },
                ],
                branches: [{
                    unlocked: false,
                    cost: 2,
                    rewards: [
                        {
                            type: "item",
                            id: 21,
                        },
                        {
                            type: "coins",
                            count: 5,
                        },
                    ],
                    branches: [],
                },{
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
                },{
                    unlocked: false,
                    cost: 2,
                    rewards: [
                        {
                            type: "item",
                            id: 2,
                        },
                        {
                            type: "coins",
                            count: 5,
                        },
                    ],
                    branches: [],
                }],
            }],
        },
        {
            unlocked: false,
            cost: 2,
            rewards: [
                {
                    type: "item",
                    id: 7,
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

