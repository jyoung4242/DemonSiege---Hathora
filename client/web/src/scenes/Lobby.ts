import { UI, UIView } from 'peasy-ui';
import { HathoraClient } from '../../../.hathora/client';
import { ClientState } from '../types';

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
    intervalID: NodeJS.Timer;

    model = {
        name: '',
        id: '',
        newGame: () => {
            console.log(`Here`);
        },
        joinGame: () => {
            console.log(`Join Here`);
        },
        input: '',
    };

    constructor(client: HathoraClient, state: ClientState) {
        this.model.name = state.name;
        this.model.id = state.id;
    }

    mount(element: HTMLElement) {
        const template = `
        <div>
          <div class="Header">
            <h1 class="LoginPageheader">Welcome to the Lobby</h1>
          </div>
          <div class="Header">
            <h3 class="LoginPageheader">Username: \${name}</h3>
            <h3 class="LoginPageheader">ID: \${id}</h3>
            
          </div>
          <button id='btnCreateGame' \${click @=> newGame} class="loginButton">Create New Game</button>
          
          <div>
            <input id="joinGameInput"/>
            <button id='btnJoinGame' \${click @=> joinGame} class="loginButton" disabled>Join Existing Game</button>
          </div>
      </div>
      `;
        this.ui = UI.create(element, template, this.model);

        this.intervalID = setInterval(() => {
            UI.update();
        }, 1000 / 60);
    }

    leaving() {
        this.ui.destroy();
        this.ui = null;
        clearInterval(this.intervalID);
    }
}
