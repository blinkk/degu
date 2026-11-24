import fs from 'node:fs';
import path from 'node:path';
import {type Plugin, defineConfig} from 'vite';

// Plugin that auto-injects the index.js file into every html page in examples.
const examplesHtmlPlugin = (): Plugin => ({
  name: 'examples-html',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(
        '</body>',
        '</body><script src="scripts/index.js" type="module"></script>'
      ),
  },
});

export default defineConfig(() => {
  const inputs: Record<string, string> = {};
  const examplesDir = path.resolve('./examples');
  for (const entry of fs.readdirSync(examplesDir)) {
    if (entry.endsWith('.html')) {
      const filename = entry.slice(0, -5);
      inputs[filename] = path.join('./examples', entry);
    }
  }
  inputs.main = './examples/index.html';
  return {
    root: './examples',
    base: '/degu/examples/',
    appType: 'mpa',
    build: {
      minify: true,
      rollupOptions: {
        input: inputs,
      },
    },
    plugins: [examplesHtmlPlugin()],
  };
});
