
import { Vector2 } from '../../lib/vector2';


class Main {
  constructor() {
    console.log('main project');
    this.canvasEl = document.getElementById('canvas');

    this.runVector2();
  }


  runVector2() {
    console.log('vector2', this.canvasEl);
    let test = new Vector2();
    console.log(test.hello());
  }

}


new Main();
