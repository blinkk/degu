import * as dom from '../../dom/dom';
import {DomWatcher} from '../../dom/dom-watcher';
import * as urlParams from '../../dom/url-params';

export enum ParamTogglerType {
  // Future support.
  // SELECT = 'select',
  BOOL = 'bool',
}

export interface ParamTogglerOption {
  displayName: string;
  paramName: string;
  paramType: ParamTogglerType;

  // For appending internally generated element.
  element?: HTMLElement;
}

export interface ParamTogglerConfig {
  togglerTitle: string;

  // The debugger itself gets enabled / disabled based on the presence
  // of a url parameter.
  togglerParamName: string;

  fields: ParamTogglerOption[];

  // Debugger can be opened with cmd + this keyname.
  // Leave this empty if you do not want the debugger to be opened with
  // keyboard commands.
  openKey?: string;
}

/**
 *
 * Generates a small panel to toggle url options on the page.
 *
 *
 * 1) Add param-toggler.sass to your project.
 * 2)
 *   const toggler = new ParamToggler({
 *     togglerTitle: 'My Project Param Settings',
 *     togglerParamName: 'debug',
 *     openKey: 'd',
 *     fields: [
 *       {
 *         displayName: 'Enable Grid Overlay',
 *         paramName: 'showGrid',
 *         paramType: ParamTogglerType.BOOL
 *       },
 *       {
 *         displayName: 'Inspect Accessibility',
 *         paramName: 'showAccessibility',
 *         paramType: ParamTogglerType.BOOL
 *       },
 *     ]
 *   })
 *
 * Now try pressing "CTRL + D" on your page and you'll see the toggler come up.
 * OR start the page with ?debug.
 *
 * The toggler will allow you to toggle specific param properties.
 */
export class ParamToggler {
  private config: ParamTogglerConfig;
  private mainPanelRootElement: HTMLElement;
  private mainPanelElement: HTMLElement;
  private mainPanelRefreshButton: HTMLElement;
  private mainPanelCloseButton: HTMLElement;

  private nameSpace = 'degu-param-toggler';
  private watcher: DomWatcher;
  // A list of keycodes that are currently pressed.
  private keyMapping: string[] = [];
  private initialized = false;

  constructor(config: ParamTogglerConfig) {
    this.config = config;
    this.watcher = new DomWatcher();

    if (this.config.openKey) {
      this.listenToKeyEvents();
    }

    this.mainPanelRootElement = this.createElementWithClass(this.nameSpace);
    this.mainPanelRootElement.classList.add('hide-panel');

    const title = this.createElementWithClass(this.nameSpace + '__title');
    title.textContent = this.config.togglerTitle;

    this.mainPanelRootElement.appendChild(title);

    this.mainPanelElement = this.createElementWithClass(
      this.nameSpace + '__panel'
    );

    this.mainPanelRefreshButton = this.createElementWithClass(
      this.nameSpace + '__button'
    );
    this.mainPanelRefreshButton.textContent = 'Refresh';

    this.mainPanelCloseButton = this.createElementWithClass(
      this.nameSpace + '__close'
    );

    this.mainPanelCloseButton.textContent = '✖️';

    this.mainPanelRootElement.append(this.mainPanelCloseButton);
    this.mainPanelRootElement.append(this.mainPanelElement);
    this.mainPanelRootElement.append(this.mainPanelRefreshButton);

    // If the toggler is not enabled.
    if (urlParams.hasParam(this.config.togglerParamName)) {
      this.init();
      this.open(false);
    }
  }

  private createElementWithClass(className: string, type = 'div') {
    const holder = document.createElement(type) as HTMLElement;
    holder.classList.add(className);
    return holder;
  }

  private listenToKeyEvents() {
    document.addEventListener('keydown', event => {
      if (!~this.keyMapping.indexOf(event.key)) {
        this.keyMapping.push(event.key);
      }

      // Check for CTRL + D
      if (
        ~this.keyMapping.indexOf(this.config.openKey || 'd') &&
        ~this.keyMapping.indexOf('Control')
      ) {
        // If it's open
        if (urlParams.hasParam(this.config.togglerParamName)) {
          this.close();
        } else {
          if (!this.initialized) {
            this.init();
          }

          window.setTimeout(() => {
            this.open(true);
          });
        }
      }
    });
    document.addEventListener('keyup', event => {
      if (~this.keyMapping.indexOf(event.key)) {
        this.keyMapping.splice(this.keyMapping.indexOf(event.key), 1);
      }
    });
  }

  public init() {
    this.initialized = true;
    this.watcher.add({
      element: this.mainPanelRefreshButton,
      on: ['click'],
      callback: this.onRefreshClick.bind(this),
    });

    this.watcher.add({
      element: this.mainPanelCloseButton,
      on: ['click'],
      callback: this.close.bind(this),
    });

    this.draw();
    document.body.append(this.mainPanelRootElement);
  }

  private draw() {
    this.config.fields.forEach(field => {
      if (field.element) {
        dom.removeElement(field.element);
      }
      if (field.paramType === ParamTogglerType.BOOL) {
        this.createBooleanOptionElement(field);
      }
    });
  }

  private createBooleanOptionElement(field: ParamTogglerOption) {
    const el = this.createElementWithClass(
      this.nameSpace + '__option',
      'label'
    );
    field.element = el;

    const title = this.createElementWithClass(
      this.nameSpace + '__option__title'
    );
    title.textContent = field.displayName;

    const checkbox = this.createElementWithClass(
      this.nameSpace + '__option__checkbox',
      'input'
    ) as HTMLInputElement;
    checkbox.type = 'checkbox';
    checkbox.name = field.paramType;
    checkbox.id = this.nameSpace + '-' + field.paramName;

    checkbox.setAttribute(
      'checked',
      urlParams.isTrue(field.paramName) ? 'true' : 'false'
    );
    checkbox.checked = urlParams.isTrue(field.paramName);

    el.appendChild(checkbox);
    el.appendChild(title);
    this.mainPanelElement.appendChild(el);
  }

  private open(pushState = false) {
    const params = new URLSearchParams(window.location.search);
    params.append(this.config.togglerParamName, '');
    this.mainPanelRootElement.classList.remove('hide-panel');
    if (pushState) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + '?' + params.toString()
      );
    }
  }

  private close() {
    const params = new URLSearchParams(window.location.search);
    params.delete(this.config.togglerParamName);
    this.mainPanelRootElement.classList.add('hide-panel');
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + '?' + params.toString()
    );
  }

  private onRefreshClick() {
    let params = new URLSearchParams(window.location.search);
    this.config.fields.forEach(field => {
      if (field.paramType === ParamTogglerType.BOOL) {
        const el = document.getElementById(
          `${this.nameSpace}-${field.paramName}`
        ) as HTMLInputElement;

        if (!el.checked) {
          params.delete(field.paramName);
        } else {
          params = urlParams.updateSearchParams(
            field.paramName,
            el.checked + '',
            params
          );
        }
      }
    });

    window.location.search = params.toString();
  }
}
