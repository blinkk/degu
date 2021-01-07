
//
//
// Simple Image Texture.
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739178#questions
// https://codepen.io/nik-lever/pen/ZwgrRR
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739190#questions/8753186
// https://codepen.io/nik-lever/pen/PVMRXa
//



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import {deguMathf} from '../lib/shaders/three-shader-chunks/degu-mathf';
deguMathf(THREE);

/**
 * Class that creates canvas text in three.js.
 * Thanks to Nik Lever.
 */
class CanvasText{
	constructor(scene, msg, config, material){
		this.config = (config===undefined) ? { font:'sans', size:30, h1size:50, padding:10, colour:'#fff', width:256, height:256 } : config;

        const planeMaterial = (material===undefined) ? new THREE.MeshBasicMaterial({ transparent: true }) : material;
        this.planesize = (config.planesize) ? config.planesize : { width:0.5, height:0.5 };
		const planeGeometry = new THREE.PlaneGeometry(this.planesize.width, this.planesize.height);

		this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
        if (this.config.zpos) this.mesh.position.z = this.config.zpos;

		scene.add(this.mesh);

        this.update(msg);
	}

	update(msg){
		if (this.mesh===undefined) return;

		let context = this.context;

		if (context===undefined){
			const canvas = this.createOffscreenCanvas(this.config.width, this.config.height);
			this.context = canvas.getContext('2d');
			context = this.context;
			context.font = `${this.config.size}pt ${this.config.font}`;
			context.fillStyle = this.config.colour;
			context.textAlign = 'center';
            this.texture = new THREE.CanvasTexture(canvas);
            if (this.mesh.material.uniforms!==undefined){
                this.mesh.material.uniforms.u_tex = { value:this.texture };
            }else{
                this.mesh.material.map = this.texture;
            }
		}

		const bg = this.img;
		context.clearRect(0, 0, this.config.width, this.config.height);

        if (this.config.debug){
            context.beginPath();
            context.rect(0, 0, this.config.width, this.config.height);
            context.stroke();
        }

		this.wrapText(msg, context);

		this.texture.needsUpdate = true;
	}

	createOffscreenCanvas(w, h) {
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		return canvas;
	}

	wrapText(msg, context){
		const words = msg.text.split(' ');
        let line = '';
		const lines = [];
		const maxWidth = this.config.width - 2*this.config.padding;
		const lineHeight = this.config.size + 8;

		context.font = `${this.config.size}pt ${this.config.font}`;

        words.forEach( function(word){
			const testLine = `${line}${word} `;
        	const metrics = context.measureText(testLine);
        	const testWidth = metrics.width;
			if (testWidth > maxWidth) {
				lines.push(line);
				line = `${word} `;
			}else {
				line = testLine;
			}
		});

		if (line != '') lines.push(line);

		let y = this.config.height - lines.length * lineHeight;
		const centerX = this.config.width/2;

		lines.forEach( function(line){
			context.fillText(line, centerX, y);
			y += lineHeight;
		});

        y = this.config.height - (lines.length + 1.5) * lineHeight;
        context.font = `${this.config.h1size}pt ${this.config.font}`;
        context.fillText(msg.name, centerX, y);
	}

    positionText(camera, pos){
        if (!this.planesize) return;

        if (pos.bottom!==undefined){
            this.mesh.position.y = pos.bottom + this.planesize.height/2 + camera.bottom;
        }else if (pos.top!==undefined){
            this.mesh.position.y = camera.top - pos.top - this.planesize.height/2;
        }else{
            this.mesh.position.y = 0;
        }

        if (pos.left!==undefined){
            this.mesh.position.x = pos.left + this.planesize.width/2 + camera.left;
        }else if (pos.right!==undefined){
            this.mesh.position.x = camera.right - pos.right - this.planesize.width/2;
        }else{
            this.mesh.position.x = 0;
        }
    }
}

const vshader = `
varying vec3 v_position;
varying vec2 v_uv;
void main() {
  v_position = position;
  v_uv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`;


const fshader = `
#include <deguMathf>
#define PI 3.14159265359

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_time;
uniform float u_duration;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;

varying vec3 v_position;
varying vec2 v_uv;


void main (void)
{
    // vec2 p = v_position.xy;
    vec2 p = -1.0 + 2.0 * v_uv;

    float len = length(p);
    vec2 radiant = p / len * 0.02;
    float rippleCount = 30.0;
    vec2 ripple = v_uv + radiant * cos(len * rippleCount - u_time * 4.0);
    float progress = u_time / u_duration;
    vec2 uv = mix(ripple, v_uv, progress);

    vec3 color1 = texture2D(u_texture1, uv).rgb;
    vec3 color2 = texture2D(u_texture2, uv).rgb;
    float fade = smoothstep(progress * 1.4, progress * 2.5, len);

    // Mix it
    vec3 color = mix(color2, color1, fade);

    gl_FragColor = vec4(color, 1.0);
}
`;


