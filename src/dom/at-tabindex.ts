import {DomWatcher} from '../dom/dom-watcher';
import {func} from '../func/func';

/**
 * A function that returns true or false.
 */
export type AtTabIndexEvaluationCallBack = (...args: any[]) => boolean;

export interface AtTabIndexConfig {
  /**
   * The root element to observe and to scope at class functionality to.
   */
  element: HTMLElement;

  /**
   * A list of tuple [name, callback] to check on each resize.
   */
  conditions: Array<[string, AtTabIndexEvaluationCallBack]>;

  /**
   * Whether to update on element resize events.
   */
  watchResize: boolean;
}

/**
 * AtTabIndex helps with accessibility by allows you to set tabindex values
 * to DomElements per specific conditions (usually some breakpoints.)
 *
 * Setup
 * ```
 *   const atTabIndex = new AtTabIndex({
 *     element: this.frame,
 *     conditions: [
 *       ['desktop', () => window.innerWidth >= 1440],
 *       [
 *         'laptop',
 *         () => window.innerWidth <= 1439 && window.innerWidth >= 1024,
 *       ],
 *       ['tablet', () => window.innerWidth <= 1023 && window.innerWidth >= 600],
 *       ['mobile', () => window.innerWidth <= 599],
 *       ['tablet-gt', () => window.innerWidth >= 600],
 *       ['tablet-lt', () => window.innerWidth <= 1023],
 *       ['laptop-gt', () => window.innerWidth >= 1024],
 *       ['laptop-lt', () => window.innerWidth <= 1439],
 *       ['desktop-gt', () => window.innerWidth >= 1440],
 *     ],
 *     watchResize: true,
 *   });
 *
 *  // Later
 *  atTabIndex.dispose();
 *
 * ```
 *
 *
 * Usages:
 * ```
 *
 * <div at-tab-index="2@tablet-lt 3@laptop-gt">
 *    Tab Index gets set 2 on tablet-lt and 3 on laptop-gt
 * </div>
 *
 * <div at-tab-index="2@mobile">Tab index only on mobile</div>
 * ```
 *
 */
export class AtTabIndex {
  private config: AtTabIndexConfig;
  private rootElement: HTMLElement;
  private watcher: DomWatcher;

  /**
   * A cache of all html elements with `at-tab-index` on them.
   */
  private atTabIndexElements: Set<AtTabIndexElement> =
    new Set<AtTabIndexElement>();

  constructor(config: AtTabIndexConfig) {
    console.log('at tab index 2');
    this.config = config;
    this.rootElement = config.element;
    this.watcher = new DomWatcher();
    this.scanElements();
    this.update();

    if (this.config.watchResize) {
      this.watcher.add({
        element: this.rootElement,
        on: 'resize',
        callback: func.debounce(this.update.bind(this), 50),
      });
    }
  }

  /**
   * Scans the rootElement and creates a cache of all elements with `at-tab-index`
   * within the current root element.
   */
  scanElements() {
    this.config.conditions.forEach(condition => {
      const conditionName = condition[0];

      const elements = Array.from(
        this.rootElement.querySelectorAll('[at-tab-index]')
      );

      // Include rootElement.
      if (this.rootElement.matches('[at-tab-index]')) {
        elements.push(this.rootElement);
      }

      elements.forEach(element => {
        this.atTabIndexElements.add(
          new AtTabIndexElement(element as HTMLElement)
        );
      });
    });
  }

  /**
   * Updates all conditions and applies tabindex
   */
  update() {
    // Go through all conditions and remove tabindex where conditions
    // are false and apply tabindex where conditions are true.
    // Note the order of execution is important here.  We want to
    // remove first and then apply true conditions.
    const trueCases = [];
    const falseCases = [];
    this.config.conditions.forEach(condition => {
      if (condition[1]()) {
        trueCases.push(condition);
      } else {
        falseCases.push(condition);
      }
    });

    falseCases.forEach(falseCase => {
      const falseCaseName = falseCase[0];
      this.atTabIndexElements.forEach(atTabIndexElement => {
        atTabIndexElement.removeTabIndexForCondition(falseCaseName);
      });
    });

    trueCases.forEach(trueCase => {
      const trueCaseName = trueCase[0];
      this.atTabIndexElements.forEach(atTabIndexElement => {
        atTabIndexElement.addTabIndexForCondition(trueCaseName);
      });
    });
  }

  dispose() {
    this.watcher.dispose();
  }
}

/**
 * A wrapper class around any element that has the attribute `atTabIndex`
 */
class AtTabIndexElement {
  private element: HTMLElement;

  /**
   * A record of condition to tabIndex.
   * {
   *   desktop: [1],
   *   tablet: [2],
   *   mobile: [3],
   * }
   */
  private conditionToTabIndex: Record<string, string[]> = {};

  constructor(element: HTMLElement) {
    this.element = element;
    const tabDeclarations = element.getAttribute('at-tab-index').split(' ');

    tabDeclarations.forEach((declaration: string) => {
      if (declaration.includes('@')) {
        const parts = declaration.split('@');
        const conditionName = parts[1];

        if (!this.conditionToTabIndex[conditionName]) {
          this.conditionToTabIndex[conditionName] = [];
        }

        this.conditionToTabIndex[conditionName].push(parts[0]);
      }
    });
  }

  removeTabIndexForCondition(conditionName: string) {
    this.element.removeAttribute('tabindex');
  }

  addTabIndexForCondition(conditionName: string) {
    const conditions = this.conditionToTabIndex[conditionName];
    if (conditions) {
      conditions.forEach(condition => {
        this.element.setAttribute('tabindex', condition);
      });
    }
  }
}
