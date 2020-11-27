# Yano-js

Yano is a general utility library for interactive websites.

Yano-js is currently in Alpha and the API can and probably will change
in the future.

- [API Docs](https://grow.github.io/yano-js/)
- [Examples] (https://grow.github.io/yano-js/examples/)
- [Examples] (https://grow.github.io/yano-js/coverage/)

## Motivation

Yano-js is an interactive developers toolbox.  It's not the next huge
component library with ready made solutions (modal, carousels etc) but it's
the nails and hammers that you need to build awesome customized kickass
websites.

## Build status

![Master](https://github.com/grow/yano-js/workflows/Run%20tests/badge.svg)

## Installation

```bash
npm install resize-observer-polyfill --save-dev
npm install intersection-observer --save-dev
npm install yano-js@latest --save-dev
```

Include resize-observer and intersection-observer polyfills in your project

```
import '../../node_modules/intersection-observer/intersection-observer.js';
import ResizeObserver from 'resize-observer-polyfill';
window['ResizeObserver'] = ResizeObserver;
```

## Getting started

Read the [API Docs](https://grow.github.io/yano-js/) and also look at the
/examples folder to get started.

Import the library as follows:

```ts
import {WebWorker} from 'yano-js';

const worker = new WebWorker((params)=> {
    return params.a * params.b;
})

worker.run({a: 5, b: 2}).then((result)=> {
   console.log(result); // 10
})
```

Import specific files

```ts
import { mathf } from 'yano-js/lib/mathf/mathf/'
import { is } from 'yano-js/lib/is/is/'
import { dom } from 'yano-js/lib/dom/dom/'
```

## ThreeJS deps

Classes under threef require three.js deps. Currently supports r110.

In your project do:

```
npm install --save-dev three@0.110.0
npm install --save-dev @types/three@0.103.2
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) on how to develop for yano-js.

## License

Please read [LICENSE.md](LICENSE.md)
