import {Vector} from '../mathf/vector';
import {MatrixIV} from '../mathf/matrixIV';

export enum MeshTypes {
  CUBE = 'cube',
}

/**
 * @unstable
 */
export class Mesh {
  public name: string;
  public position: Vector;
  public rotation: Vector;
  public up: Vector;
  public right: Vector;
  public forward: Vector;
  public vertices: Array<Vector>;
  public basisMatrix: MatrixIV;
  public color: string;

  /**
   * @param verticesCount The number of vertices this mesh should contain.
   */
  constructor() {
    this.name = '';
    this.vertices = [];
    this.position = Vector.ZERO;
    this.rotation = Vector.ZERO;
    this.up = Vector.ZERO;
    this.right = Vector.ZERO;
    this.forward = Vector.ZERO;
    this.basisMatrix = MatrixIV.IDENTITY;
    this.color = 'green';
  }

  size(width: number, height: number, depth: number) {
    this.up = new Vector(0, width, 0);
    this.right = new Vector(height, 0, 0);
    this.forward = Vector.ONE.cross(this.up);

    // Generate a basis matrix.
    let basisMatrix = new MatrixIV();
    basisMatrix.setVectorColumn(0, this.right);
    basisMatrix.setVectorColumn(1, this.up);
    basisMatrix.setVectorColumn(2, this.forward);
    this.basisMatrix = basisMatrix;
  }
}

/**
 * Creates a CubeMesh.
 */
export class CubeMesh extends Mesh {
  constructor() {
    super();
    this.name = MeshTypes.CUBE;
    this.vertices = [
      new Vector(-1, 1, 1),
      new Vector(1, 1, 1),
      new Vector(-1, -1, 1),
      new Vector(-1, -1, -1),
      new Vector(-1, 1, -1),
      new Vector(1, 1, -1),
      new Vector(1, -1, 1),
      new Vector(1, -1, -1),
    ];
  }
}
