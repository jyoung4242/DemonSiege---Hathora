import { Cardstatus } from '../../../../api/types';
import baseimage from '../assets/card base.png';
import cardborder from '../assets/newcardborder.png';
import cardback from '../assets/cardback.png';
import cardcost from '../assets/cardbasecost.png';

type Vector3 = {
    x: number;
    y: number;
    theta: number;
};

type CardSize = {
    width: number;
    aspectRatio: number;
};

type Vector2 = Omit<Vector3, 'theta'>;

type baseCardArgs = {
    position: Vector3;
    cardsize: CardSize;
    orientation: Cardstatus;
    name: string;
    parent?: string;
};

export class Card {
    position: Vector3;
    size: CardSize;
    orientation: Cardstatus;
    name: string;
    parent?: string;
    parentElement: HTMLElement;
    cardDiv: HTMLElement;
    front: HTMLElement;
    back: HTMLElement;
    contentDiv: HTMLElement;
    zoomed: number;

    constructor(name: string, size: CardSize, position: Vector3, orientation: Cardstatus, parent: string = 'myApp') {
        this.position = position;
        this.size = size;
        this.name = name;
        this.orientation = orientation;
        this.parent = parent;

        this.parentElement = document.getElementById(this.parent);

        this.cardDiv = document.createElement('div');
        this.cardDiv.id = this.name;
        this.cardDiv.classList.add('card');
        this.cardDiv.style.width = `${this.size.width}px`;
        this.cardDiv.style.aspectRatio = `${this.size.aspectRatio}`;
        this.cardDiv.style.position = 'fixed';
        this.cardDiv.style.opacity = '1';
        this.zoomed = 1;

        this.contentDiv = document.createElement('div');
        this.front = document.createElement('div');
        this.back = document.createElement('div');

        this.contentDiv.id = `${this.name}_Content`;
        this.front.innerHTML = this.name;
        this.back.innerHTML = 'Back of Card';
        this.front.id = `${this.name}_front`;
        this.back.id = `${this.name}_back`;
        this.front.classList.add('front');
        this.back.classList.add('back');
        this.contentDiv.classList.add('content');

        this.contentDiv.appendChild(this.front);
        this.contentDiv.appendChild(this.back);
        this.cardDiv.appendChild(this.contentDiv);
        this.parentElement.appendChild(this.cardDiv);
        this.updateCardTransform(0);
        return this;
    }

    move(x: number, y: number) {
        console.log(`Move`);
        this.position.x = x;
        this.position.y = y;
        this.updateCardTransform();
    }

    show() {
        this.cardDiv.style.transitionDuration = '0ms';
        this.cardDiv.style.opacity = `1`;
    }

    hide() {
        this.cardDiv.style.transitionDuration = '0ms';
        this.cardDiv.style.opacity = `0`;
    }

    rotate(deltaAngle: number) {
        console.log(`spin`);
        this.position.theta += deltaAngle;
        this.updateContentTransform(200);
    }

    zoom(factor: number) {
        this.zoomed = factor;
        this.updateCardTransform(500);
    }

    flip() {
        if (this.orientation != Cardstatus.FaceDown) {
            this.orientation = Cardstatus.FaceDown;
        } else {
            this.orientation = Cardstatus.FaceUp;
        }
        this.updateContentTransform();
    }

    protected updateCardTransform(speed: number = 500) {
        this.cardDiv.style.transitionDuration = `${speed}ms`;
        this.cardDiv.style.transform = `translate(${this.position.x}px,${this.position.y}px) scale(${this.zoomed},${this.zoomed})`;
    }

    protected updateContentTransform(speed: number = 500) {
        this.contentDiv.style.transitionDuration = `${speed}ms`;
        if (this.orientation == Cardstatus.FaceDown) this.contentDiv.style.transform = `rotateY(180deg) rotate(${this.position.theta}deg)`;
        else this.contentDiv.style.transform = `rotateY(0deg) rotate(${this.position.theta}deg)`;
    }

    static create(params: baseCardArgs) {
        console.log(`Here`);
        return new Card(params.name, params.cardsize, params.position, params.orientation, params.parent);
    }

    destroy() {}

    getPosition(): Vector3 {
        return this.position;
    }

    getSize(): object {
        return {
            width: this.size.width,
            height: this.size.width * (1 / this.size.aspectRatio),
            aspectRatio: this.size.aspectRatio.toFixed(3),
        };
    }
}

export type ABcard = {
    name: string;
    cardsize: CardSize;
    orientation: Cardstatus;
    position: Vector3;
    title: string;
    description: string;
    catagory: string;
    cost: number;
    image: string;
    level: number;
    parent?: string;
};

export class AbilityCard extends Card {
    title: string;
    description: string;
    catagory: string;
    cost: number;
    image: string;
    level: number;

    constructor(abcard: ABcard) {
        super(abcard.name, abcard.cardsize, abcard.position, abcard.orientation, (abcard.parent = 'myApp'));
        this.title = abcard.title;
        this.description = abcard.description;
        this.catagory = abcard.catagory;
        this.cost = abcard.cost;
        this.image = abcard.image;
        this.parent = abcard.parent;
        //inject ability card data into DOM elements
        const front_image = document.getElementById(`${this.name}_front`);
        front_image.style.backgroundImage = `url(${baseimage}), url(${cardborder}), url(${cardcost})`;
        return this;
    }

    create(params: ABcard) {
        console.log(`or here`);
        return new AbilityCard(params);
    }
}
