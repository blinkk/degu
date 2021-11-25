import DetailsDialogElement from '@github/details-dialog-element';
import {LitElement, html, css} from 'lit';
import {query} from 'lit/decorators.js';
import {DeguYoutubeInline} from './youtube-inline';
import {DomWatcher} from '../dom/dom-watcher';
import * as dom from '../dom/dom';

/**
 * DeguYutubeModal wraps details-dialog-element and degu-youtube-inline.
 *
 * https://github.com/github/details-dialog-element
 * https://github.com/github/details-dialog-element/blob/main/src/index.ts
 *
 * ```ts
 * import { DeguYoutubeModal} from '../lib/lit/youtube-modal';
 * import DetailsDialogElement from '@github/details-dialog-element';
 *
 * // Define a host.  When you register against a host, the component will
 * // look for any clicks within that host with the data attribute
 * // `youtube-modal="<youtube-id>".
 *
 * const myHost = document.body;
 * DeguYoutubeModal.register(myHost)
 * ```
 *
 * Now somewhere within your host, just add buttons or elements with the
 * attribute `youtube-modal`.
 *
 * ```html
 *   <button youtube-modal="8Qn_spdM5Zg">Watch StarWars</button>
 *   <button youtube-modal="TcMBFSGVi1c">Watch Avengers</button>
 * ```
 *
 */
export class DeguYoutubeModal extends LitElement {
  private watcher: DomWatcher;
  private hasFirstUpdateCompleted = false;
  private isOpen = false;

  private host: HTMLElement;
  private delegateDisposer: Function = null;

  @query('summary')
  summary: HTMLElement;

  @query('details-dialog')
  detailsDialog: DetailsDialogElement;

  @query('details')
  details: HTMLDetailsElement;

  @query('degu-youtube-inline')
  youtubeInline: DeguYoutubeInline;

  private youtubeId: string;

