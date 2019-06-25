

import * as dat from "dat.gui";
import { VectorDom } from "../lib/dom/vector-dom";
import { Raf } from '../lib/raf/raf';
import { Vector } from "../lib/mathf/vector";
import { mathf } from "../lib/mathf/mathf";

export default class VectorDomSample2 {
    constructor() {
        this.gui = new dat.GUI();


        this.balls = Array.from(document.querySelectorAll('.ball'));


        this.ballVectors = [];

        const createBall = (id, x, y, z) => {
            let ballVector = new VectorDom(document.getElementById(id));
            // Rougly and manually set it to the center of the screen.
            ballVector.setOffset(new Vector(
                800 / 2 - 100,
                800 / 2, 0));
            ballVector.moveX = mathf.getRandomFloat(-15, 15);
            ballVector.moveY = mathf.getRandomFloat(-5, 5);
            ballVector.moveZ = mathf.getRandomFloat(-0.01, 0.01);
            ballVector.rotateX = mathf.getRandomFloat(0, 0.05);
            ballVector.rotateY = mathf.getRandomFloat(0, 0.05);
            ballVector.rotateZ = mathf.getRandomFloat(0, 0.05);


            ballVector.setPosition(new Vector(x, y, z));
            this.ballVectors.push(ballVector);
        };
        createBall('ball1', -100, 100, 2);
        createBall('ball2', 100, 100, -0.5);
        createBall('ball3', -100, -100, -0.2);
        createBall('ball4', -100, -100, 1);
        createBall('ball5', -100, 100, 0.5);
        createBall('ball6', 100, 100, 0.2);
        createBall('ball7', 100, -100, 0.5);
        createBall('ball8', 100, -100, 1);


        this.timer = 0;

        this.raf = new Raf(this.onRaf.bind(this));
        this.raf.start();

    }


    onRaf(delta) {
        this.timer += 0.04;

        const sin = Math.sin(this.timer);



        this.ballVectors.forEach((ballVector) => {

            let position = new Vector(
                ballVector.moveX * sin,
                ballVector.moveY * sin,
                ballVector.moveZ * sin,
            );
            ballVector.position.add(position);
            ballVector.rotation.add(new Vector(
                ballVector.rotateX, ballVector.rotateY, ballVector.rotateZ));
            ballVector.render();
        });
    }


}