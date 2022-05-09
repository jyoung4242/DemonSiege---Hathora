export let TD = {
    tripwire1: {
        level: 1,
        Effect: [
            {
                name: 'DracoEffect',
                target: 'ActiveHero',
                cb: 'passiveWhenLocationAdded',
                value: {
                    Health: -2,
                },
                type: 'PASSIVE',
            },
        ],
    },
    tripwire2: {
        level: 1,
        Effect: [
            {
                name: 'Health -2',
                target: 'ActiveHero',
                cb: 'changeProperty',
                value: {
                    Health: -2,
                },
                type: 'ACTIVE',
            },
        ],
    },
    goblin: {
        level: 1,
        Effect: [
            {
                name: 'GoblinEffect',
                target: 'Active Hero',
                cb: 'passiveWhenDiscarded',
                value: {
                    Health: -1,
                },
                type: 'PASSIVE',
            },
        ],
    },
};
