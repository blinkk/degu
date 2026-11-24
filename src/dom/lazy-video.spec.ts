import {describe, expect, it} from 'vitest';
import {LazyVideo, detectVideoMimeType} from './lazy-video';

describe('detectVideoMimeType', () => {
  it('infers MIME types from common video extensions', () => {
    expect(detectVideoMimeType('/assets/hero.mp4')).toBe('video/mp4');
    expect(
      detectVideoMimeType('https://cdn.example.com/clip.WEBM?v=1#t=2')
    ).toBe('video/webm');
    expect(detectVideoMimeType('/video/demo.ogv')).toBe('video/ogg');
    expect(detectVideoMimeType('/video/demo.mov')).toBe('video/quicktime');
    expect(detectVideoMimeType('/video/stream.m3u8')).toBe(
      'application/x-mpegURL'
    );
    expect(detectVideoMimeType('/video/unknown.xyz')).toBeNull();
    expect(detectVideoMimeType('')).toBeNull();
  });

  it('autodetects and applies type attribute on LazyVideo source when missing', () => {
    const video = document.createElement('video');
    video.load = () => {};
    video.pause = () => {};
    const source = document.createElement('source');
    source.setAttribute('lazy-video', 'https://example.com/demo.webm?foo=bar');
    video.appendChild(source);
    document.body.appendChild(video);

    const lazy = new LazyVideo(source);
    lazy.paint(true);

    expect(source.getAttribute('type')).toBe('video/webm');
    expect(source.getAttribute('src')).toBe(
      'https://example.com/demo.webm?foo=bar'
    );

    video.remove();
  });

  it('preserves explicit type attribute when already set on source', () => {
    const video = document.createElement('video');
    video.load = () => {};
    video.pause = () => {};
    const source = document.createElement('source');
    source.setAttribute('type', 'video/mp4; codecs="avc1.42E01E"');
    source.setAttribute('lazy-video', 'https://example.com/demo.mp4');
    video.appendChild(source);
    document.body.appendChild(video);

    const lazy = new LazyVideo(source);
    lazy.paint(true);

    expect(source.getAttribute('type')).toBe('video/mp4; codecs="avc1.42E01E"');

    video.remove();
  });
});
