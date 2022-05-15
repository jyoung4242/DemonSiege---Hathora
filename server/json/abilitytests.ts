import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let AbilityCardPool: AbilityCard[];

export default AbilityCardPool = [
    {
        Title: 'Spear',
        Catagory: 'weapon',
        Level: 2,
        Cost: 3,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack2',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Crossbow',
        Catagory: 'weapon',
        Level: 5,
        Cost: 6,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack2',
            userPrompt: false,
        },
        PassiveEffect: {
            target: targetType.ActiveHero,
            cb: 'passiveWhenMonsterDefeatedDraw1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Dagger',
        Catagory: 'weapon',
        Level: 1,
        Cost: 3,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack1',
            userPrompt: false,
        },

        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Sling',
        Catagory: 'weapon',
        Level: 1,
        Cost: 3,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack1Ability1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Broadsword',
        Catagory: 'weapon',
        Level: 1,
        Cost: 3,
        ActiveEffect: {
            cb: 'addAttack1',
            target: targetType.ActiveHero,
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Mana Potion',
        Catagory: 'item',
        Level: 1,
        Cost: 4,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addHealth1Ability1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Bracelet',
        Catagory: 'item',
        Level: 1,
        Cost: 3,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAbility1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Acid Hail',
        Catagory: 'spell',
        Level: 1,
        Cost: 2,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
];
