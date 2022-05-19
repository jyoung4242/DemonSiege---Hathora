import { ClientState, ElementAttributes } from '..';
import { GameStates } from '../../../../api/types';
import { UI, UIView } from '../ui';

export class Role {
    userInfo: ClientState;
    ui: UIView;
    cbRoleChoice: EventListener;
    constructor(roleCB: EventListener) {
        this.cbRoleChoice = roleCB;
    }

    setUserInfo = (u: ClientState) => {
        this.userInfo = u;
    };

    mount(element: HTMLElement) {
        const template = `
        <div>
          <div class="Header">
            <h1 class="LoginPageheader">Choose Roles for Game</h1>
          </div>
          
          <div class="Header">
            <h3 class="LoginPageheader">Username: \${name}</h3>
            <h3 class="LoginPageheader">ID: \${id}</h3>
            <h3 class="LoginPageheader">Type: \${type}</h3>
          </div>
         
          <div class="Header">
            <h5 class="LoginPageheader">Game ID: \${game}</h5>
            <h5 class="LoginPageheader">GameStatus: \${status}</h5>
          </div>
          
          <div class="Header">
            <h5 class="LoginPageheader">Name your character: </h5>
            <input id="characterName" value=\${name} />
          </div>
          
          <div>
            <button id='btnBarbarian' class="loginButton">Barbarian</button>
            <button id='btnWizard' class="loginButton">Wizard</button>
            <button id='btnPaladin' class="loginButton">Paladin</button>
            <button id='btnRogue' class="loginButton">Rogue</button>
            
          </div>
      </div>
      `;

        this.ui = UI.create(element, template, this.userInfo);
        UI.update();
        this.ui.element.querySelector('#btnBarbarian').addEventListener('click', this.cbRoleChoice);
        this.ui.element.querySelector('#btnWizard').addEventListener('click', this.cbRoleChoice);
        this.ui.element.querySelector('#btnPaladin').addEventListener('click', this.cbRoleChoice);
        this.ui.element.querySelector('#btnRogue').addEventListener('click', this.cbRoleChoice);
    }

    leaving(element: HTMLElement) {
        this.ui.destroy();
        this.ui = null;
    }
}
