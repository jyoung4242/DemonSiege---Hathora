import { ClientState } from '../types';
import { UI, UIView } from 'peasy-ui';
import background from '../assets/game assets/background.png';
import { HathoraClient, UpdateArgs } from '../../../.hathora/client';
import { GameStates } from '../../../../api/types';
import { bloom, dealLocationCardFromDeck, dealTDcardFromDeck, dealMonsterCardFromDeck, dealPlayerCardFromDeck, runCardPoolAnimation, runPlayerHandAnimation, showStatusEffect, toggleCardpoolDrawer, removeActiveTDCard, runDamageAnimation, userTurn, playMonsterCard } from '../lib/helper';
import { hand } from '../lib/hand';
import { activeLocation, game, towerDefensePile, playerHand } from '..';
import { showOther } from '../lib/events';

//TODO UI processing queue

class GameUI {
    state: ClientState = undefined;
    ui: UIView;
    isDiscard: boolean;
    cardAction: string = 'discard';

    constructor(state: ClientState) {
        this.state = state;
    }
    startGame = () => {
        this.state.myConnection.startGame({});
    };
    startTurn = () => {
        this.state.myConnection.startTurn({});
    };
    drawTD = () => {
        if (document.getElementById('TDDeck').classList.contains('bloom')) {
            let nextTDcard = this.state.towerDefense.pop();
            dealTDcardFromDeck(nextTDcard);
        }
    };
    playTD = () => {
        if (document.getElementById('TDPile').classList.contains('bloom')) {
            this.state.myConnection.selectTowerDefense({ cardname: `${towerDefensePile[0].name}` });
        }
    };
    playM1 = () => {
        if (document.getElementById('Monster1').classList.contains('bloom')) {
            playMonsterCard(1, this.state);
        }
    };
    playM2 = () => {
        if (document.getElementById('Monster2').classList.contains('bloom')) {
            playMonsterCard(2, this.state);
        }
    };
    playM3 = () => {
        if (document.getElementById('Monster3').classList.contains('bloom')) {
            playMonsterCard(3, this.state);
        }
    };

    playerHandClicked = () => {
        console.log(`I'm clicked in the hand`);
        //am i playing cards?
        console.log(`this.state: `, this.state);
        //if(){}
    };

    get showDiscard() {
        return this.isDiscard;
    }

    public create = (elm: HTMLElement, temp: string) => {
        this.ui = UI.create(elm, temp, this);
    };
    public destroy = () => {
        this.ui.destroy();
        this.ui = null;
    };
}

export class Game {
    gameUI: GameUI;
    client: HathoraClient;
    intervalID: NodeJS.Timer;
    myStartFlag: boolean = false;
    myHand;

    constructor(client: HathoraClient, state: ClientState) {
        this.client = client;
        this.gameUI = new GameUI(state);
    }

    mount(element: HTMLElement) {
        const template = `
        <div >
          <div id="damageFlash"></div>
          <div id="discardModal" \${ === showDiscard}>
            <div class="innerModal">Select Card to discard</div>
          </div>
          
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
                  <div \${click@=>playerHandClicked} class='card playerdiscard'></div>
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

        this.gameUI.create(element, template);
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
        this.gameUI.state = state;
        console.log(`updating gameUI state:`, this.gameUI.state, state);
    };

    divLoaded = () => {
        this.gameUI.state.otherid.forEach((player, index) => {
            showOther(index + 1);
        });
    };

    leaving() {
        this.gameUI.destroy();
        this.gameUI.ui = null;
        clearInterval(this.intervalID);
    }
}
