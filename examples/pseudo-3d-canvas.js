
import * as dat from "dat.gui";
import { Raf } from '../lib/raf/raf';
import { Pseudo3dCanvas } from '../lib/pseudo-3d-canvas/pseudo-3d-canvas';
import { CubeMesh } from '../lib/pseudo-3d-canvas/mesh';
import { Camera } from '../lib/pseudo-3d-canvas/camera';

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
        cubeMesh.position.x = 0;
        cubeMesh.position.y = 0;
        cubeMesh.position.z = 0;

        console.log(cubeMesh);

        // Update the camera position.
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 5.0;

        this.meshes = [
            cubeMesh
        ];


        let projection = this.gui.addFolder('Projection');
        projection.add(this.pseudo3dCanvas, 'fov', 0, 50);
        projection.add(this.pseudo3dCanvas, 'near', 0.001, 10);
        projection.add(this.pseudo3dCanvas, 'far', 0.001, 100);

        let cameraFolder = this.gui.addFolder('camera position');
        cameraFolder.add(this.camera.position, 'x', -500, 500);
        cameraFolder.add(this.camera.position, 'y', -500, 500);
        cameraFolder.add(this.camera.position, 'z', -500, 500);
        let cameraTargetFolder = this.gui.addFolder('camera target');
        cameraTargetFolder.add(this.camera.target, 'x', -500, 500);
        cameraTargetFolder.add(this.camera.target, 'y', -500, 500);
        cameraTargetFolder.add(this.camera.target, 'z', -500, 500);

        let meshFolder = this.gui.addFolder('mesh');
        meshFolder.add(cubeMesh.rotation, 'x', 0.001, 0.9);
        meshFolder.add(cubeMesh.rotation, 'y', 0.001, 0.9);
        meshFolder.add(cubeMesh.rotation, 'z', 0.001, 0.9);


        // Start raf loop.
        this.raf.start();
        // this.renderLoop();
    }


    /**
     * Handles each raf loop.
     */
    renderLoop() {

        this.meshes.forEach((mesh) => {
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            mesh.rotation.z += 0.01;
        });

        this.pseudo3dCanvas.render(
            this.camera,
            this.meshes
        );

    }

}