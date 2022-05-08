import { Cardstatus } from '../../api/types';
import { Effect } from './effects';

export type MonsterCard = {
    Title: string;
    Health: number;
    Damage: number;
    Level: number;
    CardStatus: Cardstatus;
    Effects: Effect[];
    Rewards: Effect[];
};

export type AbilityCard = {
    Title: string;
    Catagory: string;
    Level: number;
    Cost: number;
    Effects: Effect[];
    CardStatus: Cardstatus;
};

export type TowerDefense = {
    Title: string;
    Level: number;
    Effects: Effect[];
    CardStatus: Cardstatus;
};

export type LocationCard = {
    Title: string;
    Level: number;
    TD: number;
    Sequence: number;
    Health: number;
    Effects?: Effect[];
    CardStatus: Cardstatus;
};
