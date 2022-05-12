import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckWizard: AbilityCard[];

export default starterDeckWizard = [
    {
        Title: 'Starter Robes',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Choose',
                target: targetType.ActiveHero,
                cb: 'choose',
                value: {
                    prop: 'Health',
                    val: 1,
                },
                type: effectType.Active,
            },
            {
                name: 'Choose',
                target: targetType.ActiveHero,
                cb: 'choose',
                value: {
                    prop: 'Ability',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Wand',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Attack',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Spellbook',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Ability',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Ability',
                    val: 2,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Staff',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Choose',
                target: targetType.ActiveHero,
                cb: 'choose',
                value: {
                    prop: 'Attack',
                    val: 1,
                },
                type: effectType.Active,
            },
            {
                name: 'Choose',
                target: targetType.ActiveHero,
                cb: 'choose',
                value: {
                    prop: 'Ability',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Pet',
        Catagory: 'friend',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Ability',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Ability',
                    val: 1,
                },
                type: effectType.Active,
            },
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Attack',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Firespell',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Attack',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Minor Heal',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Health',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Health',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Wizard Meditation',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Ability',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Ability',
                    val: 1,
                },
                type: effectType.Active,
            },
            {
                name: 'Draw',
                target: targetType.ActiveHero,
                cb: 'drawCard',
                value: {
                    prop: 'Draw',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Wizard Focus',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Ability',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Ability',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Magic Arrow',
        Catagory: 'weapon',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Choose',
                target: targetType.ActiveHero,
                cb: 'choose',
                value: {
                    prop: 'Attack',
                    val: 1,
                },
                type: effectType.Active,
            },
            {
                name: 'Choose',
                target: targetType.ActiveHero,
                cb: 'choose',
                value: {
                    prop: 'Ability',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
];
