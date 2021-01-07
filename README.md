# degu

![Master](https://github.com/blinkkcode/degu/workflows/Run%20tests/badge.svg)

A general utility library for interactive websites, with a focus on performance.

- [API docs](https://blinkkcode.github.io/degu/)
- [Examples](https://blinkkcode.github.io/degu/examples/)
- [Coverage](https://blinkkcode.github.io/degu/coverage/)

## Motivation

degu is an interactive developer toolbox. It is not the next buzzword-filled, 
huge component library with ready-made UI solutions (such as modals, carousels, etc.)
but it aims to provide the "hammer and nails" needed to build highly-interactive,
performant, kickass websites.

## Installation

```bash
npm install resize-observer-polyfill --save-dev
npm install intersection-observer --save-dev
npm install degu@latest --save-dev
```

Include `resize-observer-polyfill` and `intersection-observer` polyfill:

```ts
import '../../node_modules/intersection-observer/intersection-observer.js';
import ResizeObserver from 'resize-observer-polyfill';
window['ResizeObserver'] = ResizeObserver;

/* ... insert code that depends on degu ... */
```

## Getting started

- Read the [API docs](https://blinkkcode.github.io/degu/)
- Explore the [examples folder](/examples/)

Import the library:

```ts
import {WebWorker} from 'degu';

const worker = new WebWorker((params)=> {
    return params.a * params.b;
})

worker.run({a: 5, b: 2}).then((result)=> {
   console.log(result); // 10
})
```

Import specific files:

```ts
import { mathf } from 'degu/lib/mathf/mathf/'
import { is } from 'degu/lib/is/is/'
import { dom } from 'degu/lib/dom/dom/'
```

## ThreeJS deps

Classes under `threef` require three.js deps. Currently supports r110.

```bash
npm install --save-dev three@0.110.0
npm install --save-dev @types/three@0.103.2
```

## Browser compatibility

degu supports only "evergreen" browsers back to the latest two versions:

- Chrome
- Edge (Chromium version)
- Firefox
- Safari

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) on how to develop for degu.

## License

Please read [LICENSE.md](LICENSE.md)
