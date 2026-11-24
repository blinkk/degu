import {describe, expect, it, vi} from 'vitest';
import {DeguYouTubeInline} from './youtube-inline';
import {DeguYouTubeModal} from './youtube-modal';

if (!customElements.get('degu-youtube-inline')) {
  customElements.define('degu-youtube-inline', DeguYouTubeInline);
}
if (!customElements.get('degu-youtube-modal')) {
  customElements.define('degu-youtube-modal', DeguYouTubeModal);
}

describe('DeguYouTubeModal & DeguYouTubeInline', () => {
  it('opens and closes cleanly when details-dialog does not implement toggle()', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const modal = DeguYouTubeModal.register(host);
    host.appendChild(modal);
    await modal.updateComplete;

    // details-dialog is a plain unknown element without toggle() when
    // @github/details-dialog-element is not registered.
    expect(() => modal.openModalAndPlay('dQw4w9WgXcQ')).not.toThrow();
    expect(modal.details.open).toBe(true);

    expect(() => modal.toggle(false)).not.toThrow();
    expect(modal.details.open).toBe(false);

    modal.remove();
    host.remove();
  });

  it('passes autoplay=1 when load(id, true) is called on DeguYouTubeInline', async () => {
    const inline = document.createElement(
      'degu-youtube-inline'
    ) as DeguYouTubeInline;
    document.body.appendChild(inline);
    await inline.updateComplete;

    const capturedOptions: any[] = [];
    const playVideo = vi.fn();
    const pauseVideo = vi.fn();

    const originalScriptLoader = DeguYouTubeInline.scriptLoader;
    DeguYouTubeInline.scriptLoader = {
      load: vi.fn().mockResolvedValue(undefined),
    } as any;
    (window as any).YT = {
      loaded: 1,
      Player: vi.fn(function (_el: HTMLElement, opts: any) {
        capturedOptions.push(opts);
        opts.events.onReady({
          target: {
            playVideo,
            pauseVideo,
            loadVideoById: vi.fn(),
            cueVideoById: vi.fn(),
          },
        });
      }),
    };

    try {
      await inline.load('TcMBFSGVi1c', true);
      expect(capturedOptions).toHaveLength(1);
      expect(capturedOptions[0].playerVars.autoplay).toBe(1);
      expect(playVideo).toHaveBeenCalledTimes(1);
    } finally {
      DeguYouTubeInline.scriptLoader = originalScriptLoader;
      (window as any).YT = undefined;
      inline.remove();
    }
  });
});
