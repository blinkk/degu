# Yano-js

Yano is a general utility library for interactive websites.

Yano-js is currently in Alpha and the API can and probably will change
in the future.

- [API Docs](https://yano-js.surge.sh)
- [Coverage Report](https://yano-js-coverage.surge.sh)
- [Circle CI Builds](https://circleci.com/gh/uxder/yano-js)

## Motivation
Yano-js is an interactive developers toolbox.  It's not the next huge
component library with ready made solutions (modal, carousels etc) but it's
the nails and hammers that you need to build awesome customized kickass
websites.


## Build Status

![Master](https://circleci.com/gh/uxder/yano-js.svg?style=svg)


## Installation
```bash
npm install yano-js@latest --save-dev
```

## Getting started

Read the [API Docs](https://yano-js.surge.sh) and also look at the /examples
folder to get started.


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


## Contributing
Please read [CONTRIBUTING.md](https://github.com/uxder/yano-js/blob/master/CONTRIBUTING.md)
on how to develop for yano-js.


## License
Please read [LICENSE.md](https://github.com/uxder/yano-js/blob/master/LICENSE.md)