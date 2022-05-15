import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { TdCardPool, abilityCardPool, playerOrder, joinNewPlayertoGame, setPlayerRole, loadPlayersStartingDecks, setupAbilityDeck, setupMonsterDeck, setupLocationDeck, setupTDDeck, setupPlayerOrder } from './lib/init';
import { RoundState, GameStates, GameState, UserId, IInitializeRequest, IJoinGameRequest, ISelectRoleRequest, IAddAIRequest, IStartGameRequest, IDrawCardRequest, IDiscardRequest, IEndTurnRequest, IStartTurnRequest, IApplyAttackRequest, IBuyAbilityCardRequest, IApplyHealthRequest, IApplyChoiceRequest, IApplySelectedUserRequest, Cardstatus, ErrorMessage, ISelectTowerDefenseRequest, ISelectMonsterCardRequest, TowerDefense, Cards, ISelectPlayerCardRequest } from '../api/types';
import { dealCards, discard, checkPassiveTDEffects, checkPassiveMonsterEffects, checkPassivePlayerEffects } from './lib/helper';
import { applyActiveEffect } from './lib/effects';

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
        const stsObject: ErrorMessage = joinNewPlayertoGame(userId, state);
        if (stsObject.status < 0) return Response.error(stsObject.message);
        else return Response.ok();
    }

    selectRole(state: InternalState, userId: UserId, ctx: Context, request: ISelectRoleRequest): Response {
        const stsObject: ErrorMessage = setPlayerRole(userId, state, request.role);
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

        ctx.broadcastEvent('PASSIVE TD EFFECTS');
        checkPassiveTDEffects(state, ctx);

        ctx.broadcastEvent('PASSIVE MONSTER EFFECTS');
        checkPassiveMonsterEffects(state, ctx);

        ctx.broadcastEvent('PASSIVE PLAYER EFFECTS');
        checkPassivePlayerEffects(state, ctx);

        ctx.broadcastEvent('Enable TD');
        ctx.sendEvent('SelectTD', state.turn);
        return Response.ok();
    }

    selectTowerDefense(state: GameState, userId: string, ctx: Context, request: ISelectTowerDefenseRequest): Response {
        console.log('TD method from client');
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.roundSequence != RoundState.TowerDefense) return Response.error('Not ready for this response yet');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');
        //check for card data
        if (!request.cardname.length) return Response.error('no card submitted');

        //find card in state
        const index = state.towerDefensePile.findIndex(card => card.Title == request.cardname);
        if (index < 0) return Response.error('Invalid Card Played');

        //cards matchup
        ctx.sendEvent('Found TD card', state.turn);
        // found card, so implement effect

        let cardObject: Cards = { type: 'TowerDefense', val: state.towerDefensePile[index] };
        applyActiveEffect(state, state.turn, cardObject, ctx);

        //once played,flip card and move to discard
        state.towerDefensePile[index].CardStatus = Cardstatus.FaceDown;
        discard(state.towerDefensePile, state.towerDefenseDiscard, index);
        ctx.broadcastEvent(`discard TD card: ${index}`);

        // check if other TD cards to play
        if (state.towerDefensePile.length) {
            //play next td card
            ctx.broadcastEvent('Enable TD');
            ctx.sendEvent('SelectTD', state.turn);
        } else {
            //move on to monster cards
            //check if any active monsters are enabled
            if (state.activeMonsters.every(card => card.CardStatus == Cardstatus.FaceUpDisabled)) {
                //all disabled
                //all monster cards done
                state.roundSequence = RoundState.PlayerTurn;
                ctx.broadcastEvent('Enable Current Users Cards');
                console.log(`Moving on to Players cards`);
            } else {
                state.roundSequence = RoundState.MonsterCard;
                ctx.broadcastEvent('Enable Monsters');
                console.log(`Moving on to Monster cards`);
            }
        }
        // if empty, move gamestate onto monstercard

        return Response.ok();
    }

    selectMonsterCard(state: GameState, userId: string, ctx: Context, request: ISelectMonsterCardRequest): Response {
        console.log('Monster Card method from client');
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.roundSequence != RoundState.MonsterCard) return Response.error('Not ready for this response yet');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');
        //check for card data
        if (!request.cardname.length) return Response.error('no card submitted');

        //find index of card sent
        const index = state.activeMonsters.findIndex(card => card.Title == request.cardname);
        if (index < 0) return Response.error('Invalid Card Played');

        //Gaurd condition, card submitted doesn't have an Active Effect
        if (!state.activeMonsters[index].ActiveEffect) return Response.error('Invalid Card Played');

        //cards matchup
        ctx.sendEvent('Monster Card Effect being applied', state.turn);
        // found card, so implement effect
        let cardObject: Cards = {
            type: 'MonsterCard',
            val: state.activeMonsters[index],
        };
        applyActiveEffect(state, state.turn, cardObject, ctx);
        state.activeMonsters[index].CardStatus = Cardstatus.FaceUpDisabled;

        //check for additional monster cards that aren't disabled
        if (state.activeMonsters.every(card => card.CardStatus == Cardstatus.FaceUpDisabled)) {
            //all monster cards done
            state.roundSequence = RoundState.PlayerTurn;
            ctx.broadcastEvent('Enable Current Users Cards');
            console.log(`Moving on to Players cards`);
        } else {
            //more monster cards to process
            state.roundSequence = RoundState.MonsterCard;
            ctx.broadcastEvent('Next Monster Card');
            console.log(`Next Monster Card`);
        }

        return Response.ok();
    }
    selectPlayerCard(state: GameState, userId: string, ctx: Context, request: ISelectPlayerCardRequest): Response {
        console.log('Monster Card method from client');
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.roundSequence != RoundState.PlayerTurn) return Response.error('Not ready for this response yet');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');
        //check for card data
        if (!request.cardname.length) return Response.error('no card submitted');

        //find player index
        const playerIndex = state.players.findIndex(player => player.Id == userId);
        if (playerIndex < 0) return Response.error('invalid player submission');

        //find index of card sent
        const index = state.players[playerIndex].Hand.findIndex(card => card.Title == request.cardname);
        if (index < 0) return Response.error('Invalid Card Played');

        //cards matchup
        ctx.sendEvent('Player Card Effect being applied', state.turn);
        // found card, so implement effect
        let cardObject: Cards = {
            type: 'AbilityCard',
            val: state.players[playerIndex].Hand[index],
        };
        applyActiveEffect(state, state.turn, cardObject, ctx);
        state.activeMonsters[index].CardStatus = Cardstatus.FaceUpDisabled;

        return Response.ok();
    }

    discard(state: InternalState, userId: UserId, ctx: Context, request: IDiscardRequest): Response {
        const index = state.players.findIndex(p => p.Id == userId);
        const cardspot = state.players[index].Hand.findIndex(c => c.Title == request.card.Title);
        state.players[index].Hand = state.players[index].Hand.slice(cardspot, cardspot + 1);
        ctx.broadcastEvent(`USER: ${userId} Discarded ${request.card}`);

        //TBD - Check for discard status effects here

        return Response.ok();
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
