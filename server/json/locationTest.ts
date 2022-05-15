import { Cardstatus, LocationCard, targetType, effectType } from '../../api/types';
let LocationCardPool: LocationCard[];

export default LocationCardPool = [
    {
        Title: 'Cellar',
        Sequence: 1,
        Health: 5,
        Level: 1,
        TD: 1,
        CardStatus: Cardstatus.FaceDown,
        ActiveDamage: 0,
    },
    {
        Title: 'Dungeon',
        Sequence: 2,
        Health: 5,
        Level: 1,
        TD: 1,
        CardStatus: Cardstatus.FaceDown,
        ActiveDamage: 0,
    },
    {
        Title: 'Crypt',
        Sequence: 3,
        Health: 6,
        Level: 1,
        TD: 1,
        CardStatus: Cardstatus.FaceDown,
        ActiveDamage: 0,
    },
];
