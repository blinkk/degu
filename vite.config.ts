/* eslint-disable node/no-extraneous-import */
import {defineConfig, Plugin} from 'vite';
import fg from 'fast-glob';
import path from 'node:path';
import jsBeautify from 'js-beautify';

// Plugin that auto-injects the index.js file into every html page in examples.
const examplesHtmlPlugin = () => {
  const plugin: Plugin = {
    name: 'examples-html',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(
        '</body>',
        '</body><script src="scripts/index.js" type="module"></script>'
      ),
    },
  };
  return plugin;
};

// Plugin that pretty prints the html output.
const prettyHtmlPlugin = () => {
  function prettyHtml(html: string): string {
    try {
      const output = jsBeautify.html(html, {
        indent_size: 0,
        end_with_newline: true,
        max_preserve_newlines: 0,
        extra_liners: [],
      });
      return output.trimStart();
    } catch (e) {
      console.error('failed to pretty html:', e);
      return html;
    }
  }
  const plugin: Plugin = {
    name: 'pretty-html',
    transformIndexHtml: {
      order: 'post',
      handler: (html) => prettyHtml(html),
    },
  };
  return plugin;
};

export default defineConfig(() => {
  const inputs: Record<string, string> = {};
  const files = fg.sync('./examples/*.html');
  files.forEach(relpath => {
    const basename = path.basename(relpath);
    const filename = basename.slice(0, -5);
    inputs[filename] = relpath;
  });
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
    plugins: [examplesHtmlPlugin(), prettyHtmlPlugin()],
  };
});
