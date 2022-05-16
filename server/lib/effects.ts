import { UserId, targetType, Player, Cards, TowerDefense, AbilityCard, MonsterCard, LocationCard, StatusEffect } from '../../api/types';
import { Context } from '../.hathora/methods';
import { InternalState } from '../impl';

type EffectCallback = (u: UserId, state: InternalState, c: Context, t: targetType) => void;
type Callbacks = typeof callbacks;
type CallbackName = keyof Callbacks;

/**
 * Helper Functions for effects
 */

export function applyPassiveEffect(state: InternalState, userId: UserId, card: Cards, c: Context) {
    let myCard: TowerDefense | AbilityCard | MonsterCard | LocationCard = card.val;
    let target: targetType = myCard.PassiveEffect!.target;
    executeCallback(myCard.PassiveEffect!.cb as CallbackName, userId, state, c, target);
}

function executeCallback(cbName: CallbackName, u: UserId, s: InternalState, c: Context, t: targetType) {
    callbacks[cbName as CallbackName](u, s, c, t);
}

export function applyActiveEffect(state: InternalState, userId: UserId, card: Cards, c: Context) {
    let myCard: TowerDefense | AbilityCard | MonsterCard | LocationCard = card.val;
    let target: targetType = myCard.ActiveEffect!.target;
    executeCallback(myCard.ActiveEffect!.cb as CallbackName, userId, state, c, target);
}

export function applyRewardEffect(state: InternalState, userId: UserId, card: MonsterCard, c: Context) {
    let target: targetType = card.Rewards.target;
    executeCallback(card.Rewards.cb as CallbackName, userId, state, c, target);
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

        //check for Stunned
        if (state.players[index].StatusEffects.find(status => status == StatusEffect.Stunned)) {
            c.sendEvent('HEALING BLOCKED BY STUNNED', player);
            return;
        }

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

export const lowerHealth1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Lowering Player Health By 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        //TBD - need test for status effects

        const index = state.players.findIndex(p => p.Id == player);
        if (state.players[index].StatusEffects.find(status => status == StatusEffect.Stunned)) {
            c.sendEvent('TAKING DAMAGE BLOCKED BY STUNNED', player);
            return;
        }
        state.players[index].Health -= 1;
        c.sendEvent('Health Lowered 1 ', player);
        if (state.players[index].Health <= 0) stunned(userId, state, c);
    });
};

const lowerHealth2: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Lowering Player Health By 2`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        //TBD - need test for status effects

        const index = state.players.findIndex(p => p.Id == player);
        if (state.players[index].StatusEffects.find(status => status == StatusEffect.Stunned)) {
            c.sendEvent('TAKING DAMAGE BLOCKED BY STUNNED', player);
            return;
        }

        state.players[index].Health -= 2;
        c.sendEvent('Health Lowered 2', player);
        if (state.players[index].Health <= 0) stunned(userId, state, c);
    });
};

const lowerHealth1Discard1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Lowering Player Health By 1, triggering discard`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const index = state.players.findIndex(p => p.Id == player);
        //Lowering Health by 1

        if (state.players[index].StatusEffects.find(status => status == StatusEffect.Stunned)) {
            c.sendEvent('TAKING DAMAGE BLOCKED BY STUNNED', player);
        } else {
            state.players[index].Health -= 1;
            c.sendEvent('Health Lowered', player);
        }

        if (state.players[index].Health <= 0) stunned(userId, state, c);

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
        //check for Stunned
        if (state.players[index].StatusEffects.find(status => status == StatusEffect.Stunned)) {
            c.sendEvent('HEALING BLOCKED BY STUNNED', player);
        } else {
            state.players[index].Health += 1;
            c.sendEvent('AbilityAttack added 1 ', player);
        }
    });
};

const addAttack1Draw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding  attack to player by 1, Draw 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const playerIndex = state.players.findIndex(p => p.Id == player);
        state.players[playerIndex].AttackPoints += 1;
        c.sendEvent('Attack added 1', player);

        //Draw command
        //Passive Effect
        if (state.players[playerIndex].StatusEffects.find(status => status == StatusEffect.NoDraw)) {
            c.sendEvent('DRAW BLOCKED BY STATUS EFECT', player);
            return;
        }
        c.sendEvent('UE Draw1', player);
    });
};

