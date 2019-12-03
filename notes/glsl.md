
// https://medium.com/@Zadvorsky/into-vertex-shaders-part-1-the-spaces-of-webgl-c70ded527841

# Coordinate Systems

Normalized Device Coordiantes (webGl)
-1,1----------------1,1
 |                  |
 |                  |
 |      0,0         |
 |                  |
 |                  |
-1,-1----------------1, -1


World Space
- XYZ system.
- Axis depends on orientation and there is no standard.
- v_position (varying position) uses this.
        ue
        |
        |
        |
<------ 0,0 --------->
        |
        |
        |
        shita



UV Space

0,1----------------1,1
 |                  |
 |                  |
 |      0.5,0.5     |
 |                  |
 |                  |
0,0----------------1,0

v_uv (varying uv) uses this.


Pixel Coordinates

0,0--------x------->
 |
 |
 y
 |
 |
 ↓



Example of Pixel -> NDC conversion
 ```
window.addEventListener('mousemove', function(e) {
  var x = (e.clientX / window.innerWidth * 2) - 1;
  var y = (e.clientY / window.innerHeight * -2) + 1;
  // something awesome
});
 ```

# Uniforms
  - pass data between the control program (in this case three.js) and shaders
  - each uniform will store a common value for each vertex and pixel.
  - we call it uniform because it indicates that the same value will be the same
    for each vertex and pixel.

  Note different ways to access vector uniforms
  - u_mouse.x = u_mouse[0]
  - u_resolution.y = u_resolution[1]
  - vec2 uv = gl_FragCoord.xy / u_resolution;  // Which multiplies the xy of fragCoord with xy of u_resolution.
  - vec3(0.0)
     --> x,y,z = 0.0
     --> r,g,b = 0.0
     --> [0],[1],[2] = 0.0

# Varying
  - passes data from vertex -> frag.
  - see v_uv, v_position below.

# Vertex Shader
  - Vertex should set the vec4 gl_Position which is in clip coordinates
  - Applied per vertices of the mesh geometry.

  The position needs to condiser the model view projection.

  model - moves the vertex from local to world
  view - moves the vertex from world space to camera
  projection - moves the vertex clip to screen space coordinates (3d -> 2d)

  So to move the vertex, you want multiply the position vec3 by the model view
  projection but since you can't multiply vec3 * mat4, convert the vec3 into a
  vec4 by adding a w dimension as 1.0.   vec4(position, 1.0).

  In effect you are doing:
  gl_Position = Project (mat4) * View (mat4) * Model (mat4) * vec4 (position, w)

 resulting in a default vertex shader of:
 gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );






 # Frag Shader
  - Frag should set the gl_FragColor.
  - gl_FragColor is type vec4 for
  - Applied per pixel of the mesh.

  gl_FragCood is a vec4 that provides the current coordinates of the pixel (x,y,z,w)
     not 0,0 is at the bottom left and 1,1 is at the top left, middle is 0.5, 0.5.


# Common

UV
  Vertex
    When using THREE.js the uv value is passed to the vertex shader.

  Fragment:
    The normalized coordinates of the screen between 0,0 (bottom left) and 1, 1 (top right)
    @see glsl-playground4.js for simple example.

    vec2 uv = gl_FragCoord.xy / u_resolution; // Which multiplies the xy of fragCoord with xy of u_resolution.

normal
  normal is available in the vert shader made available by three.js.
  normal is a vector that extends outwards from the vertex used for
  lighting calculations.

  Also see @glsl-playground30.js for example of manual calcuations of normal lighting reflections.





