
import {DomWatcher} from '../lib/dom/dom-watcher';
import {Swipe} from '../lib/ui/swipe'

export default class UiSwipeSample {
  constructor() {
    const div = document.getElementById('myElement');

    const swipe = new Swipe(div);

    swipe.on(Swipe.Events.DOWN, ()=> {
      console.log("down");
    })
    swipe.on(Swipe.Events.UP, ()=> {
      console.log("up");
    })
    swipe.on(Swipe.Events.LEFT, ()=> {
      console.log("left");
    })
    swipe.on(Swipe.Events.RIGHT, ()=> {
      console.log("right");
    })


    div.addEventListener(Swipe.Events.UP, ()=> {
      console.log('up');
    })
    div.addEventListener(Swipe.Events.DOWN, ()=> {
      console.log('down');
    })
    div.addEventListener(Swipe.Events.LEFT, ()=> {
      console.log('left');
    })
    div.addEventListener(Swipe.Events.RIGHT, ()=> {
      console.log('right');
    })



    // Check dom watcher.
    const watcher = new DomWatcher();


    watcher.add({
      element: div,
      on: 'swipe-up',
      callback: ()=> {
        console.log('up')
      }
    })
    watcher.add({
      element: div,
      on: 'swipe-down',
      callback: ()=> {
        console.log('down')
      }
    })
    watcher.add({
      element: div,
      on: 'swipe-left',
      callback: ()=> {
        console.log('left')
      }
    })
    watcher.add({
      element: div,
      on: 'swipe-right',
      callback: ()=> {
        console.log('right')
      }
    })

  }

}
