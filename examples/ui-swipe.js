
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
  }

}
