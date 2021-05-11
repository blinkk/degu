/**
 * Creates a 2d rotation matrix.
 *
 * mat2 mat = deguGetRotationMatrix(rotationInRadians);
 * vec2 rotatedPoint = mat * v_position.xy;
 *
 *    mat2          *      vec2.xy = new rotated position
 * --        ---         ---  --
 * |   c   -s  |    *    |   x  |  = new rotated position.
 * |   s    c  |         |   y  |
 * ---       ---         --    --
 *
 * For example:
 * rotation 0
 * sin(0) = 0, cos(0) = 1
 *  1   0         x      1*x + 0*x     x
 *  0   1    *    y   =  0*y + 1*y  =  y
 * rotation of zero has no effect.
 *
 *
 * rotation 180 degrees (3.14 radian)
 * sin(3.14) = 0, cos(3.14) = -1
 *  -1   0         x      -1*x + 0*x     -x
 *  0   -1    *    y   =  0*y + 1*-y  =  -y
 * rotation makes it 180 flipping x,y so it's correct.
 *
 */
const deguGet2dRotationMatrix = `
   mat2 deguGet2dRotationMatrix(float theta) {
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c, -s, s, c);
   }
`;

/*
 * Returns a mat2 scale matrix.
 *
 * mat2 scaleMat = deguGetScaleMatrix(1.5);
 * mat2 rotateMat = deguGetRotationMatrix(rotationInRadians);
 * vec2 scaledPoint = scaleMat * v_position.xy;
 * vec2 scaledAndRotatedPoint = scaleMat * rotateMat * v_position.xy;
 *
 */
const deguGet2dScaleMatrix = `
  mat2 deguGetScaleMatrix(float scale) {
      return mat2(scale, 0, 0, scale);
  }
`;

/**
 * A 2d based rotation.
 * pt - The point of rotation
 * theta - the angle in radians
 * @return vec2
 *
 * vec2 myPoints = vec2(0,0.5);
 * // Rotate by 1 radian
 * vec2 rotatedPoints = deguRotate2d(myPoints, 1);
 *
 */
const deguRotate2d = `
   vec2 deguRotate2d(vec2 pt, float theta) {
       mat2 rotationMatrix = deguGet2dRotationMatrix(theta);
       return rotationMatrix * pt;
   }
`;

/**
 * Rotations an image.
 * https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739174#questions
 * @see glsl-playground20.js for an example.
 * ```
 *   vec2 center = vec2(0.5);
 *   float imageAspect = 300.0 / 448.0;
 *   vec3 backgroundColor = vec3(0.0);
 *   vec3 color = deguRotate2dImage(
 *       u_texture, imageAspect, v_uv, center, u_time, backgroundColor);
 * ```
 */
const deguRotate2dImage = `
   vec3 deguRotate2dImage(sampler2D texture, float aspect, vec2 uv, vec2 center, float theta, vec3 backgroundColor) {
       // Adjust for the center point.
       uv -= center;

       mat2 rotationMatrix = deguGet2dRotationMatrix(theta);
       // Go to square uv coordinates.
       uv.y /= aspect;
       // Conduct rotation.
       uv = rotationMatrix * uv;
       // Go back to whatever the aspect was.
       uv.y *= aspect;

       // Adjust back for the center point.
       uv += center;

       vec3 texel = texture2D(texture, uv).rgb;

       // Determine if this point is within the bounds of the rectangle.
       // If not, use the background color.
       vec2 s = step(vec2(0.0), uv) - step(vec2(1.0), uv);
       float t = s.x * s.y;

       vec3 color = mix(backgroundColor, texel, t);

       return color;
   }
`;

/**
 * Sin returns values between -1 and 1 but we often want 0-1.
 * Allows you to run a normlized sin.  You can combine this
 * with mix to create sin waves of any given range.
 *
 * ```
 *  // These two are the same.
 *  float s = (sin(radians) + 1.0) / 2.0;
 *  float s = normalizedSin(radians);
 *
 * // Use normalized sin to shift values of sin.
 * // Make a sin wave of range -0.2, 0.2
 * float wave = mix(-0.2, 0.2, normalizedSin(currentRadian));
 * ```
 */
const normalizedSin = `
  float normalizedSin(float radians) {
    return (sin(radians) + 1.0) / 2.0;
  }
`;

/**
 * Raycast algo.
 * @see  http://blog.ruofeidu.com/tutorial-of-ray-casting-ray-tracing-and-ray-marching/
 */
// eslint-disable-next-line
const castRay = `
bool castRay( const vec3 & ro, const vec3 & rd, float & resT )
{
    const float delt = 0.01f;
    const float mint = 0.001f;
    const float maxt = 10.0f;
    for( float t = mint; t < maxt; t += delt )
    {
        const vec3 p = ro + rd*t;
        if( p.y < f( p.x, p.z ) )
        {
            resT = t - 0.5f*delt;
            return true;
        }
    }
    return false;
}
`;

/**
 * Common custom math functions for glsl.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deguMathf = (three: any) => {
  three.ShaderChunk.deguMathf = `
  ${deguGet2dRotationMatrix}
  ${deguGet2dScaleMatrix}
  ${deguRotate2d}
  ${deguRotate2dImage}
  ${normalizedSin}
`;
};
