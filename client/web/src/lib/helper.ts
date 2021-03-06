import cardback from '../assets/card assets/newcardback.png';
import { waApiSequencer } from './sequencer';
import { Cardstatus } from '../../../../api/types';
import ABcardback from '../assets/card assets/newcardback.png';
import locationDamage from '../assets/game assets/statusLocationDamage.png';
import noDraw from '../assets/game assets/statusNoDraw.png';
import damageWhenDiscard from '../assets/game assets/statusDiscardDamage.png';
import { isCardinDB, retrieveMasterCardData } from './allAbilityCards';
import { ABcard, AbilityCard, LocationCard, LOCcard, LOCcardData, MCdata, MonsterCard, MonsterCardData, TDCard, TDcard, TDcardData } from './card';
import { playerHand, game, playerInfo, activeMonsters, activeLocation, towerDefensePile } from '../index';
import { ABCARDASPECTRATIO, ClientState, LOC_MONSTERRATIO, numberMonstersActiveByLevel, TDRATIO } from '../types';
import { retrieveMCCardData } from './monstercards';
import { retrieveLocCardData } from './locationCards';
import { retrieveTDCardData } from './towerdefense';
import { Shake } from './shake';
import { postToastMessage } from './events';

export const toggleCardpoolDrawer = (status: 'open' | 'closed') => {
    if (status == 'open') {
        document.getElementById('cardPoolDrawer').classList.add('openDrawer');
    } else {
        document.getElementById('cardPoolDrawer').classList.remove('openDrawer');
    }
};

export const sleep = async (t: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('I can sleep!');
        }, t);
    });
};

export const bloom = (setBloom: boolean, target: string) => {
    const myTarget = document.getElementById(target);
    if (setBloom) myTarget.classList.add('bloom');
    else myTarget.classList.remove('bloom');
};

export const runCardPoolAnimation = async () => {
    return new Promise<void>(resolve => {
        console.log(`starting sleep`);
        sleep(4000).then(() => {
            console.log(`ending sleep`);
            resolve();
        });
    });
};

export const showGameUI = async () => {
    //next animation - Monster Deck
    let promise = new Promise((resolve, reject) => {
        const allAnimations = document.getAnimations();
        console.log(`Animations: `, allAnimations);
        allAnimations.forEach(anim => anim.cancel());
        console.log(`Animations: `, allAnimations);
        document.getElementById('MonsterDiv').classList.add('fadeIn');
        document.getElementById('LocationsDiv').classList.add('fadeIn');
        document.getElementById('TDDiv').classList.add('fadeIn');
    });
    return promise;
};

export const dealTDcardFromDeck = TD => {
    const TDData: TDcardData = retrieveTDCardData(TD);

    //find TD card is going
    //get # of monster cards per level and target width of card
    let targetWidth: number;
    let targetTDDiv: HTMLElement;
    let targetTDDivID: string;

    targetTDDivID = `TDPile`;
    //get children of div
    targetTDDiv = document.getElementById(targetTDDivID);
    const targetRect = targetTDDiv.getBoundingClientRect();
    targetWidth = targetRect.right - targetRect.left;
    //turn LOCcardData into TDrCard Data
    let args: TDcard = {
        name: TDData.name,
        size: { width: targetWidth, aspectRatio: TDRATIO },
        orientation: Cardstatus.FaceUp,
        position: { x: 0, y: 0, theta: 0 },
        title: TDData.title,
        description: TDData.description,
        image: TDData.image,
        level: TDData.level,
        parent: 'TDPile',
    };
    //create card
    towerDefensePile.push(TDCard.create(args));
    if (TDData.active == true) {
        bloom(false, 'TDDeck');
        bloom(true, 'TDPile');
    }
};

export const removeActiveTDCard = () => {
    towerDefensePile[0].destroy();
    towerDefensePile.pop();
};

export const dealLocationCardFromDeck = (monster: string) => {
    const LocationData: LOCcardData = retrieveLocCardData(monster);

    //find location card is going
    //get # of monster cards per level and target width of card
    let targetWidth: number;
    let targetLocationDiv: HTMLElement;
    let targetLocationDivID: string;

    targetLocationDivID = `LocPile`;
    //get children of div
    targetLocationDiv = document.getElementById(targetLocationDivID);
    const targetRect = targetLocationDiv.getBoundingClientRect();
    targetWidth = targetRect.right - targetRect.left;
    //turn LOCcardData into LocationrCard Data
    let args: LOCcard = {
        name: LocationData.name,
        TD: LocationData.TD,
        sequence: LocationData.sequence,
        size: { width: targetWidth, aspectRatio: LOC_MONSTERRATIO },
        orientation: Cardstatus.FaceUp,
        position: { x: 0, y: 0, theta: 0 },
        title: LocationData.title,
        description: LocationData.description,
        image: LocationData.image,
        level: LocationData.level,
        parent: 'LocPile',
        health: LocationData.health,
    };
    //create card
    activeLocation.push(LocationCard.create(args));
};

