import { XTexture } from './x-texture';
import { func } from '../func/func';
import { mathf, point } from '../mathf/mathf';
import { Vector } from '../mathf/Vector';
import { EASE } from '../ease/ease';

export interface XGameConfigComputedBox {
    width: number;
    height: number;
    topLeft: point;
    topRight: point;
    bottomLeft: point;
    bottomRight: point;
    centerPoint: point;
}

export interface XGameObjectConfig {
    id?: string,
    x?: number,
    y?: number,
    alpha?: number;
    width?: number;
    height?: number;
    scaleX?: number
    scaleY?: number;
    anchorX?: number
    anchorY?: number
    rotation?: number;
    texture?: XTexture;
    interactable?: boolean;
    onMouseDown?: Function;
    onMouseMove?: Function;
    onMouseUp?: Function;
    zIndex?: number
}

export const XGameObjectDefaults = {
    id: '',
    x: 0,
    y: 0,
    alpha: 1,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    anchorX: 0,
    anchorY: 0,
    rotation: 0,
    interactable: false,
    zIndex: 0
}

/**
 * A GameObject within the X Engine.
 *
 * The GameObject is a central part of the X Engine and specifically,
 * the coordinate system is designed to make global calculations easy
 * so that the x-engine objects that exist in canvas can ultimately,
 * easily be aligned with DOM elements.
 *
 * At a high level, the XStage typically is the top level GameObject.
 * Each GameObject can have children.  When a child is attached to
 * a GameObject, it becomes grouped with it's parents and it's x,y positions
 * will become relative to the parent.
 *
 *
 * # Positioning System
 * Positioning is coordinated by a combination of position, velocity and
 * acceleration vectors.
 *
 * position vector  (x,y)
 * - this is the actual coordinates of the GameObject.
 *
 * velocity vector (vx, vy)
 * - velocity is how much the position is changed per frame.  In short,
 *   velocity gets added to the position every frame.
 *
 * acceleration vector (ax, ay)
 * - A force that changes velocity.
 *   acceleration is added to the velocity vector every frame.  acceleration
 *   changes velocity.
 *
 * See the updatePosition method to see how these are added on each gameLoop
 * cycle.
 *
 *
 *
 *
 *
 *
 */
export class XGameObject {
    /**
     * Whether this GameObject shoud be draw on the canvas at all.
     */
    public visible: boolean;


    /**
     * Whether this is a special type of game object that is a debugging
     * object.  These are objects that get automatically to the stage
     * depending on the debug status of the app and are not necessarily
     * user generated.
     */
    public debugObject: boolean;


    /**
     * The GameObject position vector.
     */
    public position: Vector;

    /**
     * The GameObject velocity vector.
     */
    public velocity: Vector;

    /**
     * The GameObject acceleration
     */
    public acceleration: Vector;

    /**
     * The natural width prior to scaling being applied.  This can be consider more
     * the "real" natural width of this GameObject.
     */
    public naturalWidth: number;
    /**
     * The natural height prior to scaling being applied.  This can be consider more
     * the "real" natural height of this GameObject.
     */
    public naturalHeight: number;
    /**
     * The natural and actual scale of this object without consideration
     * of the scale of it's parent.
     */
    public naturalScaleX: number;
    /**
     * The natural and actual scale of this object without consideration
     * of the scale of it's parent.
     */
    public naturalScaleY: number;

    /**
     * A unique identifer for this game object.
     */
    public id: string;

