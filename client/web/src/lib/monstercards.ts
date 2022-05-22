import { Cardstatus } from '../../../../api/types';
import goblin from '../assets/monster cards/goblincard.png';
import kobalt from '../assets/monster cards/kobaltcard.png';
import skeleton from '../assets/monster cards/skeletoncard.png';
import { MonsterCardData } from '../lib/card';

export function retrieveMCCardData(cardchosen: string): MonsterCardData {
    const foundArray = MonsterCardRawData.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const MonsterCardRawData = [
    {
        name: 'Goblin',
        title: 'Goblin',
        description: 'When player discards, Health -1',
        level: 1,
        health: 5,
        orientation: Cardstatus.FaceDown,
        image: goblin,
        reward: 'All players draw one card',
    },
    {
        name: 'Kobalt',
        title: 'Kobalt',
        description: 'Active Hero -1 Health',
        level: 1,
        health: 6,
        orientation: Cardstatus.FaceDown,
        image: kobalt,
        reward: 'All players +1 Ability, +1 Health',
    },
    {
        name: 'Skeleton',
        title: 'Skeleton',
        description: '-2 health, when location added',
        level: 1,
        health: 6,
        orientation: Cardstatus.FaceDown,
        image: skeleton,
        reward: 'Remove 1 influence point from location',
    },
];
