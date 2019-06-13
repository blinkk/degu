
import { Vector } from '../mathf/vector';

export enum MeshTypes {
    CUBE = 'cube'
}


export class Mesh {
    public name: string;
    public position: Vector;
    public rotation: Vector;
    public vertices: Array<Vector>;


    /**
     * @param verticesCount The number of vertices this mesh should contain.
     */
    constructor() {
        this.name = '';
        this.vertices = [];
        this.position = Vector.ZERO;
        this.rotation = Vector.ZERO;
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
            new Vector(1, -1, -1)
        ]
    }

    size(value: number) {
        this.vertices = this.vertices.map((v) => {
            return v.scale(value);
        })
    }
}