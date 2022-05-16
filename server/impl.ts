import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { playerOrder, joinNewPlayertoGame, setPlayerRole, loadPlayersStartingDecks, setupAbilityDeck, setupMonsterDeck, setupLocationDeck, setupTDDeck, setupPlayerOrder } from './lib/init';
import { RoundState, GameStates, GameState, UserId, IInitializeRequest, IJoinGameRequest, ISelectRoleRequest, IAddAIRequest, IStartGameRequest, IDrawCardRequest, IDiscardRequest, IEndTurnRequest, IStartTurnRequest, IApplyAttackRequest, IBuyAbilityCardRequest, Cardstatus, ErrorMessage, ISelectTowerDefenseRequest, ISelectMonsterCardRequest, TowerDefense, Cards, ISelectPlayerCardRequest } from '../api/types';
import { dealCards, discard, checkPassiveTDEffects, checkPassiveMonsterEffects, checkPassivePlayerEffects, nextPlayer } from './lib/helper';
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
        state.players[playerIndex].Hand[index].CardStatus = Cardstatus.FaceUpDisabled;

        //check for additional ability cards that aren't disabled
        if (state.players[playerIndex].Hand.every(card => card.CardStatus == Cardstatus.FaceUpDisabled)) {
            //all cards in hand are done

            ctx.broadcastEvent('All Cards Played');
            console.log(`No more cards in players hand`);
        } else {
            //more monster cards to process
            state.roundSequence = RoundState.PlayerTurn;
            ctx.broadcastEvent('Next Ability Card in Players Hand');
            console.log(`Next Players Card`);
        }

        return Response.ok();
    }

    discard(state: InternalState, userId: UserId, ctx: Context, request: IDiscardRequest): Response {
        console.log('Discarding Card from Hand');
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');

        //find player index
        const playerIndex = state.players.findIndex(player => player.Id == userId);
        if (playerIndex < 0) return Response.error('invalid player submission');

        const cardIndex = state.players[playerIndex].Hand.findIndex(c => c.Title == request.cardname);
        discard(state.players[playerIndex].Hand, state.players[playerIndex].Discard, cardIndex);
        ctx.broadcastEvent(`USER: ${userId} Discarded ${request.cardname}`);

        //TODO - Check for discard status effects here

        return Response.ok();
    }

    drawCard(state: InternalState, userId: UserId, ctx: Context, request: IDrawCardRequest): Response {
        console.log('Drawing Card from Deck');
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');

        //check for card data
        if (!request.cardname.length) return Response.error('no card submitted');

        //find player index
        const playerIndex = state.players.findIndex(player => player.Id == userId);
        if (playerIndex < 0) return Response.error('invalid player submission');

        //confirm cards in deck
        if (state.players[playerIndex].Deck.length == 0) {
            //TODO, reshuffle and replace deck with discard pile
        }

        dealCards(state.players[playerIndex].Deck, state.players[playerIndex].Hand, 1);
        ctx.sendEvent('new card dealt', userId);

        return Response.ok();
    }
    endTurn(state: InternalState, userId: UserId, ctx: Context, request: IEndTurnRequest): Response {
        state.roundSequence = RoundState.End;
        ctx.broadcastEvent('All Cards Played');
        console.log(`No more cards in players hand`);
        nextPlayer(state);
        return Response.ok();
    }

    applyAttack(state: InternalState, userId: UserId, ctx: Context, request: IApplyAttackRequest): Response {
        console.log('Attacking Monster');
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.roundSequence != RoundState.PlayerTurn) return Response.error('Not ready for this response yet');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');
        //check for card data
        if (!request.cardname.length) return Response.error('no card submitted');

        //find monstercard
        const monsterIndex = state.activeMonsters.findIndex(monster => monster.Title == request.cardname);
        if (monsterIndex < 0) return Response.error('invalid monster submission');

        ctx.broadcastEvent('Attacking Monster');
        state.activeMonsters[monsterIndex].Damage += 1;
        if (state.activeMonsters[monsterIndex].Damage == state.activeMonsters[monsterIndex].Health) {
            //do something, cuz monster done
            ctx.broadcastEvent('Monster Defeated!');
            /*TODO DEFEATED MONSTER CODE */
        }

        return Response.ok();
    }

    buyAbilityCard(state: InternalState, userId: UserId, ctx: Context, request: IBuyAbilityCardRequest): Response {
        console.log('Purchasing Ability Card');
        if (userId != state.turn) return Response.error('Not your turn, please wait');
        if (state.roundSequence != RoundState.PlayerTurn) return Response.error('Not ready for this response yet');
        if (state.gameSequence != GameStates.InProgress) return Response.error('Not ready for this response yet');
        //check for card data
        if (!request.cardname.length) return Response.error('no card submitted');

        //find player index
        const playerIndex = state.players.findIndex(player => player.Id == userId);
        if (playerIndex < 0) return Response.error('invalid player submission');

        //find ability card in pool
        const ABcardIndex = state.abilityPile.findIndex(card => card.Title == request.cardname);
        if (ABcardIndex < 0) return Response.error('invalid ability card submission');

        //check if player can afford cost of card
        if (state.players[playerIndex].AbilityPoints < state.abilityPile[ABcardIndex].Cost) return Response.error('Card too expensive, choose another card');

        //withdraw points from player, and move card to discard pile
        const costOfCard = state.abilityPile[ABcardIndex].Cost;
        state.players[playerIndex].AbilityPoints -= costOfCard;
        discard(state.abilityPile, state.players[playerIndex].Discard, ABcardIndex);

        return Response.ok();
    }

    getUserState(state: InternalState, userId: UserId): GameState {
        return state;
    }
}
