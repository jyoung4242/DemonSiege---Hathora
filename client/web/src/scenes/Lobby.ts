import { ElementAttributes } from '..';
import { UI, UIView } from '../ui';

type UserInformation = {
    name: string;
    id: string;
    type: string;
};

export class Lobby {
    userInfo: UserInformation;
    createNGM: EventListener;
    joinEGM: EventListener;
    inputchanged: EventListener;
    ui: UIView;

    constructor(cb1: EventListener, cb2: EventListener, cb3: EventListener) {
        this.createNGM = cb1;
        this.joinEGM = cb2;
        this.inputchanged = cb3;
    }

    setUserInfo = (u: UserInformation) => {
        this.userInfo = u;
    };

    mount(element: HTMLElement) {
        const template = `
        <div>
          <div class="Header">
            <h1 class="LoginPageheader">Welcome to the Lobby</h1>
          </div>
          <div class="Header">
            <h3 class="LoginPageheader">Username: \${name}</h3>
            <h3 class="LoginPageheader">ID: \${id}</h3>
            <h3 class="LoginPageheader">Type: \${type}</h3>
          </div>
          <button id='btnCreateGame' class="loginButton">Create New Game</button>
          
          <div>
            <input id="joinGameInput"/>
            <button id='btnJoinGame' class="loginButton" disabled>Join Existing Game</button>
          </div>
      </div>
      `;

        this.ui = UI.create(element, template, this.userInfo);
        UI.update();
        this.ui.element.querySelector('#btnCreateGame').addEventListener('click', this.createNGM);
        this.ui.element.querySelector('#btnJoinGame').addEventListener('click', this.joinEGM);
        this.ui.element.querySelector('#joinGameInput').addEventListener('change', this.inputchanged);
    }

    leaving(element: HTMLElement) {
        this.ui.destroy();
        this.ui = null;
    }
}
