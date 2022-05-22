import { Cardstatus } from '../../../../api/types';
import dagger from '../assets/ability cards/dagger.png';
import sling from '../assets/ability cards/sling.png';
import broadsword from '../assets/ability cards/broadsword.png';
import mana from '../assets/ability cards/manapotion.png';
import bracelet from '../assets/ability cards/bracelet.png';
import jewel from '../assets/ability cards/jewel.png';
import supportspell from '../assets/ability cards/supportspell.png';
import attackspell from '../assets/ability cards/attackspell.png';
import duraina from '../assets/ability cards/femaletraderhuman.png';
import jacquelyn from '../assets/ability cards/femalesailorhuman.png';
import { ABcardData } from '../lib/card';

export function retrieveCardData(cardchosen: string): ABcardData {
    const foundArray = abilityCardDataLv1.filter(card => card.name == cardchosen);
    return foundArray[0];
}

export const abilityCardDataLv1 = [
    {
        name: 'Dagger',
        title: 'Spirit Cleaver',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: dagger,
    },
    {
        name: 'Sling',
        title: 'Chromacloth',
        description: 'Attack +1, Ability+1',
        catagory: 'WEAPON',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: sling,
    },
    {
        name: 'Broadsword',
        title: 'Spellsword',
        description: 'Attack +1',
        catagory: 'WEAPON',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: broadsword,
    },
    {
        name: 'Mana Potion',
        title: 'Djinn and Tonic',
        description: 'Health +1, Ability +1',
        catagory: 'ITEM',
        level: 1,
        cost: 4,
        orientation: Cardstatus.FaceDown,
        image: mana,
    },
    {
        name: 'Bracelet',
        title: 'Contingency Band',
        description: 'Ability +1',
        catagory: 'ITEM',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: bracelet,
    },
    {
        name: 'Jewel',
        title: 'Eye of the Bookwurm',
        description: 'Ability +1',
        catagory: 'ITEM',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: jewel,
    },
    {
        name: 'Daydream',
        title: 'Daydream',
        description: 'Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 2,
        orientation: Cardstatus.FaceDown,
        image: supportspell,
    },
    {
        name: 'Awakening',
        title: 'Blast of Awakening',
        description: 'Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: supportspell,
    },
    {
        name: 'Torrent',
        title: 'Fiery Torrent',
        description: 'Attack +1, Draw 1 Card',
        catagory: 'SPELL',
        level: 1,
        cost: 4,
        orientation: Cardstatus.FaceDown,
        image: attackspell,
    },
    {
        name: 'Torment',
        title: 'Torment',
        description: 'Draw 1 Card, Discard 1',
        catagory: 'SPELL',
        level: 1,
        cost: 2,
        orientation: Cardstatus.FaceDown,
        image: supportspell,
    },
    {
        name: 'AcidHail',
        title: 'Acid Hail',
        description: 'Attack +1',
        catagory: 'SPELL',
        level: 1,
        cost: 2,
        orientation: Cardstatus.FaceDown,
        image: attackspell,
    },
    {
        name: 'Solitude',
        title: 'Solitude Bolt',
        description: 'Attack +1',
        catagory: 'SPELL',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: attackspell,
    },
    {
        name: 'HolyTempest',
        title: 'Holy Tempest',
        description: 'Choose: Health +1 -or- Ability +1',
        catagory: 'SPELL',
        level: 1,
        cost: 4,
        orientation: Cardstatus.FaceDown,
        image: supportspell,
    },
    {
        name: 'Eviction',
        title: 'Eviction',
        description: 'Remove 1 location point',
        catagory: 'SPELL',
        level: 1,
        cost: 5,
        orientation: Cardstatus.FaceDown,
        image: attackspell,
    },
    {
        name: 'Imitationrituals',
        title: 'Imitation of Rituals',
        description: 'Choose: Ability +1 -or- Draw 1 card',
        catagory: 'SPELL',
        level: 1,
        cost: 3,
        orientation: Cardstatus.FaceDown,
        image: supportspell,
    },
    {
        name: 'Duraina',
        title: 'Duraina Serpentwind',
        description: 'Attack +1, +1 Health to all',
        catagory: 'FRIEND',
        level: 1,
        cost: 4,
        orientation: Cardstatus.FaceDown,
        image: duraina,
    },
    {
        name: 'Jacquelyn',
        title: 'Jacqulyn Cornwalis',
        description: 'Attack +1, If monster defeated, Ability +1',
        catagory: 'FRIEND',
        level: 1,
        cost: 2,
        orientation: Cardstatus.FaceDown,
        image: jacquelyn,
    },
];
