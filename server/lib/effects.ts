import { UserId, CardType, targetType, effectType } from '../../api/types';
import { InternalState } from '../impl';

type effectCallback = {
    callbackName: validPassiveCallback;
    target?: targetType;
    value?: number;
    flag?: boolean;
};

type passiveWhenDiscarded = (active: boolean) => void;
type passiveWhenLocationAdded = (active: boolean) => void;
type passiveWhenMonsterCardPlayed = (active: boolean) => void;
type passiveWhenMonsterDefeated = (active: boolean) => void;

type validPassiveCallback = passiveWhenDiscarded | passiveWhenLocationAdded | passiveWhenMonsterCardPlayed | passiveWhenMonsterDefeated;

export let flagCardDiscardedCheck: boolean = false;
export let flagLocationAddedCheck: boolean = false;
export let flagMonsterCardPlayedCheck: boolean = false;
export let flagMonsterDefeatedCheck: boolean = false;

/**
 * Helper Functions for effects
 */

function arrayOfTargets(p: UserId, u: Array<UserId>, t: targetType): Array<UserId> {
    let returnArray: Array<UserId> = [];
    switch (t) {
        case targetType.ActiveHero:
            returnArray.push(p);
            break;
        case targetType.AllHeroes:
            returnArray = [...u];
            break;
        case targetType.OtherHeroes:
            let r = u.filter(user => {
                user != p;
            });
            returnArray = [...r];
            break;
        default:
            break;
    }
    return returnArray;
}

/**
 * Passive Effects
 * Just set boolean flag that gets checked during some custom event
 * Setters and Clearers...
 */

function passiveWhenDiscarded(active: boolean) {
    flagCardDiscardedCheck = active;
}

function passiveWhenLocationAdded(active: boolean) {
    flagLocationAddedCheck = active;
}

function passiveWhenMonsterCardPlayed(active: boolean) {
    flagMonsterCardPlayedCheck = active;
}

function passiveWhenMonsterDefeated(active: boolean) {
    flagMonsterDefeatedCheck = active;
}
