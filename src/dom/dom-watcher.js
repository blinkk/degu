/**
 * A class that helps with DOM events.  The main usecase for this class is
 * to be able to watch the dom and then later remove a group of events
 * all at once.
 *
 * ```ts
 * let new watcher = new DomWatcher();
 *
 * var scrollCallback = (event, done)=> {
 *   // on scroll events.
 * };
 * watcher.add(window, 'scroll', scrollCallback, { options: passive })
 * watcher.add(element, 'click', ()=> {});
 *
 *
 * // Removes all watchers.
 * watcher.removeAll();
 *
 * ```
 * @hidden
 */