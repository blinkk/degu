/**
 * Texture class to be used with the x-engine.
 * @unstable
 */
export class XTexture {
  public width: number;
  public height: number;
  public imageElement: HTMLImageElement;

  constructor(imageElement: HTMLImageElement) {
    this.imageElement = imageElement;
    this.width = imageElement.width;
    this.height = imageElement.height;
  }
}
