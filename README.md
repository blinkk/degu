# Yano

Yano is a general utility library for interactive websites.

[API Docs](yano-js.surge.sh)

# Build Status

| Branch       | Status           |
| ------------- |:-------------:|
| Master      | ![Master](https://circleci.com/gh/uxder/yano-js.svg?style=svg)|

[Circle CI Builds](https://circleci.com/gh/uxder/yano-js)


# Installation
```
npm install yano-js@latest --save-dev
```

# Example
Take a look at the /examples folder to get started.

```js
import {WebWorker} from 'yano-js';

const worker = new WebWorker((params)=> {
    return params.a * params.b;
})

worker.run({a: 5, b: 2}).then((result)=> {
   console.log(result); // 10
})

```


Import specific files
```
import { mathf } from 'yano-js/mathf'
import { dom } from 'yano-js/dom'
```