    /**
     * The anchor x represents the center origin of the GameObject. Primarily
     * affects the rotational, scaling center point of the object.
     * anchorX: 0, anchorY: 0 would represent top left corner of the sprite.
     * anchorX: 1, anchorY: 1 would represent bottom left corner of the sprite.
     */
    public anchorX: number;
    /**
     * The anchor y represents the center origin of the GameObject. Primarily
     * affects the rotational, scaling center point of the object.
     * anchorX: 0, anchorY: 0 would represent top left corner of the sprite.
     * anchorX: 1, anchorY: 1 would represent bottom left corner of the sprite.
     */
    public anchorY: number;
    /**
     * The order in which this GameObject should be drawn.
     * Keep in mind that the order is always relative to the parent and
     * can't be exceeed.
     *
     *
     * Consider this case:
     * A GameObject - zIndex 0
     *    B GameObject - zIndex - 2
     *    C GameObject - zIndex - 1001
     *
     * D GameObject - zIndex 1000
     *    E GameObject - zIndex - 3
     *    F GameObject - zIndex - 1
     *    G GameObject - zIndex - 2
     *
     * H GameObject - zIndex 500
     *
     *
     * This would render in the order of:
     *
     * A, B, C, H, D, F, G, E
     *
     * The painting first takes top level items, then renders the children in
     * order of lower to high index.
     */
    public zIndex: number;
    public rotation: number;
    public texture: XTexture | null;
    /**
     * The children of this GameObject.
     */
    public children: Array<XGameObject>;
    /**
     * Internal cache of alpha.  The actual alpha gets calculated in relation
     * to the GameObject parent (if set).
     */
    protected alpha_: number;
    /**
     * The parent of this GameObject.
     */
    protected parent: XGameObject | undefined;
    /**
     * Whether this GameObject is interactable with a pointer.  Defaults to
     * false to improve performance.
     */
    public interactable: boolean;
    /**
     * The handler for mouse over events.  Must set interactable to true for
     * this to execute.
     */
    public onMouseUp: Function | null;
    /**
     * The handler for mouse move events.  Must set interactable to true for
     * this to execute.
     */
    public onMouseMove: Function | null;
    /**
     * The handler for onMouseDown events.  Must set interactable to true for
     * this to execute.
     */
    public onMouseDown: Function | null;

    constructor(config: XGameObjectConfig) {

        this.parent = undefined;
        this.visible = true;

        this.debugObject = false;

        this.children = [];

        this.alpha_ = func.setDefault(config.alpha, 1);

        this.id =
            func.setDefault(config.id, XGameObjectDefaults.id);
        this.zIndex = func.setDefault(config.zIndex, XGameObjectDefaults.zIndex);

        const x = func.setDefault(config.x, XGameObjectDefaults.x);
        const y = func.setDefault(config.y, XGameObjectDefaults.y);

        this.position = new Vector(x, y);
        this.velocity = Vector.ZERO;
        this.acceleration = Vector.ZERO;

        this.naturalScaleX =
            func.setDefault(config.scaleX, XGameObjectDefaults.scaleX);
        this.naturalScaleY =
            func.setDefault(config.scaleY, XGameObjectDefaults.scaleY);
        this.anchorX =
            func.setDefault(config.anchorX, XGameObjectDefaults.anchorX);
        this.anchorY =
            func.setDefault(config.anchorY, XGameObjectDefaults.anchorY);
        this.naturalWidth =
            func.setDefault(config.width, XGameObjectDefaults.width);
        this.naturalHeight =
            func.setDefault(config.height, XGameObjectDefaults.height);
        this.rotation =
            func.setDefault(config.rotation, XGameObjectDefaults.rotation);
        this.interactable =
            func.setDefault(config.interactable,
                XGameObjectDefaults.interactable);
        this.onMouseUp = func.setDefault(config.onMouseUp, null);
        this.onMouseMove = func.setDefault(config.onMouseMove, null);
        this.onMouseDown = func.setDefault(config.onMouseDown, null);
        this.texture =
            func.setDefault(config.texture, null);

        if (this.texture) {
            this.setTexture(this.texture);
        }
    }


    get x(): number {
        return this.position.x;
    }
    set x(value: number) {
        this.position.x = value;
    }

    get y(): number {
        return this.position.y;
    }
    set y(value: number) {
        this.position.y = value;
    }

    get vx(): number {
        return this.velocity.x;
    }

    set vx(value: number) {
        this.velocity.x = value;
    }

    get vy(): number {
        return this.velocity.y;
    }

    set vy(value: number) {
        this.velocity.y = value;
    }

    get ax(): number {
        return this.acceleration.x;
    }

    set ax(value: number) {
        this.acceleration.x = value;
    }

    get ay(): number {
        return this.acceleration.y;
    }

    set ay(value: number) {
        this.acceleration.y = value;
    }

