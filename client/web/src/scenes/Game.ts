import { ClientState } from '../types';
import { UI, UIView } from 'peasy-ui';
import background from '../assets/game assets/background.png';
import { HathoraClient, UpdateArgs } from '../../../.hathora/client';
import { GameStates } from '../../../../api/types';
import { bloom, dealLocationCardFromDeck, dealTDcardFromDeck, dealMonsterCardFromDeck, dealPlayerCardFromDeck, runCardPoolAnimation, runPlayerHandAnimation, showStatusEffect, toggleCardpoolDrawer, removeActiveTDCard, runDamageAnimation, userTurn, playMonsterCard } from '../lib/helper';
import { hand } from '../lib/hand';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { activeLocation, game, towerDefensePile } from '..';

export class Game {
    ui: UIView;
    client: HathoraClient;
    intervalID: NodeJS.Timer;
    myStartFlag: boolean = false;
    myHand;
    isDiscard: boolean = false;

    model = {
        state: undefined,
        startGame: () => this.model.state.myConnection.startGame({}),
        startTurn: () => this.model.state.myConnection.startTurn({}),
        drawTD: () => {
            if (document.getElementById('TDDeck').classList.contains('bloom')) {
                let nextTDcard = this.model.state.towerDefense.pop();
                dealTDcardFromDeck(nextTDcard);
            }
        },
        playTD: () => {
            if (document.getElementById('TDPile').classList.contains('bloom')) {
                this.model.state.myConnection.selectTowerDefense({ cardname: `${towerDefensePile[0].name}` });
            }
        },
        playM1: () => {
            console.log(`monster card clicked`);
            if (document.getElementById('Monster1').classList.contains('bloom')) {
                playMonsterCard(1, this.model.state);
            }
        },
        playM2: () => {
            if (document.getElementById('Monster2').classList.contains('bloom')) {
                playMonsterCard(2, this.model.state);
            }
        },
        playM3: () => {
            if (document.getElementById('Monster3').classList.contains('bloom')) {
                playMonsterCard(3, this.model.state);
            }
        },
        get showDiscard() {
            console.clear();
            console.log('flag: ', this.isDiscard);

            return this.isDiscard;
        },
    };

    constructor(client: HathoraClient, state: ClientState) {
        this.client = client;
        this.model.state = state;
        this.isDiscard = false;
    }

