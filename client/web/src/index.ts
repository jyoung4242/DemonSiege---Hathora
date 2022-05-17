import './style.css';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';
import { Game } from './scenes/Game';
import { GameState } from '../../../api/types';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';

enum GS {
    null,
    login,
    lobby,
    game,
}

const body = document.getElementById('myApp');
const client = new HathoraClient();

const loginscreen = new Login(client);
const lobby = new Lobby(client);
const game = new Game(client);
let myGameState: GS = GS.null;

const reRender = (state: GS, gs: GS) => {
    if (state == gs) return;
    switch (gs) {
        case GS.lobby:
            if (state == GS.login) loginscreen.leaving(body);
            else game.leaving(body);
            myGameState = GS.lobby;
            lobby.mount(body);
            break;
        case GS.login:
            if (state == GS.lobby) lobby.leaving(body);
            else game.leaving(body);
            myGameState = GS.login;
            loginscreen.mount(body);

            break;
        case GS.game:
            if (state == GS.lobby) {
                lobby.leaving(body);
                //can't jump from login to game
                myGameState = GS.game;
                game.mount(body);
            }
            break;
    }
};

//initial
reRender(myGameState, GS.login);
