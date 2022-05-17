import { AnonymousUserData } from '../../../../api/base';
import { GameState } from '../../../../api/types';
import { HathoraClient, HathoraConnection, UpdateArgs } from '../../../.hathora/client';

type ElementAttributes = {
    InnerText?: string;
    className?: string;
    event?: string;
    eventCB?: EventListenerOrEventListenerObject;
};

export class Login {
    clientRef: HathoraClient;
    user: AnonymousUserData;

    constructor(client: HathoraClient) {
        this.clientRef = client;
        console.log(`client reference: `, this.clientRef);
    }

    mount(element: HTMLElement) {
        const myDiv = this.createElement('div', element, { className: 'Header' });
        this.createElement('h1', myDiv, { InnerText: 'Login Page', className: 'LoginPageheader' });
        this.createElement('button', element, { InnerText: 'Login', className: 'loginButton', event: 'click', eventCB: this.login });
    }

    createElement(type: string, parent: HTMLElement, attributes: ElementAttributes): HTMLElement {
        const myElement = document.createElement(type);
        myElement.innerHTML = attributes.InnerText ? attributes.InnerText : '';
        if (attributes.className) myElement.classList.add(attributes.className);
        if (attributes.event && attributes.eventCB) {
            myElement.addEventListener(attributes.event, attributes.eventCB);
        }

        parent.appendChild(myElement);
        return myElement;
    }

    async login() {
        if (this.clientRef == undefined) {
            console.log(`lost client reference`);
            return;
        }
        if (sessionStorage.getItem('token') === null) {
            console.log(`client reference: `, this.clientRef);
            //sessionStorage.setItem('token', await this.clientRef.loginAnonymous());
        }
        const token = sessionStorage.getItem('token')!;
        this.user = HathoraClient.getUserFromToken(token);
        console.log(this.user);
    }

    leaving(element: HTMLElement) {}
}
