let movingPoints = [];
let stars;
let techTree_ctx;
let viewWidth, 
    viewHeight,
    offsetX,
    offsetY,
    drag = false,
    startX,
    startY;
let laUnlocked;
const dragSpeed = 0.5;
const elementDragSpeed = 0.8;
const spaceSize = 25000; // Huge space
let activePass;

function loadTechTree(tree) {
    activePass = tree;
    for (let i = 0; i < localAccount.battlePasses.length; i++) {
        if (localAccount.battlePasses[i].name === activePass.name) {
            laUnlocked = localAccount.battlePasses[i].unlocked;
        }
    }
    let scene = $("scene_tree"); 
    scene.innerHTML = "";
    let canvas = scene.create("canvas.techTree_background");
    let vignette = scene.create("div.techTree_vignette");
    let infoCard = scene.create("div.techTree_infoCard")
    infoCard.create("div.infocard_name");
    infoCard.create("div.infocard_title");
    infoCard.create("div.infocard_description")
    movingPoints.push({
        div: infoCard,
        x: 0,
        y: 0,
    })
    let topLeftContent = scene.create("div.techTree_content");
    let goBackHomeButton = topLeftContent.create("div.techTree_returnButton");
    goBackHomeButton.innerHTML = "Return Home";
    goBackHomeButton.on("click",function() {
        setScene("newMenu")
    })
    let battlePointsImg = topLeftContent.create("img.techTree_battlePointsImg");
    battlePointsImg.src = "img/techTrees/battlePoints.png";
    let battlePointsCounter = topLeftContent.create("div.techTree_battlePointsCounter");
    battlePointsCounter.innerHTML = "x" + localAccount.battlePassPoints;
    generateStarBackground(canvas);

    drawTree(tree,"start");

    setScene("tree");
}
function drawTree(point,comeFromPoint,parentDiv, parentAngle = 0,parentUnlocked) {
    let rewardsDiv = getRewardsDiv(point);
    if (laUnlocked.includes(point.id) || comeFromPoint == "start") rewardsDiv.locked = false;
    else rewardsDiv.locked = true;
    rewardsDiv.lines = [];
    setTimeout(function() {
        rewardsDiv.style.opacity = 1;
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
            drawLine(parentDiv,rewardsDiv,laUnlocked.includes(point.id),point.cost,parentUnlocked,point.id);
        });
    
        rewardsDiv.activate = function() {
            laUnlocked.push(point.id);

            rewardsDiv.$(".techTree_reward").classRemove("techTree_locked");
            rewardsDiv.$(".techTree_reward").classAdd("techTree_unlocked");
            rewardsDiv.locked = false;
            for (let i = 0; i < rewardsDiv.lines.length; i++) {
                rewardsDiv.lines[i].$(".techTree_line_count").show();
                rewardsDiv.lines[i].$(".techTree_lineLocked").show("flex");
                rewardsDiv.lines[i].$(".techTree_lineLockedImg").classRemove("grayScale");
                rewardsDiv.lines[i].$(".techTree_lineLockedImg").classAdd("noInvert");
            }
        }
        
        
        // **Spread out the branches**
        let numBranches = point.branches.length;
        let radius = 225; // Distance from parent to child (adjustable)
    
        // Symmetry calculation for the angle spread
        let spreadAngle = comeFromPoint === "start" ? Math.PI : 170 * (Math.PI / 180); // 200 degrees in radians
        let randomOffset = Math.PI / 18; // ±10-degree variation (adjustable)

        if (numBranches > 1) {
            let angleStep = spreadAngle / (numBranches - 1);
            let startAngle = -spreadAngle / 2; 
    
            for (let i = 0; i < numBranches; i++) {
                let baseAngle = startAngle + i * angleStep + parentAngle;
                
                // Generate a deterministic "random" offset using the branch ID
                let offset = (hashValue(i) % 2000) / 2000 * 2 - 1; // Value between -1 and 1
                let randomAngle = baseAngle + offset * randomOffset; 
    
                // Adjust starting edge point
                let edgeX = Math.cos(randomAngle) * (divWidth / 2);
                let edgeY = Math.sin(randomAngle) * (divHeight / 2);
    
                let newX = ogX + edgeX + Math.cos(randomAngle) * radius;
                let newY = ogY + edgeY + Math.sin(randomAngle) * radius;
    
                drawTree(point.branches[i], { x: newX, y: newY }, rewardsDiv, randomAngle,laUnlocked.includes(point.id));
            }
        } else if (numBranches === 1) {
            let offset = (hashValue(0) % 2000) / 2000 * 2 - 1; 
            let randomAngle = parentAngle + offset * randomOffset; 
    
            let newX = ogX + Math.cos(randomAngle) * radius;
            let newY = ogY + Math.sin(randomAngle) * radius;
    
            drawTree(point.branches[0], { x: newX, y: newY }, rewardsDiv, randomAngle,laUnlocked.includes(point.id));
        }
    },150)
}
let techTree_strings = [];
for (let i = 0; i < 500; i++) {
    let string = "";
    for (let j = 0; j < ((i*i)%i+i); j++) {
        string += "a";
    }
    techTree_strings.push(string);
}
function hashValue(str) {
    str = techTree_strings[str];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % 10000; // Simple deterministic hash
    }
    return hash;
}
function drawLine(parentDiv, childDiv,unlocked,price,parentUnlocked) {
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

    // Calculate the edge offsets based on div sizes
    const parentEdgeX = Math.cos(angle) * (parentRect.width / 2);
    const parentEdgeY = Math.sin(angle) * (parentRect.height / 2);
    const childEdgeX = Math.cos(angle) * (childRect.width / 2);
    const childEdgeY = Math.sin(angle) * (childRect.height / 2);

    // Adjust start and end positions to connect at the edges
    const startX = parentCenterX + parentEdgeX;
    const startY = parentCenterY + parentEdgeY;
    const endX = childCenterX - childEdgeX;
    const endY = childCenterY - childEdgeY;

    // Recalculate the new distance between the adjusted points
    const adjustedDeltaX = endX - startX;
    const adjustedDeltaY = endY - startY;
    const adjustedDistance = Math.sqrt(adjustedDeltaX * adjustedDeltaX + adjustedDeltaY * adjustedDeltaY);

    // Create a new line div
    const lineDiv = $("scene_tree").create('div.techTree_line');
    if (!unlocked) {
        let lockedImgHolder = lineDiv.create("div.techTree_lineLocked") 
        let lockedImg = lockedImgHolder.create("img.techTree_lineLockedImg")
        if (!parentUnlocked) lockedImg.classAdd("grayScale");
        else lockedImg.classAdd("noInvert");
        lockedImg.src = "img/techTrees/battlePoints.png";
        let pointCounterDiv = lineDiv.create("div.techTree_line_count")
        pointCounterDiv.innerHTML = "x" + price;
        lockedImgHolder.on("click",function() {
            if (parentDiv.locked == true) return;
            if (localAccount.battlePassPoints < price) return;

            lineDiv.classAdd("techTree_line_unlocked");
            this.hide();
            pointCounterDiv.hide();

            removePoints(price);
            localAccount.battlePassPoints -= price;
            
            setTimeout(function() {
                childDiv.activate();
            },75)
        })

        if (!parentUnlocked) {
            lockedImgHolder.hide();
            pointCounterDiv.hide();
        }

    } else {
        lineDiv.classAdd("techTree_line_unlocked")
    }
    
    parentDiv.lines.push(lineDiv);

    // Style the line div
    lineDiv.style.width = `${adjustedDistance}px`; // Set the width of the line to the adjusted distance
    lineDiv.style.top = `${startY}px`; // Adjust the top position for the line
    lineDiv.style.left = `${startX}px`; // Adjust the left position for the line
    lineDiv.style.transformOrigin = '0 50%'; // Set the line's rotation origin to the left side of the line
    lineDiv.style.transform = `rotate(${angle}rad)`; // Rotate the line by the calculated angle

    movingPoints.push({
        div: lineDiv,
        x: startX,
        y: startY,
    });
}
function removePoints(count) {
    let ogPoints = Number($(".techTree_battlePointsCounter").innerHTML.subset(1,"end"));
    ogPoints--;
    $(".techTree_battlePointsCounter").innerHTML = "x" + ogPoints;
    count--;
    
    if (count > 0) {
        setTimeout(function() {
            removePoints(count);
        },100);
    } else {
        $(".techTree_battlePointsCounter").innerHTML = "x" + localAccount.battlePassPoints;
    }
}
function getRewardsDiv(point) {
    let rewards = point.rewards;
    let holder = $("scene_tree").create("div.textTree_rewards");
    holder.style.opacity = 0;
    for (let i = 0; i < rewards.length; i++) {
        let reward = rewards[i];
        let rewardDiv = holder.create("div.techTree_reward");
        rewardDiv.classAdd("hover");
        let insideDiv;

        if (["item","tile","coins"].includes(reward.type)) insideDiv = rewardDiv.create("img.techTree_insideReward");
        if (["text"].includes(reward.type)) insideDiv = rewardDiv.create("div.techTree_insideReward");

        if (laUnlocked.includes(point.id) || point.name) rewardDiv.classAdd("techTree_unlocked");
        else rewardDiv.classAdd("techTree_locked");

        if (reward.type == "text") {
            rewardDiv.classAdd("techTree_reward_text");
            insideDiv.innerHTML = reward.text;
        }
        if (reward.type == "item" || reward.type == "tile") {
            rewardDiv.classAdd("techTree_reward_img");
            let item = _getById(reward.id,reward.type);
            insideDiv.src = getImage(item,"src");
            insideDiv.on("click",function(){
                if (this.$P().classList.contains("techTree_reward_selected")) {
                    $(".techTree_reward").classRemove("techTree_reward_selected");
                    $(".techTree_infoCard").hide();
                    return;
                }
                $(".techTree_reward").classRemove("techTree_reward_selected");
                this.$P().classAdd("techTree_reward_selected");
                openInfoCard("item",item,this);
            })
        }
        if (reward.type == "coins") {
            rewardDiv.classAdd("techTree_reward_img");
            insideDiv.src = "img/techTrees/coins.png";
            let amountText = rewardDiv.create("div.techTree_reward_miniText");
            amountText.innerHTML = "+" + reward.count;
            insideDiv.on("click",function(){
                if (this.$P().classList.contains("techTree_reward_selected")) {
                    $(".techTree_reward").classRemove("techTree_reward_selected");
                    $(".techTree_infoCard").hide();
                    return;
                }
                $(".techTree_reward").classRemove("techTree_reward_selected");
                this.$P().classAdd("techTree_reward_selected");
                openInfoCard("coins",reward.count,this);
            })

        }
    }
    return holder;
}
function openInfoCard(type,thingToOpen,parent) {
    const margin = 10;
    let card = $(".techTree_infoCard");
    if (type == "item") {
        card.$(".infocard_name").innerHTML = thingToOpen.displayName;
        card.$(".infocard_name").style.color = _color("neongreen").ogColor;
        card.$(".infocard_title").show();
        card.$(".infocard_title").innerHTML = thingToOpen.type.toUpperCase();
        card.$(".infocard_description").innerHTML = thingToOpen.description;
    }
    if (type == "coins") {
        card.$(".infocard_name").innerHTML = "Coins";
        card.$(".infocard_name").style.color = "gold";
        card.$(".infocard_title").show();
        card.$(".infocard_title").innerHTML = "x" + thingToOpen;
        card.$(".infocard_description").innerHTML = "Use Coins To Buy Things In The Store!";
    }
    if (type == "purchace") {
        card.$(".infocard_name").innerHTML = "Battle Points";
        card.$(".infocard_name").style.color = "purple";
        card.$(".infocard_title").show();
        card.$(".infocard_title").innerHTML = "Cost";
        card.$(".infocard_description").innerHTML = thingToOpen;
    }

    let x,y;
    let parentRect = parent.getBoundingClientRect();

    y = parentRect.bottom + margin;
    x = parentRect.left - (275/2) + (parentRect.width/4);

    card.style.left = x + "px";
    card.style.top = y + "px";

    movingPoints[0].x = x;
    movingPoints[0].y = y;

    card.show("flex");
    
}
function generateStarBackground(canvas) {
    
    techTree_ctx = canvas.getContext("2d");

    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;
    canvas.width = viewWidth;
    canvas.height = viewHeight;

    offsetX = (spaceSize - viewWidth) / 2;
    offsetY = (spaceSize - viewHeight) / 2;

    const starCount = Math.floor((spaceSize*15000)/4000); // Number of stars
    stars = [];

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * spaceSize,
            y: Math.random() * spaceSize,
            size: Math.random() * 2,
            brightness: Math.random() * 255,
        });
    }

    drawStars();
}


