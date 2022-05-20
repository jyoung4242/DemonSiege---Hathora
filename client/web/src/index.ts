import './style.css';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';
import { Game } from './scenes/Game';
import { Role } from './scenes/chooseRole';
import { Cardstatus, GameStates, Roles } from '../../../api/types';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { AnonymousUserData } from '../../../api/base';
import Card from './lib/card';

export type ElementAttributes = {
    InnerText?: string;
    className?: string;
    event?: string;
    eventCB?: EventListener;
};

export type ClientState = {
    name: string;
    id: string;
    type?: string;
    game?: string;
    role?: string;
    status: string;
    Health: number;
    AttackPoints: number;
    AbilityPoints: number;
    othername?: string[];
    otherrole?: string[];
    otherid?: string[];
    otherHP?: number[];
    otherATP?: number[];
    otherABP?: number[];
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

const body = document.getElementById('myApp');
const client = new HathoraClient();
export let user: AnonymousUserData;

let token: string;
let myConnection: HathoraConnection;
let gameID: string;
let gameStatus: GameStates;
let myRole: Roles;
let testCard: Card;

let playerInfo: ClientState = {
    name: '',
    id: '',
    type: '',
    game: ``,
    role: mappedRoles[myRole],
    status: mappedStatus[gameStatus],
    Health: 10,
    AttackPoints: 0,
    AbilityPoints: 0,
    othername: [],
    otherrole: [],
    otherid: [],
    otherHP: [],
    otherATP: [],
    otherABP: [],
};

let updateState = (update: UpdateArgs) => {
    //do something with state here
    console.log(`State: `, update);
    gameStatus = update.state.gameSequence;
    playerInfo.status = mappedStatus[gameStatus];
    if (update.state.players.length != 0) {
        const playerIndex = update.state.players.findIndex(player => player.Id == user.id);
        if (playerIndex >= 0) {
            playerInfo.id = update.state.players[playerIndex].Id;
            playerInfo.role = mappedRoles[update.state.players[playerIndex].Role];
            playerInfo.name = update.state.players[playerIndex].characterName;
            playerInfo.Health = update.state.players[playerIndex].Health;
            playerInfo.AttackPoints = update.state.players[playerIndex].AttackPoints;
            playerInfo.AbilityPoints = update.state.players[playerIndex].AbilityPoints;
        }
    }
    if (update.state.players.length > 1) {
        update.state.players
            .filter(player => player.Id != user.id)
            .forEach((player, index) => {
                console.log(`filling other players stuff`);
                playerInfo.othername[index] = player.characterName;
                playerInfo.otherrole[index] = mappedRoles[player.Role];
                playerInfo.otherid[index] = player.Id;
                playerInfo.otherHP[index] = player.Health;
                playerInfo.otherATP[index] = player.AttackPoints;
                playerInfo.otherABP[index] = player.AbilityPoints;
                console.log(`playerinfo.other`, playerInfo);
            });
    }

    //process events
    if (update.events.length) parseEvents(update);

    game.updateInfo(playerInfo);
};

function parseEvents(state: UpdateArgs) {
    state.events.forEach(event => {
        console.log(`EVENT: `, event);
        switch (event) {
            case 'Player Joined':
                if (state.state.players.length > 1) {
                    if (state.state.gameSequence == GameStates.ReadyForRound) {
                        console.log(`RR - joining event HERE!!!!`);
                        showOther(state.state.players.length - 1);
                    } else if (state.state.gameSequence == GameStates.PlayersJoining) {
                        console.log(`joining event HERE!!!!`);
                        showOther(state.state.players.length - 1);
                    }
                }

            default:
                break;
        }
    });
}

function showOther(numOtherPlayers: number) {
    console.log(`num other players:`, numOtherPlayers);
    const elm = document.getElementById(`other${numOtherPlayers}`);
    console.log(`other player element: `, elm);
    elm.classList.remove('hidden');
}

const divLoaded = () => {
    console.log(`loaded state: `, playerInfo);
    playerInfo.otherid.forEach((player, index) => {
        showOther(index + 1);
    });
};

let login = async (e: Event) => {
    let myUser: AnonymousUserData;
    if (sessionStorage.getItem('token') === null) {
        sessionStorage.setItem('token', await client.loginAnonymous());
    }
    token = sessionStorage.getItem('token')!;
    user = HathoraClient.getUserFromToken(token);
    playerInfo.type = user.type;
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

let playCard = (e: Event) => {
    console.log(`card played`);
    const args = {
        name: 'Sword',
        size: {
            width: 125,
            aspectRatio: 1 / 1.5,
        },
        startingPosition: {
            x: 200,
            y: 200,
            theta: 0,
        },
        orientation: Cardstatus.FaceUp,
        parent: 'myApp',
    };
    testCard = Card.create(args);

    //run little demoscript here

    setTimeout(() => {
        testCard.move({ x: 700, y: 400 });
        setTimeout(() => {
            testCard.show();
            testCard.flip();
            setTimeout(() => {
                testCard.zoom(1.25);
                setTimeout(() => {
                    testCard.zoom(1);
                    setTimeout(() => {
                        testCard.flip();
                        setTimeout(() => {
                            testCard.move({ x: 200, y: 300 });
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
};

let createNewGame = async (e: Event) => {
    if (location.pathname.length > 1) {
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, location.pathname.split('/').pop()!, updateState, console.error);
        myConnection.joinGame({});
    } else {
        const stateId = await client.create(token, {});
        gameID = stateId;
        playerInfo.game = gameID;
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
        playerInfo.game = gameID;
        reRender(myGameState, GS.role);
        myConnection = client.connect(token, location.pathname.split('/').pop()!, updateState, console.error);
        myConnection.joinGame({});
    }
};

let roleSelected = (e: Event) => {
    const parsedButtonPress = (e.target as HTMLElement).getAttribute('id');
    //console.log(`ID: `, parsedButtonPress);
    const charname = document.getElementById('characterName');
    myConnection.nameCharacter({ name: (charname as HTMLInputElement).value });
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

const loginscreen = new Login(login);
const lobby = new Lobby(createNewGame, joinCurrentGame, manageInput);
const game = new Game(divLoaded, playCard);
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
            role.setUserInfo(playerInfo);
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
                game.setUserInfo(playerInfo);
                game.mount(body);
            }
            break;
    }
};

//initial
reRender(myGameState, GS.login);
