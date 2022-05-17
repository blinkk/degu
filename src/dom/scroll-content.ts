import {DomWatcher} from '../dom/dom-watcher';

/**
 *
 * Given a "scrollable" div, this class allows you to drag the
 * content area on desktop (non-touch devices).
 *
 * For example:
 * ```
 * [scroll-content]
 *    max-height: 400px
 *    overflow: scroll
 *
 * <div scroll-content>
 *    ... bunch of content that is very tall.
 * </div>
 * ```
 * The above would present a div with a scrollbar.  But
 * the user can't "drag" within the content and move it.
 *
 * This class will automatically set that up.
 *
 *
 * ```
 *   Array.from(document.querySelectorAll('[scroll-content]')).forEach(el => {
 *     new ScrollContent(el as HTMLElement);
 *   });
 * ```
 *
 */
export class ScrollContent {
  private container: HTMLElement;
  private watcher: DomWatcher;
  private links: HTMLElement[];

  private position: {
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.watcher = new DomWatcher();
    this.links = [];

    this.position = {
      x: 0,
      y: 0,
      scrollLeft: 0,
      scrollTop: 0,
    };

    this.watcher.add({
      element: this.container,
      on: 'mousedown',
      eventOptions: {passive: true},
      callback: (e: MouseEvent) => this.handleMouseDown(e),
    });

    this.removeLinkDrag();
  }

  protected removeLinkDrag(): void {
    const links = Array.from(this.container.querySelectorAll('a'));
    for (const link of links) {
      link.draggable = false;
      // https://stackoverflow.com/questions/26356877/html5-draggable-false-not-working-in-firefox-browser
      // This is primarily required for firefox where draggble=false
      // doesn't work.
      this.watcher.add({
        element: link,
        on: ['dragstart'],
        callback: (e: MouseEvent) => {
          e.preventDefault();
        },
      });
      this.links.push(link);
    }
  }

  private handleMouseMove(e: MouseEvent) {
    const dx = e.clientX - this.position.x;
    const dy = e.clientY - this.position.y;
    this.container.scrollLeft = this.position.scrollLeft - dx;
    this.container.scrollTop = this.position.scrollTop - dy;

    for (const link of this.links) {
      link.style.pointerEvents = 'none';
    }
  }

  private handleMouseUp(e: MouseEvent) {
    this.container.classList.remove('active');
    this.watcher.removeById('mousemove');
    this.watcher.removeById('mouseup');

    for (const link of this.links) {
      link.style.removeProperty('pointer-events');
    }
  }

  private handleMouseDown(e: MouseEvent) {
    this.position.x = e.clientX;
    this.position.y = e.clientY;
    this.position.scrollLeft = this.container.scrollLeft;
    this.position.scrollTop = this.container.scrollTop;
    this.container.classList.add('active');

    this.watcher.add({
      element: this.container,
      on: 'mousemove',
      id: 'mousemove',
      eventOptions: {passive: true},
      callback: (e: MouseEvent) => this.handleMouseMove(e),
    });

    this.watcher.add({
      element: document,
      on: 'mouseup',
      id: 'mouseup',
      eventOptions: {passive: true},
      callback: (e: MouseEvent) => this.handleMouseUp(e),
    });
  }

  dispose() {
    this.watcher.dispose();
  }
}
