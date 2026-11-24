import {defineConfig} from 'tsup';

export default defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/testing/**',
  ],
  outDir: 'lib',
  target: 'es2020',
  dts: true,
  splitting: false,
  format: ['esm'],
  external: [
    '@github/details-dialog-element',
    'angular',
    'dat.gui',
    'jquery',
    'lit',
    'lottie-web',
    'pixi.js',
    'three',
  ],
  esbuildOptions(options) {
    options.chunkNames = 'chunks/[name]-[hash]';
  },
});
