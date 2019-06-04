
import { Observerable, Observable } from '../../lib/stream/observable';
import { Observer } from '../../lib/stream/observer';


export default class ObservableSample {
    constructor() {

        // this.testObservable();
        this.testObservable2();
    }



    testObservable() {
        console.log('testing observable');
        let obs = Observable.fromArgs(1, 2, 3);
        console.log(obs);


        const observer = new Observer({
            onNext: (x) => { console.log('value', x); },
            onError: (x) => { console.log('error'); },
            onComplete: (x) => { console.log('complete'); },
        });

        obs.subscribe(observer);
    }


    testObservable2() {
        console.log('testing observable2');
        let obs = Observable.fromEvent(document, 'click');
        // const observer = new Observer({
        //     onNext: (x) => { console.log('value', x); },
        //     onError: (x) => { console.log('error'); },
        //     onComplete: (x) => { console.log('complete'); },
        // });

        // obs.subscribe(observer);


        let obs2 = obs.map(event => event.clientX);

        let unsubscribe = obs2.subscribe(
            new Observer({
                onNext: (x) => { console.log('clientX', x); },
                onError: (x) => { console.log('error'); },
                onComplete: (x) => { console.log('complete'); },
            })
        );


        window.setTimeout(() => {
            console.log("gonna unsubscribe");
            console.log(unsubscribe());
        }, 5000);

    }
}