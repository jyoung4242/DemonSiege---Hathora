import { Cardstatus } from '../../../../api/types';
import chant from '../assets/starter cards/paladin/paladinchant.png';
import concentration from '../assets/starter cards/paladin/paladinconcentration.png';
import defend from '../assets/starter cards/paladin/paladindefend.png';
import hammer from '../assets/starter cards/paladin/paladinhammer.png';
import helmet from '../assets/starter cards/paladin/paladinhelmet.png';
import mace from '../assets/starter cards/paladin/paladinmace.png';
import prayer from '../assets/starter cards/paladin/paladinprayer.png';
import redemption from '../assets/starter cards/paladin/paladinredeption.png';
import shield from '../assets/starter cards/paladin/paladinshield.png';
import talisman from '../assets/starter cards/paladin/paladintalisman.png';

import { ABcardData } from '../lib/card';

export function retrieveStarterPaladinCardData(cardchosen: string): ABcardData {
    const foundArray = starterPaladinCardData.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const starterPaladinCardData = [
    {
        name: 'Starter_Chant',
        title: 'Holy Chant',
        description: 'Choose: Health +1 -or- Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: chant,
    },
    {
        name: 'Starter_Concentration',
        title: 'Concentrtion Auro',
        description: 'Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: concentration,
    },
    {
        name: 'Starter_Defend',
        title: 'Celestial Defense',
        description: 'Ability +1, For any one player',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: defend,
    },
    {
        name: 'Starter_Hammer',
        title: 'Hammer of the Church',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: hammer,
    },
    {
        name: 'Starter_Helmet',
        title: 'Righteous Helm',
        description: 'Health +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: helmet,
    },
    {
        name: 'Starter_Mace',
        title: 'Mace of the Gods',
        description: 'Choose: Attack +1 -or- draw one card',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: mace,
    },
    {
        name: 'Starter_Prayer',
        title: 'Devine Prayer',
        description: 'Health +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: prayer,
    },
    {
        name: 'Starter_Redemption',
        title: 'Holy Redeption',
        description: 'Health +1 for any one player',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: redemption,
    },
    {
        name: 'Starter_Paladin_Shield',
        title: 'Shield of the Devine',
        description: 'Choose: Ability +1 -or- Health +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: shield,
    },
    {
        name: 'Starter_Talisman',
        title: 'Brooch of the Almighty',
        description: 'Draw two cards, discard any one',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: talisman,
    },
];