const addAbility1Draw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Adding ability to player by 1, Draw 1`);

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        const playerIndex = state.players.findIndex(p => p.Id == player);
        state.players[playerIndex].AbilityPoints += 1;
        c.sendEvent('Attack added 1', player);

        //Draw command

        //Passive Effect
        if (state.players[playerIndex].StatusEffects.find(status => status == StatusEffect.NoDraw)) {
            c.sendEvent('DRAW BLOCKED BY STATUS EFECT', player);
            return;
        }
        c.sendEvent('UE Draw1', player);
    });
};

const draw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Draw 1`);
    const playerIndex = state.players.findIndex(player => player.Id == userId);
    //Passive Effect
    if (state.players[playerIndex].StatusEffects.find(status => status == StatusEffect.NoDraw)) {
        c.sendEvent('DRAW BLOCKED BY STATUS EFECT', userId);
        return;
    }

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
        //Draw command
        c.sendEvent('UE Draw1', player);
    });
};

const draw2lose1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    console.log(`Draw 2 cards, discard 1`);
    const playerIndex = state.players.findIndex(player => player.Id == userId);
    //Passive Effect
    if (state.players[playerIndex].StatusEffects.find(status => status == StatusEffect.NoDraw)) {
        c.sendEvent('DRAW BLOCKED BY STATUS EFECT', userId);
        return;
    }

    let listOfTargets: Array<UserId> = arrayOfTargets(userId, state.players, t, c);
    listOfTargets.forEach(player => {
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
    const playerIndex = state.players.findIndex(player => player.Id == userId);
    //test for status effects
    if (state.players[playerIndex].StatusEffects.find(status => status == StatusEffect.LocationCursed)) {
        c.sendEvent('LOCATION CURSE', userId);
        lowerHealth2(userId, state, c, targetType.ActiveHero);
    }

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

const chooseAttack1Ability1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    c.sendEvent('Choose - Attack +1 -or- Ability +1', userId);
};

const chooseHealth1Ability1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    c.sendEvent('Choose - Health +1 -or- Ability +1', userId);
};

const chooseAbility1Draw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    c.sendEvent('Choose - Ability +1 -or- Draw 1', userId);
};

/**
 * Passive Effects
 * Just set boolean flag that gets checked during some custom event
 * Setters and Clearers...
 */

const whenDiscardLoseHealth1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    //adding no draw status effect to user
    const index = state.players.findIndex(p => p.Id == userId);
    //check for NoDraw status
    const rsltStatus = state.players[index].StatusEffects.find(SE => SE == StatusEffect.DiscardCurse);
    if (rsltStatus == undefined) {
        state.players[index].StatusEffects.push(StatusEffect.DiscardCurse);
        c.sendEvent('STATUS EFFECT - DiscardLoseHealth1', userId);
    }
};

const whenLocationAddedLoseHealth2: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    //adding no draw status effect to user
    const index = state.players.findIndex(p => p.Id == userId);
    //check for NoDraw status
    const rsltStatus = state.players[index].StatusEffects.find(SE => SE == StatusEffect.LocationCursed);
    if (rsltStatus == undefined) {
        state.players[index].StatusEffects.push(StatusEffect.LocationCursed);
        c.sendEvent('STATUS EFFECT - LocationCurseLoseHealth2', userId);
    }
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

const passiveWhenMonsterDefeatedDraw1: EffectCallback = (userId: UserId, state: InternalState, c: Context, t: targetType) => {
    //adding no draw status effect to user
    const index = state.players.findIndex(p => p.Id == userId);
    //check for NoDraw status
    const rsltStatus = state.players[index].StatusEffects.find(SE => SE == StatusEffect.MonsterDefeatPerk);
    if (rsltStatus == undefined) {
        state.players[index].StatusEffects.push(StatusEffect.MonsterDefeatPerk);
        c.sendEvent('STATUS EFFECT - NO DRAW', userId);
    }
};

export const stunned = (userId: UserId, state: InternalState, c: Context) => {
    const index = state.players.findIndex(p => p.Id == userId);
    state.players[index].StatusEffects.push(StatusEffect.Stunned);
    c.sendEvent('Player Stunned', userId);
    state.players[index].AbilityPoints = 0;
    state.players[index].AttackPoints = 0;
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

const callbacks = {
    whenLocationAddedLoseHealth2,
    addLocation1,
    lowerHealth1Discard1,
    NoDraw,
    lowerHealth1,
    lowerHealth2,
    whenDiscardLoseHealth1,
    chooseAttack1Ability1,
    chooseHealth1Ability1,
    chooseAbility1Draw1,
    draw2lose1,
    removeLocation1,
    draw1,
    addAbility1Draw1,
    addAttack1Draw1,
    addHealth1Ability1,
    addAttack1Ability1,
    addAbility2,
    addAbility1,
    addAttack2,
    addHealth1,
    addAttack1,
    passiveWhenMonsterDefeatedDraw1,
} as const;
