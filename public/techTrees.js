function loadTechTree(tree) {
    $("scene_tree").innerHTML = "";
    $("scene_tree").create("img.techTree_background");


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

let techTree_beta = {
    rewards: [{
        type: "text",
        text: "Beta",
    }],
    background: "img/techTrees/backgroundStarts.jpeg",
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