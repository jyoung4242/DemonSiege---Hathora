import { Cardstatus, UserId, AbilityCard, MonsterCard, TowerDefense, LocationCard, Effect } from '../../api/types';
import { InternalState } from '../impl';

export function loadMonsterCardsFromJSON(incoming: object): Array<MonsterCard> {
    let returnArray: Array<MonsterCard> = [];

    for (const [key, value] of Object.entries(incoming)) {
        let tempCard: MonsterCard = {
            Title: key,
            Damage: 0,
            Health: value.health,
            Level: value.level,
            Effects: [],
            Rewards: [],
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
            Effects: [],
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
            Effects: loadEffectArray(value.Effect),
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
            Effects: [],
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

export function applyEffect(state: InternalState, userId: UserId, effect: Effect) {}

function loadEffectArray(inputArray: Array<any>): Array<Effect> {
    let rsltArray: Effect[] = [];
    inputArray.forEach(effect => {
        console.log(`effect: `, effect);
        rsltArray.push(effect);
    });

    return rsltArray;
}
