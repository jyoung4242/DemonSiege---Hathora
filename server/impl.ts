import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { TdCardPool, abilityCardPool, playerOrder, joinNewPlayertoGame, setPlayerRole, loadPlayersStartingDecks, setupAbilityDeck, setupMonsterDeck, setupLocationDeck, setupTDDeck, setupPlayerOrder } from './lib/init';
import { RoundState, GameStates, GameState, UserId, IInitializeRequest, IJoinGameRequest, ISelectRoleRequest, IAddAIRequest, IStartGameRequest, IPlayCardRequest, IDiscardRequest, IDrawCardRequest, IEndTurnRequest, IStartTurnRequest, IApplyAttackRequest, IBuyAbilityCardRequest, IApplyHealthRequest, IApplyChoiceRequest, IApplySelectedUserRequest, Cardstatus, errorMessage, ISelectTowerDefenseRequest } from '../api/types';
import { dealCards, applyEffect } from './lib/helper';

export type InternalState = GameState;
//console.log(`Init TdCardPool:`, typeof TdCardPool, TdCardPool);

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
            monsterDiscard: [],
            activeMonsters: [],
            locationDeck: [],
            locationPile: undefined,
            locationDiscard: [],
            towerDefenseDeck: [],
            towerDefensePile: [],
            towerDefenseDiscard: [],
            turn: undefined,
            players: [],
        };
    }

    joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
        //Guard conditions
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
        //Guard condition
        if (state.gameSequence != GameStates.ReadyForRound) Response.error('Not ready to start round');

        loadPlayersStartingDecks(state, ctx);
        setupAbilityDeck(state, ctx);
        setupMonsterDeck(state, ctx);
        setupLocationDeck(state, ctx);
        setupTDDeck(state, ctx);
        setupPlayerOrder(state, ctx);
        state.gameSequence = GameStates.ReadyForRound;
        return Response.ok();
    }

    startTurn(state: InternalState, userId: UserId, ctx: Context, request: IStartTurnRequest): Response {
        if (state.gameSequence != GameStates.ReadyForRound) return Response.error('Not Ready to start round');
        if (userId != state.turn) return Response.error('Not Your turn!');
        state.gameSequence = GameStates.InProgress;
        state.roundSequence = RoundState.TowerDefense;

        //draw right amount of cards from TD Deck into the active Monsters array by location Card: TD property
        const loopIndex = state.locationPile?.TD || 1;
        dealCards(state.towerDefenseDeck, state.towerDefensePile, loopIndex);
        state.towerDefensePile.forEach(card => (card.CardStatus = Cardstatus.FaceUp));
        ctx.broadcastEvent('Enable TD');
        ctx.sendEvent('SelectTD', state.turn);
        return Response.ok();
    }

    selectTowerDefense(state: GameState, userId: string, ctx: Context, request: ISelectTowerDefenseRequest): Response {
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.roundSequence != RoundState.TowerDefense) return Response.error('Not ready for this response yet');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');

        //evaluate effect of TD card
        if (request.response.userData) {
            ctx.sendEvent('i made it', state.turn);
        }

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
