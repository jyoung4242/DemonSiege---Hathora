import { Cardstatus, MonsterCard, targetType, effectType } from '../../api/types';
let MonsterCardPool: MonsterCard[];

export default MonsterCardPool = [
    {
        Title: 'Goblin',
        Health: 5,
        Damage: 0,
        Level: 1,
        CardStatus: 0,
        Effects: [
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'passiveWhenDiscarded',
                value: {
                    prop: 'Health',
                    val: -1,
                },
                type: effectType.Passive,
            },
        ],
        Rewards: [
            {
                name: 'AllDraw',
                target: targetType.AllHeroes,
                cb: 'changeProperty',
                value: {
                    prop: 'Draw',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
    },
    {
        Title: 'Kobalt',
        Health: 6,
        Damage: 0,
        Level: 1,
        CardStatus: 0,
        Effects: [
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Health',
                    val: -1,
                },
                type: effectType.Active,
            },
        ],
        Rewards: [
            {
                name: 'Health',
                target: targetType.AllHeroes,
                cb: 'changeProperty',
                value: {
                    prop: 'Health',
                    val: 1,
                },
                type: effectType.Active,
            },
            {
                name: 'Ability',
                target: targetType.AllHeroes,
                cb: 'changeProperty',
                value: {
                    prop: 'Ability',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
    },
    {
        Title: 'Skeleton',
        Health: 6,
        Damage: 0,
        Level: 1,
        CardStatus: 0,
        Effects: [
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'passiveWhenLocationAdded',
                value: {
                    prop: 'Health',
                    val: -2,
                },
                type: effectType.Passive,
            },
        ],
        Rewards: [
            {
                name: 'Location',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Location',
                    val: -1,
                },
                type: effectType.Active,
            },
        ],
    },
];
