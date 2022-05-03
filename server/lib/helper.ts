import { AbilityCard, MonsterCard, TowerDefense, LocationCard, Cardstatus } from '../../api/types';

export function loadMonsterCardsFromJSON(incoming: object): Array<MonsterCard> {
    let returnArray: Array<MonsterCard> = [];

    for (const [key, value] of Object.entries(incoming)) {
        let tempCard: MonsterCard = {
            Title: key,
            Health: value.health,
            Level: value.level,
            Action: [],
            Reward: [],
            CardStatus: Cardstatus.FaceDown,
        };
        returnArray.push(tempCard);
    }

    return returnArray;
}

export function loadAbilityCardsFromJSON(incoming: object): Array<AbilityCard> {
    let returnArray: Array<AbilityCard> = [];

    for (const [key, value] of Object.entries(incoming)) {
        let tempCard: AbilityCard = {
            Title: key,
            Catagory: value.catagory,
            Cost: value.cost,
            Level: value.level,
            Ability: [],
            CardStatus: Cardstatus.FaceDown,
        };
        returnArray.push(tempCard);
    }

    return returnArray;
}

export function loadTDCardsFromJSON(incoming: object): Array<TowerDefense> {
    let returnArray: Array<TowerDefense> = [];

    for (const [key, value] of Object.entries(incoming)) {
        let tempCard: TowerDefense = {
            Title: key,
            Level: value.level,
            Ability: [],
            CardStatus: Cardstatus.FaceDown,
        };
        returnArray.push(tempCard);
    }

    return returnArray;
}

export function loadLocationCardsFromJSON(incoming: object): Array<LocationCard> {
    let returnArray: Array<LocationCard> = [];

    for (const [key, value] of Object.entries(incoming)) {
        let tempCard: LocationCard = {
            Title: key,
            Level: value.level,
            TD: value.TD,
            Sequence: value.sequence,
            Health: value.health,
            Special: [],
            CardStatus: Cardstatus.FaceDown,
        };
        returnArray.push(tempCard);
    }

    return returnArray;
}

export function dealCards<T>(source: Array<T>, destination: Array<T>, numCards: number) {
    for (let index = 0; index < numCards; index++) {
        const myCard: T = source.pop()!;
        destination.push(myCard);
    }
}
