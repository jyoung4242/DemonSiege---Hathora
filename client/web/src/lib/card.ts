import { Cardstatus } from '../../../../api/types';

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
    startingPosition: Vector3;
    size: CardSize;
    orientation: Cardstatus;
    name: string;
    parent?: string;
};

export default class Card {
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

    constructor(name: string, size: CardSize, position: Vector3, orientation: Cardstatus, parent?: string) {
        this.position = position;
        this.size = size;
        this.name = name;
        this.orientation = orientation;
        this.parent = parent;

        if (parent) this.parentElement = document.getElementById(this.parent);
        else this.parentElement = document.getElementById('myApp');

        this.cardDiv = document.createElement('div');
        this.cardDiv.classList.add('card');
        this.cardDiv.style.width = `${this.size.width}px`;
        this.cardDiv.style.aspectRatio = `${this.size.aspectRatio}`;
        this.cardDiv.style.position = 'fixed';
        this.cardDiv.style.top = `0px`;
        this.cardDiv.style.left = `0px`;
        this.cardDiv.style.visibility = 'hidden';

        this.contentDiv = document.createElement('div');
        this.front = document.createElement('div');
        this.back = document.createElement('div');

        this.front.innerHTML = this.name;
        this.back.innerHTML = 'Back of Card';
        this.front.classList.add('front');
        this.back.classList.add('back');
        this.contentDiv.classList.add('content');

        this.contentDiv.appendChild(this.front);
        this.contentDiv.appendChild(this.back);
        this.cardDiv.appendChild(this.contentDiv);
        this.parentElement.appendChild(this.cardDiv);

        return this;
    }

    move(newPosition: Vector2) {
        console.log(`Move`);
        this.position.x = newPosition.x;
        this.position.y = newPosition.y;
        this.updateCardTransform(600);
    }

    show() {
        this.cardDiv.style.visibility = 'visible';
    }

    hide() {
        this.cardDiv.style.visibility = 'hidden';
    }

    rotate(newAngle: number) {
        console.log(`spin`);
        this.position.theta = newAngle;
        this.updateCardTransform(200);
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
        this.contentDiv.style.transitionDuration = `450ms`;
        if (this.orientation == Cardstatus.FaceDown) this.contentDiv.style.transform = `rotateY(180deg)`;
        else this.contentDiv.style.transform = `rotateY(0deg)`;
    }

    protected updateCardTransform(speed: number = 500) {
        this.cardDiv.style.transitionDuration = `${speed}ms`;
        this.cardDiv.style.transform = `rotate(${this.position.theta}deg) translate(${this.position.x}px,${this.position.y}px) scale(${this.zoomed},${this.zoomed})`;
    }

    static create(params: baseCardArgs) {
        return new Card(params.name, params.size, params.startingPosition, params.orientation, params.parent);
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
