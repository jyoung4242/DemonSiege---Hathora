import { UpdateArgs } from '../../../.hathora/client';
import { UIManager } from '../lib/UI-Manager';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { GameStates } from '../../../../api/types';
import { bloom, dealLocationCardFromDeck, dealMonsterCardFromDeck, dealPlayerCardFromDeck, removeActiveTDCard, runCardPoolAnimation, runDamageAnimation, runPlayerHandAnimation, showGameUI, showStatusEffect, sleep, userTurn } from './helper';
import { playerInfo, game, gameStatus, activeLocation } from '..';

export let UILockID: string = '';

export const postToastMessage = messageString => {
    Toastify({
        text: messageString,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: false, // Prevents dismissing of toast on hover
        style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
    }).showToast();
};

export const showOther = (numOtherPlayers: number) => {
    const elm = document.getElementById(`other${numOtherPlayers}`);
    elm.classList.remove('hidden');
};

export const parseEvents = (state: UpdateArgs, UIM: UIManager) => {
    state.events.forEach((event, eventIndex) => {
        console.log(`EVENT: `, event, ` event Index: `, eventIndex);
        switch (event) {
            case 'Player Joined':
                UIM.addQue(playersJoining, []);

                break;
            case 'game starting':
                UIM.addQue(runCardPoolAnimation, []);
                UIM.addQue(showGameUI, []);
                UIM.addQue(runPlayerHandAnimation, []);

                /* 
                runCardPoolAnimation().then(() => {
                    //next animation - Monster Deck
                    const allAnimations = document.getAnimations();
                    console.log(`Animations: `, allAnimations);
                    allAnimations.forEach(anim => anim.cancel());
                    console.log(`Animations: `, allAnimations);
                    document.getElementById('MonsterDiv').classList.add('fadeIn');
                    document.getElementById('LocationsDiv').classList.add('fadeIn');
                    document.getElementById('TDDiv').classList.add('fadeIn');
                    setTimeout(() => {
                        runPlayerHandAnimation(this.gameUI.state, this);
                    }, 750); 
                });*/

                //TODO if other players, load their UI too
                break;

            case 'ReadyToStartTurn':
                UIM.addQue(ReadyToStartTurn, []);
                break;
            case 'Enable TD':
                UIM.addQue(enableTD, []);
                UIM.addQue(dealCards, []);
                UIM.addQue(highlightTD, []);
                break;
            case 'SelectTD':
                break;
            case 'PASSIVE TD EFFECTS':
                postToastMessage('Passive TD Effects');
                break;
            case 'PASSIVE MONSTER EFFECTS':
                postToastMessage('Passive Monster Effects');
                break;
            case 'PASSIVE PLAYER EFFECTS':
                postToastMessage('Passive Player Effects');
                break;
            case 'deal monster card':
                UIM.addQue(dealMonster, []);
                break;
            case 'deal location card':
                UIM.addQue(dealLocation, []);
                break;
            case 'STATUS EFFECT - LocationCurseLoseHealth2':
                showStatusEffect('locationLoseHealth');
                break;
            case 'STATUS EFFECT - NO DRAW':
                showStatusEffect('noDraw');
                break;
            case 'Found TD card':
                postToastMessage('Found TD card');
                break;
            case 'Health Lowered 2':
            case 'Health Lowered 1':
                postToastMessage('Damage Taken to Player');
                runDamageAnimation();
                break;

            case 'UE Discard1':
                UILockID = UIM.lockUI(() => {
                    postToastMessage('Must Discard 1');
                    game.myHand.cards.forEach(card => {
                        console.log(`card: `, card);
                        card.setCardAction('discard', playerInfo);
                    });
                    game.isDiscard = true;
                    let element = document.getElementById('playerHand');
                    element.classList.add('openPlayersHand');
                    element.style.zIndex = `8`;
                }, []);

                break;
            case 'discard TD card: 0':
                UIM.addQue(discardTD, []);
                break;
            case 'Enable Current Users Cards':
                UIM.addQue(enableUserCards, []);
                break;
            case 'Add Location 1':
                UIM.addQue(add1location, []);
                break;
            case 'LOCATION CURSE':
                UIM.addQue(locationcurse, []);
                break;
            case 'STATUS EFFECT - DiscardLoseHealth1':
                showStatusEffect('discardLoseHealth');
                break;
            case 'Enable Monsters':
                UIM.addQue(enableMonsters, []);
                break;
            default:
                //parse event string
                let eventArray = event.split(':');
                switch (eventArray[0]) {
                    case 'DISCARD':
                        UIM.clearLock(UILockID, discardroutine, [eventArray]);
                        break;
                }
                break;
        }
    });
};

