import { GameStates, Roles } from '../../../api/types';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../.hathora/client';
import { AnonymousUserData } from '../../../api/base';

export const ABCARDASPECTRATIO = 2.5 / 3.5;
export const LOC_MONSTERRATIO = 4 / 3;
export const TDRATIO = 1 / 1;

export type ElementAttributes = {
    InnerText?: string;
    className?: string;
    event?: string;
    eventCB?: EventListener;
};

export let user: AnonymousUserData;

export type ClientState = {
    myConnection?: HathoraConnection;
    client?: HathoraClient;
    user?: AnonymousUserData;
    token?: string;
    username: string;
    name: string;
    id: string;
    type?: string;
    gameID?: string;
    gameLevel: number;
    role?: string;
    status: string;
    hand: object[];
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

export const mappedRoles = {
    [Roles.Barbarian]: 'Barbarian',
    [Roles.Wizard]: 'Wizard',
    [Roles.Paladin]: 'Paladin',
    [Roles.Rogue]: 'Rogue',
};

export const mappedStatus = {
    [GameStates.Completed]: 'Completed',
    [GameStates.Idle]: 'Idle',
    [GameStates.InProgress]: 'In Progress',
    [GameStates.PlayersJoining]: 'Players Joining',
    [GameStates.ReadyForRound]: 'Ready for Round',
    [GameStates.Setup]: 'Game Setup',
};

export enum GS {
    null,
    login,
    lobby,
    role,
    game,
}
