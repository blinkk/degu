import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'lib',
  target: 'node16',
  dts: true,
  splitting: false,
  format: ['esm'],
  external: [
    'angular',
    'dat.ui',
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
