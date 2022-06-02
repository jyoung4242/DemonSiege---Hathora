import { ClientState, GS } from '../types';
import { UI, UIView } from '../ui';
import { HathoraClient } from '../../../.hathora/client';
import { Roles } from '../../../../api/types';
import { reRender } from '..';

export class Role {
    ui: UIView;
    state: ClientState;
    client: HathoraClient;
    intervalID: NodeJS.Timer;

    model = {
        name: '',
        gameID: '',
        status: '',
        id: '',
        setBarbarian: () => {
            this.state.myConnection.selectRole({ role: Roles.Barbarian });
            reRender(GS.role, GS.game);
        },
        setWizard: () => {
            this.state.myConnection.selectRole({ role: Roles.Wizard });
            reRender(GS.role, GS.game);
        },
        setPaladin: () => {
            this.state.myConnection.selectRole({ role: Roles.Paladin });
            reRender(GS.role, GS.game);
        },
        setRogue: () => {
            this.state.myConnection.selectRole({ role: Roles.Rogue });
            reRender(GS.role, GS.game);
        },
        characterName: ``,
    };

    constructor(client: HathoraClient, state: ClientState) {
        this.state = state;
        this.client = client;
        console.log(`state:`, state);
        this.model.name = state.username;
        this.model.gameID = state.gameID;
        this.model.status = state.status;
        this.model.id = state.user.id;
        this.model.characterName = 'Enter Name';
        console.log(`model:`, this.model);
    }

    mount(element: HTMLElement) {
        const template = `
        <div>
          <div class="Header">
            <h1 class="LoginPageheader">Choose Roles for Game</h1>
          </div>
          
          <div class="Header">
            <h3 class="LoginPageheader">Username: \${name}</h3>
            <h3 class="LoginPageheader">ID: \${id}</h3>
            <h3 class="LoginPageheader">Game ID: \${gameID}</h3>
            <h3 class="LoginPageheader">GameStatus: \${status}</h3>
          </div>
                   
          <div class="Header">
            <h5 class="LoginPageheader">Name your character: </h5>
            <input id="charName" \${value<=>characterName}/>
          </div>
          
          <div>
            <button id='btnBarbarian' class="loginButton">Barbarian</button>
            <button id='btnWizard' class="loginButton">Wizard</button>
            <button id='btnPaladin' class="loginButton">Paladin</button>
            <button id='btnRogue' class="loginButton">Rogue</button>
          </div>
      </div>
      `;
        /**
         * \${click @=> setBarbarian}
         * \${click @=> setWizard}
         *  \${click @=> setPaladin}
         * \${click @=> setRogue}
         */

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
