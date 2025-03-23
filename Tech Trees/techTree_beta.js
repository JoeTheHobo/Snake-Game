
let techTree_beta = {
    name: "beta",
    rewards: [{
        type: "text",
        text: "Beta",
    }],
    img: "beta",
    id: -1,
    branches: [
        {
            id: 0,
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
                id: 1,
                cost: 2,
                rewards: [
                    {
                        type: "item",
                        id: 14,
                    },
                    {
                        type: "item",
                        id: 9,
                    },
                    {
                        type: "item",
                        id: 30,
                    },
                    {
                        type: "coins",
                        count: 5,
                    },
                ],
                branches: [{
                    id: 2,
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
                    id: 3,
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
                    id: 4,
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
            id: 5,
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
            branches: [
                {
                    id: 6,
                    cost: 1,
                    rewards: [
                        {
                            type: "tile",
                            id: 7,
                        },
                        {
                            type: "boardSlot",
                            count: 1,
                        },
                    ],
                    branches: [
                        
                    ],
                },
                {
                    id: 7,
                    cost: 4,
                    rewards: [
                        {
                            type: "tileSkin",
                            id: 9,
                            skin: "disco",
                        },
                        {
                            type: "snakeColor",
                            color: {hue: 318, saturation: 300, brightness: 200},
                        },
                    ],
                    branches: [
                        
                    ],
                }
            ],
        }
    ]
}


module.exports = { techTree_beta };