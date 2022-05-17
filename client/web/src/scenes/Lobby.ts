import { ElementAttributes } from '..';

type UserInformation = {
    name: string;
    id: string;
    type: string;
};

export class Lobby {
    elements: HTMLElement[];
    userInfo: UserInformation;

    constructor() {
        this.elements = [];
    }

    setUserInfo = (u: UserInformation) => {
        this.userInfo = u;
    };

    mount(element: HTMLElement) {
        const myDiv = this.createElement('div', element, { className: 'Header' });
        this.createElement('h1', myDiv, { InnerText: 'Welcome to the Lobby', className: 'LoginPageheader' });

        const subDiv = this.createElement('div', element, { className: 'Header' });
        this.createElement('h3', subDiv, { InnerText: `Username ${this.userInfo.name}`, className: 'LoginPageheader' });
        this.createElement('h3', subDiv, { InnerText: `ID: ${this.userInfo.id}`, className: 'LoginPageheader' });
        this.createElement('h3', subDiv, { InnerText: `Type: ${this.userInfo.type}`, className: 'LoginPageheader' });

        this.createElement('button', element, { InnerText: 'Create New Game', className: 'loginButton' });

        const innerDiv = this.createElement('div', element, {});
        this.createElement('input', innerDiv, {});
        this.createElement('button', innerDiv, { InnerText: 'Join Existing Game', className: 'loginButton' });
    }

    createElement(type: string, parent: HTMLElement, attributes: ElementAttributes): HTMLElement {
        const myElement = document.createElement(type);
        myElement.innerHTML = attributes.InnerText ? attributes.InnerText : '';
        if (attributes.className) myElement.classList.add(attributes.className);
        if (attributes.event && attributes.eventCB) {
            myElement.addEventListener(attributes.event, attributes.eventCB);
        }

        parent.appendChild(myElement);
        this.elements.push(myElement);
        return myElement;
    }

    leaving(element: HTMLElement) {}
}
