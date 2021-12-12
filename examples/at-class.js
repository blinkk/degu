
import {AtClass} from '../lib/dom/at-class';

export default class AtClassSample {
  constructor() {
    let root = document.getElementById('root');

    const atClass = new AtClass({
      element: root,
      conditions: [
        ['desktop', ()=> window.innerWidth > 1000],
        ['tablet', ()=> window.innerWidth < 1000 && window.innerWidth > 780],
        ['mobile', ()=> window.innerWidth < 780],
      ],
      watchResize: true
    })
  }
}
