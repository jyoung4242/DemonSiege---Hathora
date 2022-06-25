import { ClientState, GS } from '../types';
import { reRender } from '..';
import { UI, UIView } from 'peasy-ui';
import { HathoraClient } from '../../../.hathora/client';

export class Login {
    ui: UIView;
    intervalID: NodeJS.Timer;
    state: ClientState;
    client: HathoraClient;

    model = {
        loginUser: () => this.login(this.client),
    };

    constructor(client: HathoraClient, state: ClientState) {
        this.state = state;
        this.client = client;
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

        console.log(`UI loaded`);
    }

    login = async (client: HathoraClient) => {
        (document.getElementById('btnLogin') as HTMLButtonElement).disabled = true;
        if (sessionStorage.getItem('token') === null) {
            sessionStorage.setItem('token', await client.loginAnonymous());
        }
        console.log(`checking session`);
        this.state.token = sessionStorage.getItem('token')!;
        console.log(`getting token`);
        this.state.user = HathoraClient.getUserFromToken(this.state.token);
        console.log(`got token`);
        this.state.username = this.state.user.name;
        this.state.type = this.state.user.type;
        reRender(GS.login, GS.lobby);
    };

    leaving() {
        this.ui.destroy();
        this.ui = null;
        clearInterval(this.intervalID);
    }
}
