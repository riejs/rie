import './replace-resolve-sync';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getUsablePort } from '@riejs/packer-utils';
import * as express from 'express';
import { createServer as createProxyServer } from 'http-proxy';
import { createServer, ViteDevServer } from 'vite';

const MIN_PORT = 51000;
const MAX_PORT = 51999;

const defalutTemplate = readFileSync(resolve(__dirname, '../../template.html'), 'utf-8');

class DevRenderer {
  private app: express.Application;
  private viteDevServer: ViteDevServer;
  private template: string;
  private base: string;
  private port: number;
  private proxy;
  private option;

  public constructor(option) {
    this.option = option;
    this.template = option.template || defalutTemplate;
    const { route } = option;
    this.base = route.endsWith('/') ? route : `${route}/`;
  }

  public async initDevServer() {
    const app = express();
    const viteDevServer = await createServer({
      base: this.base,
      root: resolve(__dirname, '../../src/single-vue'),
      logLevel: 'info',
      server: {
        middlewareMode: true,
      },
    });
    app.get(`${this.base}export-app`, (req, res) => res
      .status(200)
      .set({ 'Content-Type': 'application/javascript' })
      .end([
        `import App from '${this.base}@fs${this.option.dir}/index.vue';`,
        'window.rieApp = App;',
      ].join('\n')));
    app.use(viteDevServer.middlewares);
    app.use('*', this.renderHandler.bind(this));
    const port = await getUsablePort(MIN_PORT, MAX_PORT);

    this.app = app;
    this.viteDevServer = viteDevServer;
    this.proxy = createProxyServer();
    this.port = port;

    return new Promise((resolve) => {
      app.listen(port, () => resolve(true));
    });
  }

  public render(ctx) {
    const devServer = `http://127.0.0.1:${this.port}`;
    const requestPath = ctx.path.replace(/\/$/, '');
    const isPageRequest = requestPath === this.option.route
      || requestPath === this.option.route.replace(/\/index$/, '');

    const target = isPageRequest
      ? `${devServer}${this.base}`
      : `${devServer}/`;
    return new Promise(() => this.proxy.web(ctx.req, ctx.res, { target }));
  }

  private async renderHandler(req: express.Request, res: express.Response) {
    const [template, entry, App] = await Promise.all([
      this.viteDevServer.transformIndexHtml(req.originalUrl, this.template),
      this.viteDevServer.ssrLoadModule('/entry-server'),
      this.viteDevServer.ssrLoadModule(`${this.option.dir}/index.vue`),
    ]);
    const [appHtml, preloadLinks] = await entry.render(App.default ?? App, {});

    const html = template
      .replace('<!--preload-links-->', preloadLinks)
      .replace('<!--app-html-->', appHtml);

    res.status(200)
      .set({ 'Content-Type': 'text/html' })
      .end(html);
  }
};

export { DevRenderer };