    mount(element: HTMLElement) {
        const template = `
        <div >
          <div id="damageFlash"></div>
          <div id="discardModal" \${ === showDiscard}></div>
          
          <div id="gamediv">
            <div class="Header">
              <h1 class="LoginPageheader">Enjoy your game!!!</h1>
            </div>
            <div class="Header">
              <h4 class="LoginPageheader">ID: \${state.id}</h4>
              <h4 class="LoginPageheader">Game ID: \${state.gameID}</h4>
              <h4 class="LoginPageheader">GameStatus: \${state.status}</h4>
              <h4 class="LoginPageheader">Game Level: \${state.gameLevel}</h4>
              <button id="btnStartGame" \${click@=>startGame} >Start Game</button>
              <button id="btnStartTurn" \${click@=>startTurn} disabled>Start Turn</button>
              <button id="btnEndTurn" disabled>End Turn</button>
             
            </div>
            
            <div id="playerHand" class="playerContainer" >
              <div id="playerStatusArea" class="playerStatus"></div>
              <div class="playersArea">
                <div class="playerHeader">
                  <div class="playerHeaderContent"> Players Hand </div>
                  <div class="playerHeaderContent">Name: \${state.name}</div>
                  <div class="playerHeaderContent">Role: \${state.role}</div>
                </div>
                <div class="playerHeader">
                  <div class="playerHeaderContent">Health: </div>
                  <div class="playerHeaderContent">\${state.Health}</div>
                  <div class="playerHeaderContent">Attack: </div>
                  <div class="playerHeaderContent">\${state.AttackPoints}</div>
                  <div class="playerHeaderContent">Ability: </div>
                  <div class="playerHeaderContent">\${state.AbilityPoints}</div>
                </div>
                <div class="playersHandArea" >
                  <div id='playerdeck' class='card playerdeck'></div>
                  <div class='card playerdiscard'></div>
                  <div id='innerPlayerHand' class="hand"></div>
                </div>
              </div>
              
              
             
            </div>          
            
            <div id="other1" class="otherplayer other1 hidden ">
            <div class="otherplayerHeader">
              <div class="otherplayerHeaderContent">\${state.othername.0}</div>
              <div class="otherplayerHeaderContent">\${state.otherrole.0}</div>

            </div>
            <div class="otherplayerHeader">
              <div class="otherplayerHeaderContent">H: </div>
              <div class="otherplayerHeaderContent">\${state.otherHP.0}</div>
              <div class="otherplayerHeaderContent">ATP: </div>
              <div class="otherplayerHeaderContent">\${state.otherATP.0}</div>
              <div class="otherplayerHeaderContent">ABP: </div>
              <div class="otherplayerHeaderContent">\${state.otherABP.0}</div>
            </div>
            <div class='smallcard playerdeck'></div>
            <div class='smallcard playerdiscard'></div>
          </div>

          <div id="other2" class="otherplayer other2 hidden">
            <div class="otherplayerHeader">
              <div class="otherplayerHeaderContent">\${state.othername.1}</div>
              <div class="otherplayerHeaderContent">\${state.otherrole.1}</div>
            </div>
            <div class="otherplayerHeader">
              <div class="otherplayerHeaderContent">H: </div>
              <div class="otherplayerHeaderContent">\${state.otherHP.1}</div>
              <div class="otherplayerHeaderContent">ATP: </div>
              <div class="otherplayerHeaderContent">\${state.otherATP.1}</div>
              <div class="otherplayerHeaderContent">ABP: </div>
              <div class="otherplayerHeaderContent">\${state.otherABP.1}</div>
            </div>
            <div class='smallcard playerdeck'></div>
            <div class='smallcard playerdiscard'></div>
          </div>

          <div id="other3" class="otherplayer other3 hidden ">
            <div class="otherplayerHeader">
              <div class="otherplayerHeaderContent">\${state.othername.2}</div>
              <div class="otherplayerHeaderContent">\${state.otherrole.2}</div>
            </div>
          <div class="otherplayerHeader">
            <div class="otherplayerHeaderContent">H: </div>
            <div class="otherplayerHeaderContent">\${state.otherHP.2}</div>
            <div class="otherplayerHeaderContent">ATP: </div>
            <div class="otherplayerHeaderContent">\${state.otherATP.2}</div>
            <div class="otherplayerHeaderContent">ABP: </div>
            <div class="otherplayerHeaderContent">\${state.otherABP.2}</div>
           </div>
            <div class='smallcard playerdeck'></div>
            <div class='smallcard playerdiscard'></div>
          </div>

          

            <div id="cardPoolDrawer" class="ABcardDrawer">
              <div id="cardPoolDeck" class='card  ABcardDeck'></div>
              
              <div class='card ABspot1'></div>
              <div class='card ABspot2'></div>
              <div class='card ABspot3'></div>
              <div class='card ABspot4'></div>
              <div class='card ABspot5'></div>
              <div class='card ABspot6'></div>
            </div>

            <div id="MonsterDiv" class="MonsterDiv">
              <div id="MonsterTitle" class="MonsterSpotTitle">Monster Cards</div>              
              <div id="MonsterDeck" class="MonsterSpot MDeck"></div>
              <div id="Monster1" \${click@=>playM1} class="MonsterSpot M1"></div>
              <div id="Monster2" \${click@=>playM2} class="MonsterSpot M2"></div>
              <div id="Monster3" \${click@=>playM3} class="MonsterSpot M3"></div>
              <div id="MonsterDiscard" class="MonsterSpot MDiscard"><span>Discard</span></div>
            </div>

            <div id="LocationsDiv" class="LocationsDiv">
              <div id="LocDeck" class="LTitle"></div>              
              <div id="LocPile" class="LDeck"></div>
            </div>

            <div id="TDDiv" class="TDDiv">
              <div id="TDDeck" \${click@=>drawTD} class="TDTitle"></div>              
              <div id="TDPile" \${click@=>playTD} class="TDDeck"></div>
            </div>
        </div>
      </div>
      `;

        this.ui = UI.create(element, template, this.model);
        this.myHand = new hand('innerPlayerHand');
        document.body.style.backgroundImage = `url(${background})`;
        document.body.style.backgroundSize = `cover`;
        document.body.style.backgroundRepeat = `no-repeat`;

        this.divLoaded();
        this.intervalID = setInterval(() => {
            UI.update();
        }, 1000 / 60);
    }

    updateInfo = (state: ClientState) => {
        this.model.state = state;
    };

    showOther(numOtherPlayers: number) {
        const elm = document.getElementById(`other${numOtherPlayers}`);
        elm.classList.remove('hidden');
    }

    divLoaded = () => {
        this.model.state.otherid.forEach((player, index) => {
            this.showOther(index + 1);
        });
    };

