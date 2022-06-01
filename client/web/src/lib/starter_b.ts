import { Cardstatus } from '../../../../api/types';
import sword from '../assets/starter cards/barbarian/barbariansword.png';
import axe from '../assets/starter cards/barbarian/barbarianaxe.png';
import shield from '../assets/starter cards/barbarian/barbarianshield.png';
import dagger from '../assets/starter cards/barbarian/barbariandagger.png';
import medkit from '../assets/starter cards/barbarian/barbarianmedkit.png';
import horse from '../assets/starter cards/barbarian/barbariansteed.png';
import steward from '../assets/starter cards/barbarian/barbariansteward.png';
import rage from '../assets/ability cards/attackspell.png';
import focus from '../assets/ability cards/supportspell.png';
import bow from '../assets/starter cards/barbarian/barbarianbow.png';
import { ABcardData } from '../lib/card';

export function retrieveStarterBarbarianCardData(cardchosen: string): ABcardData {
    const foundArray = starterBararianbCardData.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const starterBararianbCardData = [
    {
        name: 'Starter_Sword',
        title: 'Sword',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: sword,
    },
    {
        name: 'Starter_Axe',
        title: 'Axe',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: axe,
    },
    {
        name: 'Starter_Shield',
        title: 'Shield',
        description: 'Health +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: shield,
    },
    {
        name: 'Starter_Dagger',
        title: 'Dagger',
        description: 'Choose: Attack +1 -or- Ability +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: dagger,
    },
    {
        name: 'Starter_Medkit',
        title: 'Medkit',
        description: 'Choose: Health +1 -or- Ability +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: medkit,
    },
    {
        name: 'Starter_Horse',
        title: 'Steed',
        description: 'Ability +2',
        catagory: 'FRIEND',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: horse,
    },
    {
        name: 'Starter_Steward',
        title: 'Steward',
        description: 'Choose: Health +1 -or- Ability +1',
        catagory: 'FRIEND',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: steward,
    },
    {
        name: 'Starter_Rage',
        title: 'Barbarian Rage',
        description: 'Attack +1, draw one card',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: rage,
    },
    {
        name: 'Starter_Focus',
        title: 'Barbarian Focus',
        description: 'Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: focus,
    },
    {
        name: 'Starter_Bow_and_Arrow',
        title: 'Bow and Arrows',
        description: 'Choose: Attack +1 -or- Ability +1',
        catagory: 'WEAPOM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: bow,
    },
];
