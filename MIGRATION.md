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
```

After:

```typescript
import * as dom from '@blinkk/degu/lib/dom/dom.js';
```

### Install peerDependencies when using `lit` or `lottie-web`

A few 3rd party dependencies have been moved to optional peerDependencies. If you're using a module that uses `lit` or `lottie-web`, you may need to install it in your project, e.g.


```
yarn install lottie-web
```
