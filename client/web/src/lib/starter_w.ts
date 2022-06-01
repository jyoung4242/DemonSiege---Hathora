import { Cardstatus } from '../../../../api/types';
import pet from '../assets/starter cards/wizard/wizardpet.png';
import robe from '../assets/starter cards/wizard/wizardrobes.png';
import book from '../assets/starter cards/wizard/wizardspellbook.png';
import staff from '../assets/starter cards/wizard/wizardstaff.png';
import wand from '../assets/starter cards/wizard/wizardwand.png';
import aspell from '../assets/ability cards/attackspell.png';
import sspell from '../assets/ability cards/supportspell.png';
import hspell from '../assets/ability cards/healingspell.png';

import { ABcardData } from '../lib/card';

export function retrieveStarterWizardCardData(cardchosen: string): ABcardData {
    const foundArray = starterWizardCardData.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const starterWizardCardData = [
    {
        name: 'Starter_Robes',
        title: 'Robes',
        description: 'Choose: Health +1 -or- Ability +1',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: robe,
    },
    {
        name: 'Starter_Wand',
        title: 'Wand',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: wand,
    },
    {
        name: 'Starter_Spellbook',
        title: 'Spellboook',
        description: 'Ability +2',
        catagory: 'ITEM',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: book,
    },
    {
        name: 'Starter_Staff',
        title: 'Staff',
        description: 'Choose: Attack +1 -or- Ability +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: staff,
    },
    {
        name: 'Starter_Pet',
        title: 'Psuedodragon',
        description: 'Attack +1,Ability +1',
        catagory: 'FRIEND',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: pet,
    },
    {
        name: 'Starter_Firespell',
        title: 'Hand of Fire',
        description: 'Attack +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: aspell,
    },
    {
        name: 'Starter_Minor_Heal',
        title: 'Minor healing',
        description: 'Health +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: hspell,
    },
    {
        name: 'Starter_Meditation',
        title: 'Wizard Meditation',
        description: 'Ability +1, Draw 1 card',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: sspell,
    },
    {
        name: 'Starter_Wizard_Focus',
        title: 'Wizard Focus',
        description: 'Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: sspell,
    },
    {
        name: 'Starter_Magic_Arrow',
        title: 'Magic Arrow',
        description: 'Choose: Attack +1 -or- Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 0,
        orientation: Cardstatus.FaceDown,
        image: aspell,
    },
];
