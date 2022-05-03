import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { PlayerStatus, CardType, Roles, RoundState, GameStates, DieFaces, Conditions, LocationCard, TowerDefense, AbilityCard, MonsterCard, Effects, StandardEffect, ConditionalEffect, AbilityEffect, AttackEffect, AttackCapEffect, HealthEffect, HealthCapEffect, LocationEffect, DrawCardEffect, DiscardEffect, TowerDefenseEffect, MonsterHealthEffect, MonsterAbilityBlockEffect, NoHealEffect, DieRollEffect, Events, Player, GameState, UserId, IInitializeRequest, IJoinGameRequest, ISelectRoleRequest, IAddAIRequest, IStartGameRequest, IPlayCardRequest, IDiscardRequest, IDrawCardRequest, IEndTurnRequest, IStartTurnRequest, IApplyAttackRequest, IBuyAbilityCardRequest, IApplyHealthRequest, IApplyChoiceRequest, IApplySelectedUserRequest, Cardstatus } from '../api/types';
import { loadMonsterCardsFromJSON, loadAbilityCardsFromJSON, loadTDCardsFromJSON, loadLocationCardsFromJSON, dealCards } from './lib/helper';
import monsters from './json/monstersDB.json';
import abilities from './json/cardsdb.json';
import TDcards from './json/TDDB.json';
import myLocations from './json/locationsDB.json';
import barbarian from './json/starter_b.json';
import wizard from './json/starter_w.json';
import paladin from './json/starter_p.json';
import rogue from './json/starter_r.json';
//import { Chance } from 'chance';
//let chance = new Chance();

type InternalState = GameState;

const bStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(barbarian);
const wStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(wizard);
const pStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(paladin);
const rStartingDeck: Array<AbilityCard> = loadAbilityCardsFromJSON(rogue);
const abilityCardPool: Array<AbilityCard> = loadAbilityCardsFromJSON(abilities);
const monsterCardPool: Array<MonsterCard> = loadMonsterCardsFromJSON(monsters);
const locationCardPool: Array<LocationCard> = loadLocationCardsFromJSON(myLocations);
const TdCardPool: Array<TowerDefense> = loadTDCardsFromJSON(TDcards);
const playerOrder: Array<UserId> = [];
const numberMonstersActiveByLevel: Array<number> = [1, 1, 2, 2, 3, 3, 3, 3];
const mappedStartingDeck = {
    [Roles.Barbarian]: bStartingDeck,
    [Roles.Wizard]: wStartingDeck,
    [Roles.Paladin]: pStartingDeck,
    [Roles.Rogue]: rStartingDeck,
};

export class Impl implements Methods<InternalState> {
    initialize(ctx: Context, request: IInitializeRequest): InternalState {
        //Clean out order array
        playerOrder.splice(0, playerOrder.length);
        return {
            gameLevel: 1,
            locationSequence: 0,
            gameLog: ['Starting Game Instance'],
            eventLog: [],
            roundSequence: 0,
            gameSequence: 0,
            abilityDeck: [],
            abilityPile: [],
            monsterDeck: [],
            monsterPile: undefined,
            activeMonsters: [],
            locationDeck: [],
            locationPile: undefined,
            towerDefenseDeck: [],
            towerDefensePile: [],
            turn: undefined,
            players: [],
        };
    }
    joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
        if (state.players.length >= 4) {
            return Response.error('Maximum Players Allowed');
        }
        if (state.players.find(player => player.Id === userId) !== undefined) {
            return Response.error('Already joined');
        }
        let newPlayer: Player = {
            PlayerState: PlayerStatus.Undefined,
            Id: userId,
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
        state.players.push(newPlayer);
        playerOrder.push(userId);

        state.players.forEach(player => {
            if (player.Id == userId) {
                player.PlayerState = PlayerStatus.RoleSelection;
            }
        });
        return Response.ok();
    }

    selectRole(state: InternalState, userId: UserId, ctx: Context, request: ISelectRoleRequest): Response {
        let found = false;

        let errMessage = '';
        state.players.forEach(player => {
            if (player.Id == userId) {
                found = true;
                if (player.PlayerState != PlayerStatus.RoleSelection) {
                    errMessage = 'Player unable to select role';
                } else {
                    player.Role = request.role;
                    player.PlayerState = PlayerStatus.Connected;
                }
            }
        });
        if (!found) errMessage = 'Player Not Found';
        if (errMessage != '') {
            return Response.error(errMessage);
        } else {
            return Response.ok();
        }
    }

