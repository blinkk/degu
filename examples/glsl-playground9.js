



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';


const vshader = `
varying vec3 v_position; // Declare v_position
void main() {
  // Set the uv value.  Three.js passes the uv value by default of the current vertices.
  v_position = position;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`;


const fshader = `
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_time;

varying vec3 v_position;

// Determine if a particular pixel is within the boundaries of a rectangle box.
// Returns 1.0 when point pt,  is inside a rectangle defined by size and center.
float rect(vec2 pt, vec2 size, vec2 center) {
    // We need to offset the position of the virtual box to do a hit test.
    vec2 p = pt - center;
    vec2 halfsize = size * 0.5; // Half the size since we just need

    // Now do a hit test of this rectangle and see if pt falls within it.
    // float horz = (v_position.x > -halfsize.x && v_position.x < halfsize.x) ?
    float horz = step(-halfsize.x, p.x) - step(halfsize.x, p.x);
    float vert = step(-halfsize.y, p.y) - step(halfsize.y, p.y);
    return horz * vert;
}

void main (void)
{


// Example 1: Just a square
//   float inRect = rect(v_position.xy, vec2(0.5), vec2(0.0));
//   vec3 color = vec3(1.0, 1.0, 0.0) * inRect;

// Example 2: Some movement
// Add movement over time.
//   float s = ((sin(u_time) + 1.0) / 2.0); // Normalize sin.
//   s = s - 0.5; // Offset it.
//   float inRect = rect(v_position.xy, vec2(s, s), vec2(s, -s));
//   vec3 color = vec3(1.0, 1.0, 0.0) * inRect;

// // Example 3: Two squares
//   float square1 = rect(v_position.xy, vec2(0.3), vec2(0.0));
//   float square2 = rect(v_position.xy, vec2(0.3), vec2(-0.5));
//   vec3 color =
//     (vec3(1.0, 1.0, 0.0) * square1) + // square 1
//     (vec3(0.0, 1.0, 0.0) * square2) // square2
//    ;


// Example 4: Go around in a circle.
  float radius = 0.2;
  float time = u_time * 2.0;
  // Get the center point for going around in a circle over time.
  vec2 center = vec2( cos(time) * radius, sin(time) * radius);
  float inRect = rect(v_position.xy, vec2(0.4), center);
  vec3 color = vec3(1.0, 1.0, 0.0) * inRect;



  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground9 {
    constructor() {

        this.scene = new THREE.Scene();
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

        this.domWatcher.add({
            element: window,
            on: 'mousemove',
            callback: this.onMouseMove.bind(this),
        });


        this.uniforms = {
            u_color: { value: new THREE.Color(0xff0000) },
            // Float
            u_time: { value: 0.0 },
            // Vec2 0,0 at top, left and window.innerWidth and window.innerHeight at bottom right.
            u_mouse: { value: { x: 0.0, y: 0.0 } },
            // Vec2 Screen resolution
            u_resolution: { value: { x: 0, y: 0 } }
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

        this.uniforms.u_resolution.value.x = window.innerWidth;
        this.uniforms.u_resolution.value.y = window.innerHeight;
    }


    onMouseMove(evt) {
        this.uniforms.u_mouse.value.x = (evt.touches) ? evt.touches[0].clientX : evt.clientX;
        this.uniforms.u_mouse.value.y = (evt.touches) ? evt.touches[0].clientY : evt.clientY;
    }


    onRaf(delta) {
        this.uniforms.u_time.value += this.raf.getDelta(true);
        this.renderer.render(this.scene, this.camera);
    }

}