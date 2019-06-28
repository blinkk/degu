import { ImageLoader } from '../lib/loader/image-loader';
import { Raf } from '../lib/raf/raf';
import * as dat from "dat.gui";

const vertexSrc = `
precision mediump float;

attribute vec4 position;

varying vec2 vUv;

void main() {
	gl_Position = position;
    vUv = vec2( (position.x + 1.)/2., (-position.y + 1.)/2.);

}
`;

const fragmentSrc = `
precision mediump float;

uniform float uTrans;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uDisp;

varying vec2 vUv;

float quarticInOut(float t) {
  return t < 0.5
    ? +8.0 * pow(t, 4.0)
    : -8.0 * pow(t - 1.0, 4.0) + 1.0;
}

void main() {
    vec4 disp = texture2D(uDisp, vUv);
    float trans = clamp((uTrans * uTrans * 5.0) - disp.r * 2.0, 0.0, 1.0);
    vec4 color0 = texture2D(uTexture0, vUv);
    vec4 color1 = texture2D(uTexture1, vUv);
	gl_FragColor = mix(color0, color1 , trans);
}
`;


const assets = [
    '/public/guy1.jpg',
    '/public/guy2.jpg',
    '/public/displacement1.png'
];

export default class WebGlSample {

    constructor() {
        console.log('webGL image distortion sample');
        this.canvas = document.getElementById('canvas');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.gl = canvas.getContext('webgl');

        this.controls = {
            trans: 0
        };

        // Setup
        this.program = this.createProgram(vertexSrc, fragmentSrc);
        this.createBuffer(this.program);
        this.setUniform(this.program);


        // Setup raf loop.
        this.raf = new Raf(this.loop.bind(this));

        this.imageLoader = new ImageLoader(assets);
        this.imageLoader.decodeAfterFetch = false;
        this.imageLoader.load().then(this.onImageLoad.bind(this));


        this.gui = new dat.GUI();
        let gui = this.gui.addFolder('Controls');
        gui.add(this.controls, 'trans', 0.000, 1.00).step(0.001);

    }


    /**
     * Creates a program with vertex and frag shaders.
     */
    createProgram(vs, fr) {
        // Create program
        let program = this.gl.createProgram();
        // Compile vertex shader
        var vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vShader, vs);
        this.gl.compileShader(vShader);
        // Compile frag shader
        var fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fShader, fr);
        this.gl.compileShader(fShader);

        this.gl.attachShader(program, vShader);
        this.gl.deleteShader(vShader);

        this.gl.attachShader(program, fShader);
        this.gl.deleteShader(fShader);
        this.gl.linkProgram(program);

        return program;
    }


    createBuffer(program) {

        var vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            -1, 1,
            1, 1,
        ]);

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.vertexLocation = this.gl.getAttribLocation(program, 'position');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);


    }

    setUniform(program) {
        // uniformのロケーションを取得しておく
        this.uTransLoc = this.gl.getUniformLocation(program, 'uTrans');
        this.uniforms = [];
        this.uniforms.push(this.gl.getUniformLocation(program, 'uTexture0'));
        this.uniforms.push(this.gl.getUniformLocation(program, 'uTexture1'));
        this.uniforms.push(this.gl.getUniformLocation(program, 'uDisp'));
    }


    /**
     * When all images have loaded.
     */
    onImageLoad(images) {
        let gl = this.gl;

        this.textures = [];
        Object.values(images).forEach((image, i) => {
            let imageName = assets[i];
            let textureImage = images[imageName];
            let texture = gl.createTexture();
            // Add the image to the texture.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, textureImage);
            gl.generateMipmap(gl.TEXTURE_2D);

            this.textures.push(texture);
        });


        // Now start raf.
        this.raf.start();
    }

    /**
     * Runs on raf loop once images are loaded.
     */
    loop() {

        let gl = this.gl;
        // WebGLを初期化する
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 使用するprogramを指定する
        gl.useProgram(this.program);

        // 描画に使用する頂点バッファーをattributeとして設定する。
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            this.vertexLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertexLocation);

        // uniformsの値を指定する
        // 描画に使用するのtexture設定
        this.textures.forEach((texture, index) => {
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(this.uniforms[index], index);
        });

        gl.uniform1f(this.uTransLoc, this.controls.trans);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
