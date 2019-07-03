

import * as dat from "dat.gui";
import { VectorDom } from "../lib/dom/vector-dom";
import { Raf } from '../lib/raf/raf';
import { Vector } from "../lib/mathf/vector";
import { MouseTracker } from '../lib/dom/mouse-tracker';

export default class VectorDomSample3 {
    constructor() {
        this.gui = new dat.GUI();

        console.log('vectorDOM3');

        this.vectorBall = new VectorDom(document.getElementById('ball'));
        this.vectorBall.anchorX = 0;
        this.vectorBall.anchorY = 0;
        this.vectorBall.setPosition(new Vector(0, 0, 0.8 - 1));
        this.vectorBall.init();

        this.vectorBall2 = new VectorDom(document.getElementById('ball2'));
        this.vectorBall2.anchorX = 0.5;
        this.vectorBall2.anchorY = 0.5;
        this.vectorBall2.setPosition(new Vector(0, 0, 1.3 - 1));
        this.vectorBall2.setOffset(new Vector(100, -200, 0));
        this.vectorBall2.init();

        this.text = new VectorDom(document.getElementById('text'));
        this.text.anchorX = 0;
        this.text.anchorY = 0;
        this.text.setPosition(new Vector(100, 200, 1.2 - 1));
        this.text.init();

        this.raf = new Raf(this.onRaf.bind(this));
        this.raf.start();


    }


    onRaf() {

        // this.text._.force.mouseRotationForce(
        //     -0.002, -0.02, 0, 0.16
        // );
        this.vectorBall2._.force.mouseRotationForce(
            0.02, 0.02, 0, 0.02
        );
        this.vectorBall._.force.scrollYRotationForce(
            -0.004,
            0
        );

        // this.vectorBall2.rx += 0.003;
        // this.vectorBall2._.force.addScrollYRotationForce(
        //     0,
        //     -0.004
        // );

        this.vectorBall.render();
        this.vectorBall2.render();
        // this.text.render();
    }

}