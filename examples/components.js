import {DeguImage} from '../lib/components/image';
import {DeguVideo} from '../lib/components/video';
import {DeguYouTubeInline} from '../lib/components/youtube-inline';
import {DeguYouTubeModal} from '../lib/components/youtube-modal';
import * as dom from '../lib/dom/dom';

export default class ComponentsSample {

  constructor() {
    window.customElements.define('degu-image', DeguImage);
    window.customElements.define('degu-video', DeguVideo);
    window.customElements.define('degu-youtube-inline', DeguYouTubeInline);
    window.customElements.define('degu-youtube-modal', DeguYouTubeModal);


    // Youtube Inline Samples
    const youtubeInlineTest = document.getElementById('youtube-inline-test1');
    youtubeInlineTest.load('t_cKM_JYtbs')


    const colorTest = document.getElementById('color-test');
    const colorContainer = document.getElementById('color-container');


    colorTest.addEventListener(DeguVideo.Events.CANVAS_READY, ()=> {
        window.setInterval(()=> {
          const color = colorTest.getHexColorAt(10,200);
          dom.setCssVariable(colorContainer,'--background', color);
        }, 50)
    });


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

    // Youtube Modal Sample
    // const host = document.getElementById('youtube-modal-section');
    const host = document.body;
    const youtubeModal = DeguYouTubeModal.register(host);


  }
}
