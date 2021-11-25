
 import { DeguImage} from '../lib/lit/image';
 import { DeguVideo} from '../lib/lit/video';
 import { DeguYoutubeInline} from '../lib/lit/youtube-inline';

export default class LitComponentSample {

  constructor() {
    window.customElements.define('degu-image', DeguImage);
    window.customElements.define('degu-video', DeguVideo);
    window.customElements.define('degu-youtube-inline', DeguYoutubeInline);

    const youtubeInlineTest = document.getElementById('youtube-inline-test1');
    youtubeInlineTest.load('t_cKM_JYtbs')

    let index = 0;
    const youtubeIds = [
      '_tV5LEBDs7w',
      'hGIW2fDb0jg',
      '4pcNRDx6KrE',
      'UtWaBEn_x8c'
    ]
    document.getElementById('change-youtube-video').addEventListener('click', ()=> {
      index++;
      if(index >= youtubeIds.length - 1) {
        index = 0;
      }
      youtubeInlineTest.load(youtubeIds[index], true)
    })

  }
}