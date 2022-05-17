import { ElementAttributes } from '..';
import { UI, UIView } from '../ui';

export class Login {
    lgCB: EventListener;
    elements: HTMLElement[];
    ui: UIView;

    constructor(logincallback: EventListener) {
        this.lgCB = logincallback;
        this.elements = [];
    }

    mount(element: HTMLElement) {
        const template = `
      <div class="Header">
        <h1 class="LoginPageHeader">Login Page</h1>
      </div>
      <button id="btnLogin" class="loginButton">Login</button>
      
      `;
        this.ui = UI.create(element, template, {});
        //this.ui.element.querySelector('#btnLogin').addEventListener('click', this.lgCB);
    }

    leaving(element: HTMLElement) {
        this.ui.destroy();
        this.ui = null;
    }
}
