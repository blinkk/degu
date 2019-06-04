

/**
 * Texture class to be used with the x-engine.
 */
export class XTexture {
    private width: number;
    private height: number;
    private imageElement: HTMLImageElement;

    constructor(imageElement: HTMLImageElement) {
        this.imageElement = imageElement;
        this.width = imageElement.width;
        this.height = imageElement.height;
    }

}