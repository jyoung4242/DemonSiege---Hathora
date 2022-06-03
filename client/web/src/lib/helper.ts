import cardback from '../assets/card assets/newcardback.png';
import { animate } from 'motion';
import { Cardstatus } from '../../../../api/types';
import ABcardback from '../assets/card assets/newcardback.png';
import { isCardinDB, retrieveMasterCardData } from './allAbilityCards';
import { ABcard, AbilityCard } from './card';
import { playerHand, game } from '../index';
import { ABCARDASPECTRATIO } from '../types';

export const toggleCardpoolDrawer = (status: 'open' | 'closed') => {
    if (status == 'open') {
        document.getElementById('cardPoolDrawer').classList.add('openDrawer');
    } else {
        document.getElementById('cardPoolDrawer').classList.remove('openDrawer');
    }
};

export const runCardPoolAnimation = () => {
    return new Promise<void>(resolve => {
        const NUM_CARDS = 20;
        let elementArray: HTMLElement[] = [];

        for (let index = 0; index < NUM_CARDS; index++) {
            elementArray[index] = document.createElement('div');
            elementArray[index].classList.add('card');
            elementArray[index].classList.add('cardPoolAnimation');
            elementArray[index].setAttribute('index', `${index}`);

            let innerDivElement = document.createElement('div');
            innerDivElement.style.backgroundImage = `url(${cardback})`;
            innerDivElement.style.backgroundRepeat = 'no-repeat';
            innerDivElement.style.backgroundSize = `cover`;
            innerDivElement.classList.add('spinningDiv');
            elementArray[index].appendChild(innerDivElement);

            document.getElementById('myApp').appendChild(elementArray[index]);
        }

        for (let index = 0; index < NUM_CARDS; index++) {
            const MAG = 250;
            const angleToMultiply = 360 / NUM_CARDS;
            const myAngle = angleToMultiply * index;
            const retObject = getCoordFromAngleMag(myAngle, Math.random() * MAG);

            if (index != NUM_CARDS - 1) {
                animate(
                    `div[index="${index}"]`,
                    { x: retObject.x, y: retObject.y },
                    {
                        delay: 0.05 * index,
                        duration: 0.25,
                    }
                );
            } else {
                //last card animation
                const animationControls = animate(
                    `div[index="${index}"]`,
                    { x: retObject.x, y: retObject.y },
                    {
                        delay: 0.05 * index,
                        duration: 0.25,
                    }
                ).finished.then(() => {
                    //loop through cards and random place them in center
                    elementArray = shuffle(elementArray);
                    for (let index = 0; index < NUM_CARDS; index++) {
                        if (index != NUM_CARDS - 1) {
                            animate(
                                elementArray[index],
                                { x: `-50%`, y: `-50%`, rotate: 360 },
                                {
                                    delay: 0.05 * index,
                                    duration: 0.25,
                                }
                            );
                        } else {
                            let fin = animate(
                                elementArray[index],
                                { x: `-50%`, y: `-50%`, rotate: 360 },
                                {
                                    delay: 0.05 * index,
                                    duration: 0.25,
                                }
                            ).finished.then(() => {
                                //get location of .ABcardDeck
                                const location = getOffset(document.getElementById('cardPoolDeck')); //document.getElementById('cardPoolDeck').getBoundingClientRect();

                                let fin = animate(
                                    `.cardPoolAnimation`,
                                    { top: `${location.top}px`, left: `${location.left}px`, transform: 'none' },
                                    {
                                        duration: 0.75,
                                    }
                                ).finished.then(() => {
                                    let pooldeck = document.getElementById('cardPoolDeck');
                                    pooldeck.style.backgroundImage = `url(${cardback})`;
                                    pooldeck.style.backgroundSize = 'cover';
                                    pooldeck.style.backgroundRepeat = 'no-repeat';

                                    let fin = animate(
                                        `.cardPoolAnimation`,
                                        { opacity: 0 },
                                        {
                                            duration: 0.1,
                                        }
                                    );

                                    //move the cards under the drawer div
                                    toggleCardpoolDrawer('closed');
                                    for (let index = 0; index < NUM_CARDS; index++) {
                                        document.getElementById('myApp').removeChild(elementArray[index]);
                                    }
                                    resolve();
                                });
                            });
                        }
                    }
                });
            }
        }
    });
};

export const dealPlayerCardFromDeck = async myCard => {
    //find card
    console.log(`myCard.Title`, myCard.Title);
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
        console.log(`Helper.ts, line 146, calling create `);
        let card = AbilityCard.create(args);
        game.myHand.addCard(card);
        playerHand.push(myCard);
        /*let cardDiv = document.getElementById(`${card.name}`);
        document.getElementById('innerPlayerHand').appendChild(cardDiv);
        console.log(`card name`, card.name);
        let elem = document.getElementById(`${card.name}`);
        await animate(elem, { rotate: 1080, x: 300 }, { duration: 0.4 });
        reorganizePlayerHand(); */
    }
};

export const reorganizePlayerHand = () => {
    //get number of cards in player hand
    let numCards = playerHand.length;
    let oddEven: 'Odd' | 'Even' = 'Odd';
    if (numCards % 2 == 0) oddEven = 'Even';
    //calculate card 'offset' for being in a hand ~ 30% of card size
    let cardOffset = playerHand[0];
    //get size in pixels of hand area
    let handWidth = document.getElementById('innerPlayerHand').style.width;
};

export const runPlayerHandAnimation = () => {
    return new Promise<void>((resolve, reject) => {
        let elem = document.getElementsByClassName('playersArea');
        elem[0].classList.add('openPlayersHand');

        let pdeck = document.getElementById('playerdeck');
        console.log(`pdeck: `, pdeck);
        pdeck.style.backgroundImage = `url(${ABcardback})`;
        pdeck.style.backgroundSize = 'cover';
        pdeck.style.backgroundRepeat = 'no-repeat';
        setTimeout(() => {
            elem[0].classList.remove('openPlayersHand');
        }, 1500);
    });
};

const getCoordFromAngleMag = (thetaDeg, MagPixels): { x: number; y: number } => {
    //x=r×cos(θ), y=r×sin(θ)
    const thetaRad = thetaDeg * (Math.PI / 180);
    //radians = degrees × 0.017453
    return { x: MagPixels * Math.cos(thetaRad), y: MagPixels * Math.sin(thetaRad) };
};

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
    };
}

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

    return array;
}