  constructor(host: HTMLElement) {
    super();
    this.host = host;
    this.delegateDisposer = dom.addDelegatedListener(
      this.host,
      'click',
      (el: HTMLElement) => {
        const youtubeModalId = el.getAttribute('youtube-modal');
        if (youtubeModalId) {
          // Attach this element if it is not in the dom yet.
          if (!this.isConnected) {
            this.host.appendChild(this);
          }

          // Wait for child components to render.
          window.setTimeout(() => {
            this.openModalAndPlay(youtubeModalId);
          });
        }
      }
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.watcher = new DomWatcher();

    this.updateComplete.then(this.onUpdateComplete.bind(this));
  }

  private onUpdateComplete() {
    if (!this.hasFirstUpdateCompleted) {
      // Watch and update the toggle state of the modal.
      this.watcher.add({
        element: this.details,
        on: 'toggle',
        callback: this.onToggle.bind(this),
      });
      this.hasFirstUpdateCompleted = true;
    }
  }

  openModalAndPlay(youtubeId: string) {
    this.youtubeId = youtubeId;
    this.detailsDialog.toggle(true);
  }

  private onToggle() {
    this.isOpen = this.details.open;
    if (this.isOpen && this.youtubeInline) {
      this.youtubeInline.load(this.youtubeId, true);
    } else {
      this.youtubeInline.pause();
    }
  }

  toggle(open: boolean) {
    this.detailsDialog.toggle(open);
  }

  /**
   * Creates an instance of YoutubeModal.
   */
  static register(host: HTMLElement): DeguYoutubeModal {
    const modal = new DeguYoutubeModal(host);
    return modal;
  }

  static styles = css`
    .modal summary {
      display: none;
    }

    .modal[open] > summary {
      display: block;
      cursor: default;
    }

    .modal[open] .modal__mask {
      background-color: #202124;
      content: ' ';
      display: block;
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 1;
    }

    details-dialog {
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2001;
      max-height: 100vh;
      max-width: 100vw;
      width: 100vw;
      height: 100vh;
      overflow: auto;
    }

    .modal__content {
      width: calc(100vw - 22.1912072575vw);
      height: calc(100vh - 7.3970690858vw);
      max-height: calc((100vw - 22.1912072575vw) * 9 / 16);
      max-width: calc((100vh - 7.3970690858vw) * 16 / 9);
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      z-index: 2;
    }

    .modal__close {
      overflow: visible !important;
      background-color: transparent !important;
      border-radius: 100%;
      border: 2px solid rgba(95, 99, 104, 0.6);
      top: 35px !important;
      right: 50px !important;
      position: absolute;
      top: 0px;
      width: 60px;
      height: 60px;
      z-index: 1;
    }

    @media (max-width: 1024px) {
      .mqn3-modal__close {
        width: 46px;
        height: 46px;
      }
    }

    @media (max-width: 600px) {
      .mqn3-modal__close {
        width: 34px;
        height: 34px;
      }
    }

    .modal__close:before,
    .modal__close:after {
      content: '';
      display: block;
      position: absolute;
      transition: all 250ms linear;
    }
    .modal__close:before {
      top: 50%;
      left: 50%;
      width: 16px !important;
      height: 16px !important;
      margin-top: -8px;
      margin-left: -8px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: 16px;
      background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23423F3F%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22m2.06.73%2013.577%2013.577-1.697%201.697L.363%202.427z%22%2F%3E%3Cpath%20d%3D%22M.363%2014.307%2013.94.73l1.697%201.697L2.06%2016.004z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E');
      z-index: 1;
      filter: invert(1);
    }
    .modal__close:after {
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      top: -2px;
      right: -2px;
      opacity: 0;
      border-radius: 100%;
      background-color: #3c4043;
      transform-origin: center center;
      transform: scale3d(0.8, 0.8, 0.8);
      z-index: 0;
    }
    .modal__close:hover {
      border-color: transparent;
      cursor: pointer;
    }
    .modal__close:hover:before {
      background-repeat: no-repeat;
      background-position: center;
      background-size: 16px;
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUxLjIgKDU3NTE5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5leGl0LXdoaXRlPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IjIwLi1EZXNrdG9wLVVJLUVsZW1lbnRzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNjM3LjAwMDAwMCwgLTExOTkuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIGlkPSJFeGl0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDEuMDAwMDAwLCAxMTA1LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDY4LjAwMDAwMCkiIGlkPSJob3ZlciI+CiAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDcyLjU2NjQwNiwgMy44NTE1NjIpIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS40MzM1OTQsIDAuNTE1NjI1KSIgaWQ9ImV4aXQtd2hpdGUiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjIuMDAwMDAwLCAyMi4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4LjAwMDAwMCwgOC4wMDAwMDApIHJvdGF0ZSgtMzE1LjAwMDAwMCkgdHJhbnNsYXRlKC04LjAwMDAwMCwgLTguMDAwMDAwKSAiIHg9Ii0xLjYiIHk9IjYuOCIgd2lkdGg9IjE5LjIiIGhlaWdodD0iMi40Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOC4wMDAwMDAsIDguMDAwMDAwKSByb3RhdGUoLTQ1LjAwMDAwMCkgdHJhbnNsYXRlKC04LjAwMDAwMCwgLTguMDAwMDAwKSAiIHg9Ii0xLjYiIHk9IjYuOCIgd2lkdGg9IjE5LjIiIGhlaWdodD0iMi40Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==');
    }
    .modal__close:hover:after {
      opacity: 1;
      background-color: #ffffff;
      transform: scale3d(1, 1, 1);
    }
  `;

  render() {
    return html`
      <details class="modal">
        <summary></summary>
        <details-dialog
          aria-label="Dialog with no CSS"
          role="dialog"
          aria-modal="true"
        >
          <div class="modal__mask"></div>
          <div class="modal__content">
            <degu-youtube-inline
              style="aspect-ratio: 16/9"
            ></degu-youtube-inline>
          </div>
          <button
            class="modal__close"
            data-close-dialog=""
            type="button"
            autofocus=""
          ></button>
        </details-dialog>
      </details>
    `;
  }

  disconnectedCallback() {
    this.watcher && this.watcher.dispose();
    this.delegateDisposer && this.delegateDisposer();
  }
}