export const playMonsterCard = (position: number, state: ClientState) => {
    //get child card of that position
    let card = document.getElementById(`Monster${position}`).firstElementChild;
    state.myConnection.selectMonsterCard({ cardname: card.id });
};

export const userTurn = (state: ClientState) => {
    //TODO other players need addressed here
    console.log(`userturn`, state);
    if (state.turn == state.id) {
        //if any monsterspots are bloomed, remove
        for (let i = 1; i <= 3; i++) {
            let elm = document.getElementById(`Monster${i}`);
            if (elm.classList.contains('bloom')) {
                elm.classList.remove('bloom');
            }
        }
        //open player hand
        //bloom innerhand
        console.trace(`you're the current user`);
        bloom(true, 'innerPlayerHand');
    }
};

export const dealMonsterCardFromDeck = (monster: string) => {
    const monsterData: MonsterCardData = retrieveMCCardData(monster);

    //find location card is going
    //get # of monster cards per level and target width of card
    let targetWidth: number;
    let targetMonsterDiv: HTMLElement;
    let targetMonsterDivID: string;
    const numMonstersThisRound = numberMonstersActiveByLevel[playerInfo.gameLevel];
    //iterate over number to find monster spots to put card
    for (let index = 1; index <= numMonstersThisRound; index++) {
        targetMonsterDivID = `Monster${index}`;
        //get children of div
        targetMonsterDiv = document.getElementById(targetMonsterDivID);
        const existingMonsterCard = targetMonsterDiv.firstChild;
        if (existingMonsterCard == null) {
            const targetclientBox = targetMonsterDiv.getBoundingClientRect();
            targetWidth = targetclientBox.right - targetclientBox.left;
            break;
        } //leave loop with this targetMonsterDiv selected
    }

    //turn MCData into MonsterCard Data
    let args: MCdata = {
        name: monsterData.name,
        size: { width: targetWidth, aspectRatio: LOC_MONSTERRATIO },
        orientation: Cardstatus.FaceUp,
        position: { x: 0, y: 0, theta: 0 },
        title: monsterData.title,
        description: monsterData.description,
        image: monsterData.image,
        level: monsterData.level,
        parent: targetMonsterDivID,
        reward: monsterData.reward,
        health: monsterData.health,
        active: monsterData.active,
    };
    //create card
    activeMonsters.push(MonsterCard.create(args));
    console.log(`activeMonsters: `, activeMonsters);
};

export const dealPlayerCardFromDeck = myCard => {
    //find card

    if (isCardinDB(myCard.Title)) {
        let foundCard = retrieveMasterCardData(myCard.Title);
        //get position of player deck
        let style = getComputedStyle(document.getElementById('playerdeck'));
        let width = parseInt(style.getPropertyValue('width'));

        let args: ABcard = {
            name: foundCard.name,
            size: { width: width, aspectRatio: ABCARDASPECTRATIO },
            orientation: Cardstatus.FaceUp,
            position: { x: 0, y: 0, theta: 0 },
            title: foundCard.title,
            description: foundCard.description,
            catagory: foundCard.catagory,
            cost: foundCard.cost,
            image: foundCard.image,
            level: foundCard.level,
            parent: 'innerPlayerHand',
        };

        game.myHand.addCard(args);
        playerHand.push(myCard);
    }
};
/* 
export const reorganizePlayerHand = () => {
    //get number of cards in player hand
    let numCards = playerHand.length;
    let oddEven: 'Odd' | 'Even' = 'Odd';
    if (numCards % 2 == 0) oddEven = 'Even';
    //calculate card 'offset' for being in a hand ~ 30% of card size
    let cardOffset = playerHand[0];
    //get size in pixels of hand area
    let handWidth = document.getElementById('innerPlayerHand').style.width;
}; */

