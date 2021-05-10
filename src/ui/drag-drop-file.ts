import {is} from '../is/is';
import {DomWatcher} from '../dom/dom-watcher';
import {dom} from '../dom/dom';

/**
 * A simple drag and drop file utility.
 * Allows you to drop file onto the screen and start loading the file.
 *
 * Note that this handles ONLY a single file.
 *
 *
 * ```
 *   this.drapDropFile = new DragDropFile(
 *       dropElement,  // The DOM element which a file can be dragged on top of.  "Drop zone" basically.
 *      // Handles drop event.
 *      (data) => {
 *          console.log(data.url); // The local blob url.
 *          console.log(data.file); // More detailed info on the file itself.
 *      }
 *   );
 *
 * ```
 *
 *
 */
export class DragDropFile {
  private dropElement: HTMLElement;
  private watcher: DomWatcher;
  private dropCallback: Function;

  constructor(dropzoneElement: HTMLElement, dropCallback: Function) {
    this.dropElement = dropzoneElement;
    this.dropCallback = dropCallback;
    this.watcher = new DomWatcher();

    if (!is.supportingFileApis()) {
      console.log('The file apis are not supported for this browser');
      return;
    }
    this.watcher.add({
      element: this.dropElement,
      on: 'dragover',
      callback: this.handleDragOver.bind(this),
    });
    this.watcher.add({
      element: this.dropElement,
      on: 'drop',
      callback: this.handleDrop.bind(this),
    });
  }

  private handleDragOver(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
  }

  private handleDrop(e: DragEvent): void {
    e.stopPropagation();
    e.preventDefault();

    // Fire a drop start event.
    dom.event(this.dropElement, 'drop-start', {});

    // Currently support only 1 file.
    // let entries;
    if (e.dataTransfer?.items) {
      // entries = Array.from(e.dataTransfer.items).map(item =>
      //   item.webkitGetAsEntry()
      // );
      const file = e.dataTransfer.files[0];
      this.dropCallback({
        file: file,
        url: URL.createObjectURL(file),
      });
    }
  }

  dispose() {
    this.watcher && this.watcher.dispose();
  }
}