    parseEvents(state: UpdateArgs) {
        state.events.forEach((event, eventIndex) => {
            console.log(`EVENT: `, event, ` event Index: `, eventIndex);
            switch (event) {
                case 'Player Joined':
                    if (state.state.players.length > 1) {
                        this.postToastMessage('Player Joined');
                        if (state.state.gameSequence == GameStates.ReadyForRound) {
                            this.showOther(state.state.players.length - 1);
                        } else if (state.state.gameSequence == GameStates.PlayersJoining) {
                            this.showOther(state.state.players.length - 1);
                        }
                    }
                    break;
                case 'game starting':
                    this.postToastMessage('Game Starting');
                    (document.getElementById('btnStartGame') as HTMLButtonElement).disabled = true;
                    //toggleCardpoolDrawer('open');
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
                            runPlayerHandAnimation(state, this);
                        }, 750);
                    });

                    //TODO if other players, load their UI too
                    break;

                case 'ReadyToStartTurn':
                    this.myStartFlag = true;
                    this.postToastMessage('Ready To Start Turn');
                    break;
                case 'Enable TD':
                    this.postToastMessage('Turn Started');
                    let elem = document.getElementById('playerHand');
                    elem.classList.add('openPlayersHand');
                    setTimeout(() => {
                        this.postToastMessage('Player Hand Dealt');
                        //Get cards from state
                        for (let index = 0; index < 5; index++) {
                            let dealtCard = this.model.state.hand.pop();
                            dealPlayerCardFromDeck(dealtCard);
                        }
                        setTimeout(() => {
                            elem.classList.remove('openPlayersHand');
                            bloom(true, 'TDDeck');
                            (document.getElementById('btnStartTurn') as HTMLButtonElement).disabled = true;
                        }, 1000);
                    }, 1000);

                    break;
                case 'SelectTD':
                    break;
                case 'PASSIVE TD EFFECTS':
                    this.postToastMessage('Passive TD Effects');
                    break;
                case 'PASSIVE MONSTER EFFECTS':
                    this.postToastMessage('Passive Monster Effects');
                    break;
                case 'PASSIVE PLAYER EFFECTS':
                    this.postToastMessage('Passive Player Effects');
                    break;
                case 'deal monster card':
                    const nextMonster: string = this.model.state.activeMonsters.pop();
                    dealMonsterCardFromDeck(nextMonster);
                    break;
                case 'deal location card':
                    const nextLocation: string = this.model.state.locationPile;
                    dealLocationCardFromDeck(nextLocation);
                    break;
                case 'STATUS EFFECT - LocationCurseLoseHealth2':
                    showStatusEffect('locationLoseHealth');
                    break;
                case 'STATUS EFFECT - NO DRAW':
                    showStatusEffect('noDraw');
                    break;
                case 'Found TD card':
                    this.postToastMessage('Found TD card');
                    break;
                case 'Health Lowered 2':
                    console.log(`Health Lowered 2`);
                case 'Health Lowered 1':
                    console.log(`Health Lowered 1`);
                    this.postToastMessage('Damage Taken to Player');
                    runDamageAnimation();
                    break;

                case 'UE Discard1':
                    this.postToastMessage('Must Discard 1');
                    this.isDiscard = true;
                    UI.update();
                    console.log(`discard value: `, this.isDiscard);
                    let element = document.getElementById('playerHand');
                    element.classList.add('openPlayersHand');
                    element.style.zIndex = `8`;
                    break;
                case 'discard TD card: 0':
                    this.postToastMessage('Remove TD Card');
                    bloom(false, 'TDPile');
                    removeActiveTDCard();
                    break;
                case 'Enable Current Users Cards':
                    this.postToastMessage('Ready for user to play');
                    console.trace(`enable current user cards`);
                    userTurn(this.model.state);
                    break;
                case 'Add Location 1':
                    console.log(`Add Location 1`);
                    this.postToastMessage('Adding Location point');
                    //Get location card
                    activeLocation[0].addDamage(1);
                    break;
                case 'LOCATION CURSE':
                    this.postToastMessage('Passive Effect - Location Curse');
                    runDamageAnimation();
                    break;
                case 'STATUS EFFECT - DiscardLoseHealth1':
                    showStatusEffect('discardLoseHealth');
                    break;
                case 'Enable Monsters':
                    //show bloom for each active monster
                    for (let i = 1; i < 4; i++) {
                        const card = document.getElementById(`Monster${i}`).firstElementChild;
                        if (card && card.getAttribute('active')) {
                            bloom(true, `Monster${i}`);
                        }
                    }
                    break;
                default:
                    break;
            }
        });
    }

    leaving() {
        this.ui.destroy();
        this.ui = null;
        clearInterval(this.intervalID);
    }

    postToastMessage(messageString) {
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
    }
}
