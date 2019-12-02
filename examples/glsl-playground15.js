


//
//
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
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
uniform vec3 u_color;
uniform float u_time;

varying vec3 v_position;
varying vec2 v_uv;



float circle(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
    pt -= center;
    float len = length(pt);
    float result = smoothstep(radius-line_width/2.0-edge_thickness, radius-line_width/2.0, len) - smoothstep(radius + line_width/2.0, radius + line_width/2.0 + edge_thickness, len);

    return result;
  }

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

/**
 * https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13944084#questions
 * Create a polygon.
 */
float polygon(vec2 pt, vec2 center, float radius, int sides, float rotate, float edge_thickness){
    pt -= center;

    // Angle and radius from the current pixel
    float theta = atan(pt.y, pt.x) + rotate;
    float rad = PI2/float(sides);

    // Shaping function that modulate the distance
    float d = cos(floor(0.5 + theta/rad)*rad-theta)*length(pt);

    return 1.0 - smoothstep(radius, radius + edge_thickness, d);
  }


/**
 *
 * Returns 1.0 when test point is over a sweeping line.
 * pt - test point
 * center - center point
 * radius - radius
 *
 * https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
 * https://codepen.io/nik-lever/full/YBBjLo
 *  - green line is vector d
 *  - black line is vector p
 *  - blue line is perpendicular line p and test point.
 */
float sweep(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
    vec2 d = pt - center;
    float theta = u_time * 2.0;

    // A vector point around circle with given radius from 0,0.
    vec2 p = vec2(cos(theta), -sin(theta)) * radius;


    float h = clamp( dot(d,p)/dot(p,p), 0.0, 1.0 );

    //float h = dot(d,p)/dot(p,p);
    float l = length(d - p*h);

    float gradient = 0.0;
    const float gradient_angle = PI * 0.5;

    if (length(d)<radius){
      float angle = mod(theta + atan(d.y, d.x), PI2);
      gradient = clamp(gradient_angle - angle, 0.0, gradient_angle)/gradient_angle * 0.5;
    }

    return gradient + 1.0 - smoothstep(line_width, line_width+edge_thickness, l);
  }


void main (void)
{
  vec3 axis_color = vec3(0.8);
  vec3 color = line(v_uv.y, 0.5, 0.002, 0.001) * axis_color;
  color += line(v_uv.x, 0.5, 0.002, 0.001) * axis_color;

  // Add circles
  color += circle(v_uv, vec2(0.5), 0.3, 0.002, 0.001) * axis_color;
  color += circle(v_uv, vec2(0.5), 0.2, 0.002, 0.001) * axis_color;
  color += circle(v_uv, vec2(0.5), 0.1, 0.002, 0.001) * axis_color;

  // Add sweeping line.
  color += sweep(v_uv, vec2(0.5), 0.3, 0.003, 0.001) * vec3(0.1, 0.3, 0.1);

  // Add triangular polygons
  vec3 white = vec3(1.0);
  color += polygon(
      v_uv,
      vec2(0.9 - sin(u_time * 3.0) * 0.05, 0.5),
      0.005, 3, 0.0, 0.001) * white;
  color += polygon(
      v_uv,
      vec2(0.1 - sin(u_time * 3.0 +PI) * 0.05, 0.5),
      0.005, 3, PI, 0.001) * white;


  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground15 {
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


    onRaf() {
        this.uniforms.u_time.value += this.raf.getDelta(true);
        this.renderer.render(this.scene, this.camera);
    }

}