export interface IUIBinding extends Partial<Omit<UIBinding, 'id'>> {}

export type fromUICallback = (newValue: string, oldValue: any, property: string, model: any) => any | void;
export type toUICallback = (newValue: any, oldValue: any, property: string, model: any) => string | void;

export class UIBinding {
    public id: number;

    public object: any;
    public property: string;

    public context: any;
    public selector: string | Element | Node;
    public attribute: string;

    public fromUI: boolean | fromUICallback = false;
    public toUI: boolean | toUICallback = true;

    private $element: Element;
    private lastValue: any;
    private lastUIValue: string;
    private firstUpdate = true;

    public constructor() {
        this.id = ++UI.id;
    }

    public get element(): Element {
        if (this.$element == null) {
            this.$element = this.selector instanceof Element || this.selector instanceof Text ? this.selector : this.context.querySelector(this.selector);
        }
        return this.$element;
    }
    public set element(element: Element | null) {
        this.$element = element;
    }

    public unbind(): void {
        UI.unbind(this);
    }

    public updateFromUI(): void {
        if (this.fromUI === false || this.firstUpdate) {
            this.firstUpdate = false;
            return;
        }
        const { target, property } = UI.resolveProperty(this.element, this.attribute);
        const uiValue = target[property];
        if (uiValue !== this.lastUIValue) {
            let value = this.fromUI !== true ? this.fromUI(uiValue, this.lastUIValue, this.property, this.object) : uiValue;
            this.lastUIValue = uiValue;
            if (value !== undefined && value !== this.lastValue) {
                const { target, property } = UI.resolveProperty(this.object, this.property);
                if (typeof target[property] === 'number' && !isNaN(value)) {
                    value = +value;
                }
                target[property] = value;
                this.lastValue = value;
            }
        }
    }

    public updateToUI(): void {
        if (this.toUI === false) {
            return;
        }
        const { target, property } = UI.resolveProperty(this.object, this.property);
        const value = target[property];
        if (value !== this.lastValue) {
            const uiValue = this.toUI !== true ? (this.toUI as toUICallback)(value, this.lastValue, this.property, this.object) : value;
            this.lastValue = value;
            if (uiValue !== undefined && uiValue !== this.lastUIValue) {
                const { target, property } = UI.resolveProperty(this.element, this.attribute);
                target[property] = uiValue;
                this.lastUIValue = uiValue;
            }
        }
    }
}

export class UIView {
    public element: Element;
    public bindings: UIBinding[] = [];

    public destroy(): void {
        this.element.parentElement.removeChild(this.element);
        this.bindings.forEach(binding => binding.unbind());
    }
}

export class UI {
    public static uis = {};
    public static id = 0;

    public static create(parent: Element, template: string, model = {}): UIView {
        const view = new UIView();

        const container = document.createElement('div');
        container.innerHTML = template.replace(/==>/g, '--+').replace(/<==/g, '+--').replace(/<=>/g, '+-+');
        const element = container.firstElementChild as HTMLElement;
        view.element = element;
        view.bindings.push(...UI.parse(element, model));
        parent.appendChild(element);
        console.log(view);
        return view;
    }

    public static parse(element: Element, object: any): UIBinding[] {
        const bindings: UIBinding[] = [];
        const regex = /([\S\s]*?)\$\{(.*?)\}([\S\s]*)/m;
        if (element.nodeType === 3) {
            // text
            let text = element.textContent;
            let match = text.match(regex);
            while (match != null) {
                const first = match[1];
                const property = match[2];
                text = match[3];

                let clone = element.cloneNode() as Element;
                element.textContent = first;
                element.parentElement.insertBefore(clone, element.nextElementSibling);
                bindings.push(UI.bind({ selector: clone, attribute: 'textContent', object, property }));
                element = clone;

                clone = element.cloneNode() as Element;
                clone.textContent = text;
                element.parentElement.insertBefore(clone, element.nextElementSibling);
                element = clone;
                match = text.match(regex);
            }
        } else {
            bindings.push(
                ...Object.keys(element.attributes ?? [])
                    .map((attribute): UIBinding[] => {
                        const bindings: UIBinding[] = [];
                        const attr = element.attributes[attribute];
                        let match = attr.name.match(regex);
                        if (match != null) {
                            match = match[2];
                            match = match.match(/^(.*?)([+-])-([+-])(.*?)$/);
                            const [_ignore, name, toUI, fromUI, value] = match;
                            element.setAttribute(name, '');
                            return [UI.bind({ selector: element, attribute: name, object, property: value, toUI: toUI === '+', fromUI: fromUI === '+' })];
                        }
                        const parts = [attr.value];
                        let index = 0;
                        match = parts[index].match(regex);
                        while (match != null) {
                            const [_ignore, before, property, after] = match;
                            bindings.push(
                                UI.bind({
                                    selector: element,
                                    attribute: attr.name,
                                    object,
                                    property,
                                    toUI: (_newValue: any, _oldValue: any, _name: string, model: any): void => {
                                        const value = parts
                                            .map((part, index) => {
                                                if (index % 2 === 0) {
                                                    return part;
                                                }
                                                const { target, property } = UI.resolveProperty(model, part);
                                                return target[property];
                                            })
                                            .join('');
                                        element.setAttribute(attr.name, value);
                                    },
                                })
                            );
                            parts[index++] = before;
                            parts[index++] = property;
                            parts[index] = after;
                            match = parts[index].match(regex);
                        }
                        return bindings;
                    })
                    .flat()
            );
            bindings.push(
                ...Array.from(element.childNodes)
                    .map(child => UI.parse(child as HTMLElement, object))
                    .flat()
            );
        }
        return bindings;
    }

    public static bind(options: IUIBinding): UIBinding {
        const binding = new UIBinding();
        binding.object = options.object;
        binding.property = options.property;
        binding.context = options.context ?? document;
        binding.selector = options.selector;
        binding.attribute = options.attribute ?? 'innerText';
        binding.fromUI = options.fromUI ?? binding.fromUI;
        binding.toUI = options.toUI ?? binding.toUI;

        UI.uis[binding.id] = binding;
        return binding;
    }

    public static unbind(binding: UIBinding): void {
        binding.element = null;
        delete UI.uis[`${binding.id}`];
    }

    public static update(): void {
        // console.log('UI.update', Object.keys(UI.uis).length);
        for (const id in UI.uis) {
            const binding = UI.uis[id];
            binding.updateFromUI();
            binding.updateToUI();
        }
    }

    public static resolveProperty(object: any, property: string): { target: any; property: string } {
        const properties = property.split('.');
        let target = object;
        while (properties.length > 1) {
            target = target[properties.shift()];
        }
        return { target, property: properties[0] };
    }
}
