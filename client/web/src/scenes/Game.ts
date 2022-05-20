import { ClientState } from '..';
import { UI, UIView } from '../ui';

export class Game {
    userInfo: ClientState;
    ui: UIView;
    cbLoadDiv: Function;
    test: EventListener;
    anotherTest: EventListener;
    mcard: EventListener;
    fcard: EventListener;

    constructor(cb1: Function, cb2: EventListener) {
        this.cbLoadDiv = cb1;
        this.test = cb2;
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
              
              <h3 class="LoginPageheader">ID: \${id}</h3>
              <h3 class="LoginPageheader">Type: \${type}</h3>
            </div>
            <div class="Header">
              <h5 class="LoginPageheader">Game ID: \${game}</h5>
              <h5 class="LoginPageheader">GameStatus: \${status}</h5>
              <button id="btnStartGame">Start Game</button>
              <button id="btnStartTurn">Zoom Card</button>
              
            </div>
            
            <div id="playerHand" class="playersArea">
              <div class="playerHeader">
                <div class="playerHeaderContent"> Players Hand </div>
                <div class="playerHeaderContent">Name: \${name}</div>
                <div class="playerHeaderContent">Role: \${role}</div>
              </div>
              <div class = "playerHeader">
                <div class="playerHeaderContent">Health: </div>
                <div class="playerHeaderContent">\${Health}</div>
                <div class="playerHeaderContent">Attack: </div>
                <div class="playerHeaderContent">\${AttackPoints}</div>
                <div class="playerHeaderContent">Ability: </div>
                <div class="playerHeaderContent">\${AbilityPoints}</div>
              </div>
              
              <div class='card playerdeck'>Deck</div>
              <div class='card playerdiscard'>Discard</div>
            </div>                    
          
            <div id="other1" class="otherplayer other1 hidden ">
              <div class="otherplayerHeader">
                <div class="otherplayerHeaderContent">\${othername.0}</div>
                <div class="otherplayerHeaderContent">\${otherrole.0}</div>

              </div>
              <div class = "otherplayerHeader">
                <div class="otherplayerHeaderContent">H: </div>
                <div class="otherplayerHeaderContent">\${otherHP.0}</div>
                <div class="otherplayerHeaderContent">ATP: </div>
                <div class="otherplayerHeaderContent">\${otherATP.0}</div>
                <div class="otherplayerHeaderContent">ABP: </div>
                <div class="otherplayerHeaderContent">\${otherABP.0}</div>
              </div>
              <div class='smallcard playerdeck'>Deck</div>
              <div class='smallcard playerdiscard'>Discard</div>
            </div>

            <div id="other2" class="otherplayer other2 hidden">
            <div class="otherplayerHeader">
            <div class="otherplayerHeaderContent">\${othername.1}</div>
            <div class="otherplayerHeaderContent">\${otherrole.1}</div>

          </div>
          <div class = "otherplayerHeader">
            <div class="otherplayerHeaderContent">H: </div>
            <div class="otherplayerHeaderContent">\${otherHP.1}</div>
            <div class="otherplayerHeaderContent">ATP: </div>
            <div class="otherplayerHeaderContent">\${otherATP.1}</div>
            <div class="otherplayerHeaderContent">ABP: </div>
            <div class="otherplayerHeaderContent">\${otherABP.1}</div>
          </div>
              <div class='smallcard playerdeck'>Deck</div>
              <div class='smallcard playerdiscard'>Discard</div>
            </div>

            <div id="other3" class="otherplayer other3 hidden ">
            <div class="otherplayerHeader">
            <div class="otherplayerHeaderContent">\${othername.2}</div>
            <div class="otherplayerHeaderContent">\${otherrole.2}</div>

          </div>
          <div class = "otherplayerHeader">
            <div class="otherplayerHeaderContent">H: </div>
            <div class="otherplayerHeaderContent">\${otherHP.2}</div>
            <div class="otherplayerHeaderContent">ATP: </div>
            <div class="otherplayerHeaderContent">\${otherATP.2}</div>
            <div class="otherplayerHeaderContent">ABP: </div>
            <div class="otherplayerHeaderContent">\${otherABP.2}</div>
          </div>
              <div class='smallcard playerdeck'>Deck</div>
              <div class='smallcard playerdiscard'>Discard</div>
            </div>
        </div>

      </div>
      `;

        this.ui = UI.create(element, template, this.userInfo);
        UI.update();
        this.ui.element.querySelector('#btnStartGame').addEventListener('click', this.test);
        //this.ui.element.querySelector('#btnStartTurn').addEventListener('click', this.anotherTest);

        this.cbLoadDiv();
    }

    leaving(element: HTMLElement) {
        this.ui.destroy();
        this.ui = null;
    }
}
