import { Cardstatus } from '../../../../api/types';
import baseimage from '../assets/card assets/card base.png';
import cardborder from '../assets/card assets/newcardborder.png';
import cardback from '../assets/card assets/newcardback.png';
import cardcost from '../assets/card assets/cardbasecost.png';
import monsterLanding from '../assets/card assets/monster landing spot.png';
import monsterback from '../assets/card assets/monster card.png';
import monsterborder from '../assets/card assets/newmonsterborder.png';
import locationborder from '../assets/card assets/newlocationborder.png';
import locationback from '../assets/card assets/locationcardnew.png';
import TDborder from '../assets/card assets/towerdefensefrontborder.png';
import TDback from '../assets/card assets/towerdefense.png';
import Token from '../assets/card assets/tokenspot.png';
import DamageToken from '../assets/card assets/badtokenspot.png';
import { runLocationDamageAnimation } from './helper';
import { ClientState } from '../types';

export type cardBehavior = 'discard' | 'play' | 'idle';

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
    size: CardSize;
    orientation: Cardstatus;
    name: string;
    parent?: string;
};

export type ABcard = {
    name: string;
    size: CardSize;
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

export type TDcard = {
    name: string;
    size: CardSize;
    orientation: Cardstatus;
    position: Vector3;
    title: string;
    description: string;
    image: string;
    level: number;
    parent?: string;
};

export type TDcardData = {
    name: string;
    title: string;
    description: string;
    level: number;
    orientation: Cardstatus;
    image: string;
    active: boolean;
};

export type ABcardData = {
    name: string;
    title: string;
    description: string;
    catagory: string;
    level: number;
    cost: number;
    orientation: Cardstatus;
    image: string;
};

export type LOCcard = {
    name: string;
    size: CardSize;
    orientation: Cardstatus;
    position: Vector3;
    title: string;
    description: string;
    image: string;
    level: number;
    parent?: string;
    TD: number;
    sequence: number;
    health: number;
};

export type LOCcardData = {
    name: string;
    title: string;
    description: string;
    level: number;
    sequence: number;
    orientation: Cardstatus;
    image: string;
    TD: number;
    health: number;
};

export type MonsterCardData = {
    name: string;
    title: string;
    description: string;
    level: number;
    orientation: Cardstatus;
    image: string;
    reward: string;
    parent?: string;
    health: number;
    active: boolean;
};

export type MCdata = {
    name: string;
    size: CardSize;
    orientation: Cardstatus;
    position: Vector3;
    title: string;
    description: string;
    image: string;
    level: number;
    parent?: string;
    reward: string;
    health: number;
    active: boolean;
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
    myCard: HTMLElement;

    constructor(name: string, size: CardSize, parent: string) {
        this.position = { x: 0, y: 0, theta: 0 };
        this.size = size;
        this.name = name;
        this.orientation = Cardstatus.FaceUp;
        this.parent = parent ?? 'myApp';
        this.parentElement = document.getElementById(this.parent);
        this.cardDiv = document.createElement('div');
        this.cardDiv.id = this.name;
        this.cardDiv.classList.add('card');
        this.cardDiv.style.width = `${this.size.width}px`;
        this.cardDiv.style.aspectRatio = `${this.size.aspectRatio}`;
        this.cardDiv.style.position = 'relative';
        this.cardDiv.style.opacity = '1';
        this.zoomed = 1;

        this.contentDiv = document.createElement('div');
        this.front = document.createElement('div');
        this.back = document.createElement('div');

        this.contentDiv.id = `${this.name}_Content`;
        this.front.id = `${this.name}_front`;
        this.back.id = `${this.name}_back`;
        this.front.classList.add('front');
        this.back.classList.add('back');
        if (this.orientation == Cardstatus.FaceUp) this.back.classList.add('hidden');
        this.contentDiv.classList.add('content');

        this.contentDiv.appendChild(this.front);
        this.contentDiv.appendChild(this.back);
        this.cardDiv.appendChild(this.contentDiv);
        this.parentElement.appendChild(this.cardDiv);

        this.updateCardTransform(0);
        return this;
    }

    move(x: number, y: number) {
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
        return new Card(params.name, params.size, params.parent);
    }

    destroy() {
        const myParent = this.cardDiv.parentNode;
        myParent.removeChild(this.cardDiv);
    }

    getPosition(): Vector3 {
        return this.position;
    }

    getTransformX() {
        var style = window.getComputedStyle(this.myCard);
        var matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m41;
    }

    getSize(): object {
        return {
            width: this.size.width,
            height: this.size.width * (1 / this.size.aspectRatio),
            aspectRatio: this.size.aspectRatio.toFixed(3),
        };
    }
}

export class AbilityCard extends Card {
    title: string;
    description: string;
    catagory: string;
    cost: number;
    image: string;
    level: number;
    oldZ: string;
    cdBehavior: cardBehavior;
    state: ClientState;

    constructor(abcard: ABcard) {
        super(abcard.name, abcard.size, abcard.parent ?? 'myApp');
        this.title = abcard.title;
        this.description = abcard.description;
        this.catagory = abcard.catagory;
        this.cost = abcard.cost;
        this.image = abcard.image;
        this.parent = abcard.parent;
        this.level = abcard.level;
        //inject ability card data into DOM elements
        this.myCard = document.getElementById(`${this.name}`);
        this.myCard.addEventListener('click', e => this.cardClickEvent(e));
        this.myCard.style.fontFamily = 'demonsiege';
        const front_side = document.getElementById(`${this.name}_front`);
        front_side.style.backgroundSize = 'contain';
        if (this.cost > 0) front_side.style.backgroundImage = `url(${cardcost}), url(${cardborder}),url(${this.image}), url(${baseimage})`;
        else front_side.style.backgroundImage = `url(${cardborder}), url(${this.image}),url(${baseimage})`;
        front_side.style.backgroundSize = 'cover';
        front_side.style.backgroundRepeat = 'no-repeat';

        //title and level
        const titlediv = document.createElement('div');
        const titlespan = document.createElement('span');
        const levelspan = document.createElement('span');
        titlediv.classList.add('ABcardTitle');
        titlespan.innerHTML = `${this.title}`;
        levelspan.innerHTML = `Lvl: ${this.level}`;
        titlediv.appendChild(titlespan);
        titlediv.appendChild(levelspan);
        front_side.appendChild(titlediv);
        this.reduceTitleFont(titlespan, levelspan);

        //card cost
        if (this.cost > 0) {
            const costDiv = document.createElement('div');
            costDiv.classList.add('ABcardCost');
            costDiv.innerHTML = `${this.cost}`;
            front_side.appendChild(costDiv);
        }

        //card type
        const typeDiv = document.createElement('div');
        typeDiv.classList.add('ABcardType');

        typeDiv.innerHTML = `${this.catagory}`;
        typeDiv.style.backgroundColor = `white`;
        front_side.appendChild(typeDiv);

        //description
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('ABcardDesc');
        descriptionDiv.style.fontSize = `12px`;
        descriptionDiv.innerHTML = this.description;
        front_side.appendChild(descriptionDiv);

        const back_side = document.getElementById(`${this.name}_back`);
        back_side.style.backgroundSize = 'cover';
        back_side.style.backgroundImage = `url(${cardback})`;
        back_side.style.backgroundRepeat = 'no-repeat';
        return this;
    }

    cardClickEvent(e: Event) {
        switch (this.cdBehavior) {
            case 'discard':
                console.log(`discard/state: `, this.state);
                this.state.myConnection.discard({ cardname: this.name });
                this.destroy();
                break;
            case 'play':
                console.log(`play`);
                break;
            case 'idle':
            //do nothing
            default:
                break;
        }
    }

    setCardAction = (action: cardBehavior, state: ClientState) => {
        this.cdBehavior = action;
        this.state = state;
        console.log(`setting card action: `, this.cdBehavior, this.state);
    };

    static create(params: ABcard) {
        return new AbilityCard(params);
    }

    reduceTitleFont(titlespan: HTMLElement, levelspan: HTMLElement) {
        const titlecharcount = titlespan.innerHTML.length;
        if (titlecharcount >= 0 && titlecharcount < 19) {
            titlespan.style.fontSize = `10px`;
            levelspan.style.fontSize = `10px`;
        } else if (titlecharcount >= 19 && titlecharcount < 25) {
            titlespan.style.fontSize = `7px`;
            levelspan.style.fontSize = `7px`;
        } else if (titlecharcount >= 25 && titlecharcount < 30) {
            titlespan.style.fontSize = `5px`;
            levelspan.style.fontSize = `5px`;
        } else if (titlecharcount >= 30) {
            titlespan.style.fontSize = `4px`;
            levelspan.style.fontSize = `4px`;
        }
        const levelcount = levelspan.innerHTML.length;
    }
}

export class MonsterCard extends Card {
    title: string;
    description: string;
    health: number;
    activeDamage: number;
    image: string;
    level: number;
    reward: string;
    active: boolean;

    constructor(abcard: MCdata) {
        super(abcard.name, abcard.size, abcard.parent ?? 'myApp');
        this.title = abcard.title;
        this.description = abcard.description;
        this.image = abcard.image;
        this.parent = abcard.parent;
        this.level = abcard.level;
        this.reward = abcard.reward;
        this.health = abcard.health;
        this.active = abcard.active;

        //inject ability card data into DOM elements
        const myCard = document.getElementById(`${this.name}`);
        myCard.setAttribute('active', `${this.active}`);
        myCard.classList.add('noclick');
        myCard.style.fontFamily = 'demonsiege';
        const front_side = document.getElementById(`${this.name}_front`);
        front_side.style.backgroundSize = 'contain';
        front_side.style.backgroundImage = `url(${monsterborder}), url(${this.image})`;

        //title and level
        const titlediv = document.createElement('div');
        const titlespan = document.createElement('span');
        const levelspan = document.createElement('span');
        titlediv.classList.add('MCcardTitle');
        titlespan.innerHTML = `${this.title}`;
        levelspan.innerHTML = `Lvl: ${this.level}`;
        titlediv.appendChild(titlespan);
        titlediv.appendChild(levelspan);
        front_side.appendChild(titlediv);
        this.reduceTitleFont(titlespan, levelspan);

        //card health

        const healthDiv = document.createElement('div');
        healthDiv.classList.add('MCcardHealth');
        healthDiv.innerHTML = `${this.health}`;
        front_side.appendChild(healthDiv);

        //description
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('MCcardDesc');
        descriptionDiv.style.fontSize = `12px`;
        descriptionDiv.innerHTML = this.description;
        front_side.appendChild(descriptionDiv);

        //reward
        const rewardDiv = document.createElement('div');
        rewardDiv.classList.add('MCcardReward');
        rewardDiv.style.fontSize = `12px`;
        rewardDiv.innerHTML = this.reward;
        front_side.appendChild(rewardDiv);

        const back_side = document.getElementById(`${this.name}_back`);
        back_side.style.backgroundSize = 'contain';
        back_side.style.backgroundImage = `url(${monsterback})`;

        return this;
    }

    static create(params: MCdata) {
        return new MonsterCard(params);
    }

    reduceTitleFont(titlespan: HTMLElement, levelspan: HTMLElement) {
        const titlecharcount = titlespan.innerHTML.length;
        if (titlecharcount >= 5 && titlecharcount < 19) {
            titlespan.style.fontSize = `10px`;
            levelspan.style.fontSize = `10px`;
        } else if (titlecharcount >= 19 && titlecharcount < 25) {
            titlespan.style.fontSize = `7px`;
            levelspan.style.fontSize = `7px`;
        } else if (titlecharcount >= 25 && titlecharcount < 30) {
            titlespan.style.fontSize = `5px`;
            levelspan.style.fontSize = `5px`;
        } else if (titlecharcount >= 30) {
            titlespan.style.fontSize = `4px`;
            levelspan.style.fontSize = `4px`;
        }
        const levelcount = levelspan.innerHTML.length;
    }
}

export class LocationCard extends Card {
    title: string;
    description: string;
    health: number;
    activeDamage: number = 0;
    image: string;
    level: number;
    sequence: number;
    TD: number;

    constructor(abcard: LOCcard) {
        super(abcard.name, abcard.size, abcard.parent ?? 'myApp');
        this.title = abcard.title;
        this.description = abcard.description;
        this.image = abcard.image;
        this.parent = abcard.parent;
        this.level = abcard.level;
        this.health = abcard.health;
        this.sequence = abcard.sequence;
        this.TD = abcard.TD;

        //inject ability card data into DOM elements
        const myCard = document.getElementById(`${this.name}`);
        myCard.style.fontFamily = 'demonsiege';
        const front_side = document.getElementById(`${this.name}_front`);
        front_side.style.backgroundSize = 'contain';
        front_side.style.backgroundImage = `url(${locationborder}), url(${this.image})`;

        //title and level and sequence
        const titlediv = document.createElement('div');
        const titlespan = document.createElement('span');
        const levelspan = document.createElement('span');
        const sequenceSpan = document.createElement('span');
        titlediv.classList.add('LOCcardTitle');
        titlespan.innerHTML = `${this.title}`;
        levelspan.innerHTML = `Lvl: ${this.level}`;
        sequenceSpan.innerHTML = `Location: ${this.sequence}/3`;
        titlediv.appendChild(titlespan);
        titlediv.appendChild(sequenceSpan);
        titlediv.appendChild(levelspan);
        front_side.appendChild(titlediv);
        this.reduceTitleFont(titlespan, levelspan, sequenceSpan);

        //card health
        const healthDiv = document.createElement('div');
        healthDiv.classList.add('LOCcardDHealth');
        for (let index = 0; index < this.health; index++) {
            const tokenDiv = document.createElement('div');
            tokenDiv.id = `${this.title}_healthDiv${index + 1}`;
            if (index % 2) tokenDiv.classList.add('LOCcardDHealthToken1');
            else tokenDiv.classList.add('LOCcardDHealthToken2');
            tokenDiv.style.backgroundImage = `url(${Token})`;
            tokenDiv.style.backgroundRepeat = 'no-repeat';
            if (this.health < 8) {
                tokenDiv.style.marginLeft = `1%`;
                tokenDiv.style.marginRight = `1%`;
            } else {
                tokenDiv.style.marginLeft = `.3%`;
                tokenDiv.style.marginRight = `.3%`;
            }
            healthDiv.appendChild(tokenDiv);
        }
        front_side.appendChild(healthDiv);

        //description
        const descriptionDiv = document.createElement('div');
        const TDdiv = document.createElement('div');

        TDdiv.classList.add('LOCcardDescTD');
        TDdiv.style.fontSize = `12px`;
        TDdiv.innerHTML = `Each Turn reveals ${this.TD} Tower Defense Cards`;
        descriptionDiv.appendChild(TDdiv);
        descriptionDiv.classList.add('LOCcardDesc');

        let innerDescriptionDiv: HTMLElement;
        if (this.description.length) {
            innerDescriptionDiv = document.createElement('div');
            innerDescriptionDiv.classList.add('LOCcardDescDesc');
            innerDescriptionDiv.innerHTML = this.description;
            innerDescriptionDiv.style.fontSize = `12px`;
            descriptionDiv.appendChild(innerDescriptionDiv);
        }
        front_side.appendChild(descriptionDiv);

        const back_side = document.getElementById(`${this.name}_back`);
        back_side.style.backgroundSize = 'contain';
        back_side.style.backgroundImage = `url(${locationback})`;

        return this;
    }

    addDamage(dmg: number) {
        console.log('here in addDamage');
        //increment active damage
        this.activeDamage += 1;
        console.log(`damage: `, this.activeDamage);
        //for each active damage, change token image
        for (let index = 1; index <= this.activeDamage; index++) {
            let elementString = `${this.title}_healthDiv${index}`;
            const tokenDiv = document.getElementById(elementString);
            tokenDiv.style.backgroundImage = `url(${DamageToken})`;
            console.log(`setting token images: index: ${index} tokenDiv: ${tokenDiv}`);
            if (index == this.activeDamage) runLocationDamageAnimation();
        }
    }

    static create(params: LOCcard) {
        return new LocationCard(params);
    }

    reduceTitleFont(titlespan: HTMLElement, levelspan: HTMLElement, sequenceelement: HTMLElement) {
        const titlecharcount = titlespan.innerHTML.length;
        if (titlecharcount >= 5 && titlecharcount < 19) {
            titlespan.style.fontSize = `10px`;
            levelspan.style.fontSize = `10px`;
            sequenceelement.style.fontSize = `10px`;
        } else if (titlecharcount >= 19 && titlecharcount < 25) {
            titlespan.style.fontSize = `7px`;
            levelspan.style.fontSize = `7px`;
            sequenceelement.style.fontSize = `7px`;
        } else if (titlecharcount >= 25 && titlecharcount < 30) {
            titlespan.style.fontSize = `5px`;
            levelspan.style.fontSize = `5px`;
            sequenceelement.style.fontSize = `5px`;
        } else if (titlecharcount >= 30) {
            titlespan.style.fontSize = `4px`;
            levelspan.style.fontSize = `4px`;
            sequenceelement.style.fontSize = `4px`;
        }
        const levelcount = levelspan.innerHTML.length;
    }
}

export class TDCard extends Card {
    title: string;
    description: string;
    image: string;
    level: number;

    constructor(abcard: TDcard) {
        super(abcard.name, abcard.size, abcard.parent ?? 'myApp');
        this.title = abcard.title;
        this.description = abcard.description;
        this.image = abcard.image;
        this.parent = abcard.parent;
        this.level = abcard.level;

        //inject ability card data into DOM elements
        const myCard = document.getElementById(`${this.name}`);
        myCard.style.fontFamily = 'demonsiege';
        const front_side = document.getElementById(`${this.name}_front`);
        front_side.style.backgroundSize = 'contain';
        front_side.style.backgroundImage = `url(${TDborder}), url(${this.image})`;

        //title and level and sequence
        const titlediv = document.createElement('div');
        const titlespan = document.createElement('span');
        const levelspan = document.createElement('span');
        titlediv.classList.add('TDcardTitle');
        titlespan.innerHTML = `${this.title}`;
        levelspan.innerHTML = `Lvl: ${this.level}`;

        titlediv.appendChild(titlespan);
        titlediv.appendChild(levelspan);
        front_side.appendChild(titlediv);
        this.reduceTitleFont(titlespan, levelspan);

        //description
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('TDdescription');
        descriptionDiv.innerHTML = this.description;
        descriptionDiv.style.fontSize = `0.8vw`;
        front_side.appendChild(descriptionDiv);

        //back of card
        const back_side = document.getElementById(`${this.name}_back`);
        back_side.style.backgroundSize = 'contain';
        back_side.style.backgroundImage = `url(${TDback})`;

        return this;
    }

    static create(params: TDcard) {
        return new TDCard(params);
    }

    reduceTitleFont(titlespan: HTMLElement, levelspan: HTMLElement) {
        const titlecharcount = titlespan.innerHTML.length;
        if (titlecharcount >= 5 && titlecharcount < 19) {
            titlespan.style.fontSize = `14px`;
            levelspan.style.fontSize = `14px`;
        } else if (titlecharcount >= 19 && titlecharcount < 25) {
            titlespan.style.fontSize = `10px`;
            levelspan.style.fontSize = `10px`;
        } else if (titlecharcount >= 25 && titlecharcount < 30) {
            titlespan.style.fontSize = `8px`;
            levelspan.style.fontSize = `8px`;
        } else if (titlecharcount >= 30) {
            titlespan.style.fontSize = `6px`;
            levelspan.style.fontSize = `6px`;
        }
        const levelcount = levelspan.innerHTML.length;
    }
}
