import './style.css';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';
import { Game } from './scenes/Game';
import { Role } from './scenes/chooseRole';
import { GameStates, Roles } from '../../../api/types';
import { HathoraClient, UpdateArgs } from '../../.hathora/client';
import { AbilityCard, MonsterCard, LocationCard, TDCard } from './lib/card';
import { loadAbilityCardDatabase } from './lib/allAbilityCards';
import { ClientState, GS, mappedRoles, mappedStatus } from './types';
import { parseEvents } from './lib/events';
import { UIManager } from './lib/UI-Manager';

const body = document.getElementById('myApp');

export let myRole: Roles = Roles.Barbarian;
export let gameStatus: GameStates;
export const client = new HathoraClient();

let UIM: UIManager = new UIManager(1000, true);
UIM.startQue();

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
    activeMonsters: [],
    locationPile: '',
    towerDefense: [],
    turn: '',
};

/*********************************************/
//Card buffers - for the Game
let cardPool: AbilityCard[] = [];
export let activeMonsters: MonsterCard[] = [];
export let towerDefensePile: TDCard[] = [];
export let activeLocation: LocationCard[] = [];
export let playerHand: AbilityCard[] = [];
/*********************************************/

/*********************************************
Main State Update Routine
This comes from Server state pushes, and is called when
ever there is an event or state change
**********************************************/
export let updateState = (update: UpdateArgs) => {
    //do something with state here
    console.log(`State: `, update);

    gameStatus = update.state.gameSequence;
    playerInfo.gameLevel = update.state.gameLevel;
    playerInfo.turn = update.state.turn;
    playerInfo.status = mappedStatus[gameStatus];
    if (update.state.activeMonsters) update.state.activeMonsters.forEach(monster => playerInfo.activeMonsters.push(monster.Title));
    if (update.state.locationPile) playerInfo.locationPile = update.state.locationPile.Title;
    if (update.state.towerDefensePile) update.state.towerDefensePile.forEach(TD => playerInfo.towerDefense.push(TD.Title));
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
                playerInfo.othername[index] = player.characterName;
                playerInfo.otherrole[index] = mappedRoles[player.Role];
                playerInfo.otherid[index] = player.Id;
                playerInfo.otherHP[index] = player.Health;
                playerInfo.otherATP[index] = player.AttackPoints;
                playerInfo.otherABP[index] = player.AbilityPoints;
            });
    }
    //process events
    if (update.events.length && game) parseEvents(update, UIM);
    if (game) game.updateInfo(playerInfo);
};

let loginscreen = undefined;
let lobby = undefined;
export let game = undefined;
let role = undefined;
let myGameState: GS = GS.null;

/****************************************
 * Main Scene Selection
 * when ever reRender is called
 * its passed (from,to) in its parameters
 ****************************************/
export const reRender = (state: GS, gs: GS) => {
    if (state == gs) return;
    switch (gs) {
        case GS.lobby:
            if (state == GS.login) loginscreen.leaving();
            else game.leaving();
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
                if (!game) game = new Game(client, playerInfo);
                myGameState = GS.game;
                game.mount(body);
            }
            break;
    }
};

//*********************** */
//initializations
//*********************** */
loadAbilityCardDatabase();
reRender(myGameState, GS.login);
