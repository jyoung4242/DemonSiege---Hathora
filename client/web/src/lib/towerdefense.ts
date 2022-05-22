import { Cardstatus } from '../../../../api/types';
import tripwire from '../assets/tower defense/TDtripwire.png';
import nettrap from '../assets/tower defense/TDnettrap.png';
import pittrap from '../assets/tower defense/TDpittrap.png';
import quicksand from '../assets/tower defense/TDquicksandtrap.png';

import { TDcardData } from '../lib/card';

export function retrieveTDCardData(cardchosen: string): TDcardData {
    const foundArray = TDCardRawData.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const TDCardRawData = [
    {
        name: 'Tripwire1',
        title: 'Trip Wire',
        description: 'Health -2',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: tripwire,
    },
    {
        name: 'Tripwire2',
        title: 'Trip Wire',
        description: 'Health -2',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: tripwire,
    },
    {
        name: 'Tripwire3',
        title: 'Trip Wire',
        description: 'Health -2',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: tripwire,
    },
    {
        name: 'Net1',
        title: 'Net Trap',
        description: 'Add 1 influence point to location',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: nettrap,
    },
    {
        name: 'Net2',
        title: 'Net Trap',
        description: 'Add 1 influence point to location',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: nettrap,
    },
    {
        name: 'Net3',
        title: 'Net Trap',
        description: 'Add 1 influence point to location',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: nettrap,
    },
    {
        name: 'Pit1',
        title: 'Pit Trap',
        description: '-1 Health, Discard 1 card',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: pittrap,
    },
    {
        name: 'Pit2',
        title: 'Pit Trap',
        description: '-1 Health, Discard 1 card',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: pittrap,
    },
    {
        name: 'Quicksand1',
        title: 'Quicksand',
        description: '-1 Health, Unable to draw card this round',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: quicksand,
    },
    {
        name: 'Quicksand2',
        title: 'Quicksand',
        description: '-1 Health, Unable to draw card this round',
        level: 1,
        orientation: Cardstatus.FaceDown,
        image: quicksand,
    },
];
