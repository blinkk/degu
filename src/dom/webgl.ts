/**
 * Set of webGl helper methods.
 */
export class webgl {
  /**
   * @param gl WebGlRenderingContext
   * @param vs  Vertex shader
   * @param fr  Frag shader
   */
  static createProgram(
    gl: WebGLRenderingContext,
    vs: string,
    fr: string
  ): WebGLProgram {
    // Create program
    const program = gl.createProgram()!;
    // Compile vertex shader
    const vShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vShader, vs);
    gl.compileShader(vShader);
    // Compile frag shader
    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fShader, fr);
    gl.compileShader(fShader);

    gl.attachShader(program, vShader);
    gl.deleteShader(vShader);

    gl.attachShader(program, fShader);
    gl.deleteShader(fShader);
    gl.linkProgram(program);

    return program;
  }

  /**
   * Create VBO.
   * @param gl
   * @param data
   */
  static createVbo(gl: WebGLRenderingContext, data: Array<number>) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return vbo;
  }

  /**
   * Creates a text from image.  Requires that the image is already loaded.
   * @param source
   */
  static createTextureFromImage(
    gl: WebGLRenderingContext,
    image: HTMLImageElement
  ): WebGLTexture | null {
    const texture = gl.createTexture();
    // https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png
    // Set correct transparency to support pngs.
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    // We assume the image is NOT power of 2.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Use linear to get best quality.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    return texture;
  }

  /**
   * Deletes texture from GPU memory.
   * @param gl
   * @param texture
   */
  static deleteTexture(gl: WebGLRenderingContext, texture: WebGLTexture) {
    gl.deleteTexture(texture);
  }
}
