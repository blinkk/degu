import {element} from 'angular';
import {DomWatcher} from '../dom/dom-watcher';

/**
 * A function that returns true or false.
 */
export type AtClassEvaluationCallBack = (...args: any[]) => boolean;

export interface AtClassConfig {
  /**
   * The root element to observe and to scope at class functionality to.
   */
  element: HTMLElement;

  /**
   * A list of tuple [name, callback] to check on each resize.
   */
  conditions: [string, AtClassEvaluationCallBack][];

  /**
   * Whether to update on element resize events.
   */
  watchResize: boolean;
}

/**
 * A class that allows you to selectively apply css classes based on preset
 * conditions. After declaring your conditions, you can add css classes with
 * <className>@<condition>.
 *
 *
 * Example:
 * ```ts
 *
 * // Instantiate AtClass with your conditions.
 * const atClass = new AtClass({
 *   element: document.querySelector('myElement'),
 *   conditions: [
 *       ['desktop', ()=> window.innerWidth > 1000],
 *       ['tablet', ()=> window.innerWidth < 1000 && window.innerWidth > 780],
 *       ['mobile', ()=> window.innerWidth < 780],
 *   ],
 *   watchResize: true
 * })
 *
 * // Later
 * atClass.dispose();
 *```
 *
 *
 * Now by convention, you can apply css classes with <className>@<condition> rules.
 * In your html, you can do this:
 *
 * ```html
 * <div id="myElement">
 *   <h1 class="blue@desktop left@desktop red@tablet orange@mobile">Title 1</h1>
 *   <h1 class="green@desktop green@tablet blue@mobile">Title 2</h1>
 * </div>
 * ```
 */
export class AtClass {
  private config: AtClassConfig;
  private rootElement: HTMLElement;
  private watcher: DomWatcher;

  /**
   * A cache of all html elements with @ classes on them.
   */
  private atClassElements: Set<AtClassElement> = new Set<AtClassElement>();

  constructor(config: AtClassConfig) {
    this.config = config;
    this.rootElement = config.element;
    this.watcher = new DomWatcher();
    this.scanElements();
    this.update();

    if (this.config.watchResize) {
      this.watcher.add({
        element: this.rootElement,
        on: 'resize',
        callback: this.update.bind(this),
      });
    }
  }

  /**
   * Scans the rootElement and creates a cache of all elements with @ classes
   * with the current root element.
   */
  scanElements() {
    this.config.conditions.forEach(condition => {
      const conditionName = condition[0];

      const elements = Array.from(
        this.rootElement.querySelectorAll(`[class*="@${conditionName}"`)
      );

      elements.forEach(element => {
        this.atClassElements.add(new AtClassElement(element as HTMLElement));
      });
    });
  }

  /**
   * Updates all conditions and applies classes.
   */
  update() {
    // Go through all conditions and remove classes where conditions
    // are false and apply classes where conditions are true.
    // Note the order of execution is important here.  We want to
    // remove first and then apply true conditions.
    const falseCases = this.config.conditions.filter(condition => {
      return !condition[1]();
    });
    const trueCases = this.config.conditions.filter(condition => {
      return condition[1]();
    });

    // Now go through each AtClassElement on the page and update
    // it's classes.
    falseCases.forEach(falseCase => {
      const falseCaseName = falseCase[0];
      this.atClassElements.forEach(atClassElement => {
        atClassElement.removeClassesForCondition(falseCaseName);
      });
    });

    trueCases.forEach(trueCase => {
      const trueCaseName = trueCase[0];
      this.atClassElements.forEach(atClassElement => {
        atClassElement.addClassesForCondition(trueCaseName);
      });
    });
  }

  dispose() {
    this.watcher.dispose();
  }
}

/**
 * A wrapper class around any element that has the css class has @ in the css
 * classes.
 */
class AtClassElement {
  private element: HTMLElement;

  /**
   * A record of condition to classNames.  For example,
   * if this element started with, blue@desktop, left@desktop,
   * red@tablet, orange@mobile this would look as follows:
   *
   * desktop: [blue, left],
   * tablet: [red],
   * mobile: [orange],
   */
  private conditionToClassName: Record<string, string[]> = {};
  constructor(element: HTMLElement) {
    this.element = element;
    const classNames = element.className.split(' ');

    // Create the conditionToClassName record.
    classNames.forEach((className: string) => {
      if (className.includes('@')) {
        const classNameParts = className.split('@');
        const conditionName = classNameParts[1];

        if (!this.conditionToClassName[conditionName]) {
          this.conditionToClassName[conditionName] = [];
        }

        this.conditionToClassName[conditionName].push(classNameParts[0]);
      }
    });
  }

  removeClassesForCondition(conditionName: string) {
    this.conditionToClassName[conditionName].forEach((className: string) => {
      this.element.classList.remove(className);
    });
  }
  addClassesForCondition(conditionName: string) {
    this.conditionToClassName[conditionName].forEach((className: string) => {
      this.element.classList.add(className);
    });
  }
}
