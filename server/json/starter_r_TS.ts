import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckRogue: AbilityCard[];

export default starterDeckRogue = [
    {
        Title: 'Starter Hood',
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
        Title: 'Starter Armor',
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
        Title: 'Backstab',
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
            {
                name: 'Draw',
                target: targetType.ActiveHero,
                cb: 'Draw',
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
        Title: 'Starter Boots',
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
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'starter crossbow',
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
        Title: 'starter knife',
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
        Title: 'starter pickpocket',
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
        Title: 'starter sneak',
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
        Title: 'starter smoke',
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
        Title: 'starter tools',
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
                    prop: 'draw',
                    val: 1,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
];
