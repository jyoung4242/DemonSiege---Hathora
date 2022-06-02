import './style.css';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';
import { Game } from './scenes/Game';
import { Role } from './scenes/chooseRole';
import { GameStates, Roles } from '../../../api/types';
import { HathoraClient, UpdateArgs } from '../../.hathora/client';
import { AbilityCard, MonsterCard, LocationCard, TDCard } from './lib/card';
import { dealPlayerCardFromDeck, runCardPoolAnimation, runPlayerHandAnimation, toggleCardpoolDrawer } from './lib/helper';
import { loadAbilityCardDatabase } from './lib/allAbilityCards';
import { ClientState, GS, mappedRoles, mappedStatus } from './types';

const body = document.getElementById('myApp');

let token: string;
let gameID: string;
export let myRole: Roles = Roles.Barbarian;
let myStartFlag: boolean = false;
export let gameStatus: GameStates;

export const client = new HathoraClient();

export let playerInfo: ClientState = {
    username: '',
    name: '',
    id: '',
    type: '',
    gameID: ``,
    gameLevel: 1,
    hand: [],
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

/*******************/
//Card buffers - for the Game
let cardPool: AbilityCard[] = [];
let activeMonsters: MonsterCard[] = [];
let towerDefensePile: TDCard[] = [];
let activeLocation: LocationCard = undefined;
export let playerHand: AbilityCard[] = [];
/*******************/

export let updateState = (update: UpdateArgs) => {
    //do something with state here
    console.log(`State: `, update);
    gameStatus = update.state.gameSequence;
    playerInfo.gameLevel = update.state.gameLevel;
    playerInfo.status = mappedStatus[gameStatus];
    if (update.state.players.length != 0) {
        const playerIndex = update.state.players.findIndex(player => player.Id == playerInfo.user.id);
        if (playerIndex >= 0) {
            playerInfo.id = update.state.players[playerIndex].Id;
            playerInfo.hand = update.state.players[playerIndex].Hand;
            playerInfo.role = mappedRoles[update.state.players[playerIndex].Role];
            playerInfo.name = update.state.players[playerIndex].characterName;
            playerInfo.Health = update.state.players[playerIndex].Health;
            playerInfo.AttackPoints = update.state.players[playerIndex].AttackPoints;
            playerInfo.AbilityPoints = update.state.players[playerIndex].AbilityPoints;
        }
    }
    if (update.state.players.length > 1) {
        update.state.players
            .filter(player => player.Id != playerInfo.user.id)
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
    if (game) game.updateInfo(playerInfo);
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
                break;
            case 'game starting':
                (document.getElementById('btnStartGame') as HTMLButtonElement).disabled = true;
                toggleCardpoolDrawer('open');
                runCardPoolAnimation().then(() => {
                    //next animation - Monster Deck
                    document.getElementById('MonsterDiv').classList.add('fadeIn');
                    document.getElementById('LocationsDiv').classList.add('fadeIn');
                    document.getElementById('TDDiv').classList.add('fadeIn');
                    setTimeout(() => {
                        runPlayerHandAnimation();
                        if (state.state.turn == playerInfo.id && myStartFlag) {
                            (document.getElementById('btnStartTurn') as HTMLButtonElement).disabled = false;
                        }
                    }, 750);
                });

                //TODO if other players, load their UI too

                break;
            case 'ReadyToStartTurn':
                myStartFlag = true;
                break;
            case 'Enable TD':
                //TODO Deal Players Hand
                let elem = document.getElementsByClassName('playersArea');
                elem[0].classList.add('openPlayersHand');
                setTimeout(() => {
                    //Get cards from state
                    dealPlayerCardFromDeck(playerInfo.hand[0]);
                }, 1000);
                //TODO Deal the TD cards from STATE
                break;
            case 'SelectTD':
                //TODO Enable TD to be clicked and selected and there's active effects
                //TODO Maybe Pulse and/or Glow
                break;
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

let startGame = (e: Event) => {
    playerInfo.myConnection.startGame({});
};

let startTurn = (e: Event) => {
    playerInfo.myConnection.startTurn({});
};

let endTurn = (e: Event) => {
    playerInfo.myConnection.endTurn({});
};

let roleSelected = (e: Event) => {
    const parsedButtonPress = (e.target as HTMLElement).getAttribute('id');
    //console.log(`ID: `, parsedButtonPress);
    const charname = document.getElementById('characterName');
    playerInfo.myConnection.nameCharacter({ name: (charname as HTMLInputElement).value });
    switch (parsedButtonPress) {
        case 'btnBarbarian':
            playerInfo.myConnection.selectRole({ role: Roles.Barbarian });
            myRole = Roles.Barbarian;
        case 'btnWizard':
            playerInfo.myConnection.selectRole({ role: Roles.Wizard });
            myRole = Roles.Wizard;
            break;
        case 'btnPaladin':
            playerInfo.myConnection.selectRole({ role: Roles.Paladin });
            myRole = Roles.Paladin;
            break;
        case 'btnRogue':
            playerInfo.myConnection.selectRole({ role: Roles.Rogue });
            myRole = Roles.Rogue;
            break;

        default:
            break;
    }

    reRender(myGameState, GS.game);
};

let loginscreen = undefined;
let lobby = undefined;
let game = undefined;
let role = undefined;
let myGameState: GS = GS.null;

export const reRender = (state: GS, gs: GS) => {
    if (state == gs) return;
    switch (gs) {
        case GS.lobby:
            if (state == GS.login) loginscreen.leaving();
            else game.leaving(body);
            if (!lobby) lobby = new Lobby(client, playerInfo);
            myGameState = GS.lobby;
            lobby.mount(body);

            break;
        case GS.role:
            if (state == GS.lobby) lobby.leaving();
            else if (state == GS.login) return; //invalid route
            else if (state == GS.game) return; //invalid route
            if (!role) role = new Role(client, playerInfo);
            myGameState = GS.role;
            role.mount(body);
            break;
        case GS.login:
            if (state == GS.lobby) lobby.leaving();
            else if (state == GS.null) {
                if (!loginscreen) loginscreen = new Login(client, playerInfo);
                myGameState = GS.login;
                loginscreen.mount(body);
            }

            break;
        case GS.game:
            if (state == GS.role) {
                role.leaving();
                //can't jump from login to game
                if (!game) game = new Game(divLoaded, startGame, startTurn, endTurn);
                myGameState = GS.game;
                game.setUserInfo(playerInfo);
                game.mount(body);
            }
            break;
    }
};

//initial
loadAbilityCardDatabase();
reRender(myGameState, GS.login);
