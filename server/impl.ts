import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { TdCardPool, playerOrder, numberMonstersActiveByLevel, monsterCardDiscardPoolArray, joinNewPlayertoGame, setPlayerRole, loadPlayersStartingDecks } from './lib/init';
import { PlayerStatus, CardType, Roles, RoundState, GameStates, DieFaces, Conditions, LocationCard, TowerDefense, AbilityCard, MonsterCard, Events, Player, GameState, UserId, IInitializeRequest, IJoinGameRequest, ISelectRoleRequest, IAddAIRequest, IStartGameRequest, IPlayCardRequest, IDiscardRequest, IDrawCardRequest, IEndTurnRequest, IStartTurnRequest, IApplyAttackRequest, IBuyAbilityCardRequest, IApplyHealthRequest, IApplyChoiceRequest, IApplySelectedUserRequest, Cardstatus, errorMessage } from '../api/types';
import { loadMonsterCardsFromJSON, loadAbilityCardsFromJSON, loadTDCardsFromJSON, loadLocationCardsFromJSON, dealCards, applyEffect } from './lib/helper';

//import { Chance } from 'chance';
//let chance = new Chance();

export type InternalState = GameState;

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
            gameSequence: GameStates.Idle,
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
        //Gaurd conditions
        if (state.players.length >= 4) return Response.error('Maximum Players Allowed');
        if (state.players.find(player => player.Id === userId) !== undefined) return Response.error('Already joined');

        state.gameSequence = GameStates.PlayersJoining;
        const stsObject: errorMessage = joinNewPlayertoGame(userId, state);
        if (stsObject.status < 0) return Response.error(stsObject.message);
        else return Response.ok();
    }

    selectRole(state: InternalState, userId: UserId, ctx: Context, request: ISelectRoleRequest): Response {
        const stsObject: errorMessage = setPlayerRole(userId, state, request.role);
        if (stsObject.status < 0) return Response.error(stsObject.message);
        else return Response.ok();
    }

    /**
     *
     * DO THIS LAST
     */
    addAI(state: InternalState, userId: UserId, ctx: Context, request: IAddAIRequest): Response {
        return Response.error('Not implemented');
    }

    startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
        if (state.gameSequence != GameStates.ReadyForRound) Response.error('Not ready to start round');

        loadPlayersStartingDecks(state, ctx);

        //load level 'gameLevel(state)' ability cards into working Ability Deck for that game

        //state.abilityDeck = abilityCardPool.filter(card => card.Level <= state.gameLevel);

        //shuffle ability deck

        //state.abilityDeck = ctx.chance.shuffle(state.abilityDeck);

        //draw 6 cards from ability deck into the ability pile

        //dealCards(state.abilityDeck, state.abilityPile, 6);

        //cards face up
        //state.abilityPile.forEach(card => (card.CardStatus = Cardstatus.FaceUp));

        //load leveled Monster Cards into active array, and shuffle
        //state.monsterDeck = monsterCardPool.filter(card => card.Level <= state.gameLevel);
        //shuffle monster deck
        //state.monsterDeck = ctx.chance.shuffle(state.monsterDeck);
        //draw right amount of cards from monster deck into the active Monsters array by level
        //dealCards(state.monsterDeck, state.activeMonsters, numberMonstersActiveByLevel[state.gameLevel]);
        //cards face up
        //state.activeMonsters.forEach(card => (card.CardStatus = Cardstatus.FaceUp));

        //load appropriate level location cards into active location array
        //state.locationDeck = locationCardPool.filter(card => card.Level == state.gameLevel);
        //inverst order by sequence number
        /*state.locationDeck.sort((a, b): number => {
            return b.Sequence - a.Sequence;
        });*/
        //state.locationPile = state.locationDeck.pop();
        //state.locationPile!.CardStatus = Cardstatus.FaceUp;

        //load leveled Tower Defense Cards into active array, and shuffle
        state.towerDefenseDeck = TdCardPool.filter(card => card.Level <= state.gameLevel);
        //state.towerDefenseDeck = ctx.chance.shuffle(state.towerDefenseDeck);

        //load player id's into turn order array and shuffle, set to index 0 for turn state var
        /*state.players.forEach(player => {
            playerOrder.push(player.Id);
        });
        playerOrder = ctx.chance.shuffle(playerOrder);
        state.turn = playerOrder[0];*/
        state.gameSequence = GameStates.ReadyForRound;

        return Response.ok();
    }

    startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
        if (state.gameSequence != GameStates.ReadyForRound) return Response.error('Not Ready to start round');
        if (userId != state.turn) return Response.error('Not Your turn!');
        state.gameSequence = GameStates.InProgress;
        state.roundSequence = RoundState.TowerDefense;

        /*********************
        Tower Defense Round
        *********************/
        //draw right amount of cards from TD Deck into the active Monsters array by location Card: TD property
        const loopIndex = state.locationPile?.TD || 1;
        dealCards(state.towerDefenseDeck, state.towerDefensePile, loopIndex);
        state.towerDefensePile.forEach(card => (card.CardStatus = Cardstatus.FaceUp));

        //For Each TD card in pile, apply effects of card
        state.towerDefensePile.forEach(card => {
            //cycle through each Ability of the TD card
            card.Effects.forEach(effect => {
                applyEffect(state, userId, effect);
            });
        });

        state.eventLog.push();

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
