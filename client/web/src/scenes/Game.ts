import { ElementAttributes } from '..';
import { GameStates } from '../../../../api/types';
import { UI, UIView } from '../ui';

type UserInformation = {
    name: string;
    id: string;
    type: string;
    game: string;
    status: string;
    role: string;
};

export class Game {
    userInfo: UserInformation;
    ui: UIView;
    cbRoleChoice: EventListener;
    constructor() {}

    setUserInfo = (u: UserInformation) => {
        this.userInfo = u;
    };

    mount(element: HTMLElement) {
        const template = `
        <div>
          <div class="Header">
            <h1 class="LoginPageheader">Choose Roles for Game</h1>
          </div>
          <div class="Header">
            
            <h3 class="LoginPageheader">ID: \${id}</h3>
            <h3 class="LoginPageheader">Type: \${type}</h3>
          </div>
          <div class="Header">
            <h5 class="LoginPageheader">Game ID: \${game}</h5>
            <h5 class="LoginPageheader">GameStatus: \${status}</h5>
            <button>Start Game</button>
            <button>Start Turn</button>
          </div>
          
          <div class="playersArea">
            <div class="playerHeader">
              <div class="playerHeaderContent"> Players Hand </div>
              <div class="playerHeaderContent">Username: \${name}</div>
              <div class="playerHeaderContent">Role: \${role}</div>
            </div>
            <div class = "playerHeader">
              <div class="playerHeaderContent">Health: </div>
              <div class="playerHeaderContent">10</div>
              <div class="playerHeaderContent">Attack: </div>
              <div class="playerHeaderContent">0</div>
              <div class="playerHeaderContent">Ability: </div>
              <div class="playerHeaderContent">0</div>
            </div>
            <div class='card playerdeck'>Deck</div>
            <div class='card playerdiscard'>Discard</div>
          </div>                    
         
      </div>
      `;

        this.ui = UI.create(element, template, this.userInfo);
        UI.update();
    }

    leaving(element: HTMLElement) {
        this.ui.destroy();
        this.ui = null;
    }
}
