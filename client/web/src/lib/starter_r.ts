import { Cardstatus } from '../../../../api/types';
import hood from '../assets/starter cards/rogue/roguecowl.png';
import armor from '../assets/starter cards/rogue/roguearmor.png';
import backstab from '../assets/starter cards/rogue/roguebackstab.png';
import boots from '../assets/starter cards/rogue/rogueboots.png';
import crossbow from '../assets/starter cards/rogue/roguecrossbow.png';
import knife from '../assets/starter cards/rogue/rogueknife.png';
import pickpocket from '../assets/starter cards/rogue/roguepickpocket.png';
import sneak from '../assets/starter cards/rogue/roguesneak.png';
import smoke from '../assets/starter cards/rogue/roguesmoke.png';
import tools from '../assets/starter cards/rogue/roguetools.png';

import { ABcardData } from '../lib/card';

export function retrieveStarterRogueCardData(cardchosen: string): ABcardData {
    const foundArray = starterRogueCardData.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const starterRogueCardData = [
    {
        name: 'Starter_Hood',
        title: 'Cowl',
        description: 'Choose: Health +1 -or- Ability +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: hood,
    },
    {
        name: 'Starter_Armor',
        title: 'Light Armor',
        description: 'Health +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: armor,
    },
    {
        name: 'Starter_Backstab',
        title: 'Rogue Backstab',
        description: 'Attack +1, draw one card',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: backstab,
    },
    {
        name: 'Starter_Boots',
        title: 'Boots',
        description: 'Ability +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: boots,
    },
    {
        name: 'Starter_Crossbow',
        title: 'Hand Crossbow',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: crossbow,
    },
    {
        name: 'Starter_Knife',
        title: 'Knife',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: knife,
    },
    {
        name: 'Starter_Pickpocket',
        title: 'Pickpocket',
        description: 'Health +1, Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: pickpocket,
    },
    {
        name: 'Starter_Sneak',
        title: 'Rogue Sneak',
        description: 'Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: sneak,
    },
    {
        name: 'Starter_Smoke',
        title: 'Smoke Bomb',
        description: 'Ability +1, Attack +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: smoke,
    },
    {
        name: 'Starter_Tools',
        title: 'Lockpicking Tools',
        description: 'Choose: Ability +1 -or- Draw one card',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: tools,
    },
];
