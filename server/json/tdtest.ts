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
        Title: 'net1',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addLocation1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'net2',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addLocation1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'net3',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'addLocation1',
            userPrompt: false,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'pit1',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1Discard1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'pit2',
        Level: 1,
        ActiveEffect: {
            target: targetType.ActiveHero,
            cb: 'lowerHealth1Discard1',
            userPrompt: true,
        },
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'quicksand1',
        Level: 1,
        ActiveEffect: {
            target: targetType.AllHeroes,
            cb: 'lowerHealth1',
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
        Title: 'quicksand2',
        Level: 1,
        ActiveEffect: {
            target: targetType.AllHeroes,
            cb: 'lowerHealth1',
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
