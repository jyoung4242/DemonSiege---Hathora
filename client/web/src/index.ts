import './style.css';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';
import { Game } from './scenes/Game';
import { Role } from './scenes/chooseRole';
import { GameState, GameStates, ISelectRoleRequest, Roles } from '../../../api/types';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { AnonymousUserData } from '../../../api/base';

export type ElementAttributes = {
    InnerText?: string;
    className?: string;
    event?: string;
    eventCB?: EventListener;
};

const mappedRoles = {
    [Roles.Barbarian]: 'Barbarian',
    [Roles.Wizard]: 'Wizard',
    [Roles.Paladin]: 'Paladin',
    [Roles.Rogue]: 'Rogue',
};

const mappedStatus = {
    [GameStates.Completed]: 'Completed',
    [GameStates.Idle]: 'Idle',
    [GameStates.InProgress]: 'In Progress',
    [GameStates.PlayersJoining]: 'Players Joining',
    [GameStates.ReadyForRound]: 'Ready for Round',
    [GameStates.Setup]: 'Game Setup',
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
let gameID: string;
let gameStatus: GameStates;
let myRole: Roles;

let updateState = (update: UpdateArgs) => {
    //do something with state here
    console.log('state changed: ', update);
    gameStatus = update.state.gameSequence;
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

let manageInput = (e: Event) => {
    let inputControl: HTMLInputElement = document.getElementById('joinGameInput') as HTMLInputElement;
    let inputtext: string = inputControl.value;
    let btnJoin: HTMLButtonElement = document.getElementById('btnJoinGame') as HTMLButtonElement;
    if (inputtext.length) btnJoin.disabled = false;
    else btnJoin.disabled = true;
};

let createNewGame = async (e: Event) => {
    if (location.pathname.length > 1) {
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, location.pathname.split('/').pop()!, updateState, console.error);
        myConnection.joinGame({});
    } else {
        const stateId = await client.create(token, {});
        gameID = stateId;
        history.pushState({}, '', `/${stateId}`);
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, stateId, updateState, console.error);
        myConnection.joinGame({});
    }
};

let joinCurrentGame = (e: Event) => {
    const gameToJoin: HTMLInputElement = document.getElementById('joinGameInput') as HTMLInputElement;
    console.log(`game to join: `, gameToJoin.value);
    history.pushState({}, '', `/${gameToJoin.value}`);

    if (gameToJoin.value.length > 1) {
        gameID = gameToJoin.value;
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, location.pathname.split('/').pop()!, updateState, console.error);
        myConnection.joinGame({});
    }
};

let roleSelected = (e: Event) => {
    const parsedButtonPress = (e.target as HTMLElement).getAttribute('id');
    //console.log(`ID: `, parsedButtonPress);
    switch (parsedButtonPress) {
        case 'btnBarbarian':
            myConnection.selectRole({ role: Roles.Barbarian });
            myRole = Roles.Barbarian;
        case 'btnWizard':
            myConnection.selectRole({ role: Roles.Wizard });
            myRole = Roles.Wizard;
            break;
        case 'btnPaladin':
            myConnection.selectRole({ role: Roles.Paladin });
            myRole = Roles.Paladin;
            break;
        case 'btnRogue':
            myConnection.selectRole({ role: Roles.Rogue });
            myRole = Roles.Rogue;
            break;

        default:
            break;
    }
    reRender(myGameState, GS.game);
};

const body = document.getElementById('myApp');
const client = new HathoraClient();
export let user: AnonymousUserData;

const loginscreen = new Login(login);
const lobby = new Lobby(createNewGame, joinCurrentGame, manageInput);
const game = new Game();
const role = new Role(roleSelected);
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
            role.setUserInfo({ name: user.name, id: user.id, type: user.type, game: gameID, status: mappedStatus[gameStatus] });
            role.mount(body);
            break;
        case GS.login:
            if (state == GS.lobby) lobby.leaving(body);
            else if (state == GS.null) {
                myGameState = GS.login;
                loginscreen.mount(body);
            }

            break;
        case GS.game:
            if (state == GS.role) {
                role.leaving(body);
                //can't jump from login to game
                myGameState = GS.game;
                game.setUserInfo({ name: user.name, id: user.id, type: user.type, game: gameID, role: mappedRoles[myRole], status: mappedStatus[gameStatus] });
                game.mount(body);
            }
            break;
    }
};

//initial
reRender(myGameState, GS.login);