export const playersJoining = async () => {
    let promise = new Promise((resolve, reject) => {
        if (playerInfo.othername.length > 0) {
            postToastMessage('Player Joined');
            if (gameStatus == GameStates.ReadyForRound) {
                showOther(playerInfo.othername.length);
            } else if (gameStatus == GameStates.PlayersJoining) {
                showOther(playerInfo.othername.length - 1);
            }
        }
    });
    return promise;
};

export const ReadyToStartTurn = () => {
    let promise = new Promise((resolve, reject) => {
        game.myStartFlag = true;
        postToastMessage('Ready To Start Turn');
        resolve('done');
    });
    return promise;
};

export const enableTD = () => {
    let promise = new Promise((resolve, reject) => {
        postToastMessage('Turn Started');
        let elem = document.getElementById('playerHand');
        elem.classList.add('openPlayersHand');
        sleep(1000);
        resolve('done');
    });
    return promise;
};

export const dealCards = () => {
    let promise = new Promise((resolve, reject) => {
        postToastMessage('Player Hand Dealt');
        let elem = document.getElementById('playerHand');
        //Get cards from state
        for (let index = 0; index < 5; index++) {
            let dealtCard = playerInfo.hand.pop();
            dealPlayerCardFromDeck(dealtCard);
        }
        sleep(1000);
        elem.classList.remove('openPlayersHand');
        resolve('done');
    });
    return promise;
};

export const highlightTD = () => {
    let promise = new Promise((resolve, reject) => {
        bloom(true, 'TDDeck');
        (document.getElementById('btnStartTurn') as HTMLButtonElement).disabled = true;
        resolve('done');
    });
    return promise;
};

export const dealMonster = () => {
    const nextMonster: string = playerInfo.activeMonsters.pop();
    dealMonsterCardFromDeck(nextMonster);
};

export const dealLocation = () => {
    const nextLocation: string = playerInfo.locationPile;
    dealLocationCardFromDeck(nextLocation);
};

export const discardTD = () => {
    postToastMessage('Remove TD Card');
    bloom(false, 'TDPile');
    removeActiveTDCard();
};

export const enableUserCards = () => {
    postToastMessage('Ready for user to play');
    console.trace(`enable current user cards`);
    game.myHand.cards.forEach(card => {
        card.setCardAction('play', playerInfo);
    });
    let playertray = document.getElementById('playerHand');
    playertray.classList.add('openPlayersHand');
    userTurn(playerInfo);
};

export const add1location = () => {
    postToastMessage('Adding Location point');
    activeLocation[0].addDamage(1);
};

export const locationcurse = () => {
    postToastMessage('Passive Effect - Location Curse');
    runDamageAnimation();
};

export const enableMonsters = () => {
    //show bloom for each active monster
    for (let i = 1; i < 4; i++) {
        const card = document.getElementById(`Monster${i}`).firstElementChild;
        if (card && card.getAttribute('active')) {
            bloom(true, `Monster${i}`);
        }
    }
};

export const discardroutine = eventArray => {
    let elem = document.getElementById('playerHand');
    postToastMessage(`user ${eventArray[2]} has discarded ${eventArray[4]}`);
    game.gameUI.isDiscard = false;
    game.myHand.cards.forEach(card => {
        card.setCardAction('idle', playerInfo);
    });
    elem.classList.remove('openPlayersHand');
    elem.style.zIndex = `1`;
    game.myHand.organizeCards();
};
