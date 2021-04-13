import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { URL } from 'url';

/**
 * /xxx 和 a.js 进行拼接，得到 /xxx/a.js
 * https://xxx.com 和 a.js 进行拼接，得到 https://xxx.com/a.js
 * @param {string} base 基础路径
 * @param {string} asset 资源路径
 * @returns {string}
 */
function resolver(base: string, asset: string) {
  const dist = /\/$/.test(base) ? base : `${base}/`;
  // 链接是 http://, https://, 则为 url 链接
  if (/^https?:\/\//i.test(dist)) {
    return new URL(asset, dist).href;
  }
  return join(dist, asset);
}

const initScript = isDev => `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var app = window.rieApp.default || window.rieApp;
      window.rieVue2Runtime.Vue.config.devtools = ${isDev || false};
      window.rieVue2Runtime.init(app);
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
      ? `<script defer src="${resolver(publicPath, asset)}"></script>`
      : `<link rel="stylesheet" herf="${resolver(publicPath, asset)}" >`;
    headScripts.push(script);
  });
  headScripts.push('</head>');
  const bodyScripts = ['<div id="app"></div>', initScript(isDev)].join('\n');

  return template.replace('</head>', headScripts.join('\n')).replace('<!--vue-ssr-outlet-->', bodyScripts);
};
