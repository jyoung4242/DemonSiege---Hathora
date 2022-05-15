import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckPaladin: AbilityCard[];

export default starterDeckPaladin = [
    {
        Title: 'Starter Chant',
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
        Title: 'Starter Concentration',
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
        Title: 'Starter Defense',
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
        Title: 'Starter Hammer',
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
        Title: 'Starter Helmet',
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
        Title: 'Starter Mace',
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
        Title: 'Starter Prayer',
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
        Title: 'Starter Redemption',
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
        Title: 'Starter Sheild',
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
        Title: 'Starter Redemption',
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
