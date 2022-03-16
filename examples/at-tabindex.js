
import {AtTabIndex} from '../lib/dom/at-tabindex';

export default class AtTabIndexSample {
  constructor() {
    let root = document.getElementById('root');

    const atClass = new AtTabIndex({
      element: root,
      conditions: [
        ['desktop', ()=> window.innerWidth > 1000],
        ['tablet', ()=> window.innerWidth < 1000 && window.innerWidth > 780],
        ['mobile', ()=> window.innerWidth < 780],
      ],
      watchResize: true,
      updateChildren: true
    })
  }
}
