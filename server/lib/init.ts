import { TowerDefense, UserId, MonsterCard, Player, PlayerStatus, Roles, ErrorMessage, GameStates, AbilityCard, Cardstatus, LocationCard } from '../../api/types';
import { dealCards } from './helper';
import TDpkg from '../json/tdtest';
import { InternalState } from '../impl';
import monstersPkg from '../json/monsterTest';
import abilitiesPkg from '../json/abilitytests';
import myLocationsPkg from '../json/locationTest';
import barbarianPKG from '../json/starter_b_TS';
import wizardPKG from '../json/starter_w_TS';
import paladinPKG from '../json/starter_p_TS';
import roguePKG from '../json/starter_r_TS';
import { Context } from '../.hathora/methods';

export const TdCardPool: Array<TowerDefense> = TDpkg;
export const monsterCardPool: Array<MonsterCard> = monstersPkg;
export const abilityCardPool: Array<AbilityCard> = abilitiesPkg;
export const locationCardPool: Array<LocationCard> = myLocationsPkg;
export const bStartingDeck: Array<AbilityCard> = barbarianPKG;
export const wStartingDeck: Array<AbilityCard> = wizardPKG;
export const pStartingDeck: Array<AbilityCard> = paladinPKG;
export const rStartingDeck: Array<AbilityCard> = roguePKG;

const mappedStartingDeck = {
    [Roles.Barbarian]: bStartingDeck,
    [Roles.Wizard]: wStartingDeck,
    [Roles.Paladin]: pStartingDeck,
    [Roles.Rogue]: rStartingDeck,
};
export let playerOrder: Array<UserId> = [];
export const numberMonstersActiveByLevel: Array<number> = [1, 1, 2, 2, 3, 3, 3, 3];
export let monsterCardDiscardPoolArray: Array<MonsterCard> = [];

export function joinNewPlayertoGame(u: UserId, s: InternalState): ErrorMessage {
    let newPlayer: Player = {
        PlayerState: PlayerStatus.RoleSelection,
        Id: u,
        Health: 10,
        AttackPoints: 0,
        AbilityPoints: 0,
        Hand: [],
        Role: Roles.Barbarian,
        LevelBonus: [],
        StatusEffects: [],
    };

    s.players.push(newPlayer);
    playerOrder.push(u);
    return { status: 0, message: 'All good' };
}

export function setPlayerRole(u: UserId, s: InternalState, r: Roles): ErrorMessage {
    const playerIndex = s.players.findIndex(i => i.Id == u);
    if (playerIndex == -1) return { status: -1, message: 'User Not Found' };
    if (s.players[playerIndex].PlayerState != PlayerStatus.RoleSelection) return { status: -2, message: 'Player not able to set role currently' };

    s.players[playerIndex].Role = r;
    s.players[playerIndex].PlayerState = PlayerStatus.Connected;

    if (allPlayersRoleSelected(s)) s.gameSequence = GameStates.ReadyForRound;

    return { status: 0, message: 'All good' };
}

function allPlayersRoleSelected(s: InternalState): boolean {
    return s.players.every(i => i.PlayerState == PlayerStatus.Connected);
}

export function loadPlayersStartingDecks(s: InternalState, c: Context) {
    //load all players deck with starting deck based on Roles, and shuffle deck
    s.players.forEach((player, index) => {
        s.playersHidden[index].Deck = [...mappedStartingDeck[player.Role]];
        s.playersHidden[index].Deck = c.chance.shuffle(s.playersHidden[index].Deck);
        //draw 5 cards for each player into hand
        dealCards(s.playersHidden[index].Deck, s.players[index].Hand, 5);
        //cards face up
        player.Hand.forEach(card => (card.CardStatus = Cardstatus.FaceUp));
    });
}

export function setupAbilityDeck(s: InternalState, c: Context) {
    //load level 'gameLevel(state)' ability cards into working Ability Deck for that game
    s.abilityDeck = abilityCardPool.filter(card => card.Level <= s.gameLevel);
    //shuffle ability deck
    s.abilityDeck = c.chance.shuffle(s.abilityDeck);
    //draw 6 cards from ability deck into the ability pile
    dealCards(s.abilityDeck, s.abilityPile, 6);
    //cards face up
    s.abilityPile.forEach(card => (card.CardStatus = Cardstatus.FaceUp));
}

export function setupMonsterDeck(s: InternalState, c: Context) {
    //load level 'gameLevel(state)' monster cards into working monster Deck for that game
    s.monsterDeck = monsterCardPool.filter(card => card.Level <= s.gameLevel);
    //shuffle monster deck
    s.monsterDeck = c.chance.shuffle(s.monsterDeck);
    //draw card from monster deck into the monster pile
    dealCards(s.monsterDeck, s.activeMonsters, numberMonstersActiveByLevel[s.gameLevel]);
    //cards face up
    s.activeMonsters.forEach(card => (card.CardStatus = Cardstatus.FaceUp));
}

export function setupLocationDeck(s: InternalState, c: Context) {
    //load appropriate level location cards into active location array
    s.locationDeck = locationCardPool.filter(card => card.Level == s.gameLevel);
    //inverst order by sequence number
    s.locationDeck.sort((a, b): number => {
        return b.Sequence - a.Sequence;
    });
    s.locationPile = s.locationDeck.pop();
    s.locationPile!.CardStatus = Cardstatus.FaceUp;
}

export function setupTDDeck(s: InternalState, c: Context) {
    //load appropriate level location cards into active location array
    s.towerDefenseDeck = TdCardPool.filter(card => card.Level <= s.gameLevel);
    s.towerDefenseDeck = c.chance.shuffle(s.towerDefenseDeck);
}

export function setupPlayerOrder(s: InternalState, c: Context) {
    s.players.forEach(player => {
        playerOrder.push(player.Id);
    });
    playerOrder = c.chance.shuffle(playerOrder);
    s.turn = playerOrder[0];
}
