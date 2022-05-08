import { InternalState } from '../impl';
import { UserId } from '../../api/types';
import { flagCardDiscardedCheck, flagLocationAddedCheck, flagMonsterCardPlayedCheck } from './effects';

export function discardFromHand(userId: UserId, state: InternalState) {
    //do stuff ... do stuff

    //passive STATUS EFFECT TEST
    if (flagCardDiscardedCheck) {
        console.log(`I'm a status effect for when a card is discarded`);
    }
}

export function addInfluencePointToLocation(userId: UserId, state: InternalState) {
    //do stuff .... stuff... stuff

    //passive STATUS EFFECT TEST
    if (flagLocationAddedCheck) {
        console.log(`I'm a status effect for when an influence pointy is added`);
    }
}

export function dealMonsterCard(userId: UserId, state: InternalState) {
    //do stuff .... stuff... stuff

    //passive STATUS EFFECT TEST
    if (flagMonsterCardPlayedCheck) {
        console.log(`I'm a status effect for when a Monster Card is played`);
    }
}
