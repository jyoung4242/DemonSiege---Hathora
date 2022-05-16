import { UserId, targetType, Player, Cards, TowerDefense, AbilityCard, MonsterCard, LocationCard, StatusEffect } from '../../api/types';
import { Context } from '../.hathora/methods';
import { InternalState } from '../impl';
import { dealCards } from './helper';

type EffectCallback = (u: UserId, state: InternalState, c: Context, t: targetType) => void;
type Callbacks = typeof callbacks;
type CallbackName = keyof Callbacks;

/**
 * Helper Functions for effects
 */

export function applyPassiveEffect(state: InternalState, userId: UserId, card: Cards, c: Context, userdata?: any) {
    let myCard: TowerDefense | AbilityCard | MonsterCard | LocationCard = card.val;
    let target: targetType = myCard.PassiveEffect!.target;
    executeCallback(myCard.PassiveEffect!.cb as CallbackName, userId, state, c, target);
}

function executeCallback(cbName: CallbackName, u: UserId, s: InternalState, c: Context, t: targetType) {
    callbacks[cbName as CallbackName](u, s, c, t);
}

export function applyActiveEffect(state: InternalState, userId: UserId, card: Cards, c: Context, userdata?: any) {
    let myCard: TowerDefense | AbilityCard | MonsterCard | LocationCard = card.val;
    let target: targetType = myCard.ActiveEffect!.target;
    executeCallback(myCard.ActiveEffect!.cb as CallbackName, userId, state, c, target);
}

function arrayOfTargets(p: UserId, u: Array<Player>, t: targetType, c: Context, userdata?: any): Array<UserId> {
    let tempArray: Array<UserId> = [];
    let returnArray: Array<UserId> = [];
    switch (t) {
        case targetType.ActiveHero:
            returnArray.push(p);
            break;
        case targetType.AllHeroes:
            u.forEach(p => returnArray.push(p.Id));
            break;
        case targetType.OtherHeroes:
            u.forEach(p => tempArray.push(p.Id));
            returnArray = tempArray.filter(user => user != p);
            break;
        case targetType.RandomHero:
            u.forEach(p => tempArray.push(p.Id));
            const rtrnstring = c.chance.pickone(tempArray);
            returnArray.push(rtrnstring);
        case targetType.AnyHero:
            if (userdata == undefined) userdata!.target = p;
            returnArray.push(<UserId>userdata.target);
        default:
            returnArray.push(p);
            break;
    }
    return returnArray;
}

/**
 * Active Effects
 * instantly changes something in the game when called
 */

const addAttack1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding attack to player by 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AttackPoints += 1;
        c.sendEvent('Attack added 1 ', player);
    });
};

const addHealth1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding health to player by 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].Health += 1;
        c.sendEvent('Health added 1 ', player);
    });
};

const addAttack2: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding attack to player by 2`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AttackPoints += 2;
        c.sendEvent('Attack added 2 ', player);
    });
};

const addAbility1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding ability to player by 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AbilityPoints += 1;
        c.sendEvent('Ability added 1 ', player);
    });
};

const addAbility2: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding ability to player by 2`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AbilityPoints += 2;
        c.sendEvent('Ability added 2 ', player);
    });
};

const lowerHealth1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Lowering Player Health By 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        //TBD - need test for status effects

        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].Health -= 1;
        c.sendEvent('Health Lowered 1 ', player);
        if (state.players[index].Health <= 0) {
            state.players[index].StatusEffects.push(StatusEffect.Stunned);
            c.sendEvent('Player Stunned', player);
        }
    });
};

const lowerHealth2: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Lowering Player Health By 2`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        //TBD - need test for status effects

        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].Health -= 2;
        c.sendEvent('Health Lowered 2', player);
        if (state.players[index].Health <= 0) {
            state.players[index].StatusEffects.push(StatusEffect.Stunned);
            c.sendEvent('Player Stunned', player);
        }
    });
};

const lowerHealth1Discard1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Lowering Player Health By 1, triggering discard`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        // TBD - need test for status effects

        const index = state.players.findIndex(p => p.Id == player);
        //Lowering Health by 1
        state.players[index].Health -= 1;
        c.sendEvent('Health Lowered', player);
        if (state.players[index].Health <= 0) {
            state.players[index].StatusEffects.push(StatusEffect.Stunned);
            c.sendEvent('Player Stunned', player);
        }

        //Discarding
        c.sendEvent('UE Discard1', player);
    });
};

const addAttack1Ability1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding ability and attack to player by 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AbilityPoints += 1;
        state.players[index].AttackPoints += 1;
        c.sendEvent('AbilityAttack added 1 ', player);
    });
};

const addHealth1Ability1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding ability and health to player by 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AbilityPoints += 1;
        state.players[index].Health += 1;
        c.sendEvent('AbilityAttack added 1 ', player);
    });
};

const addAttack1Draw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding  attack to player by 1, Draw 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AttackPoints += 1;
        c.sendEvent('Attack added 1', player);

        //Draw command
        c.sendEvent('UE Draw1', player);
    });
};

const addAbility1Draw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding ability to player by 1, Draw 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        state.players[index].AttackPoints += 1;
        c.sendEvent('Attack added 1', player);

        //Draw command
        c.sendEvent('UE Draw1', player);
    });
};

const draw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Draw 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        //Draw command
        c.sendEvent('UE Draw1', player);
    });
};

const draw2lose1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Draw 2 cards, discard 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        //Draw command
        c.sendEvent('UE Draw2', player);
        //Draw command
        c.sendEvent('UE Discard1', player);
    });
};

const removeLocation1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Removing Location Point`);
    if (state.locationPile!.ActiveDamage > 0) state.locationPile!.ActiveDamage -= 1;
    c.broadcastEvent('Location Point removed');
};

const addLocation1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding location point by 1`);
    state.locationPile!.ActiveDamage += 1;
    if (state.locationPile!.ActiveDamage >= state.locationPile!.Health) {
        //Location Lost
        c.broadcastEvent('Location Lost');
        state.locationDiscard.push(state.locationPile!);
        if (state.locationDeck.length) state.locationPile = state.locationDeck.pop();
        else {
            //game over - you lost
            c.broadcastEvent('GAME OVER-out of locations');
        }
    }
};

function chooseAttack1Ability1() {}

function chooseHealth1Ability1() {}

function chooseAbility1Draw1() {}

/**
 * Passive Effects
 * Just set boolean flag that gets checked during some custom event
 * Setters and Clearers...
 */

const whenDiscardLoseHealth1: EffectCallback = () => {
    console.log('when discard lose health');
};

const whenLocationAddedLoseHealth2: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log('HERE!!!!');
};

const NoDraw: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    //adding no draw status effect to user
    const index = state.players.findIndex(p => p.Id == userId);
    //check for NoDraw status
    const rsltStatus = state.players[index].StatusEffects.find(SE => SE == StatusEffect.NoDraw);
    if (rsltStatus == undefined) {
        state.players[index].StatusEffects.push(StatusEffect.NoDraw);
        c.sendEvent('STATUS EFFECT - NO DRAW', userId);
    }
};

function passiveWhenDiscarded(active: boolean) {}

function passiveWhenLocationAdded(active: boolean) {}

function passiveWhenMonsterCardPlayed(active: boolean) {}

function passiveWhenMonsterDefeatedDraw1(active: boolean) {}

const callbacks = {
    whenLocationAddedLoseHealth2,
    addLocation1,
    lowerHealth1Discard1,
    NoDraw,
    lowerHealth1,
    lowerHealth2,
    whenDiscardLoseHealth1,
} as const;
