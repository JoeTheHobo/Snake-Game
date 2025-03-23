
let techTree_beta = {
    name: "beta",
    rewards: [{
        type: "text",
        text: "Beta",
    }],
    img: "beta",
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
            branches: [],
        }
    ]
}


module.exports = { techTree_beta };