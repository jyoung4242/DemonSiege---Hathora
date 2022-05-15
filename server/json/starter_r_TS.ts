import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckRogue: AbilityCard[];

export default starterDeckRogue = [
    {
        Title: 'Starter Hood',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'chooseHealth1Ability1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Armor',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addHealth1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Backstab',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack1Draw1',
            userPrompt: false,
        },

        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Boots',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAbility1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'starter crossbow',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'starter knife',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'starter pickpocket',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addHealth1Ability1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'starter sneak',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAbility1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'starter smoke',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAttack1Ability1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'starter tools',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'chooseAbility1Draw1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
];