    /**
     * Sets a main texture for this sprite.
     * @param texture
     */
    setTexture(texture: XTexture) {
        this.texture = texture;
        this.naturalWidth = this.texture.width;
        this.naturalHeight = this.texture.height;
    }

    /**
     * The global x coordinates of this GameObject.  This is a combination
     * of the local x value + the parents global x value.  Does not consider
     * rotation (use globalCorners for that).
     */
    get gx(): number {
        const parentGx = this.parent && this.parent.gx || 0;
        return this.x + parentGx;
    }

    /**
     * The global y coordinates of this GameObject.  This is a combination
     * of the local y value + the parents global y value.  Does not consider
     * rotation (use global corders for that.)
     */
    get gy(): number {
        const parentGy = this.parent && this.parent.gy || 0;
        return this.y + parentGy;
    }

    /**
     * The global computed positions of this gameObject with scale and rotation.
     * The top left, top right, bottom left, and bottom right
     * x, y coordinates of this game object (assume it is rectangular) in
     * the actually computed sizes on the screen.
     * This value is computed and considers scales and rotation as represented
     * the exact coordinates on the screen so it useful if you want global
     * coordinates of the gameObject position, width and height.
     *
     * Return the XGameConfigComputedBox
     * @returns {XGameConfigComputedBox}
     */
    get globalComputedBox(): XGameConfigComputedBox {
        // First figure out the coordinates of each corner
        // without the rotation.
        let box = {
            centerPoint: {
                x: this.gcx,
                y: this.gcy,
            },
            width: this.width,
            height: this.height,
            topLeft: {
                x: this.gx,
                y: this.gy
            },
            topRight: {
                x: this.gx + this.width,
                y: this.gy
            },
            bottomLeft: {
                x: this.gx,
                y: this.gy + this.height
            },
            bottomRight: {
                x: this.gx + this.width,
                y: this.gy + this.height
            },
        }


        // Now calculate the rotation of each point via 2d rotation matrix.
        const cx = this.gcx;
        const cy = this.gcy;
        const topLeft =
            mathf.calculate2dPointRotation(
                cx, cy, box.topLeft.x, box.topLeft.y, this.rotation)
        box.topLeft.x = topLeft.x;
        box.topLeft.y = topLeft.y;

        const topRight =
            mathf.calculate2dPointRotation(
                cx, cy, box.topRight.x, box.topRight.y, this.rotation)
        box.topRight.x = topRight.x;
        box.topRight.y = topRight.y;

        const bottomLeft =
            mathf.calculate2dPointRotation(
                cx, cy, box.bottomLeft.x, box.bottomLeft.y, this.rotation)
        box.bottomLeft.x = bottomLeft.x;
        box.bottomLeft.y = bottomLeft.y;

        const bottomRight =
            mathf.calculate2dPointRotation(
                cx, cy, box.bottomRight.x, box.bottomRight.y, this.rotation)
        box.bottomRight.x = bottomRight.x;
        box.bottomRight.y = bottomRight.y;

        return box;
    }

    /**
     * The global center point x of this object.
     */
    get gcx() {
        return this.gx + this.anchorXOffset
    }

    /**
     * The global center point y of this object.
     */
    get gcy() {
        return this.gy + this.anchorYOffset
    }

    get globalCenterVector() {
        return new Vector(this.gcx, this.gcy).floor();
    }


    get anchorXOffset() {
        return this.naturalAnchorXOffset * this.scaleX;
    }

    get anchorYOffset() {
        return this.naturalAnchorYOffset * this.scaleY;
    }

    /**
     * This is a vector representing the "computed" (including scale),
     * vector from the top, left of the GameObject to the center point.
     */
    get anchorOffsetVector() {
        return new Vector(this.anchorXOffset, this.anchorYOffset).floor();
    }

    /**
     * Give that the x, y position represent the position of the Gameobject,
     * the amount we need to move to get to the anchor point.
     *
     * Let's say we have an object that is 500x500 at coords 0,0.
     * If the anchor is 0.5, 0.5 for example, the anchor is dead center of the
     * object.
     *-----------
     *
     *     a
     *
     * ----------
     *
     * The anchorXOffset would be 250 and anchorYOffset would be 250.
     * That is 0 (x) + 250 (anchorXOffset) = 250
     * That is 0 (y) + 250 (anchorYOffset) = 250
     *
     */
    get naturalAnchorXOffset(): number {
        return this.naturalWidth * this.anchorX;
    }

