

import * as dat from 'dat.gui';
import {VectorDom} from '../lib/dom/vector-dom';
import {Raf} from '../lib/raf/raf';
import {Vector} from '../lib/mathf/vector';
import {Quaternion} from '../lib/mathf/quaternion';
import {MatrixIV} from '../lib/mathf/matrixIV';

export default class QuaternionSample {
  constructor() {
    console.log('test');
    this.gui = new dat.GUI();

    // Create targets.
    this.targets = {};
    const createTarget = (id, x, y, z) => {
      let el = document.getElementById(id);
      let t = new VectorDom(el);
      t.anchorX = 0.5;
      t.anchorY = 0.5;
      t.setPosition(new Vector(x, y, z));
      t.init();
      // Add the coordinates so we can see them.
      // el.innerHTML = `${x} ${y} ${z}`;
      el.innerHTML = id;
      this.targets[id] = t;
      t.render();
    };

    createTarget('target1', 100, 200, 1 - 1);
    createTarget('target2', 700, 500, 1 - 1);
    createTarget('target3', 100, 400, 1 - 1);
    createTarget('target4', 700, -100, 1 - 1);
    createTarget('target5', 400, -200, 1 - 1);


    this.cube = new VectorDom(document.getElementById('ball'));
    this.cube.setPosition(
        new Vector(0, 0, 1 - 1)
    );
    // We are going to offset the entire element position to the center
    // of the container.
    this.cube.setOffset(
        new Vector(800 / 2, 800 / 2, 0)
    );

    this.cube.init();


    this.raf = new Raf(this.onRaf.bind(this));
    this.raf.start();

    // Setup DAT GUI radio options
    const setChecked = (prop) => {
      for (let param in this.parameters) {
        this.parameters[param] = false;
      }
      this.parameters[prop] = true;
    };

    const addRadio = (folder, prop) => {
      folder.add(this.parameters, prop).listen().onChange(() => {
        setChecked(prop);
      });
    };

    this.parameters = {
      lookAtTarget1: false,
      lookAtTarget2: false,
      lookAtTarget3: false,
      lookAtTarget4: false,
      lookAtTarget5: false,
    };

    let folder = this.gui.addFolder('Options');
    addRadio(folder, 'lookAtTarget1');
    addRadio(folder, 'lookAtTarget2');
    addRadio(folder, 'lookAtTarget3');
    addRadio(folder, 'lookAtTarget4');
    addRadio(folder, 'lookAtTarget5');
  }


  onRaf() {
    if (this.parameters.lookAtTarget1) {
      this.lookAt3('target1');
    }
    if (this.parameters.lookAtTarget2) {
      this.lookAt3('target2');
    }
    if (this.parameters.lookAtTarget3) {
      this.lookAt3('target3');
    }
    if (this.parameters.lookAtTarget4) {
      this.lookAt3('target4');
    }
    if (this.parameters.lookAtTarget5) {
      this.lookAt3('target5');
    }


    this.cube.render();
  }


  lookAt3(targetId) {
    let target = this.targets[targetId];
    let eye = this.cube;
    target = target.position.clone()
        .add(target.offset)
        .add(target.anchorOffsetVector);
    eye = eye.position.clone()
        .add(eye.offset)
        .add(eye.anchorOffsetVector);

    let q = Quaternion.rotateTo(
        eye.normalize(),
        target.normalize(),
        Vector.UP
    );
    this.cube.rotation.slerp(q, 0.2);
  }


  lookAt2(targetId) {
    let target = this.targets[targetId];
    let eye = this.cube;
    target = target.position.clone()
        .add(target.offset)
        .add(target.anchorOffsetVector);
    eye = eye.position.clone()
        .add(eye.offset)
        .add(eye.anchorOffsetVector);

    // target = target.globalElementCenterPosition;
    // eye = eye.globalElementCenterPosition;
    let tc = target.clone();
    let ec = eye.clone();
    let eularDifference = Vector.getEularRotationTo(
        eye.normalize(),
        target.normalize()
    );
    let m1 = new MatrixIV().ypr(
        eularDifference.z,
        eularDifference.y,
        eularDifference.x
    );

    let q = Quaternion.fromRotationMatrixIV(m1);
    // let q = Quaternion.fromEulerVector(eularDifference);
    this.cube.rotation.slerp(q, 0.2);
  }


  lookAt(targetId) {
    this.cube.useBoundsForGlobalCalculation = false;
    this.targets[targetId].useBoundsForGlobalCalculation = true;

    // This work.
    let target = this.targets[targetId];
    target = target.position.clone()
        .add(target.offset)
        .add(target.anchorOffsetVector);
    let eye = this.cube;
    eye = eye.position.clone()
        .add(eye.offset)
        .add(eye.anchorOffsetVector);
    // doesnt work because it's tied to window scroll.
    // let target = this.targets[targetId].globalElementCenterPosition.clone();
    // let eye = this.cube.globalElementCenterPosition.clone();

    // target.z = 1 - target.z;
    // eye.z = 1 - target.z;
    console.log('t', target.clone().normalize());
    console.log('e', eye);
    // target.y *= 1;
    // eye.y *= -1;
    let tc = target.clone();
    let ec = eye.clone();

    // target.y = tc.x;
    // target.x = tc.z;
    // target.z = tc.y;
    // eye.y = ec.x;
    // eye.x = ec.z;
    // eye.z = ec.y;
    target.x = tc.z;
    target.y = tc.y;
    target.z = tc.x;
    eye.x = ec.z;
    eye.y = ec.y;
    eye.z = ec.x;

    target.z *= 1;
    eye.z *= 1;

    // let m1 = new MatrixIV().lookAt(
    //     // new Vector(0, 0, 1),
    //     eye,
    //     target,
    //     // Vector.UP
    //     new Vector(0, 1, 0)
    // );
    let m1 = new MatrixIV().lookAt(
        // new Vector(0, 0, 1),
        eye.clone().normalize(),
        target.clone().normalize(),
        Vector.FORWARD
        // eye.cross(Vector.FORWARD)
    );
    let q = Quaternion.fromRotationMatrixIV(m1);
    // console.log(Quaternion.toEulerVector(q));
    this.cube.rotation.slerp(q, 0.2);
  }
}
