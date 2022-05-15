import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckWizard: AbilityCard[];

export default starterDeckWizard = [
    {
        Title: 'Starter Robes',
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
        Title: 'Starter Wand',
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
        Title: 'Starter Spellbook',
        Catagory: 'item',
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
        Title: 'Starter Staff',
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
        Title: 'Starter Pet',
        Catagory: 'friend',
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
        Title: 'Starter Firespell',
        Catagory: 'spell',
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
        Title: 'Starter Minor Heal',
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
        Title: 'Wizard Meditation',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addAbility1Draw1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Wizard Focus',
        Catagory: 'weapon',
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
        Title: 'Magic Arrow',
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
