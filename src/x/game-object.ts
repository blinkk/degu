/**
 * A GameObject within the X Engine.
 *
 */
export class GameObject {
    public visible: boolean;
    protected parent: GameObject | undefined;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public scaleX: number;
    public scaleY: number;
    public pivotX: number;
    public pivotY: number;
    public rotation: number;
    public children: Array<GameObject>;
    protected alpha_: number;
    constructor() {
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

        this.x = 0;
        this.y = 0;
        this.pivotX = 0.5;
        this.pivotY = 0.5;
        this.width = 0;
        this.height = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
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



    addChild(sprite: GameObject) {
        sprite.parent = this;
        this.children.push(sprite);
    }

    removeChild(sprite: GameObject) {
        if (sprite.parent !== this) {
            throw new Error(sprite + 'is not a child of ' + this);
        }


        this.children = this.children.filter((childSprites) => {
            return sprite !== childSprites;
        })
    }


    render(context: CanvasRenderingContext2D) { }


}