import { ElementAttributes } from '..';
import { UI, UIView } from '../ui';

type UserInformation = {
    name: string;
    id: string;
    type: string;
};

export class Role {
    userInfo: UserInformation;
    ui: UIView;

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
            <h3 class="LoginPageheader">Username: \${name}</h3>
            <h3 class="LoginPageheader">ID: \${id}</h3>
            <h3 class="LoginPageheader">Type: \${type}</h3>
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
        //this.ui.element.querySelector('#btnCreateGame').addEventListener('click', this.);
    }

    leaving(element: HTMLElement) {
        this.ui.destroy();
        this.ui = null;
    }
}
