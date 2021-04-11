import { createApp } from './app';
import { renderToString } from '@vue/server-renderer';

export async function render(App, manifest) {
  const { app } = createApp(App);
  const ctx = {};
  const html = await renderToString(app, ctx);
  // @ts-ignore
  const preloadLinks = renderPreloadLinks(ctx.modules, manifest);
  return [html, preloadLinks];
}

function renderPreloadLinks(modules, manifest) {
  let links = '';
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

function renderPreloadLink(file) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  }
  if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`;
  }
  return '';
};