v_uv, v_position
    Varying UV and Varying Position
    @see glsl-playground5.js for simple example.
    @see https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739026

    Values that are passed from vertex -> frag.  But vertex shaders are per mesh coordinates
    versus frags are per pixel.    So if you pass the vertix coordinates from
    vertex (which would be a point on the mesh), the frag shader might be working
    on coordinates between the mesh vertices.

    The frag shader ends up getting a mix (interpolated value) between the coordinates.
    You can pass the uv and model position values as varying to the frag shader.

    Three.js passes these values to the vertex shader by default:

    Vertex shader

    ```
    varying vec2 v_uv; // Declare v_uv
    varying vec4 v_position; // Declare v_position
    void main() {
      // Set the uv value.  Three.js passes the uv value.
      v_uv = uv;
      // Set the position value.  This is the current vertices of the model coordinates. (mesh coordinates)
      v_position = position;

      // Can get normalized position as well
      vec3 pos = normalize(position);


      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    }
    ```

    Frag

    ```
    // Basically receives the varying value from vertex.
    varying vec2 v_uv;
    varying vec3 v_position;
    void main() {
        vec3 color = vec3(
            v_uv.x, v_uv.y, 0.0
        );

        //vec3 color = vec3(
        //    v_position.x, v_position.y, 0.0
        /);

        gl_FragColor = vec4(color, 1.0);
    }
    ```

    The result of this as seen in glsl-playground5 is that the higher up on
    the screen, the more green it is.  The further right the more red it gets.
    Since 0,0 is bottom left and 1,1  is top right.


    What's the difference between v_uv and v_position?
        Taking a plane as an example,
        a plane might have has 4 vertices set to
        (1,1,0), (-1,1,0), (-1,-1,0), (1,-1,0).

        The uvs are set to (1,1), (0,1), (0,0), (1,0).
        The range for vPosition is therefore -1 to 1, vUv is 0 to 1.

        Use vPosition when you want the origin in the center and vUv when
        you want the origin at the bottom left. vPosition is also a vec3
        with z plane.

        vPosition is the actual position of the model with 0,0 in center
        vUV is the spread of the model over 0,0 -> 1,1

   What's the difference between gl_Fragcoord and v_position?
        gl_Fragcoord is using screen space (pixel coordinates).
        So you could get a range of like 0 - 1920 (or whatever the screen size is).
        gl_Fragcoord can be useful when you want to set things in pixels
        for instance, you want to draw a line of 10px.


Getting World positions in frag shader.
  @see glsl-playground.28.js
  We pass the modelMatrix as a varying over to the frag shader.

Normalizing Sin / Cos
    Sin returns values between -1 and 1 and we want 0-1.
    So we first do sin(time) + 1.0 which gives us a value between 0 and 2.
    We divide that by 2 (half it) so that it normalizes to 0-1.

    float s = (sin(time) + 1.0) / 2.0;

    or used normalizedSin available as part of shader-mathf.

Shifting Sin / Cos
    Can use mix and do it pretty easily.
    float s = (sin(time) + 1.0) / 2.0;
    mix(-0.5, 0.5, s) // make between -0.5 and 0.5
    mix(0, 1, s) // make between 0 and 1
    mixn(2, 30, s) // make between 2 and 30


Sin / Cos with Radians
   2π = 1 rotation 360
   π = 180

   0 sin(0) = 0, cos(0) = 1
   90 sin(π/2) = 1, cos(π/2) = 0
   180 sin(π) = 0, cos(π) = -1
   270 sin(3π/2) = -1, cos(π) = 0
   360 sin(2π) = -1, cos(π) = 1