    get naturalAnchorYOffset(): number {
        return this.naturalHeight * this.anchorY;
    }

    /**
     * The computed width of this gameObject when it is rendered on the canvas.
     * This is effectively the global scale * the width internal width value.
     */
    get width(): number {
        return this.naturalWidth * this.scaleX;
    }

    set width(value: number) {
        this.naturalWidth = value;
    }

    /**
     * The computed height of this gameObject when it is rendered on the canvas.
     * This is effectively the global scale * the width internal width value.
     */
    get height(): number {
        return this.naturalHeight * this.scaleX;
    }

    set height(value: number) {
        this.naturalHeight = value;
    }

    /**
     * The global anchor x positon.
     */
    get anchorGx(): number {
        return this.gx + this.naturalAnchorXOffset
    }

    /**
     * The global anchor y positon.
     */
    get anchorGy(): number {
        return this.gy + this.naturalAnchorYOffset
    }


    get alpha(): number {
        const parentAlpha = this.parent && this.parent.alpha || 1;
        const relativeAlpha = parentAlpha * this.alpha_;
        return relativeAlpha;
    }

    set alpha(value: number) {
        this.alpha_ = value;
    }

    get scaleX(): number {
        const parentScaleX = this.parent && this.parent.scaleX || 1;
        const relativeScale = parentScaleX * this.naturalScaleY;
        return relativeScale;
    }

    set scaleX(value: number) {
        this.scaleX = value;
    }

    get scaleY(): number {
        const parentScaleY = this.parent && this.parent.scaleY || 1;
        const relativeScale = parentScaleY * this.naturalScaleY;
        return relativeScale;
    }

    set scaleY(value: number) {
        this.scaleY = value;
    }


    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds a child to this sprite.  At the highest level, the stage sprite
     * will receive the canvas context and element when it
     * [[XStage.attachToCanvas]] is called.  From there, any sprite that attaches
     * to the stage, receives the canvas, context and then further, passes it
     * on to it's descendants in this method.
     * @param sprite
     */
    addChild(sprite: XGameObject) {
        sprite.parent = this;
        this.children.push(sprite);

        // Always maintain an ordered list of children.
        this.orderChildrenByZIndex();
    }


    /**
     * Order the children by z-index
     */
    orderChildrenByZIndex() {
        this.children = this.children.sort((a: XGameObject, b: XGameObject) => {
            return a.zIndex - b.zIndex;
        })

    }

    removeChild(sprite: XGameObject) {
        if (sprite.parent !== this) {
            throw new Error(sprite + 'is not a child of ' + this);
        }


        this.children = this.children.filter((childSprites) => {
            return sprite !== childSprites;
        })
    }


    /**
     * In the game loop called prior to rendering to update position of this
     * object.
     */
    updatePositions() {
        if (this.debugObject) {
            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
        } else {
            this.velocity.ease(this.acceleration, 1, EASE.linear);
            this.position.add(this.velocity);
        }
    }


    /**
     * Render this object onto the current canvas.
     */
    render(context: CanvasRenderingContext2D) {
        if (this.texture) {
            context.drawImage(
                this.texture.imageElement,
                0, 0, this.texture.width, this.texture.height,
                // If the anchor is 0,0, this value would be 0,0.
                // we want to paint it at exactly where the anchor is.
                -this.naturalAnchorXOffset,
                -this.naturalAnchorYOffset,
                this.naturalWidth,
                this.naturalHeight
            );
        }
    }

    renderDebuggingOutlines(context: CanvasRenderingContext2D) {
        context.strokeStyle = 'red';
        context.lineWidth = 10;
        context.strokeRect(
            // If the anchor is 0,0, this value would be 0,0.
            // we want to paint it at exactly where the anchor is.
            -this.naturalAnchorXOffset,
            -this.naturalAnchorYOffset,
            this.naturalWidth,
            this.naturalHeight);
    }


}