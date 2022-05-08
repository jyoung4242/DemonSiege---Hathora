import { TowerDefense, UserId, MonsterCard, Player, PlayerStatus, Roles, errorMessage, GameStates, AbilityCard, Cardstatus } from '../../api/types';
import { loadTDCardsFromJSON, loadAbilityCardsFromJSON, dealCards } from './helper';
import TDcards from '../json/tdtest.json';
import { InternalState } from '../impl';
import monsters from '../json/monstersDB.json';
import abilities from '../json/cardsdb.json';
import myLocations from '../json/locationsDB.json';
import barbarian from '../json/starter_b.json';
import wizard from '../json/starter_w.json';
import paladin from '../json/starter_p.json';
import rogue from '../json/starter_r.json';
import { Context } from '../.hathora/methods';

const bStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(barbarian);
const wStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(wizard);
const pStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(paladin);
const rStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(rogue);
/*const abilityCardPool: Array<AbilityCard> = loadAbilityCardsFromJSON(abilities);
const monsterCardPool: Array<MonsterCard> = loadMonsterCardsFromJSON(monsters);
const locationCardPool: Array<LocationCard> = loadLocationCardsFromJSON(myLocations);*/
const mappedStartingDeck = {
    [Roles.Barbarian]: bStartingDeck,
    [Roles.Wizard]: wStartingDeck,
    [Roles.Paladin]: pStartingDeck,
    [Roles.Rogue]: rStartingDeck,
};

export const TdCardPool: Array<TowerDefense> = loadTDCardsFromJSON(TDcards);
export let playerOrder: Array<UserId> = [];
export const numberMonstersActiveByLevel: Array<number> = [1, 1, 2, 2, 3, 3, 3, 3];
export let monsterCardDiscardPoolArray: Array<MonsterCard> = [];

export function joinNewPlayertoGame(u: UserId, s: InternalState): errorMessage {
    let newPlayer: Player = {
        PlayerState: PlayerStatus.RoleSelection,
        Id: u,
        NumCards: 0,
        Health: 10,
        AttackPoints: 0,
        AbilityPoints: 0,
        Hand: [],
        Deck: [],
        Discard: [],
        Role: Roles.Barbarian,
        LevelBonus: [],
        TurnComplete: false,
    };

    s.players.push(newPlayer);
    playerOrder.push(u);
    return { status: 0, message: 'All good' };
}

export function setPlayerRole(u: UserId, s: InternalState, r: Roles): errorMessage {
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
    s.players.forEach(player => {
        player.Deck = [...mappedStartingDeck[player.Role]];
        player.Deck = c.chance.shuffle(player.Deck);
        //draw 5 cards for each player into hand
        dealCards(player.Deck, player.Hand, 5);
        //cards face up
        player.Hand.forEach(card => (card.CardStatus = Cardstatus.FaceUp));
    });
}
