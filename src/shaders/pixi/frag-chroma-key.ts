/**
 *  A chroma-key frag shader.  Takes a given color and makes it transparent.
 *
 *
 * Sample usage with Pixi.
 * ```ts
 *
 *   import {color} from 'degu';
 *   import {fragChromaKey} from 'degu/lib/shaders/pixi/frag-chroma-key';
 *
 *   let uniforms = {
 *     // Threshold
 *     epsilon: {type: '1f', value: 0.45},
 *     // The color to replace.
 *     color: {type: 'v3', value: color.hexToRgbNormalized(0x50ff00)},
 *   };
 *   let chromaKeyShader = new PIXI.Filter(null, fragChromaKey, uniforms);
 *
 *
 * ```
 *
 *
 * @see https://github.com/pixijs/pixi-filters/blob/master/filters/color-replace/src/colorReplace.frag
 * @see https://developer.tizen.org/community/tip-tech/creating-pixi.js-filters-using-webgl
 */
export const fragChromaKey = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;

    uniform vec3 color;
    uniform float epsilon;

    void main() {
        vec4 currentColor = texture2D(uSampler, vTextureCoord);
        vec3 colorDiff = color - (currentColor.rgb / max(currentColor.a, 0.0000000001));
        float colorDistance = length(colorDiff);
        if(colorDistance < epsilon) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
        };
    }
`;