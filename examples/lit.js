
 import { DeguImage} from '../lib/lit/image';
 import { DeguVideo} from '../lib/lit/video';

export default class LitComponentSample {

  constructor() {
    window.customElements.define('degu-image', DeguImage);
    window.customElements.define('degu-video', DeguVideo);
  }
}