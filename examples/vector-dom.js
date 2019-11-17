
import * as dat from 'dat.gui';
import {VectorDom} from '../lib/dom/vector-dom';
import {Raf} from '../lib/raf/raf';
import {Vector} from '../lib/mathf/vector';

export default class VectorDomSample {
  constructor() {
    this.gui = new dat.GUI();


    this.vectorBall = new VectorDom(document.getElementById('ball'));
    this.vectorBall.setPosition(
        new Vector(0, 0, 0)
    );
    // We are going to offset the entire element position to the center
    // of the container.
    this.vectorBall.setOffset(
        new Vector(800 / 2, 800 / 2, 0)
    );

    this.eularRotationAsRotationMatrix = false;
    this.vectorBall.init();


    this.raf = new Raf(this.onRaf.bind(this));
    this.raf.start();


    let anchor = this.gui.addFolder('Anchor');
    anchor.add(this.vectorBall, 'anchorX', 0, 1);
    anchor.add(this.vectorBall, 'anchorY', 0, 1);
    let projection = this.gui.addFolder('Position');
    projection.add(this.vectorBall.position, 'x', -180, 180);
    projection.add(this.vectorBall.position, 'y', -180, 180);
    projection.add(this.vectorBall.position, 'z', -2, 10);
    let rotation = this.gui.addFolder('Rotation');
    rotation.add(this.vectorBall, 'rx', -360, 360);
    rotation.add(this.vectorBall, 'ry', -360, 360);
    rotation.add(this.vectorBall, 'rz', -360, 360);
    rotation.add(this.vectorBall, 'eularRotationAsRotationMatrix');
  }


  onRaf() {
    // this.vectorBall.rotation.addEuler(
    //     20, 90, 30);

    // this.progress += 0.04;
    // this.vectorBall.rz = this.progress;
    // console.log('s', this.vectorBall.rotation);
    this.vectorBall.render(true);
  }
}
