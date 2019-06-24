

import { EASE } from '../ease/ease';
import { mathf } from '../mathf/mathf';
import { MatrixIV } from '../mathf/matrixIV';
import { Vector } from '../mathf/vector';
import { func } from '../func/func';


/**
 * A gameObject type class for DOM elements.
 *
 * Vector-DOM allows you to specify the position (vec3), rotation (vec3) of an
 * html element using matrix3d transforms.
 *
 * The z value of the position vector gets translated as the scale.
 *
 *
 * ```ts
 *
 * const element = document.getElementById('myelement');
 * const vectorElement = new VectorDom(element);
 *
 * // By default the vector element will have an anchor at the center
 * // of the element but override if needed.  This anchor value is generally
 * // used for translate offset while rotation and scale offsets are
 * // controlled by transforOrigin.
 * // Here we set it to the top left.  Default is 0.5.
 * vectorElement.anchorX = 0;
 * vectorElement.anchorY = 0;
 *
 *
 * // Update the transform origin if you want. Default center center.
 * vectorElement.transformOrigin = 'center center'
 *
 * // Set the initial position, rotation of the vector dom.  z indicates scale.
 * vectorElement.setPosition( new Vector(0, 0, 1));
 * vectorElement.setRotation( new Vector(0.01, 0, 0));
 *
 * // Optionally set the global offset.  Here we center this element to the
 * // center of the screen.
 * vectorElement.setPosition( new Vector(
 *      window.innerWidth/ 2,  window.innerHeight /2, 0));
 *
 *
 * new Raf(()=> {
 *
 *   // Render updates the style.  It is automatically culled so only updated
 *   // when values change.
 *   this.vectorElement.render();
 * })
 *
 * ```
 */
export class VectorDom {
    /**
     * The html element that VectorDom should control.
     */
    private element: HTMLElement;

    /**
     * The position of this html element.  Z value refers to scale.
     */
    private position: Vector;

    /**
     * The rotation of this html element.
     */
    private rotation: Vector;

    /**
     * The total offset of this vector.  This is useful in realigning centeral
     * coordinates.
     */
    private offset: Vector;

    /**
     * The base zIndex scalar value.  As elements are scaled, the closer they are,
     * they get a higher index.  This is the scalar for the zIndex.
     */
    public zIndexScalar: number;

    /**
     * The element width.
     */
    public width: number;

    /**
     * The anchor point to calculate x, y positions. Defaults to the center of
     * the element.
     */
    public anchorX: number;
    public anchorY: number;

    /**
     * The element height.
     */
    public height: number;

    public transformOrigin: string;

    constructor(element: HTMLElement) {
        this.element = element;
        this.offset = Vector.ZERO;
        this.position = Vector.ZERO;
        this.rotation = Vector.ZERO;
        this.transformOrigin = 'center center';
        this.render_ = func.runOnceOnChange(this.render_.bind(this));
        this.width = element.offsetWidth;
        this.height = element.offsetHeight;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.zIndexScalar = 100;
        this.calculateSize();

        this.setTransformOrigin();
    }

    calculateSize() {
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
    }


    setTransformOrigin(value: string = 'center center') {
        this.transformOrigin = value;
        this.element.style.transformOrigin = 'center center';
    }

    setPosition(v: Vector) {
        this.position = v;
    }

    setOffset(v: Vector) {
        this.offset = v;
    }

    setRotation(v: Vector) {
        this.rotation = v;
    }

    /**
     * Takes the current position x,y,z vector points and converts it over to
     * a 4x4 matrix with just consideration for translation.
     * [
     *  0 0 0 x
     *  0 0 0 y
     *  0 0 0 z
     *  0 0 0 1
     * ]
     *
     *
     * Example of applying vector positions to dom elements.
     *
     * ```ts
     *
     * // Create a vector
     *  let ballPosition = new Vector(100, 200, 0);
     *
     *
     * // Take those vector positions and convert that into a translation matrix.
     * let matrix = ballPosition.toTranslationMatrixIV()
     *
     * // Convert that to a css 3d translation.
     * let ms = matrix.toCss3dMatrix();
     * ball.style.transform = ms;
     *
     * ```
     *
     * @return {MartrixIV}
     */
    toTranslationMatrixIV(): MatrixIV {
        const positionVector = this.position.clone();

        const matrix = new MatrixIV();
        matrix.setVectorColumn(3, positionVector);
        return matrix;
    }


    /**
     * Takes the rotation, scale and translation matrices and combines them
     * into one.
     */
    toMatrixIV(): MatrixIV {
        const translationMatrix = this.toTranslationMatrixIV();

        // Account for anchor offsets.
        const anchorOffsetVector = new Vector(
            -(this.anchorX * this.width),
            -(this.anchorY * this.height),
            0
        )


        const offsetMatrix = new MatrixIV();
        const offsetVector = this.offset.clone().add(anchorOffsetVector);
        offsetMatrix.setVectorColumn(3, offsetVector);

        // Scale based on the z position.
        let z = mathf.clamp(-1, 10, this.position.z);

        const scaleMatrix = new MatrixIV().scaleXyz(z, z, z);
        const rotationMatrix = new MatrixIV().ypr(
            this.rotation.x, this.rotation.y, this.rotation.z);

        // Apply SRT.
        return scaleMatrix
            .multiply(rotationMatrix)
            .multiply(translationMatrix)
            .multiply(offsetMatrix);
    }


    toCss3dMatrix(): string {
        const matrixValue = this.toMatrixIV().toCss3dMatrix();
        return matrixValue;
    }


    render() {
        const matrixValue = this.toCss3dMatrix();
        this.render_(matrixValue);
    }

    /**
     * Applies the css transform to this object.  Unneccesary calls get culled by
     * func.runOnceOnChange.
     */
    private render_(value: string) {
        this.element.style.transform = value;
        this.element.style.zIndex =
            (this.zIndexScalar * this.position.z >> 0) + '';
    }

}