function drawStars() {
    techTree_ctx.fillStyle = "black";
    techTree_ctx.fillRect(0, 0, viewWidth, viewHeight);

    techTree_ctx.fillStyle = "white";
    for (let star of stars) {
        const x = star.x - offsetX;
        const y = star.y - offsetY;
        if (x >= 0 && x < viewWidth && y >= 0 && y < viewHeight) {
        techTree_ctx.fillStyle = `rgb(${star.brightness}, ${star.brightness}, ${star.brightness})`;
        techTree_ctx.beginPath();
        techTree_ctx.arc(x, y, star.size, 0, Math.PI * 2);
        techTree_ctx.fill();
        }
    }
}
let mouseDownTime = 0; // Store time of the mousedown event
const maxClickDuration = 200; // Maximum duration (in ms) for a click to be considered fast

document.on('mouseout', function(e) {
    if (global_scene !== "tree") return;
    // Check if the mouse has moved off the screen
    if (e.clientY <= 0 || e.clientY >= window.innerHeight || e.clientX <= 0 || e.clientX >= window.innerWidth) {
      drag = false;
    }
  });
document.body.on("mousedown", (e) => {
    if (global_scene !== "tree") return;
    drag = true;
    startX = e.clientX;
    startY = e.clientY;
    mouseDownTime = Date.now(); // Store the time when mouse is pressed down
});
document.body.on("mouseup", (e) => {
    if (global_scene !== "tree") return;
    drag = false;

    const clickDuration = Date.now() - mouseDownTime; // Calculate the time between mousedown and mouseup
    if (clickDuration <= maxClickDuration) {
        if (!e.target.classList.contains("techTree_reward") && !e.target.classList.contains("techTree_insideReward")) {
            $(".techTree_reward").classRemove("techTree_reward_selected")
            $(".techTree_infoCard").hide();
        }
    }
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