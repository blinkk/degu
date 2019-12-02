

//
//  // https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739068
//



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';


const vshader = `
varying vec3 v_position; // Declare v_position
varying vec2 v_uv; // Declare v_position
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
varying vec2 v_uv;

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

mat2 getRotationMatrix(float theta) {
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c, -s, s, c);
}

mat2 getScaleMatrix(float scale) {
    return mat2(scale, 0, 0, scale);
}


/**
 * Checks if a pt is withi a circle that starts from the given center and of a given
 * radius.
 */
float circle(vec2 pt, vec2 center, float radius) {
    vec2 p = pt - center;
    return 1.0 - step(radius, length(p));
}

// Smooth step version of circle function.
float circle(vec2 pt, vec2 center, float radius, bool soften) {
    vec2 p = pt - center;
    return 1.0 - smoothstep(radius, radius + radius, length(p));
}

// Creates a lines circle.
float circle(vec2 pt, vec2 center, float radius, float line_width) {
    vec2 p = pt - center;
    float len = length(p);
    float half_line_width = line_width / 2.0;
    return step(radius-half_line_width, len) - step(radius + half_line_width, len);
}

// Creates a line circle with soft edge
float circle(vec2 pt, vec2 center, float radius, float line_width, bool soften) {
    vec2 p = pt - center;
    float len = length(p);
    float softenAmount = 0.5;
    float edge = (soften) ? radius * softenAmount : 0.0;
    float half_line_width = line_width / 2.0;
    return smoothstep(radius - half_line_width - edge, radius - half_line_width, len) -
        smoothstep(radius + half_line_width, radius + half_line_width + edge, len);
}



void main (void)
{
  vec2 center = vec2(0.0);

  float inCircle = circle(v_position.xy, vec2(-0.5, 0.0), 0.1);

  // Smooth edge with smooth step
   float inCircle2 = circle(v_position.xy, vec2(0.0, 0.0), 0.1, true);

  // Lined circle example.
//    float inCircle3 = circle(v_position.xy, vec2(0.5, 0.0), 0.1, 0.01);

  // Lined softed circle example.
   float inCircle3 = circle(v_position.xy, vec2(0.5, 0.0), 0.1, 0.01, true);

  // Combine outputs.
  vec3 color =
       vec3(1.0, 1.0, 0.0) * inCircle  +
       vec3(1.0, 0.0, 0.0) * inCircle2  +
       vec3(0.0, 0.0, 1.0) * inCircle3;
  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground13 {
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