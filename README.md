# Degu

[![NPM Version][npm-image]][npm-url]
[![GitHub Actions][github-image]][github-url]
[![Dependency Status][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![codecov][codecov-image]][codecov-url]

A general utility library for interactive websites, with a focus on performance.

- [API docs](https://blinkk.github.io/degu/)
- [Examples](https://blinkk.github.io/degu/examples/)
- [Coverage](https://blinkk.github.io/degu/coverage/)

## Motivation

degu is an interactive developer toolbox. It is not the next buzzword-filled,
huge component library with ready-made UI solutions (such as modals, carousels, etc.)
but it aims to provide the "hammer and nails" needed to build highly-interactive,
performant, kickass websites.

## Installation

```bash
npm install @blinkk/degu@latest --save-dev
```

## Getting started

- Read the [API docs](https://blinkk.github.io/degu/)
- Explore the [examples folder](https://github.com/blinkk/degu/tree/main/examples)

Import the library:

```ts
import {WebWorker} from '@blinkk/degu';

const worker = new WebWorker((params)=> {
    return params.a * params.b;
})

worker.run({a: 5, b: 2}).then((result)=> {
   console.log(result); // 10
})
```

Import specific files:

```ts
import * as mathf from '@blinkk/degu/lib/mathf/mathf.js'
import * as is from '@blinkk/degu/lib/is/is.js'
import * as dom from '@blinkk/degu/lib/dom/dom.js';
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

## Upgrading

If you have already been using version 2.x.y and are upgrading to version 3.x.y,
see our [MIGRATION.md](https://github.com/blinkk/degu/blob/main/MIGRATION.md) guide for details.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/blinkk/degu/blob/main/CONTRIBUTING.md) on how to develop for degu.

## License

Please read [LICENSE.md](https://github.com/blinkk/degu/blob/main/LICENSE.md)

[github-image]: https://github.com/blinkk/degu/workflows/Run%20tests/badge.svg
[github-url]: https://github.com/blinkk/degu/actions
[codecov-image]: https://codecov.io/gh/blinkk/degu/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/blinkk/degu
[david-image]: https://david-dm.org/blinkk/degu.svg
[david-url]: https://david-dm.org/blinkk/degu
[npm-image]: https://img.shields.io/npm/v/@blinkk/degu.svg
[npm-url]: https://npmjs.org/package/@blinkk/degu
[snyk-image]: https://snyk.io/test/github/blinkk/degu/badge.svg
[snyk-url]: https://snyk.io/test/github/blinkk/degu
