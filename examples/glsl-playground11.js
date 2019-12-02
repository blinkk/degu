


//
//  // https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739068
//



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
// pt - the point to test
// anchor - the rectangle anchor point
// size - the size of the rect
// center - the center of the rect
float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center) {
    // We need to offset the position of the virtual box to do a hit test.
    vec2 p = pt - center;
    vec2 halfsize = size * 0.5; // Half the size since we just need

    // Now do a hit test of this rectangle and see if pt falls within it.
    // float horz = (v_position.x > -halfsize.x && v_position.x < halfsize.x) ?
    float horz = step(-halfsize.x - anchor.x, p.x) - step(halfsize.x - anchor.x, p.x);
    float vert = step(-halfsize.y - anchor.y, p.y) - step(halfsize.y - anchor.y, p.y);
    return horz * vert;
}

//
// A classic 2d rotation matrix.
//
// mat2 mat = getRotationMatrix(rotationInRadians);
// vec2 rotatedPoint = mat * v_position.xy;
//
//
// Accepts an radian angle (theta) and returns a mat2 rotation matrix.
// s = sin(theta)
// c = cos(theta)
//
// Returned mat2
//
//    mat2          *      vec2.xy = new rotated position
// --        ---         ---  --
// |   c   -s  |    *    |   x  |  = new rotated position.
// |   s    c  |         |   y  |
// ---       ---         --    --
//
//
// For example:
// rotation 0
// sin(0) = 0, cos(0) = 1
//  1   0         x      1*x + 0*x     x
//  0   1    *    y   =  0*y + 1*y  =  y
// rotation of zero has no effect.


// rotation 180 degrees (3.14 radian)
// sin(3.14) = 0, cos(3.14) = -1
//  -1   0         x      -1*x + 0*x     -x
//  0   -1    *    y   =  0*y + 1*-y  =  -y
// rotation makes it 180 flipping x,y so it's correct.
//
mat2 getRotationMatrix(float theta) {
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c, -s, s, c);
}


/**
 * Return a mat2 scale matrix.
 *
 * mat2 scaleMat = getScaleMatrix(1.5);
 * mat2 rotateMat = getRotationMatrix(rotationInRadians);
 * vec2 scaledPoint = scaleMat * v_position.xy;
 * vec2 scaledAndRotatedPoint = scaleMat * rotateMat * v_position.xy;
 *
 */
mat2 getScaleMatrix(float scale) {
    return mat2(scale, 0, 0, scale);
}


void main (void)
{
  vec2 center = vec2(0.2, 0.0);

  // Use time as the angle theta.
  mat2 rotationMatrix = getRotationMatrix(u_time);

  // Create scale matrix based on time
  mat2 scaleMatrix = getScaleMatrix(
      ((sin(u_time) + 1.0) / 2.0) + 0.5 // Normalized sin + 0.5 offset so it ranges from 0.5 - 1.5
   );


  // Apply the scale + rotation matrix to the current v_position
   vec2 pt = scaleMatrix * rotationMatrix * v_position.xy;

  // Better version of the above which accounts for center point.
  // To do this, we account of the center point by subtracking it from the
  // v_position, then do the matrix tranform and then add it back.
//   vec2 pt = (rotationMatrix * (v_position.xy - center)) + center;

  // Use the new pt point to calculate to see if that point is in the
  // considered rectangle.
  float inRect = rect(pt.xy, vec2(0.15), vec2(0.3), center);

  vec3 color = vec3(1.0, 1.0, 0.0) * inRect;
  gl_FragColor = vec4(color, 1.0);






}
`;




export default class GlslPlayground10 {
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