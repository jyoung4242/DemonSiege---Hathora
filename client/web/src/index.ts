import './style.css';
//import './import-png.d.ts';
import { Login } from './scenes/Login';
import { Lobby } from './scenes/Lobby';
import { Game } from './scenes/Game';
import { Role } from './scenes/chooseRole';
import { Cardstatus, GameStates, Roles } from '../../../api/types';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { AnonymousUserData } from '../../../api/base';
import { AbilityCard, ABcard, ABcardData, MonsterCard, MCdata, MonsterCardData, LocationCard, LOCcardData, LOCcard, TDcard, TDCard, TDcardData } from './lib/card';
import { abilityCardDataLv1, retrieveCardData } from './lib/abilitycardsLV1';
import { retrieveMCCardData } from './lib/monstercards';
import { retrieveLocCardData } from './lib/locationCards';
import { retrieveTDCardData } from './lib/towerdefense';
import { retrieveStarterBarbarianCardData } from './lib/starter_b';
import { retrieveStarterWizardCardData } from './lib/starter_w';
import { retrieveStarterPaladinCardData } from './lib/starter_p';
import { retrieveStarteRogueCardData } from './lib/starter_r';

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
let testCard: AbilityCard[] = [];
let mCard: MonsterCard[] = [];
let locCard: LocationCard[] = [];
let TDcardbuf: TDCard[] = [];

let playCard = (e: Event) => {
    if (testCard.length) {
        testCard.forEach(card => {
            card.destroy();
        });
        testCard = [];
    }

    if (mCard.length) {
        mCard.forEach(card => {
            card.destroy();
        });
        mCard = [];
    }

    if (locCard.length) {
        locCard.forEach(card => {
            card.destroy();
        });
        locCard = [];
    }

    if (TDcardbuf.length) {
        TDcardbuf.forEach(card => {
            card.destroy();
        });
        TDcardbuf = [];
    }

    const cardnames = ['Dagger', 'Sling', 'Broadsword', 'Mana Potion', 'Bracelet', 'Jewel', 'Awakening', 'Daydream', 'Torrent', 'Torment', 'AcidHail', 'Solitude', 'HolyTempest', 'Eviction', 'Imitationrituals', 'Duraina', 'Jacquelyn'];
    const mcardnames = ['Goblin', 'Kobalt', 'Skeleton'];
    const loccardnames = ['Cellar', 'Dungeon', 'Crypt'];
    const tdCardNames = ['Tripwire1', 'Net1', 'Pit1', 'Quicksand1'];
    const bstarternames = ['Starter Sword', 'Starter Axe', 'Starter Shield', 'Starter Dagger', 'Starter Medkit', 'Starter Horse', 'Starter Steward', 'Starter Rage', 'Starter Focus', 'Starter BowArrow'];
    const wstarternames = ['Starter Robes', 'Starter Wand', 'Starter Spellbook', 'Starter Staff', 'Starter Pet', 'Starter Firespell', 'Starter Minor Heal', 'Starter Meditation', 'Starter Wizard Focus', 'Starter Magic Arrow'];
    const pstarternames = ['Starter Chant', 'Starter Concentration', 'Starter Defend', 'Starter Hammer', 'Starter Helmet', 'Starter Mace', 'Starter Prayer', 'Starter Redemption', 'Starter Paladin Shield', 'Starter Talisman'];
    const rstarternames = ['Starter Hood', 'Starter Armor', 'Starter Backstab', 'Starter Boots', 'Starter Crossbow', 'Starter Knife', 'Starter Pickpocket', 'Starter Sneak', 'Starter Smoke', 'Starter Tools'];
    //const cardchosen = cardnames[Math.floor(Math.random() * cardnames.length)];
    const tempHand = [];

    for (let index = 0; index < 10; index++) {
        let inx = Math.floor(Math.random() * rstarternames.length);
        tempHand.push(rstarternames[inx]);
        rstarternames.splice(inx, 1);
    }
    let cardData: ABcardData;

    tempHand.forEach((card, index) => {
        console.log(`card: `, card);
        cardData = retrieveStarteRogueCardData(card);
        console.log(`carddata: `, cardData);
        const args: ABcard = {
            name: cardData.name,
            cardsize: {
                width: 125,
                aspectRatio: 0.7142857142857143,
            },
            position: {
                x: Math.random() * 1400,
                y: Math.random() * 600,
                theta: 0,
            },
            orientation: cardData.orientation,
            parent: 'myApp',
            title: cardData.title,
            description: cardData.description,
            catagory: cardData.catagory,
            cost: cardData.cost,
            image: cardData.image,
            level: cardData.level,
        };
        console.log(`testCard: `, testCard);

        testCard.push(AbilityCard.create(args));
    });

    // draw monster cards now
    let mcarddata: MonsterCardData;
    mcardnames.forEach(card => {
        mcarddata = retrieveMCCardData(card);
        const args: MCdata = {
            name: mcarddata.name,
            cardsize: {
                width: 250,
                aspectRatio: 4 / 3,
            },
            position: {
                x: Math.random() * 900,
                y: Math.random() * 500,
                theta: 0,
            },
            orientation: mcarddata.orientation,
            parent: 'myApp',
            title: mcarddata.title,
            description: mcarddata.description,
            image: mcarddata.image,
            level: mcarddata.level,
            reward: mcarddata.reward,
            health: mcarddata.health,
        };
        //mCard.push(MonsterCard.create(args));
    });

    // draw location cards now
    let lcarddata: LOCcardData;
    loccardnames.forEach(card => {
        lcarddata = retrieveLocCardData(card);
        const args: LOCcard = {
            name: lcarddata.name,
            cardsize: {
                width: 250,
                aspectRatio: 4 / 3,
            },
            position: {
                x: Math.random() * 900,
                y: Math.random() * 500,
                theta: 0,
            },
            orientation: lcarddata.orientation,
            parent: 'myApp',
            title: lcarddata.title,
            description: lcarddata.description,
            image: lcarddata.image,
            level: lcarddata.level,
            health: lcarddata.health,
            TD: lcarddata.TD,
            sequence: lcarddata.sequence,
        };
        //locCard.push(LocationCard.create(args));
    });

    // draw TD cards now
    let tcarddata: TDcardData;
    tdCardNames.forEach(card => {
        tcarddata = retrieveTDCardData(card);
        const args: TDcard = {
            name: tcarddata.name,
            cardsize: {
                width: 250,
                aspectRatio: 1 / 1,
            },
            position: {
                x: Math.random() * 900,
                y: Math.random() * 500,
                theta: 0,
            },
            orientation: tcarddata.orientation,
            parent: 'myApp',
            title: tcarddata.title,
            description: tcarddata.description,
            image: tcarddata.image,
            level: tcarddata.level,
        };
        //TDcardbuf.push(TDCard.create(args));
    });

    /* //run little demoscript here
    let actions = [card => card.move(700, 100), card => card.move(250, 200), card => card.flip(), card => card.flip(), card => card.rotate(90), card => card.rotate(90), card => card.rotate(90), card => card.rotate(90), card => card.zoom(1.5), card => card.zoom(1)];

    const interval = setInterval(() => {
        const action = actions.shift();
        testCard.forEach((card, index) => {
            action(card);
            if (actions.length == 0) {
                clearInterval(interval);
                card.destroy();
            }
        });
    }, 1000); */
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
