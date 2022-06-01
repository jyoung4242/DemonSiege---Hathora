import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckPaladin: AbilityCard[];

export default starterDeckPaladin = [
    {
        Title: 'Starter_Chant',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'chooseHealth11Ability1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter_Concentration',
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
        Title: 'Starter_Defense',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.AnyHero,
            cb: 'addAbility1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter_Hammer',
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
        Title: 'Starter_Helmet',
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
        Title: 'Starter_Mace',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'chooseAttack1Draw1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter_Prayer',
        Catagory: 'spell',
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
        Title: 'Starter_Redemption',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.AnyHero,
            cb: 'addHealth1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter_Paladin_Sheild',
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
        Title: 'Starter_Talisman',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.AnyHero,
            cb: 'draw2lose1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
];
