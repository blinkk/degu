

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
        this.vectorBall.setPosition(new Vector(0, 0, 0));

        this.vectorBall2 = new VectorDom(document.getElementById('ball2'));
        this.vectorBall2.anchorX = 0;
        this.vectorBall2.anchorY = 0;
        this.vectorBall2.setPosition(new Vector(0, 0, 0));

        this.text = new VectorDom(document.getElementById('text'));
        this.text.anchorX = 0;
        this.text.anchorY = 0;
        this.text.setPosition(new Vector(0, 0, 1.2 - 1));


        this.raf = new Raf(this.onRaf.bind(this));
        this.raf.start();


    }


    onRaf() {
        // console.log(this.tracker.mouseData.deltaX);
        // console.log(this.vectorBall.globalPosition);
        // this.vectorBall.updateRotationTowardsMouse();
        // this.vectorBall2.updateRotationTowardsMouse();
        // this.text.updateRotationTowardsMouse();
        // this.vectorBall.updateRotationTowardsCenterScreen();
        // this.vectorBall2.updateRotationTowardsCenterScreen();

        this.vectorBall.addMouseRotationPushForce(
            0.0002,
            0.0002,
            0.0002,
            0.01
        );
        this.vectorBall2.addMouseRotationPushForce();
        // this.vectorBall.rz += 0.04;
        // this.vectorBall.ry += 0.04;

        // Example of limiting to just x rotation
        this.text.addMouseRotationPushForce(
            0.002, 0, 0, 0.04
        );

        this.vectorBall.render();
        this.vectorBall2.render();
        this.text.render();
    }

}