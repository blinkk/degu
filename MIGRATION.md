# Migration Guide

## 2.x.y to 3.x.y

### Add .js extension to `@blinkk/degu/lib` import

Before:

```typescript
import {DomWatcher} from '@blinkk/degu/lib/dom/dom-watcher';
```

After:

```typescript
import {DomWatcher} from '@blinkk/degu/lib/dom/dom-watcher.js';
```

### Refactor utility imports to wildcard imports

Before:

```typescript
import {dom} from '@blinkk/degu/lib/dom/dom';
import {EASE} from '@blinkk/degu/lib/ease/ease';
import {PerlinNoise} from '@blinkk/degu/lib/mathf/perlin-noise';
```

After:

```typescript
import * as dom from '@blinkk/degu/lib/dom/dom.js';
import * as EASE from '@blinkk/degu/lib/ease/ease.js';
import * as PerlinNoise from '@blinkk/degu/lib/mathf/perlin-noise.js';
// Or: import {noise3} from '@blinkk/degu/lib/mathf/perlin-noise.js';
```

### Refactor/rename a few breaking changes

`EASE.Linear` is now `EASE.linear` (consistent with other functions in that file).

```typescript
import * as EASE from '@blinkk/degu/lib/ease/ease.js';
EASE.linear
```

### Install optional peerDependencies

A few 3rd party dependencies have been moved to optional peerDependencies. If you're using a module that uses one of the 3rd party libs below, you may need to `npm install` it into your project if you haven't already.

* angular
* dat.gui
* lit
* lottie-web
* pixi.js

See the full list in [package.json#peerDependencies](package.json).
