import { abilityCardDataLv1 } from '../lib/abilitycardsLV1';
import { starterBararianbCardData } from '../lib/starter_b';
import { starterWizardCardData } from '../lib/starter_w';
import { starterPaladinCardData } from '../lib/starter_p';
import { starterRogueCardData } from '../lib/starter_r';
import { ABcardData } from './card';

export const loadAbilityCardDatabase = () => {
    abilityCardDataLv1.forEach(data => abilityCardDatabase.push(data));
    starterBararianbCardData.forEach(data => abilityCardDatabase.push(data));
    starterWizardCardData.forEach(data => abilityCardDatabase.push(data));
    starterPaladinCardData.forEach(data => abilityCardDatabase.push(data));
    starterRogueCardData.forEach(data => abilityCardDatabase.push(data));
    console.log(`card database loaded: `, abilityCardDatabase);
};

export const retrieveMasterCardData = (cardchosen: string): ABcardData => {
    console.log(`retriving: `, cardchosen);
    const foundArray = abilityCardDatabase.filter(card => card.name == cardchosen);
    return foundArray[0];
};

export const isCardinDB = (cardchosen: string): boolean => {
    console.log(`looking for: `, cardchosen);
    return abilityCardDatabase.some(card => card.name == cardchosen);
};

export let abilityCardDatabase = [];
