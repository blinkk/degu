import {esbuildPlugin} from '@web/dev-server-esbuild';
import {legacyPlugin} from '@web/dev-server-legacy';

export default {
  files: ['src/**/*.test.ts'],
  plugins: [
    esbuildPlugin({ts: true}),
    // `legacyPlugin` must be last.
    legacyPlugin({
      polyfills: {
        webcomponents: true,
        custom: [
          {
            name: 'lit-polyfill-support',
            path: 'node_modules/lit/polyfill-support.js',
            test: "!('attachShadow' in Element.prototype)",
            module: false,
          },
        ],
      },
    }),
  ],
};
