import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let starterDeckBarbarian: AbilityCard[];

export default starterDeckBarbarian = [
    {
        Title: 'Starter Sword',
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
        Title: 'Starter Axe',
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
        Title: 'Starter Shield',
        Catagory: 'weapon',
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
        Title: 'Starter Dagger',
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
        Title: 'Starter Medkit',
        Catagory: 'item',
        Level: 1,
        Cost: 0,
        Effects: [
            {
                name: 'Health',
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
        Title: 'Starter Horse',
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
                    val: 2,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Steward',
        Catagory: 'friend',
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
        Title: 'Barbarian Rage',
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
        Title: 'Barbarian Focus',
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
        Title: 'Starter Bow and Arrow',
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
