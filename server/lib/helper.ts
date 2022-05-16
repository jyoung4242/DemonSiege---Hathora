import { Cardstatus, UserId, AbilityCard, MonsterCard, TowerDefense, LocationCard, Effect, effectType, Cards, Player, StatusEffect } from '../../api/types';
import { Context } from '../.hathora/methods';
import { InternalState } from '../impl';
import { applyPassiveEffect } from './effects';

export function checkPassiveTDEffects(s: InternalState, c: Context) {
    s.towerDefensePile.forEach(card => {
        let cardobject: Cards = {
            type: 'TowerDefense',
            val: card,
        };
        if (card.PassiveEffect) {
            applyPassiveEffect(s, s.turn!, cardobject, c);
        }
    });
}

export function checkPassiveMonsterEffects(s: InternalState, c: Context) {
    s.activeMonsters.forEach(card => {
        let cardobject: Cards = {
            type: 'MonsterCard',
            val: card,
        };
        if (card.PassiveEffect) {
            applyPassiveEffect(s, s.turn!, cardobject, c);
            //if card doesn't have any ActiveEffects, disable it
            if (!card.ActiveEffect) card.CardStatus = Cardstatus.FaceUpDisabled;
        }
    });
}

export function checkPassivePlayerEffects(s: InternalState, c: Context) {
    //find player index
    const index = s.players.findIndex(p => p.Id == s.turn);
    //go through player hand and check for passive effects
    s.players[index].Hand.forEach(card => {
        let cardobject: Cards = {
            type: 'AbilityCard',
            val: card,
        };
        if (card.PassiveEffect) {
            applyPassiveEffect(s, s.turn!, cardobject, c);
            if (!card.ActiveEffect) card.CardStatus = Cardstatus.FaceUpDisabled;
        }
    });
}

export function dealCards<T>(source: Array<T>, destination: Array<T>, numCards: number): void {
    for (let index = 0; index < numCards; index++) {
        const myCard: T = source.pop()!;
        destination.push(myCard);
    }
}

export function discard<T>(source: Array<T>, destination: Array<T>, index: number): void {
    const myCard: T[] = source.splice(index, 1);
    destination.push(myCard[0]);
}

export function nextPlayer(state: InternalState) {
    const numplayers = state.players.length;
    //find index of current user
    //find player index
    let index = state.players.findIndex(p => p.Id == state.turn);
    if (index === numplayers - 1) index = 0;
    else index += 1;
    state.turn = state.players[index].Id;
}

export const gameLog = (userId: UserId, state: InternalState, message: string) => {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    state.gameLog.push(`${today.toUTCString} - ${userId} Logged:${message}`);
};

export const removeStatusEffect = (userId: UserId, state: InternalState, status: StatusEffect) => {
    const playerIndex = state.players.findIndex(player => player.Id == userId);
    const statusIndex = state.players[playerIndex].StatusEffects.findIndex(stat => stat == status);
    if (statusIndex >= 0) state.players[playerIndex].StatusEffects.splice(playerIndex, 1);
};

export const resetDecks = (state: InternalState) => {
    state.abilityDeck = [];
    state.abilityPile = [];
    state.monsterDeck = [];
    state.activeMonsters = [];
    state.locationDeck = [];
    state.locationDiscard = [];
    state.locationPile = undefined;
    state.players.forEach(player => {
        player.Hand = [];
        player.AbilityPoints = 0;
        player.Health = 10;
        player.AttackPoints = 0;
        player.StatusEffects = [];
    });
    state.playersHidden.forEach(player => {
        player.Deck = [];
        player.Discard = [];
    });
    state.monsterDiscard = [];
    state.towerDefenseDeck = [];
    state.towerDefenseDiscard = [];
    state.towerDefensePile = [];
};
