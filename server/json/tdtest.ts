import { Cardstatus, TowerDefense, targetType, effectType } from '../../api/types';
let TDCardPool: TowerDefense[];

export default TDCardPool = [
    {
        Title: 'Tripwire1',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth2',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Tripwire2',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth2',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Tripwire3',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth2',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Net1',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1Discard1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Net2',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1Discard1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Net3',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1Discard1', //addLocation1
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Pit1',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1Discard1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Pit2',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1Discard1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Quicksand1',
        Level: 1,
        ActiveEffect: {
            target: targetType.AllHeroes,
            cb: 'lowerHealth1Discard1', //lowerHealth1
            userPrompt: false,
        },
        PassiveEffect: {
            target: targetType.ActiveHero,
            cb: 'NoDraw',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Quicksand2',
        Level: 1,
        ActiveEffect: {
            target: targetType.AllHeroes,
            cb: 'lowerHealth1Discard1', //lowerHealth1
            userPrompt: false,
        },
        PassiveEffect: {
            target: targetType.ActiveHero,
            cb: 'NoDraw',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
];
