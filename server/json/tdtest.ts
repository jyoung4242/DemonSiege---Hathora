import { Cardstatus, TowerDefense, targetType, effectType } from '../../api/types';
let TDCardPool: TowerDefense[];

export default TDCardPool = [
    {
        Title: 'Tripwire1',
        Level: 1,
        Effects: [
            {
                name: 'DracoEffect',
                target: targetType.ActiveHero,
                cb: 'passiveWhenLocationAdded',
                value: {
                    prop: 'Health',
                    val: -2,
                },
                type: effectType.Passive,
            },
            {
                name: 'someothereffect',
                target: targetType.ActiveHero,
                cb: 'passiveWhenLocationAdded',
                value: {
                    prop: 'Health',
                    val: -1,
                },
                type: effectType.Passive,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Tripwire2',
        Level: 1,
        Effects: [
            {
                name: 'Health -2',
                target: targetType.ActiveHero,
                cb: 'changeProperty',
                value: {
                    prop: 'Health',
                    val: -2,
                },
                type: effectType.Active,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Goblin',
        Level: 1,
        Effects: [
            {
                name: 'GoblinEffect',
                target: targetType.ActiveHero,
                cb: 'passiveWhenDiscarded',
                value: {
                    prop: 'Health',
                    val: -1,
                },
                type: effectType.Passive,
            },
        ],
        CardStatus: Cardstatus.FaceDown,
    },
];
