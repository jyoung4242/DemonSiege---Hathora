import { AbilityCard } from './card';

export class hand {
    cards: AbilityCard[];
    myDiv: HTMLElement;
    constructor(str) {
        this.myDiv = document.getElementById(`${str}`);
        this.cards = [];
    }
    removingCard = false;

    addCard(crd) {
        let newCard: AbilityCard = new AbilityCard(crd);
        //get 'element'

        newCard.myCard.addEventListener('dblclick', e => {
            e.preventDefault();
            this.removingCard = true;
            this.removeCard(newCard);
        });
        newCard.myCard.addEventListener('pointerover', e => {
            if (!this.removingCard) {
                e.preventDefault();
                newCard.oldZ = newCard.myCard.style.zIndex;
                newCard.myCard.style.zIndex = '10';
                //zoom in on card
                var xTransform = newCard.getTransformX();
                newCard.myCard.style.transition = `tranform 0.5s`;
                newCard.myCard.style.transform = `translateX(${xTransform}px) translateY(-50px) scale(1.25,1.25)`;
            }
        });
        newCard.myCard.addEventListener('pointerout', e => {
            if (!this.removingCard) {
                e.preventDefault();
                newCard.myCard.style.zIndex = newCard.oldZ;
                //zoom in on card
                var xTransform = newCard.getTransformX();
                newCard.myCard.style.transition = `tranform 0.5s`;
                newCard.myCard.style.transform = `translateX(${xTransform}px) translateY(0px) scale(1,1)`;
            } else this.removingCard = false;
        });

        this.myDiv.appendChild(newCard.myCard);
        this.cards.push(newCard);
        this.organizeCards();
    }

    removeCard(crd) {
        //remove from array
        let myIndex = this.cards.findIndex(card => card.name == crd.name);

        if (myIndex != -1) {
            //splice array
            this.cards.splice(myIndex, 1);
            //remove from DOM.
            crd.myCard.parentNode.removeChild(crd.myCard);
            this.organizeCards();
            setTimeout(() => {
                this.organizeCards();
            }, 400);
        }
    }

    resetHand() {
        this.cards = [];
        while (this.myDiv.firstChild) {
            this.myDiv.removeChild(this.myDiv.firstChild);
        }
    }

    organizeCards() {
        let handMetrics = document.getElementById('innerPlayerHand').getBoundingClientRect();
        let cardwidth = this.vw(7);
        let cw = handMetrics.right - handMetrics.left; // this.myDiv.clientWidth, //512
        let sw = this.cards.length * cardwidth; //this.myDiv.scrollWidth, //# of cards * 135
        let diff = sw - cw;
        let offset = diff < 0 ? 0 : diff / (this.cards.length - 1);

        this.cards.forEach((card, i) => {
            let newOffset = offset * i;
            card.myCard.style.transform = `translateX(-${newOffset}px) translateY(0px) scale(1,1)`;
        });
    }

    vw(v) {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        return (v * w) / 100;
    }
}