// Version to just display text
const textFragShader = `
#include <deguMathf>
#define PI 3.14159265359

uniform float u_time;
uniform float u_duration;
uniform sampler2D u_tex;

varying vec3 v_position;
varying vec2 v_uv;

void main (void)
{
    gl_FragColor = texture2D(u_tex, v_uv);
}
`;


// Twirling text version.
const textFragShader2 = `
  uniform sampler2D u_tex;
  uniform float u_time;
  uniform float u_duration;
  uniform float u_twirls;

  varying vec2 v_uv;

  vec4 twirl(sampler2D tex, vec2 uv, float time){
    if (time<0.0) time = 0.0;

    vec2 center = vec2(0.5);
    vec2 tc = uv - center;
    float dist = length(tc);

    if (dist < 0.5){
      float delta = (0.5 - dist) / 0.5;
      float theta = delta * delta * time * u_twirls;
      float s = sin(theta);
      float c = cos(theta);
      mat2 mat = mat2(c,s,-s,c);
      tc = mat * tc;
      //tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
    }

    tc += center;
    vec4 color = texture2D(tex, tc);
    color.a = mix(0.0, color.a, min(u_time, 1.0));
    return color;
  }

  void main(void){
    gl_FragColor = twirl(u_tex, v_uv, u_duration - u_time);
  }
`;


export default class GlslPlayground23 {
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
            // Load a texture.
            // Ends up being a sampler2D type.
            u_texture1: {
                value: null
            },
            u_texture2: {
                value: null
            },
            u_time: { value: 0.0 },
            u_duration: { value: 2.0 },
            u_mouse: { value:{ x:0.0, y:0.0 }},
            u_resolution: { value:{ x:0, y:0 }}
        };

        // The plane size should be the same aspect ratio as the image otherwise,
        // the image gets stretched.
        this.geometry = new THREE.PlaneGeometry(0.669, 1);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader
        });


        // Create mesh (geom + material)
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);


        // Text for slides.
        this.text = [
            {name:"test1", text:"This is the first text"},
            {name:"test2", text:"This is the second text"},
            {name:"test3", text:"This is the third text"},
        ];

        // Add a second plane to hold the text.
        this.uniforms2 = {
            u_time: { value: 0.0 },
            u_duration: { value: 0.7 },
            u_twirls: { value: 4 },
        };

        this.material2 = new THREE.ShaderMaterial( {
            uniforms: this.uniforms2,
            vertexShader: vshader,
            // Normal text
            // fragmentShader: textFragShader,
            fragmentShader: textFragShader2,
            transparent: true
        } );
        const config = { font:'Josefin Sans', size:16, h1size:30, padding:10, colour:'#fff', width:512, height:256, zpos:0.005, planesize: { width:1, height:0.5 } };
        this.canvasText = new CanvasText(this.scene, this.text[1], config, this.material2);

        this.camera.position.z = 1;

        this.onResize();

        this.raf.start();


        this.slideIndex = 0;
        this.textures=
        [
             new THREE.TextureLoader().load('./public/random.jpg'),
             new THREE.TextureLoader().load('./public/random2.jpg'),
             new THREE.TextureLoader().load('./public/random3.jpg'),
        ];



        // Fake a slideshow for now.
        setInterval(()=> {
            this.slideIndex++;
            this.displayIndex();
        }, 3000);
        this.displayIndex();
    }


    displayIndex() {
        // Reset the time value.
        this.uniforms.u_time.value = 0;
        this.uniforms2.u_time.value = 0;

        this.canvasText.update(this.text[this.slideIndex]);
        this.uniforms.u_texture1.value = this.textures[this.slideIndex];
        this.uniforms.u_texture2.value = this.textures[this.slideIndex + 1];

        if(this.slideIndex >= this.textures.length - 1) {
          this.uniforms.u_texture1.value = this.textures[this.slideIndex];
          this.uniforms.u_texture2.value = this.textures[0];
          this.slideIndex = -1;
        }

        console.log(this.slideIndex);
        console.log(this.uniforms.u_texture1.value);
        console.log(this.uniforms.u_texture2.value);
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


        this.canvasText.positionText(this.camera, { bottom: 0.1 });
    }


    onMouseMove(evt) {
        this.uniforms.u_mouse.value.x = (evt.touches) ? evt.touches[0].clientX : evt.clientX;
        this.uniforms.u_mouse.value.y = (evt.touches) ? evt.touches[0].clientY : evt.clientY;
    }


    onRaf() {
        const delta = this.raf.getDelta(true);
        if (this.uniforms.u_time.value < this.uniforms.u_duration.value){
          this.uniforms.u_time.value += delta;
          this.uniforms2.u_time.value += delta;
        } else {
           this.uniforms.u_time.value = this.uniforms.u_duration.value;
           this.uniforms2.u_time.value = this.uniforms2.u_duration.value;

        }
        this.renderer.render(this.scene, this.camera);
    }

}