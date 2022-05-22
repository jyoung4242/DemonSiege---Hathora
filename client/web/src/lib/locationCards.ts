import { Cardstatus } from '../../../../api/types';
import cellar from '../assets/location cards/cellarlocation.png';
import dungeon from '../assets/location cards/dungeonlocation.png';
import crypt from '../assets/location cards/cryptlocation.png';
import { LOCcardData } from '../lib/card';

export function retrieveLocCardData(cardchosen: string): LOCcardData {
    const foundArray = LocationCardRawData.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const LocationCardRawData = [
    {
        name: 'Cellar',
        title: 'Cellar',
        description: 'Fake description info',
        level: 1,
        health: 10,
        orientation: Cardstatus.FaceDown,
        image: cellar,
        sequence: 1,
        TD: 1,
    },
    {
        name: 'Dungeon',
        title: 'Dungeon',
        description: '',
        level: 1,
        health: 5,
        orientation: Cardstatus.FaceDown,
        image: dungeon,
        sequence: 2,
        TD: 1,
    },
    {
        name: 'Crypt',
        title: 'Crypt',
        description: '',
        level: 1,
        health: 6,
        orientation: Cardstatus.FaceDown,
        image: crypt,
        sequence: 3,
        TD: 1,
    },
];