export const runPlayerHandAnimation = async () => {
    return new Promise<void>((resolve, reject) => {
        let elem = document.getElementById('playerHand');
        elem.classList.add('openPlayersHand');
        let pdeck = document.getElementById('playerdeck');
        pdeck.style.backgroundImage = `url(${ABcardback})`;
        pdeck.style.backgroundSize = 'cover';
        pdeck.style.backgroundRepeat = 'no-repeat';
        setTimeout(() => {
            elem.classList.remove('openPlayersHand');
            if (playerInfo.turn == playerInfo.id && game.myStartFlag) {
                (document.getElementById('btnStartTurn') as HTMLButtonElement).disabled = false;
            }
            resolve();
        }, 1500);
    });
};
/* 
const getCoordFromAngleMag = (thetaDeg, MagPixels): { x: number; y: number } => {
    //x=r??cos(??), y=r??sin(??)
    const thetaRad = thetaDeg * (Math.PI / 180);
    //radians = degrees ?? 0.017453
    return { x: MagPixels * Math.cos(thetaRad), y: MagPixels * Math.sin(thetaRad) };
};

function getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
    };
} */
/* 
function shuffle<T>(array: Array<T>): Array<T> {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return  array;
}*/

export const showStatusEffect = (effect: string) => {
    const parentDiv = document.getElementById('playerStatusArea');
    const newStatusIcon = document.createElement('div');
    console.trace('statusEffect', effect);
    switch (effect) {
        case 'locationLoseHealth':
            newStatusIcon.style.backgroundImage = `url(${locationDamage})`;
            break;
        case 'noDraw':
            newStatusIcon.style.backgroundImage = `url(${noDraw})`;
            break;
        case 'discardLoseHealth':
            newStatusIcon.style.backgroundImage = `url(${damageWhenDiscard})`;
            break;
        default:
            break;
    }
    newStatusIcon.classList.add('playerStatusEffect');
    newStatusIcon.id = `${effect}`;
    parentDiv.appendChild(newStatusIcon);
};
/* 
export const vw = (v: number) => {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (v * w) / 100;
}; */

export const runLocationDamageAnimation = () => {
    let seq1 = new waApiSequencer({
        loop: false,
        gapDelay: 0,
    });

    seq1.addSeq({
        element: 'damageFlash',
        keyFrames: [
            { backgroundColor: `#FFFFFF`, zIndex: `-1` },
            { backgroundColor: `#FFFFFF`, zIndex: `5` },
        ],
        options: { duration: 0.05, fill: 'both' },
    }).addSeq({
        element: 'damageFlash',
        keyFrames: [
            { backgroundColor: `#FFFFFF`, zIndex: `5` },
            { backgroundColor: `#FFFFFF`, zIndex: `-1` },
        ],
        options: { duration: 0.95 },
    });

    seq1.playSeq();
    let AppWindow = document.getElementById('myApp');
    /*const WIDTH = parseInt(AppWindow.style.width);
    const HEIGHT = parseInt(AppWindow.style.height); */
    let xShake = new Shake(1000, 60);
    let yShake = new Shake(1000, 60);

    let myTime = 0;
    let m = setInterval(() => {
        myTime += 16;
        xShake.update();
        yShake.update();
        AppWindow.style.transform = `translate(${xShake.amplitude(myTime)}px,${yShake.amplitude(myTime)}px)`;
        if (myTime >= 1000) clearInterval(m);
    }, 16);

    AppWindow.style.transform = `none`;
    setTimeout(() => {
        let anims = document.getAnimations();
        anims.forEach(an => an.cancel());
    }, 800);
};

export const runDamageAnimation = () => {
    console.log(`damage animation`);
    let seq1 = new waApiSequencer({
        loop: false,
        gapDelay: 0,
    });

    seq1.addSeq({
        element: 'damageFlash',
        keyFrames: [
            { backgroundColor: `#FF0000`, zIndex: `-1` },
            { backgroundColor: `#FF0000`, zIndex: `5` },
        ],
        options: { duration: 0.05, fill: 'both' },
    }).addSeq({
        element: 'damageFlash',
        keyFrames: [
            { backgroundColor: `#FF0000`, zIndex: `5` },
            { backgroundColor: `#FF0000`, zIndex: `-1` },
        ],
        options: { duration: 0.95 },
    });

    seq1.playSeq();
    let AppWindow = document.getElementById('myApp');
    /*const WIDTH = parseInt(AppWindow.style.width);
    const HEIGHT = parseInt(AppWindow.style.height); */
    let xShake = new Shake(1000, 60);
    let yShake = new Shake(1000, 60);

    let myTime = 0;
    let m = setInterval(() => {
        myTime += 16;
        xShake.update();
        yShake.update();
        AppWindow.style.transform = `translate(${xShake.amplitude(myTime)}px,${yShake.amplitude(myTime)}px)`;
        if (myTime >= 1000) clearInterval(m);
    }, 16);

    AppWindow.style.transform = `none`;
    setTimeout(() => {
        let anims = document.getAnimations();
        anims.forEach(an => an.cancel());
    }, 1500);
};
