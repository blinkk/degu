
import * as dat from "dat.gui";
import { Raf } from '../lib/raf/raf';
import { Pseudo3dCanvas } from '../lib/pseudo-3d-canvas/pseudo-3d-canvas';
import { CubeMesh } from '../lib/pseudo-3d-canvas/mesh';
import { Camera } from '../lib/pseudo-3d-canvas/camera';
import { Vector } from "../lib/mathf/vector";

/**
 * Demonstrates pseudo3dCanvas.  This is more an experimentation
 * and demonstration of how to project 3d into 2d space.
 *
 * The pseudo3dCanvas is responsible for creating a translationMatrix
 * that then transforms the positoin of each vertices to project
 * 3d into 2d space.
 */
export default class pseudo3dCanvasSample {

    constructor() {
        this.gui = new dat.GUI();
        this.raf = new Raf();
        this.raf.watch(this.renderLoop.bind(this));

        let canvasElement = document.getElementById('canvas');

        this.pseudo3dCanvas = new Pseudo3dCanvas({
            canvasElement: canvasElement
        });


        this.camera = new Camera();

        let cubeMesh = new CubeMesh();
        cubeMesh.position.x = 1;
        cubeMesh.position.y = 1;
        cubeMesh.position.z = 0;
        cubeMesh.color = 'green';
        cubeMesh.size(1.4, 1.4, 1);

        let cubeMesh2 = new CubeMesh();
        cubeMesh2.position.x = 0;
        cubeMesh2.position.y = 0;
        cubeMesh2.position.z = 100;
        // cubeMesh2.size(100, 100, 1);
        cubeMesh2.color = 'orange';


        // Update the camera position.
        this.camera.position = new Vector(0, 0, 30);
        this.camera.target = new Vector(0, 0, 0);
        // this.camera.position = new Vector(0, 0, 1);
        // this.camera.target = new Vector(0, 0, 0);

        this.meshes = [
            cubeMesh,
            cubeMesh2
        ];


        let projection = this.gui.addFolder('Projection');
        projection.add(this.pseudo3dCanvas, 'fov', -180, 180);
        projection.add(this.pseudo3dCanvas, 'aspect', 0, 2);
        projection.add(this.pseudo3dCanvas, 'near', -100, 100);
        projection.add(this.pseudo3dCanvas, 'far', -10000, 10000);

        let cameraFolder = this.gui.addFolder('camera position');
        cameraFolder.add(this.camera.position, 'x', -1, 1);
        cameraFolder.add(this.camera.position, 'y', -1, 1);
        cameraFolder.add(this.camera.position, 'z', -1, 1);
        let cameraTargetFolder = this.gui.addFolder('camera target');
        cameraTargetFolder.add(this.camera.target, 'x', -1, 1);
        cameraTargetFolder.add(this.camera.target, 'y', -1, 1);
        cameraTargetFolder.add(this.camera.target, 'z', -1, 1);

        // let meshFolder = this.gui.addFolder('mesh');
        // meshFolder.add(cubeMesh.rotation, 'x', 0.001, 0.9);
        // meshFolder.add(cubeMesh.rotation, 'y', 0.001, 0.9);
        // meshFolder.add(cubeMesh.rotation, 'z', 0.001, 0.9);


        this.renderLoop();
        console.log(this.pseudo3dCanvas);
        console.log(cubeMesh);
        // console.log(cubeMesh2);
        // Start raf loop.
        this.raf.start();
        // this.renderLoop();
    }


    /**
     * Handles each raf loop.
     */
    renderLoop() {
        this.meshes[0].rotation.x += 0.01;
        this.meshes[0].rotation.y += 0.01;

        this.meshes[1].rotation.x += 0.01;
        this.meshes[1].rotation.y += 0.02;
        this.meshes[1].rotation.z += 0.03;

        // this.meshes.forEach((mesh) => {
        //     mesh.rotation.x += 0.01;
        //     mesh.rotation.y += 0.01;
        //     // mesh.rotation.z += 0.01;
        // });

        this.pseudo3dCanvas.render(
            this.camera,
            this.meshes
        );

        // console.log(this.pseudo3dCanvas);
    }

}