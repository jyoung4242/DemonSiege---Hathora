import cardback from '../assets/card assets/newcardback.png';
import { animate, stagger } from 'motion';
import { RoundState } from '../../../../api/types';

export const toggleCardpoolDrawer = (status: 'open' | 'closed') => {
    if (status == 'open') {
        document.getElementById('cardPoolDrawer').classList.add('openDrawer');
    } else {
        document.getElementById('cardPoolDrawer').classList.remove('openDrawer');
    }
};

export const runCardPoolAnimation = () => {
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

    let lastElement;

    for (let index = 0; index < NUM_CARDS; index++) {
        const MAG = 200;
        const angleToMultiply = 360 / NUM_CARDS;
        const myAngle = angleToMultiply * index;
        const retObject = getCoordFromAngleMag(myAngle, MAG);

        if (index != NUM_CARDS - 1) {
            animate(
                `div[index="${index}"]`,
                { x: retObject.x, y: retObject.y },
                {
                    delay: 0.1 * index,
                    duration: 0.25,
                }
            );
        } else {
            //last card animation
            const animationControls = animate(
                `div[index="${index}"]`,
                { x: retObject.x, y: retObject.y },
                {
                    delay: 0.1 * index,
                    duration: 0.25,
                }
            ).finished.then(() => {
                let fin = animate(
                    `.spinningDiv`,
                    { transform: 'rotate(1080deg)' },
                    {
                        delay: stagger(0.075),
                        duration: 1.5,
                    }
                ).finished.then(() => {
                    let fin = animate(
                        `.cardPoolAnimation`,
                        { top: `50%`, left: `50%`, transform: `translate(-50%,-50%)` },
                        {
                            duration: 0.5,
                        }
                    ).finished.then(() => {
                        //get location of .ABcardDeck
                        const location = getOffset(document.getElementById('cardPoolDeck')); //document.getElementById('cardPoolDeck').getBoundingClientRect();

                        let fin = animate(
                            `.cardPoolAnimation`,
                            { top: `${location.top}px`, left: `${location.left}px`, transform: 'none' },
                            {
                                duration: 0.5,
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
                        });
                    });
                });
            });
        }
    }
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
