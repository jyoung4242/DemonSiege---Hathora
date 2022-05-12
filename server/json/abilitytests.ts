import { Cardstatus, AbilityCard, targetType, effectType } from '../../api/types';
let AbilityCardPool: AbilityCard[];

export default AbilityCardPool = [
    {
        Title: 'Spear',
        Catagory: 'weapon',
        Level: 2,
        Cost: 3,
        Effects: [
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Attack',
                    val: 2,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Crossbow',
        Catagory: 'weapon',
        Level: 5,
        Cost: 6,
        Effects: [
            {
                name: 'Attack',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Attack',
                    val: 2,
                },
                type: effectType.Active,
            },
            {
                name: 'DrawCard',
                target: targetType.ActiveHero,
                cb: 'passiveWhenMonsterDefeated',
                value: {
                    prop: 'Draw',
                    val: 1,
                },
                type: effectType.Passive,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Dagger',
        Catagory: 'weapon',
        Level: 1,
        Cost: 3,
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
        Title: 'Sling',
        Catagory: 'weapon',
        Level: 1,
        Cost: 3,
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
        Title: 'Broadsword',
        Catagory: 'weapon',
        Level: 1,
        Cost: 3,
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
        Title: 'Mana Potion',
        Catagory: 'item',
        Level: 1,
        Cost: 4,
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
        Title: 'Bracelet',
        Catagory: 'item',
        Level: 1,
        Cost: 3,
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
        Title: 'Acid Hail',
        Catagory: 'spell',
        Level: 1,
        Cost: 2,
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
];
