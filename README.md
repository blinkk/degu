# Yano-js

![Master](https://github.com/grow/yano-js/workflows/Run%20tests/badge.svg)

Yano is a general utility library for interactive websites.

- [API docs](https://grow.github.io/yano-js/)
- [Examples](https://grow.github.io/yano-js/examples/)
- [Coverage](https://grow.github.io/yano-js/coverage/)

## Motivation

Yano-js is an interactive developer toolbox. It is not the next buzzword-filled, 
huge component library with ready-made UI solutions (such as modals, carousels, etc.)
but it aims to provide the "hammer and nails" needed to build highly-interactive,
performant, kickass websites.

## Installation

```bash
npm install resize-observer-polyfill --save-dev
npm install intersection-observer --save-dev
npm install yano-js@latest --save-dev
```

Include `resize-observer-polyfill` and `intersection-observer` polyfill:

```ts
import '../../node_modules/intersection-observer/intersection-observer.js';
import ResizeObserver from 'resize-observer-polyfill';
window['ResizeObserver'] = ResizeObserver;

/* ... insert code that depends on yano-js ... */
```

## Getting started

- Read the [API Docs](https://grow.github.io/yano-js/)
- Explore the [/examples](examples folder)

Import the library:

```ts
import {WebWorker} from 'yano-js';

const worker = new WebWorker((params)=> {
    return params.a * params.b;
})

worker.run({a: 5, b: 2}).then((result)=> {
   console.log(result); // 10
})
```

Import specific files:

```ts
import { mathf } from 'yano-js/lib/mathf/mathf/'
import { is } from 'yano-js/lib/is/is/'
import { dom } from 'yano-js/lib/dom/dom/'
```

## ThreeJS deps

Classes under `threef` require three.js deps. Currently supports r110.

```bash
npm install --save-dev three@0.110.0
npm install --save-dev @types/three@0.103.2
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) on how to develop for yano-js.

## License

Please read [LICENSE.md](LICENSE.md)
