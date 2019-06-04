import { XTexture } from './x-texture';
import { func } from '../func/func';

export interface XGameObjectConfig {
    x?: number,
    y?: number,
    width?: number;
    height?: number;
    scaleX?: number
    scaleY?: number;
    pivotX?: number
    pivotY?: number
    rotation?: number;
    texture?: XTexture;
}

export const XGameObjectDefaults = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    pivotX: 0.5,
    pivotY: 0.5,
    rotation: 0,
}

/**
 * A GameObject within the X Engine.
 *
 */
export class XGameObject {
    public visible: boolean;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public scaleX: number;
    public scaleY: number;
    public pivotX: number;
    public pivotY: number;
    public rotation: number;
    public texture: XTexture | null;
    public children: Array<XGameObject>;

    protected alpha_: number;
    protected parent: XGameObject | undefined;

    constructor(config: XGameObjectConfig) {

        /**
         * The parent of this GameObject.
         */
        this.parent = undefined;
        /**
          * The visibility of this GameObject.
          */
        this.visible = true;

        /**
         * The children of this GameObject.
         */
        this.children = [];

        this.alpha_ = 1;

        this.x = func.setDefault(config.x, XGameObjectDefaults.x);
        this.y = func.setDefault(config.y, XGameObjectDefaults.y);
        this.scaleX =
            func.setDefault(config.scaleX, XGameObjectDefaults.scaleX);
        this.scaleY =
            func.setDefault(config.scaleY, XGameObjectDefaults.scaleY);
        this.pivotX =
            func.setDefault(config.pivotX, XGameObjectDefaults.pivotX);
        this.pivotY =
            func.setDefault(config.pivotX, XGameObjectDefaults.pivotY);
        this.width =
            func.setDefault(config.width, XGameObjectDefaults.width);
        this.height =
            func.setDefault(config.height, XGameObjectDefaults.height);
        this.rotation =
            func.setDefault(config.rotation, XGameObjectDefaults.rotation);
        this.texture =
            func.setDefault(config.texture, null);
    }

    /**
     * The global x coordinates of this GameObject.  This is a combination
     * of the local x value + the parents global x value.
     */
    get gx(): number {
        const parentGx = this.parent && this.parent.gx || 0;
        return this.x + parentGx;
    }

    get gy(): number {
        const parentGy = this.parent && this.parent.gy || 0;
        return this.x + parentGy;
    }

    get alpha(): number {
        const parentAlpha = this.parent && this.parent.alpha || 1;
        const relativeAlpha = parentAlpha * this.alpha_;
        return relativeAlpha;
    }
    set alpha(value: number) {
        this.alpha_ = value;
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }



    addChild(sprite: XGameObject) {
        sprite.parent = this;
        this.children.push(sprite);
    }

    removeChild(sprite: XGameObject) {
        if (sprite.parent !== this) {
            throw new Error(sprite + 'is not a child of ' + this);
        }


        this.children = this.children.filter((childSprites) => {
            return sprite !== childSprites;
        })
    }


    render(context: CanvasRenderingContext2D) { }


}