import './style.css';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';
import { Game } from './scenes/Game';
import { Role } from './scenes/chooseRole';
import { GameState, Roles } from '../../../api/types';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { AnonymousUserData } from '../../../api/base';

export type ElementAttributes = {
    InnerText?: string;
    className?: string;
    event?: string;
    eventCB?: EventListener;
};

enum GS {
    null,
    login,
    lobby,
    role,
    game,
}

let token: string;
let myConnection: HathoraConnection;

let updateState = (update: UpdateArgs) => {
    //do something with state here
    console.log('state changed: ', update);
};

let login = async (e: Event) => {
    let myUser: AnonymousUserData;
    if (sessionStorage.getItem('token') === null) {
        sessionStorage.setItem('token', await client.loginAnonymous());
    }
    token = sessionStorage.getItem('token')!;
    user = HathoraClient.getUserFromToken(token);
    console.log(`User Data: `, user);
    reRender(myGameState, GS.lobby);
};

let createNewGame = async (e: Event) => {
    if (location.pathname.length > 1) {
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, location.pathname.split('/').pop()!, updateState, console.error);
        myConnection.joinGame({});
    } else {
        const stateId = await client.create(token, {});
        history.pushState({}, '', `/${stateId}`);
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, stateId, updateState, console.error);
        myConnection.joinGame({});
    }
};

let joinCurrentGame = async (e: Event) => {
    const gameToJoin: HTMLInputElement = document.getElementById('joinGameInput') as HTMLInputElement;
    console.log(`game to join: `, gameToJoin.value);

    if (gameToJoin.value.length > 1) {
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, location.pathname.split('/').pop()!, updateState, console.error);
        myConnection.joinGame({});
    }
};

const body = document.getElementById('myApp');
const client = new HathoraClient();
export let user: AnonymousUserData;

const loginscreen = new Login(login);
const lobby = new Lobby(createNewGame, joinCurrentGame);
const game = new Game();
const role = new Role();
let myGameState: GS = GS.null;

const reRender = (state: GS, gs: GS) => {
    if (state == gs) return;
    switch (gs) {
        case GS.lobby:
            if (state == GS.login) loginscreen.leaving(body);
            else game.leaving(body);
            myGameState = GS.lobby;
            lobby.setUserInfo({ name: user.name, id: user.id, type: user.type });
            lobby.mount(body);

            break;
        case GS.role:
            if (state == GS.lobby) lobby.leaving(body);
            else if (state == GS.login) return; //invalid route
            else if (state == GS.game) return; //invalid route
            myGameState = GS.role;
            role.setUserInfo({ name: user.name, id: user.id, type: user.type });
            role.mount(body);
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
