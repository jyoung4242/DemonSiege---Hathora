import { ClientState } from '../types';
import { UI, UIView } from 'peasy-ui';
import background from '../assets/game assets/background.png';
import mcardback from '../assets/card assets/monster card.png';
import TDcardback from '../assets/card assets/towerdefense.png';
import locationcardback from '../assets/card assets/locationcardnew.png';

export class Game {
    userInfo: ClientState;
    ui: UIView;
    cbLoadDiv: Function;
    buttonCB1: EventListener;
    buttonCB2: EventListener;
    buttonCB3: EventListener;
    mcard: EventListener;
    fcard: EventListener;

    constructor(cb1: Function, cb2: EventListener, cb3: EventListener, cb4: EventListener) {
        this.cbLoadDiv = cb1;
        this.buttonCB1 = cb2;
        this.buttonCB2 = cb3;
        this.buttonCB3 = cb4;
    }

    setUserInfo = (pInfo: ClientState) => {
        this.userInfo = pInfo;
    };

    updateInfo = (pInfo: ClientState) => {
        this.userInfo = pInfo;
        UI.update();
    };

    mount(element: HTMLElement) {
        const template = `
        <div >
          <div id="gamediv">
            <div class="Header">
              <h1 class="LoginPageheader">Enjoy your game!!!</h1>
            </div>
            <div class="Header">
              <h4 class="LoginPageheader">ID: \${id}</h4>
              <h4 class="LoginPageheader">Game ID: \${gameID}</h4>
              <h4 class="LoginPageheader">GameStatus: \${status}</h4>
              <h4 class="LoginPageheader">Game Level: \${gameLevel}</h4>
              <button id="btnStartGame">Start Game</button>
              <button id="btnStartTurn" disabled>Start Turn</button>
              <button id="btnEndTurn" disabled>End Turn</button>
            </div>
            
            <div id="playerHand" class="playersArea">
              <div class="playerHeader">
                <div class="playerHeaderContent"> Players Hand </div>
                <div class="playerHeaderContent">Name: \${name}</div>
                <div class="playerHeaderContent">Role: \${role}</div>
              </div>
              <div class="playerHeader">
                <div class="playerHeaderContent">Health: </div>
                <div class="playerHeaderContent">\${Health}</div>
                <div class="playerHeaderContent">Attack: </div>
                <div class="playerHeaderContent">\${AttackPoints}</div>
                <div class="playerHeaderContent">Ability: </div>
                <div class="playerHeaderContent">\${AbilityPoints}</div>
              </div>
              
              <div id='playerdeck' class='card playerdeck'></div>
              <div class='card playerdiscard'></div>
              <div id='innerPlayerHand' class="hand"></div>
            </div>                    
          
            <div id="other1" class="otherplayer other1 hidden ">
              <div class="otherplayerHeader">
                <div class="otherplayerHeaderContent">\${othername.0}</div>
                <div class="otherplayerHeaderContent">\${otherrole.0}</div>

              </div>
              <div class="otherplayerHeader">
                <div class="otherplayerHeaderContent">H: </div>
                <div class="otherplayerHeaderContent">\${otherHP.0}</div>
                <div class="otherplayerHeaderContent">ATP: </div>
                <div class="otherplayerHeaderContent">\${otherATP.0}</div>
                <div class="otherplayerHeaderContent">ABP: </div>
                <div class="otherplayerHeaderContent">\${otherABP.0}</div>
              </div>
              <div class='smallcard playerdeck'></div>
              <div class='smallcard playerdiscard'></div>
            </div>

            <div id="other2" class="otherplayer other2 hidden">
              <div class="otherplayerHeader">
                <div class="otherplayerHeaderContent">\${othername.1}</div>
                <div class="otherplayerHeaderContent">\${otherrole.1}</div>
              </div>
              <div class="otherplayerHeader">
                <div class="otherplayerHeaderContent">H: </div>
                <div class="otherplayerHeaderContent">\${otherHP.1}</div>
                <div class="otherplayerHeaderContent">ATP: </div>
                <div class="otherplayerHeaderContent">\${otherATP.1}</div>
                <div class="otherplayerHeaderContent">ABP: </div>
                <div class="otherplayerHeaderContent">\${otherABP.1}</div>
              </div>
              <div class='smallcard playerdeck'></div>
              <div class='smallcard playerdiscard'></div>
            </div>

            <div id="other3" class="otherplayer other3 hidden ">
              <div class="otherplayerHeader">
                <div class="otherplayerHeaderContent">\${othername.2}</div>
                <div class="otherplayerHeaderContent">\${otherrole.2}</div>
              </div>
            <div class="otherplayerHeader">
              <div class="otherplayerHeaderContent">H: </div>
              <div class="otherplayerHeaderContent">\${otherHP.2}</div>
              <div class="otherplayerHeaderContent">ATP: </div>
              <div class="otherplayerHeaderContent">\${otherATP.2}</div>
              <div class="otherplayerHeaderContent">ABP: </div>
              <div class="otherplayerHeaderContent">\${otherABP.2}</div>
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
              <div id="Monster1" class="MonsterSpot M1"></div>
              <div id="Monster2" class="MonsterSpot M2"></div>
              <div id="Monster3" class="MonsterSpot M3"></div>
              <div id="MonsterDiscard" class="MonsterSpot MDiscard"><span>Discard</span></div>
            </div>

            <div id="LocationsDiv" class="LocationsDiv">
              <div id="LocDeck" class="LTitle"></div>              
              <div id="LocPile" class="LDeck"></div>
            </div>

            <div id="TDDiv" class="TDDiv">
              <div id="TDDeck" class="TDTitle"></div>              
              <div id="TDPile" class="TDDeck"></div>
            </div>
        </div>
      </div>
      `;

        this.ui = UI.create(element, template, this.userInfo);
        UI.update();
        this.ui.element.querySelector('#btnStartGame').addEventListener('click', this.buttonCB1);
        this.ui.element.querySelector('#btnStartTurn').addEventListener('click', this.buttonCB2);
        this.ui.element.querySelector('#btnEndTurn').addEventListener('click', this.buttonCB3);
        document.body.style.backgroundImage = `url(${background})`;
        document.body.style.backgroundSize = `cover`;
        document.body.style.backgroundRepeat = `no-repeat`;

        let mdeck = document.getElementById('MonsterDeck');
        mdeck.style.backgroundImage = `url(${mcardback})`;
        mdeck.style.backgroundSize = 'contain';
        mdeck.style.backgroundRepeat = 'no-repeat';

        let ldeck = document.getElementById('LocDeck');
        ldeck.style.backgroundImage = `url(${locationcardback})`;
        ldeck.style.backgroundSize = 'contain';
        ldeck.style.backgroundRepeat = 'no-repeat';

        let tdeck = document.getElementById('TDDeck');
        tdeck.style.backgroundImage = `url(${TDcardback})`;
        tdeck.style.backgroundSize = 'contain';
        tdeck.style.backgroundRepeat = 'no-repeat';

        this.cbLoadDiv();
    }

    leaving(element: HTMLElement) {
        this.ui.destroy();
        this.ui = null;
    }
}
