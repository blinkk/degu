/**
 * Interface for a component for the {@link ComponentRegistry}.
 */
export interface Component {
  el: HTMLElement;
  dispose?: () => void;
}

/**
 * Component registry. The registry monitors the DOM for changes and
 * automatically mounts and unmounts any components as elements enter and
 * leave the DOM.
 *
 * Within the DOM, components are marked by the `data-component="ComponentName"`
 * attribute. An element entering the DOM with that attribute will be
 * initialized by the registered component, along with any args passed to the
 * [register]{@link ComponentRegistry#register} method.
 *
 * Usage:
 *
 * ```
 * // main.ts
 * class FooComponent {
 *   el: HTMLElement;
 *   options: any;
 *   constructor(el: HTMLElement, options: any) {
 *     this.el = el;
 *     this.options = options;
 *   }
 * }
 *
 * const registry = new ComponentRegistry();
 * registry.register('FooComponent', FooComponent, {myOption: 'value'});
 * registry.start();
 * ```
 *
 * ```
 * <!-- foo.html -->
 * <div class="foo" data-component="FooComponent"></div>
 * ```
 *
 * In the example above, when the "foo" element enters the DOM, the following
 * would be called automatically by the registry:
 *
 * ```
 * new FooComponent(el, {myOption: 'value'})
 * ```
 */
export class ComponentRegistry {
  observer: MutationObserver = new MutationObserver(this.onMutate.bind(this));
  managers: ComponentLifecycleManager[] = [];

  /** Disposes the registry. */
  dispose() {
    this.managers.forEach(h => h.dispose());
    this.managers = [];
    this.stop();
  }

  /** Registers a component to the registry. */
  register(
    name: string,
    cls: new (el: HTMLElement, ...args: unknown[]) => Component,
    ...args: unknown[]
  ): ComponentRegistry {
    this.managers.push(new ComponentLifecycleManager(name, cls, ...args));
    return this;
  }

  /** Starts the component registry. */
  start() {
    this.update();
    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-component'],
      subtree: true,
      childList: true,
    });
  }

  /** Stops the component registry observer. */
  stop() {
    this.observer.disconnect();
  }

  /** Updates all component handlers registered to the registry. */
  update() {
    this.managers.forEach(m => m.update());
  }

  private onMutate(mutationList: MutationRecord[]) {
    // At the moment, any observed mutation will trigger all lifecycle managers
    // to update its components. Need to check the mutation list to only
    // trigger the ones that need to be updated.
    // TODO(stevenle): optimize this.
    this.update();
  }
}

/**
 * Lifecycle manager for a registered component. Handles the mounting and
 * unmounting of components as they enter or leave the DOM.
 */
class ComponentLifecycleManager {
  /** The name of the component. */
  name: string;
  /** Constructor to create a component. */
  cls: new (el: HTMLElement, ...args: unknown[]) => Component;
  /** Any args to pass to the component's constructor. */
  args: unknown[];
  /** A map of elements and their mounted components. */
  mounted: Map<HTMLElement, Component> = new Map();

  constructor(
    name: string,
    cls: new (el: HTMLElement, ...args: unknown[]) => Component,
    ...args: unknown[]
  ) {
    this.name = name;
    this.cls = cls;
    this.args = args;
  }

  /** Checks if the element is mounted by a component handled by the manager. */
  isMounted(el: HTMLElement) {
    return this.mounted.has(el);
  }

  /** Mounts or unmounts all components handled by the manager. */
  update() {
    const active: Map<HTMLElement, Component> = new Map();
    const nodeList = document.querySelectorAll(
      `[data-component="${this.name}"]`
    );

    // Mount any new components that have entered the DOM.
    for (let i = 0; i < nodeList.length; i++) {
      const el = nodeList[i] as HTMLElement;
      let component = this.mounted.get(el);
      if (!component) {
        component = new this.cls(el, ...this.args);
        el.setAttribute('data-component-mounted', 'true');
      }
      active.set(el, component);
    }

    // Dispose any components that have left the DOM.
    const diff = Array.from(this.mounted.keys()).filter(el => !active.has(el));
    diff.forEach(el => {
      const component = this.mounted.get(el)!;
      component.el.removeAttribute('data-component-mounted');
      if (component.dispose) {
        component.dispose();
      }
    });

    this.mounted = active;
  }

  /** Disposes any component mounted by the manager. */
  dispose() {
    this.mounted.forEach(component => {
      component.el.removeAttribute('data-component-mounted');
      if (component.dispose) {
        component.dispose();
      }
    });
    this.mounted.clear();
  }
}

export default ComponentRegistry;
