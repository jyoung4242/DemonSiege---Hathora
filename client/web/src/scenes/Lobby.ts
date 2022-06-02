import { UI, UIView } from 'peasy-ui';
import { reRender, updateState } from '..';
import { HathoraClient } from '../../../.hathora/client';
import { ClientState, GS } from '../types';

export class Lobby {
    client: HathoraClient;
    state: ClientState;
    ui: UIView;
    intervalID: NodeJS.Timer;

    model = {
        name: '',
        id: '',
        newGame: async () => {
            if (location.pathname.length > 1) {
                reRender(GS.lobby, GS.role);
                this.state.myConnection = this.client.connect(this.state.token, location.pathname.split('/').pop()!, updateState, console.error);
                this.state.myConnection.joinGame({});
            } else {
                const stateId = await this.client.create(this.state.token, {});
                this.state.gameID = stateId;
                history.pushState({}, '', `/${stateId}`);
                reRender(GS.lobby, GS.role);
                this.state.myConnection = this.client.connect(this.state.token, stateId, updateState, console.error);
                this.state.myConnection.joinGame({});
            }
        },
        joinGame: () => {
            const gameToJoin = (document.getElementById('joinGameInput') as HTMLInputElement).value;
            this.state.myConnection = this.client.connect(this.state.token, gameToJoin, updateState, console.error);
            this.state.myConnection.joinGame({});
            reRender(GS.lobby, GS.role);
        },
        inputValidation: () => {
            if ((document.getElementById('joinGameInput') as HTMLInputElement).value.length) {
                (document.getElementById('btnJoinGame') as HTMLButtonElement).disabled = false;
            } else {
                (document.getElementById('btnJoinGame') as HTMLButtonElement).disabled = true;
            }
        },
    };

    constructor(client: HathoraClient, state: ClientState) {
        this.client = client;
        this.state = state;
        this.model.name = state.user.name;
        this.model.id = state.user.id;
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
                <input  \${input @=> inputValidation} id="joinGameInput"/>
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
