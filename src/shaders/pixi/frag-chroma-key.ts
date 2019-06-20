/**
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