import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'lib',
  target: 'node16',
  dts: true,
  splitting: true,
  format: ['esm'],
  esbuildOptions(options) {
    options.chunkNames = 'chunks/[name]-[hash]';
  },
});
