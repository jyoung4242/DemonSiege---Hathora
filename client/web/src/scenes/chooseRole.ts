import { ClientState, GS } from '../types';
import { UI, UIView } from 'peasy-ui';
import { HathoraClient } from '../../../.hathora/client';
import { Roles } from '../../../../api/types';
import { reRender } from '..';

export class Role {
    ui: UIView;
    state: ClientState;
    client: HathoraClient;
    intervalID: NodeJS.Timer;

    name: string;
    gameID: string;
    status: string;
    id: string;
    characterName: string;

    constructor(client: HathoraClient, state: ClientState) {
        this.state = state;
        this.client = client;

        this.name = state.username;
        this.gameID = state.gameID;
        this.id = state.user.id;
        this.characterName = 'Enter Name';
    }

    mount = (element: HTMLElement) => {
        const template = `
      <div>
        <div class="Header">
          <h1 class="LoginPageheader">Choose Roles for Game</h1>
        </div>
        
        <div class="Header">
          <h3 class="LoginPageheader">Username: \${name}</h3>
          <h3 class="LoginPageheader">ID: \${id}</h3>
          <h3 class="LoginPageheader">Game ID: \${gameID}</h3>
          
        </div>
                
        <div class="Header">
          <h5 class="LoginPageheader">Name your character: </h5>
          <input id="charName" \${change @=> inputValidation} \${value <=> characterName}/>
        </div>
        
        <div>
          <button id="btnBarbarian"  \${click @=> setBarbarian} disabled class="loginButton">Barbarian</button>
          <button id="btnWizard" \${click @=> setWizard}  disabled class="loginButton">Wizard</button>
          <button id="btnPaladin" \${click @=> setPaladin} disabled class="loginButton">Paladin</button>
          <button id="btnRogue" \${click @=> setRogue} disabled class="loginButton">Rogue</button>
        </div>
    </div>
    `;
        this.ui = UI.create(element, template, this);

        this.intervalID = setInterval(() => {
            UI.update();
        }, 1000 / 60);
    };

    setBarbarian = () => {
        console.log(`Here`);
        this.state.myConnection.nameCharacter({ name: (document.getElementById('charName') as HTMLInputElement).value });
        this.state.myConnection.selectRole({ role: Roles.Barbarian });
        reRender(GS.role, GS.game);
    };
    setWizard = () => {
        this.state.myConnection.nameCharacter({ name: (document.getElementById('charName') as HTMLInputElement).value });
        this.state.myConnection.selectRole({ role: Roles.Wizard });
        reRender(GS.role, GS.game);
    };
    setPaladin = () => {
        this.state.myConnection.nameCharacter({ name: (document.getElementById('charName') as HTMLInputElement).value });
        this.state.myConnection.selectRole({ role: Roles.Paladin });
        reRender(GS.role, GS.game);
    };
    setRogue = () => {
        this.state.myConnection.nameCharacter({ name: (document.getElementById('charName') as HTMLInputElement).value });
        this.state.myConnection.selectRole({ role: Roles.Rogue });
        reRender(GS.role, GS.game);
    };

    inputValidation = () => {
        if ((document.getElementById('charName') as HTMLInputElement).value != 'Enter Name') {
            (document.getElementById('btnBarbarian') as HTMLButtonElement).disabled = false;
            (document.getElementById('btnWizard') as HTMLButtonElement).disabled = false;
            (document.getElementById('btnPaladin') as HTMLButtonElement).disabled = false;
            (document.getElementById('btnRogue') as HTMLButtonElement).disabled = false;
        } else {
            (document.getElementById('btnBarbarian') as HTMLButtonElement).disabled = true;
            (document.getElementById('btnWizard') as HTMLButtonElement).disabled = true;
            (document.getElementById('btnPaladin') as HTMLButtonElement).disabled = true;
            (document.getElementById('btnRogue') as HTMLButtonElement).disabled = true;
        }
    };

    leaving = () => {
        this.ui.destroy();
        this.ui = null;
        clearInterval(this.intervalID);
    };
}
