
import { Camera } from './camera';
import { Mesh } from './Mesh';
import { mathf } from '../mathf/mathf';
import { MatrixIV } from '../mathf/matrixIV';
import { Vector } from '../mathf/vector';
import { domCanvas } from '../dom/dom-canvas';

interface Pseudo3dCanvasConfig {
    canvasElement: HTMLCanvasElement;
}

/**
 * The main renderer for pseudo3dCanvas.
 *
 * This pseudo3dCanvas particular class, implements the model - view - perspective
 * matrices to achieve pseudo3d onto 2d canvas.
 *
 *
 * @see http://web.archive.org/web/20131222170415/http:/robertokoci.com/world-view-projection-matrix-unveiled/
 * @see https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/
 * @see http://www.codinglabs.net/article_world_view_projection_matrix.aspx
 * @see https://solarianprogrammer.com/2013/05/22/opengl-101-matrices-projection-view-model/
 * @see https://www.3dgep.com/understanding-the-view-matrix/
 */
export class Pseudo3dCanvas {

    private canvasElement: HTMLCanvasElement;
    private width: number;
    private height: number;
    private context: CanvasRenderingContext2D;
    public fov: number;
    public near: number;
    public far: number;
    public aspect: number;

    private rotationMatrix: MatrixIV;
    private translationMatrix: MatrixIV;
    private viewMatrix: MatrixIV;
    private worldMatrix: MatrixIV;
    private projectionMatrix: MatrixIV;
    private transformMatrix: MatrixIV;

    constructor(config: Pseudo3dCanvasConfig) {
        this.canvasElement = config.canvasElement;
        this.context = this.canvasElement.getContext('2d')!;
        this.canvasElement.width = this.canvasElement.offsetWidth;
        this.canvasElement.height = this.canvasElement.offsetHeight;
        this.width = this.canvasElement.offsetWidth;
        this.height = this.canvasElement.offsetHeight;

        this.fov = mathf.degreeToRadian(45);
        this.near = 1;
        this.aspect = this.width / this.height;
        this.far = 1000;

        this.rotationMatrix = MatrixIV.IDENTITY;
        this.translationMatrix = MatrixIV.IDENTITY;
        this.viewMatrix = MatrixIV.IDENTITY;
        this.worldMatrix = MatrixIV.IDENTITY;
        this.transformMatrix = MatrixIV.IDENTITY;
        this.projectionMatrix = MatrixIV.IDENTITY;
    }


    /**
     * The render cycle for the pseudo-3d-canvas.
     *
     * Takes various 3d meshes that need to be displayed on the screen
     * and projects them as 2d points.
     *
     * This takes on a world - view - projection pattern to creates a
     * translation matrix and then applies that to each vector point.
     *
     *
     * Note that this order matters.
     *
     * ```ts
     *
     * var transformMatrix = projectionMatrix * viewMatrix * projectionMatrix;
     * ```
     *
     * WorldMatrix = Takes object space to world space
     * ViewMatrix = Camera matrix - transforms world space to camera space
     * projectionMatrix = Near or far angle of view.
     *
     *
     * http://web.archive.org/web/20131222170415/http:/robertokoci.com/world-view-projection-matrix-unveiled/
     *
     * @param camera
     * @param meshes
     */
    render(camera: Camera, meshes: Array<Mesh>): void {
        this.context.clearRect(0, 0, this.width, this.height);

        // Loop through each mesh.
        meshes.forEach((mesh) => {

            // This is the main view / camera matrix.
            this.viewMatrix =
                new MatrixIV().lookAt(camera.position, camera.target, Vector.UP);

            // The main projection matrix.
            this.projectionMatrix =
                new MatrixIV()
                    .perspective(
                        this.fov, this.aspect, this.near, this.far)


            // The main world or model matrix.  Here we are going to shift the
            // position of the mesh based on the curren tmesh position.
            this.translationMatrix = new MatrixIV()
                .translate(mesh.position);
            this.worldMatrix =
                MatrixIV.IDENTITY
                    .multiply(this.translationMatrix)


            // Create the transform matrix.
            // ProjectMatrix * ViewMatrix * WorldMatrix
            this.transformMatrix = this.projectionMatrix
                .multiply(this.viewMatrix).multiply(this.worldMatrix);


            // Now we are going to apply the transformMatrix to each
            // vertices point in the mesh effectively projecting 3d into
            // the 2d canvas.
            mesh.vertices.forEach((v: Vector, i: number) => {


                // Take each vector point such as 1,1 and first locally,
                // rotate and move it's position based on the basisMatrix.
                // The basisMatrix consists of up, right, forward vectors
                // that define the shape of the mesh and this particular vector.
                // Apart from the basic position (controled in worldMatrix),
                // this locally affects the position of each vector which can
                // be controlled by the mesh size and vector positions.
                let rotationMatrix = new MatrixIV()
                    .ypr(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z)
                let basisMatrix = mesh.basisMatrix.clone()
                    .multiply(rotationMatrix);
                let transformedVector = v.clone()
                    .transformWithMatrixIV(basisMatrix);

                // Apply the transformation to the vector.
                // These are our final vector coordinates that are normalized
                // where by the screen is 1x1 with the center in zero position
                // like webGL.
                let vector2d = transformedVector.clone()
                    .transformWithMatrixIV(this.transformMatrix);



                // So far the coordinate system is one based on center / center
                // like webGL.
                // The vector position remains normalized so we want to
                // scale/map it to the canvas dimensions.


                // Scale it and then shift it over half the screen width to center
                // it.
                var x = (vector2d.x * this.width);
                x += (this.width * 0.5)
                // Scale it and then shift it over half the screen width to center
                // it.
                var y = (-vector2d.y * this.height)
                y += (this.height * 0.5);

                // We get our final vector coordinates on the canvas.
                vector2d = new Vector(x, y).int();


                // Check if this vector goes out of boundaries in which case,
                // we don't need to draw it.
                if (vector2d.x >= 0 && vector2d.y >= 0 && vector2d.x < this.width
                    && vector2d.y < this.height) {

                    domCanvas.setFillColor(this.context, mesh.color);
                    domCanvas.setStrokeColor(this.context, mesh.color);
                    domCanvas.vectorPoint(this.context, vector2d);
                    domCanvas.quickText(this.context, 'v' + i, vector2d.x, vector2d.y - 4);
                }
            })
        })

    }
}