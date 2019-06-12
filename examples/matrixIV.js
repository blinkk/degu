
import { domCanvas } from '../lib/dom/dom-canvas';
import { Vector } from '../lib/mathf/vector';
import { MatrixIV } from '../lib/mathf/matrixIV';
import { mathf } from '../lib/mathf/mathf';
import { func } from '../lib/func/func';


export default class MatrixIVSample {
    constructor() {
        console.log('matrixIV sample');

        this.canvas = document.getElementById('canvas');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.context = this.canvas.getContext('2d');


        // First plot out a basic vector
        let c1 = new Vector(250, 250);
        domCanvas.setFillColor(this.context, 'purple');
        domCanvas.setStrokeColor(this.context, 'purple');
        domCanvas.quickText(this.context, 'c1', c1.x, c1.y - 4);
        domCanvas.vectorPoint(this.context, c1);


        // Now we apply a translation.
        let c2 = c1.clone().transformWithMatrixIV(
            new MatrixIV().translateXyz(10, 10, 0)
        );
        domCanvas.quickText(this.context, 'c1 translate', c2.x, c2.y - 4);
        domCanvas.vectorPoint(this.context, c2);


        // A basic scaling.
        let c3 = new Vector(400, 400);
        domCanvas.setFillColor(this.context, 'green');
        domCanvas.setStrokeColor(this.context, 'green');
        domCanvas.vectorPoint(this.context, c3);
        let c4 = c3.clone().transformWithMatrixIV(
            new MatrixIV().scaleXyz(0.8, 0.8, 0)
        );
        domCanvas.quickText(this.context, 'c4 scale', c4.x, c4.y - 4);
        domCanvas.vectorPoint(this.context, c4);


        // Translate multiple points.
        domCanvas.setFillColor(this.context, 'orange');
        domCanvas.setStrokeColor(this.context, 'orange');
        let c6 = new Vector(300, 50, 0);
        func.times(180, (i) => {
            const point = c6.clone()
                .transformWithMatrixIV(MatrixIV._.translateXyz(
                    -1.2 * i,
                    1.5 * i, 0));
            domCanvas.vectorPoint(this.context, point);
            console.log(point);
        });
    }
}