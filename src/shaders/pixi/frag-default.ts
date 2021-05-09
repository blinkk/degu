/**
 * Default frag shader that doesn't do very much.
 */
export const fragDefault = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;
