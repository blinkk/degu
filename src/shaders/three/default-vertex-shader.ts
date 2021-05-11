/**
 *  A chroma-key frag shader.  Takes a given color and makes it transparent.
 *
 *
 * Sample usage with Pixi.
 * ```ts
 *
 *   import {defaultVertexShader} from 'degu/lib/shaders/three/default-vertex-shader';
 *
 *   const material = new THREE.ShaderMaterial({
 *           uniforms: ...,
 *           vertexShader: defaultVertexShader
 *           fragmentShader: ..
 *   });
 * ```
 */
export const defaultVertexShader = `
    varying vec2 v_uv;
    varying vec3 v_position;

    void main() {
       v_position = position;
       v_uv = uv;
       gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    }
`;
