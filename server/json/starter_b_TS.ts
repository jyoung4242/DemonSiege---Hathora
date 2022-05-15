import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckBarbarian: AbilityCard[];

export default starterDeckBarbarian = [
    {
        Title: 'Starter Sword',
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
        Title: 'Starter Axe',
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
        Title: 'Starter Shield',
        Catagory: 'weapon',
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
        Title: 'Starter Dagger',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'chooseAttack1Ability1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Medkit',
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
        Title: 'Starter Horse',
        Catagory: 'friend',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAbility2',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Steward',
        Catagory: 'friend',
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
        Title: 'Barbarian Rage',
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
        Title: 'Barbarian Focus',
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
        Title: 'Starter Bow and Arrow',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'chooseAttack1Ability1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
];
