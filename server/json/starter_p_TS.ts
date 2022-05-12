import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckPaladin: AbilityCard[];

export default starterDeckPaladin = [
    {
        Title: 'Starter Chant',
        Catagory: 'spell',
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
        Title: 'Starter Concentration',
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
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Defense',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Ability',
                target: targetType.AnyHero,
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
        Title: 'Starter Hammer',
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
        Title: 'Starter Helmet',
        Catagory: 'item',
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
        Title: 'Starter Mace',
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
                    prop: 'Draw',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Prayer',
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
        Title: 'Starter Redemption',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Health',
                target: targetType.AnyHero,
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
        Title: 'Starter Sheild',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        Effects: [
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
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Starter Redemption',
        Catagory: 'spell',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Draw2',
                target: targetType.AnyHero,
                cb: 'Draw',
                value: {
                    prop: 'Draw',
                    val: 2,
                },
                type: effectType.Active,
            },
            {
                name: 'Discard',
                target: targetType.AnyHero,
                cb: 'Discard',
                value: {
                    prop: 'Discard',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
];
