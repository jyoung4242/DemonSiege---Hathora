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

type validPassiveCallback = passiveWhenDiscarded | passiveWhenLocationAdded | passiveWhenMonsterCardPlayed;

export let flagCardDiscardedCheck: boolean = false;
export let flagLocationAddedCheck: boolean = false;
export let flagMonsterCardPlayedCheck: boolean = false;

/**
 * Class Definition
 */
export class Effect {
    value: number = 0;
    target: targetType = targetType.ActiveHero;
    eType: effectType = effectType.;
    cb: effectCallback;
    vcb: validPassiveCallback;

    constructor(public name: string, typePassed: effectType, cb: effectCallback, args: object, target: targetType) {
        this.name = name;
        this.eType = typePassed;
        this.cb = cb;
        this.vcb = cb.callbackName;
        this.target = target;
    }

    get_type() {
        return this.eType;
    }

    activate() {
        this.vcb(true);
    }

    deactivate() {
        this.vcb(false);
    }
}

/**
 * Helper Functions for effects
 */

function arrayOfTargets(p: UserId, u: Array<UserId>, t: targetType): Array<UserId> {
    let returnArray: Array<UserId> = [];
    switch (t) {
        case 'Active Hero':
            returnArray.push(p);
            break;
        case 'All Hereos':
            returnArray = [...u];
            break;
        case 'Other Hereos':
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