    /**
     *
     * DO THIS LAST
     */
    addAI(state: InternalState, userId: UserId, ctx: Context, request: IAddAIRequest): Response {
        return Response.error('Not implemented');
    }

    startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
        //check for all players being in Connected State
        let valStatus: boolean = false;
        state.players.forEach(player => {
            if (player.PlayerState != PlayerStatus.Connected) {
                valStatus = true;
            }
        });
        if (valStatus) {
            return Response.error('Not all players ready');
        }

        //load all players deck with staring deck based on Roles, and shuffle deck
        state.players.forEach(player => {
            player.Deck = [...mappedStartingDeck[player.Role]];
            //chance.shuffle(player.Deck);
            //draw 5 cards for each player into hand
            dealCards(player.Deck, player.Hand, 5);
            //cards face up
            player.Hand.forEach(card => (card.CardStatus = Cardstatus.FaceUp));
        });

        //load level 'gameLevel(state)' ability cards into working Ability Deck for that game
        state.abilityDeck = abilityCardPool.filter(card => card.Level <= state.gameLevel);
        //shuffle ability deck
        //chance.shuffle(state.abilityDeck);
        //draw 6 cards from ability deck into the ability pile
        dealCards(state.abilityDeck, state.abilityPile, 6);
        //cards face up
        state.abilityPile.forEach(card => (card.CardStatus = Cardstatus.FaceUp));

        //load leveled Monster Cards into active array, and shuffle
        state.monsterDeck = monsterCardPool.filter(card => card.Level <= state.gameLevel);
        //shuffle monster deck
        //chance.shuffle(state.monsterDeck);
        //draw right amount of cards from monster deck into the active Monsters array by level
        dealCards(state.monsterDeck, state.activeMonsters, numberMonstersActiveByLevel[state.gameLevel]);
        //cards face up
        state.activeMonsters.forEach(card => (card.CardStatus = Cardstatus.FaceUp));

        //load appropriate level location cards into active location array
        state.locationDeck = locationCardPool.filter(card => card.Level == state.gameLevel);
        //inverst order by sequence number
        state.locationDeck.sort((a, b): number => {
            return b.Sequence - a.Sequence;
        });
        state.locationPile = state.locationDeck.pop();
        state.locationPile!.CardStatus = Cardstatus.FaceUp;

        //load leveled Tower Defense Cards into active array, and shuffle
        state.towerDefenseDeck = TdCardPool.filter(card => card.Level <= state.gameLevel);
        //chance.shuffle(state.towerDefenseDeck);
        //draw right amount of cards from TD Deck into the active Monsters array by location Card: TD property
        const loopIndex = state.locationPile?.TD || 1;
        dealCards(state.towerDefenseDeck, state.towerDefensePile, loopIndex);
        state.towerDefensePile.forEach(card => (card.CardStatus = Cardstatus.FaceUp));

        //load player id's into turn order array and shuffle, set to index 0 for turn state var
        state.players.forEach(player => {
            playerOrder.push(player.Id);
        });
        //chance.shuffle(playerOrder);
        state.turn = playerOrder[0];

        return Response.ok();
    }

    playCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayCardRequest): Response {
        return Response.error('Not implemented');
    }
    discard(state: InternalState, userId: UserId, ctx: Context, request: IDiscardRequest): Response {
        return Response.error('Not implemented');
    }
    drawCard(state: InternalState, userId: UserId, ctx: Context, request: IDrawCardRequest): Response {
        return Response.error('Not implemented');
    }
    endTurn(state: InternalState, userId: UserId, ctx: Context, request: IEndTurnRequest): Response {
        return Response.error('Not implemented');
    }
    startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
        return Response.error('Not implemented');
    }
    applyAttack(state: InternalState, userId: UserId, ctx: Context, request: IApplyAttackRequest): Response {
        return Response.error('Not implemented');
    }
    buyAbilityCard(state: InternalState, userId: UserId, ctx: Context, request: IBuyAbilityCardRequest): Response {
        return Response.error('Not implemented');
    }
    applyHealth(state: InternalState, userId: UserId, ctx: Context, request: IApplyHealthRequest): Response {
        return Response.error('Not implemented');
    }
    applyChoice(state: InternalState, userId: UserId, ctx: Context, request: IApplyChoiceRequest): Response {
        return Response.error('Not implemented');
    }
    applySelectedUser(state: InternalState, userId: UserId, ctx: Context, request: IApplySelectedUserRequest): Response {
        return Response.error('Not implemented');
    }
    getUserState(state: InternalState, userId: UserId): GameState {
        return state;
    }
}
