import { ClientState, ElementAttributes, GS } from '../types';
import { reRender } from '..';
import { UI, UIView } from 'peasy-ui';
import { HathoraClient } from '../../../.hathora/client';

export class Login {
    ui: UIView;
    intervalID: NodeJS.Timer;
    state: ClientState;
    classClientReference: HathoraClient;

    model = {
        loginUser: (event, model) => this.login(this.classClientReference),
    };

    constructor(client: HathoraClient, state: ClientState) {
        this.state = state;
        this.classClientReference = client;
    }

    mount(element: HTMLElement) {
        const template = `
        <div>
          <div class="Header">
            <h1 class="LoginPageheader">Login Page</h1>
          </div>
          <button id="btnLogin" \${click @=> loginUser} class="loginButton">Login</button>
        </div>
      `;
        this.ui = UI.create(element, template, this.model);

        this.intervalID = setInterval(() => {
            UI.update();
        }, 1000 / 60);
    }

    login = async (client: HathoraClient) => {
        if (sessionStorage.getItem('token') === null) {
            sessionStorage.setItem('token', await client.loginAnonymous());
        }
        this.state.token = sessionStorage.getItem('token')!;
        this.state.user = HathoraClient.getUserFromToken(this.state.token);
        this.state.type = this.state.user.type;
        reRender(GS.login, GS.lobby);
    };

    leaving() {
        this.ui.destroy();
        this.ui = null;
        clearInterval(this.intervalID);
    }
}
