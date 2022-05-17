import { ElementAttributes } from '..';

export class Login {
    lgCB: EventListener;
    elements: HTMLElement[];

    constructor(logincallback: EventListener) {
        this.lgCB = logincallback;
        this.elements = [];
    }

    mount(element: HTMLElement) {
        const myDiv = this.createElement('div', element, { className: 'Header' });
        this.createElement('h1', myDiv, { InnerText: 'Login Page', className: 'LoginPageheader' });
        this.createElement('button', element, { InnerText: 'Login', className: 'loginButton', event: 'click', eventCB: this.lgCB });
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

    leaving(element: HTMLElement) {
        //unmount all ui elements
        for (var i = this.elements.length - 1; i >= 0; i--) {
            this.elements[i].parentNode.removeChild(this.elements[i]);
        }
    }
}
