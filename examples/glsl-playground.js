
import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';


/**
 * https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
 * https://gist.github.com/uxder/cc02c445c2f7b4679e48e91d2920c832
 *
 * Uniforms
 * - pass data between the control program (in this case three.js) and shaders
 * - each uniform will store a common value for each vertex and pixel.
 * - we call it uniform because it indicates that the same value will be the same
 *   for each vertex and pixel.
 *
 * Note different ways to access vector uniforms
 * - u_mouse.x = u_mouse[0]
 * - u_resolution.y = u_resolution[1]
 */



 /*
 * Vertex Shader
 * - Vertex should set the vec4 gl_Position.
 * - Applied per vertices of the mesh geometry.
 *
 * The position needs to condiser the model view projection.
 * model - moves the vertex from local to world
 * view - moves the vertex from world space to camera
 * projection - moves the vertex clip to screen space coordinates (3d -> 2d)
 *
 * So to move the vertex, you want multiply the position vec3 by the model view projectiion
 * but since you can't multiply vec3 * mat4, convert the vec3 into a vec4 by adding a
 * w dimension as 1.0.   vec4(position, 1.0).
 *
 * In effect you are doing:
 * gl_Position = Project (mat4) * View (mat4) * Model (mat4) * vec4 (position, w)
 *
 * resulting in a default vertex shader of:
 * gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
 */
const vshader = `
void main() {

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

  // Make each vertices position half.
  //   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position * 0.5, 1.0 );
}
`;


/**
 *
 * Frag Shader
 * - Frag should set the gl_FragColor.
 * - gl_FragColor is type vec4 for
 * - Applied per pixel of the mesh.
 *
 * Three.js Color translates to vec3 type which we pass as a uniform u_color.
 *
 */
const fshader = `
uniform vec3 u_color;

void main (void)
{
// Green
//   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);

// Red
//   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

// From uniform
  gl_FragColor = vec4(u_color, 1.0);

// You can swap the rgba order if you want to green blue red alpha.
//   gl_FragColor = vec4(u_color, 1.0).gbra;


}
`;




export default class GlslPlayground {
    constructor() {

        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        // 2x2
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.raf = new Raf(this.onRaf.bind(this));
        this.domWatcher = new DomWatcher();

        this.domWatcher.add({
            element: window,
            on: 'resize',
            callback: this.onResize.bind(this),
            eventOptions: { passive: true },
        });



        this.uniforms = {
            u_color: { value: new THREE.Color(0xffff00) },
        };

        // 2x2 so it fill the screen.
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader
        });

        // Create mesh (geom + material)
        this.plane = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.plane);

        this.camera.position.z = 1;

        this.onResize();

        this.raf.start();
    }


    onResize() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        let width, height;
        if (aspectRatio >= 1) {
            width = 1;
            height = (window.innerHeight / window.innerWidth) * width;
        } else {
            width = aspectRatio;
            height = 1;
        }
        this.camera.left = -width;
        this.camera.right = width;
        this.camera.top = height;
        this.camera.bottom = -height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    onRaf() {
        this.renderer.render(this.scene, this.camera);
    }

}