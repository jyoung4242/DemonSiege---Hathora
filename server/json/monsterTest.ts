import { MonsterCard, targetType } from '../../api/types';
let MonsterCardPool: MonsterCard[];

export default MonsterCardPool = [
    {
        Title: 'Goblin',
        Health: 5,
        Damage: 0,
        Level: 1,
        CardStatus: 0,
        PassiveEffect: {
            target: targetType.AllHeroes,
            cb: 'whenDiscardLoseHealth1',
            userPrompt: false,
        },

        Rewards: {
            target: targetType.AllHeroes,
            cb: 'draw1',
            userPrompt: false,
        },
        StatusEffects: [],
    },
    {
        Title: 'Kobalt',
        Health: 6,
        Damage: 0,
        Level: 1,
        CardStatus: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1',
            userPrompt: false,
        },
        Rewards: {
            target: targetType.AllHeroes,
            cb: 'addHealth1Ability1',
            userPrompt: false,
        },
        StatusEffects: [],
    },
    {
        Title: 'Skeleton',
        Health: 6,
        Damage: 0,
        Level: 1,
        CardStatus: 0,
        PassiveEffect: {
            target: targetType.ActiveHero,
            cb: 'whenLocationAddedLoseHealth2',
            userPrompt: false,
        },
        Rewards: {
            target: targetType.ActiveHero,
            cb: 'removeLocation1',
            userPrompt: false,
        },
        StatusEffects: [],
    },
];
