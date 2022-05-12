import { Cardstatus, LocationCard, targetType, effectType } from '../../api/types';
let LocationCardPool: LocationCard[];

export default LocationCardPool = [
    {
        Title: 'Cellar',
        Sequence: 1,
        Health: 5,
        Level: 1,
        TD: 1,
        Effects: [],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Dungeon',
        Sequence: 2,
        Health: 5,
        Level: 1,
        TD: 1,
        Effects: [],
        CardStatus: Cardstatus.FaceDown,
    },
    {
        Title: 'Crypt',
        Sequence: 3,
        Health: 6,
        Level: 1,
        TD: 1,
        Effects: [],
        CardStatus: Cardstatus.FaceDown,
    },
];
