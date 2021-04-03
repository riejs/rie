import { readFileSync } from 'fs';
import { resolve } from 'path';

const initScript = isDev => `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var app = window.rieApp.default || window.rieApp;
      var isDev = ${isDev || false};
      window.rieVue2Runtime.init(app, isDev);
    });
  </script>`;

let manifest = {
  initial: [],
};

try {
  const content = readFileSync(resolve(__dirname, '../single-vue/server/rie.vue2.runtime.manifest.json'), 'utf-8');
  manifest = JSON.parse(content);
} catch (exception) {}

export const getServerTemplate = function getServerTemplate(template: string, { isDev }) {
  const headScripts = [
    '{{{ meta.inject().meta ? meta.inject().meta.text() : \'\' }}}',
    '{{{ meta.inject().title ? meta.inject().title.text() : \'\' }}}',
    '{{{ meta.inject().style ? meta.inject().style.text() : \'\' }}}',
    '{{{ meta.inject().link ? meta.inject().link.text() : \'\' }}}',
    '{{{ meta.inject().script ? meta.inject().script.text() : \'\' }}}',
    '</head>',
  ].join('\n');
  const bodyScripts = [
    '<!--vue-ssr-outlet-->',
    '{{{renderState({contextKey: "asyncData", windowKey: "__INITIAL_ASYNCDATA__"})}}}',
    initScript(isDev),
  ].join('\n');

  return template.replace('</head>', headScripts).replace('<!--vue-ssr-outlet-->', bodyScripts);
};

export const getClientTemplate = function getServerTemplate(template: string, { publicPath, isDev }) {
  const headScripts = [];
  manifest.initial.forEach((asset: string) => {
    const script = asset.match(/\.js$/)
      ? `<script defer src="${publicPath}${asset}"></script>`
      : `<link rel="stylesheet" herf="${publicPath}${asset}" >`;
    headScripts.push(script);
  });
  headScripts.push('</head>');
  const bodyScripts = ['<div id="app"></div>', initScript(isDev)].join('\n');

  return template.replace('</head>', headScripts.join('\n')).replace('<!--vue-ssr-outlet-->', bodyScripts);
};