SampleCube - Cube Textures
https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739244#questions/8753186
- takes 6 images.  1 for negative and positive of each x,y,z
- THREE.CubeTextureLoader(); (https://threejs.org/docs/#api/en/loaders/CubeTextureLoader)

# Functions
@see http://www.shaderific.com/glsl-functions
mix(x, y, a)  --> linear interpolation.
  - is basically: mix(x,y, a) = x * (1 - a) + y * a
  - mix(x, y, 0.0) ---> x
  - mix(x, y, 1.0) ---> y
  - mix(x, y, 0.5) ---> between x and y, blended values.

  x, y can be floats, vec2, vec3, vec4 as long as x and y are the same type.
  @see glsl-playground4.js for simple example.

clamp(n, min, max)  --> contrains a value between min and max
  - clamp(2.0, 0.0, 1.0) --> 1.0
  - clamp(-1.0, 0.0, 1.0) --> 0.0
  - clamp(0.5, 0.0, 1.0) --> 0.5

step(edge, n) --> helps to create edges.
  @see glsl-playground7.js for simple example.
  - returns 0.0 or 1.0
  - if n < edge --> 0.0
  - if n > edge --> 1.0

  basically step says, is n greater than edge or not.

  you can do the invert and do, is n less than edge by subtracting it.
  float lessThan = 1.0 - step(1.0, 0.0); // 1.0
  float lessThan = 1.0 - step(1.0, 1.1); // 0.0



smoothstep(edge0, edge1, n) --> creates smooth edges.
  @see glsl-playground7.js for simple example.
  - Check the value of n between edge0 and edge1 and sort of
    clamps it and everything else is smoothly interpolated in between.
    Kind of a clamp + lerp/mix.
  - returns 0.0 or 1.0
  - if n < edge0 --> 0.0
  - if n > edge1 --> 1.0

dot(a,b)  ----> dot product of two vectors
  - dot(a,b) = a.x * b.x + a.y * b.y;
  - https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739214 (3:50)
  - https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739236#questions/8753186 (first two minutes)
  - https://betterexplained.com/articles/vector-calculus-understanding-the-dot-product/
  - multiplying the common parts of the vectors.  Looking at the similarities.
  - directional multiplication.  Howe much overlap is there.
  - solar panel example.  Closer to 90 degrees - 0 max power.  Parallel - 1.
    (if dealing with normalized unit vectors)
  - mario-kart speed boost


atan(d.y, d.x) ---> returns the angle of vector
  vec2 a = vec2(0.5, 0.2);
  vec2 b = vec2(0.2, -0.2);
  vec2 d = a - b;
  float an gle = atan(d.y, dx);
  // return value between -3.14 and 3.14

length(v_position.xy)  --> returns the length of a vector



fract(number) --> gets the decimal value.
  - 1.5     --> 0.5
  - 6.7     --> 0.7
  - 3.3     --> 0.3

# Noise
https://github.com/ashima/webgl-noise
https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83

# Textures
@see glsl-playground20.js for basic example.

texture2D(texture, uv)
 - the texture is the first param. (sampler2D)
 - the uv (vec2) is the second param.  This specifies what "color" is at what uv coordinate.
   by passing the current uv, you can ask, what is the pixel color of the current uv coordinate.
 - returns a vec4 by default. rgba
 - change to texture2D(u_texture, v_uv).rgb to return it as a vec3.



# Three integrations
Three.jsのさまざまなマテリアル
https://ics.media/tutorial-three/material_variation/

ThreejsでGLSLをいじるための基礎知識
https://qiita.com/kitasenjudesign/items/1657d9556591284a43c8


Three Shader Locations
https://github.com/mrdoob/three.js/tree/master/src/renderers/shaders

Materials
https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib.js

https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshphysical_vert.glsl.js

https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshphysical_frag.glsl.js


Extending Materials
https://discourse.threejs.org/t/function-to-extend-materials/7882
view-source:https://threejs.org/examples/webgl_buffergeometry_instancing_lambert


# Three Shader Chunk
You can defined three.js shader chunks for common used functions.
This essentially monkey patches the three.js object and three.js
will include your functions at run time.

```
import { noise } from 'yano-js/lib/shaders/three-shader-chunks/noise'
import { yanoMathf } from 'yano-js/lib/shaders/three-shader-chunks/yano-mathf'
// Run monkey patch.
noise(THREE);
yanoMathf(THREE);
```
then in your shader just do:

```
#include <noise>;
#include <yanoMathf>;
```

@see glsl-playground19.js for an example of this.


# Shader Frog

説明
https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739244#questions/8753186


Sample
https://codepen.io/nik-lever/pen/JzjwmW


https://shaderfrog.com/


# Inspiration
http://glslsandbox.com/


# Refs

thisbookofshaders.com


glsl トラブルまとめ
https://alteredqualia.com/tmp/webgl-maxparams-test/

Random Issue
http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/

GLSL による画像フィルタを色々試してみた
https://qiita.com/cx20/items/15e9ac23fe8ee821387d


glslで良く作られるユーティリティ関数 (Random)
https://qiita.com/7CI fnoiseT/items/2c69351b96743b6ae0e1

WebGLのシェーダーGLSLでの画像処理の作り方（モノクロ、セピア、モザイク、渦巻き）
https://ics.media/entry/5535/

GLSLを使ってワンランク上の表現を！ Three.jsでのぷるぷるシェーダーの作り方
https://ics.media/entry/3228/

エフェクト作成入門講座 Three.js編 ゲーム演出に役立つマグマ表現の作り方
https://ics.media/entry/13973/

エフェクト作成入門講座 Three.js編 RPGのセーブポイント風の魔法陣
https://ics.media/entry/11401/

Performance
https://ics.media/entry/12930/