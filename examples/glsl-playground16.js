


//
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739138#questions/
//



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';


const vshader = `
varying vec3 v_position; // Declare v_position
varying vec2 v_uv; // Declare v_uv
void main() {
  // Set the uv value.  Three.js passes the uv value by default of the current vertices.
  v_position = position;
  v_uv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`;


const fshader = `
#define PI 3.14159265359
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color_a;
uniform vec3 u_color_b;
uniform float u_time;

varying vec3 v_position;
varying vec2 v_uv;



float line(float a, float b, float line_width, float edge_thickness) {
    float half_line_width = line_width * 0.5;
    return smoothstep(
        a - half_line_width - edge_thickness,
        a - half_line_width,
        b
     ) -
     smoothstep(
         a + half_line_width,
         a + half_line_width + edge_thickness,
         b
     );
}


float brick(vec2 pt, float mortar_height, float edge_thickness){
    float result = line(pt.y, 0.0, mortar_height, edge_thickness);
    result += line(pt.y, 0.5, mortar_height, edge_thickness);
    result += line(pt.y, 1.0, mortar_height, edge_thickness);

    if(pt.y > 0.5) {
        pt.x = fract(pt.x + 0.5);
    }
    result += line(pt.x, 0.5, mortar_height, edge_thickness);


    return result;
  }

void main (void)
{
  vec2 uv = fract(v_uv*10.0);
  vec3 white = vec3(1.0);
  float brickLines = brick(uv, 0.05, 0.001);
  vec3 color = mix(u_color_a, u_color_b, brickLines);
  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground16 {
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
            u_color_a: { value: new THREE.Color(0xff0000) },
            u_color_b: { value: new THREE.Color(0x00ffff) },
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