

import * as dat from "dat.gui";
import { VectorDom } from "../lib/dom/vector-dom";
import { Raf } from '../lib/raf/raf';
import { Vector } from "../lib/mathf/vector";
import { Quad } from "pixi.js";
import { Quaternion } from "../lib/mathf/quaternion";
import { MatrixIV } from "../lib/mathf/matrixIV";

export default class QuaternionSample {
    constructor() {
        console.log('test');
        this.gui = new dat.GUI();

        // Create targets.
        this.targets = {};
        const createTarget = (id, x, y, z) => {
            let el = document.getElementById(id);
            let t = new VectorDom(el);
            t.setPosition(new Vector(x, y, z));
            t.init();
            // Add the coordinates so we can see them.
            // el.innerHTML = `${x} ${y} ${z}`;
            el.innerHTML = id;
            this.targets[id] = t;
            t.render();
        };

        createTarget('target1', 100, 200, 0.5 - 1);
        createTarget('target2', 700, 500, 1.2 - 1);
        createTarget('target3', 100, 400, 1 - 1);


        this.cube = new VectorDom(document.getElementById('ball'));
        this.cube.setPosition(
            new Vector(0, 0, 0)
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
            folder.add(this.parameters, prop).listen().onChange(() => { setChecked(prop); });
        };

        this.parameters = {
            lookAtTarget1: false,
            lookAtTarget2: false,
            lookAtTarget3: false
        };

        var folder = this.gui.addFolder("Options");
        addRadio(folder, 'lookAtTarget1');
        addRadio(folder, 'lookAtTarget2');
        addRadio(folder, 'lookAtTarget3');

    }


    onRaf() {

        if (this.parameters.lookAtTarget1) {
            // Find the angle difference between the position of flower and the
            // target.
            // let eularDifference = Vector.getEularRotationTo(
            //     this.targets['target1'].position,
            //     this.cube.position
            // );
            // console.log(eularDifference);

            // // Now slerp the flower rotation quaternion to that position.
            // this.cube.rotation.slerpEulerVector(eularDifference, 0.3);

            let target = this.targets['target1'].position;
            let m1 = new MatrixIV().lookAt(
                this.cube.position.clone(),
                target.clone(),
                Vector.UP
            );
            // Create a Eular Vector from the matrix.
            // let eular = Vector.fromRotationMatrixIV(m1);
            // console.log(eular);
            // // Make a quaternion.
            // let q = Quaternion.fromEulerVector(eular);
            let q = Quaternion.fromRotationMatrixIV(m1);


            console.log(q);
            this.cube.rotation.slerp(q, 0.2);



        }

        if (this.parameters.lookAtTarget2) {
            // Create a matrix that looks at the target.
            // let target = this.targets['target2'].position.clone().normalize();
            let target = this.targets['target2'].position;
            let m1 = new MatrixIV().lookAt(
                this.cube.position.clone(),
                target.clone(),
                Vector.UP
            );
            // Create a Eular Vector from the matrix.
            let eular = Vector.fromRotationMatrixIV(m1);
            // Make a quaternion.
            // let q = Quaternion.fromEulerVector(eular);

            let q = Quaternion.fromRotationMatrixIV(m1);


            console.log(q);
            this.cube.rotation.slerp(q, 0.2);

            this.cube.rotation.slerp(q, 0.2);

            // let eularDifference = Vector.getEularRotationTo(
            //     this.targets['target2'].position,
            //     this.cube.position
            // );
            // console.log(eularDifference);
            // this.cube.rotation.slerpEulerVector(eularDifference, 0.3);
        }

        if (this.parameters.lookAtTarget3) {
            // Create a matrix that looks at the target.
            let target = this.targets['target3'].position.clone();
            // target.z = 0.5;
            let m1 = new MatrixIV().lookAt(
                this.cube.position.clone(),
                target,
                Vector.UP
            );
            // Create a Eular Vector from the matrix.
            // let eular = Vector.fromRotationMatrixIV(m1);
            // // Make a quaternion.
            // let q = Quaternion.fromEulerVector(eular);

            let q = Quaternion.fromRotationMatrixIV(m1);


            console.log(q);
            this.cube.rotation.slerp(q, 0.2);

            // this.cube.rotation.slerp(q, 0.2);

            // this.cube.rotation.copy(q);
            // console.log(q);

            // let eularDifference = Vector.getEularRotationTo(
            //     this.targets['target3'].position,
            //     this.cube.position
            // );
            // console.log(eularDifference);
            // this.cube.rotation.slerpEulerVector(eularDifference, 0.3);
        }
        // this.vectorBall.rotation.addEuler(
        //     20, 90, 30);

        // this.progress += 0.04;
        // this.vectorBall.rz = this.progress;
        // console.log('s', this.vectorBall.rotation);



        this.cube.render();
    }

}