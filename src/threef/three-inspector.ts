import * as THREE from 'three';
import {Datguif} from '../datguif/datguif';

/**
 * A class that setups guif with a three.js scene.
 */
export class ThreeInspector {
  constructor(element: HTMLElement, scene: THREE.Scene, camera: THREE.Camera) {
    console.log('setting up new GUI');
    // Setup GUIF.
    const gui = new Datguif({
      load: JSON,
      autoPlace: false,
    });
    element.appendChild(gui.getGui().domElement);

    gui.addFolder('Renderer', 'Settings');

    // gui.addFolder('Camera', 'Settings');
    // gui.addObjectToFolder(
    //     'Camera',
    //     camera,
    //     [
    //         { keyName: 'fov', min: 0, max: 50, step: 0.01, callback: ()=> {
    //             camera.updateProjectionMatrix();
    //         } },
    //         { keyName: 'zoom', min: 0, max: 10, step: 0.0001, callback: ()=> {
    //             camera.updateProjectionMatrix();
    //         } },
    //     ]
    // );

    gui.addFolder('Objects');
  }
}
