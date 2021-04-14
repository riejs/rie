import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { URL } from 'url';
import { RendererInterface, RendererOption } from '@riejs/rie';
import { BaseContext } from 'koa';
import * as Vue from 'vue';
import { createBundleRenderer, BundleRenderer } from 'vue-server-renderer';

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

class Renderer implements RendererInterface {
  public static type = '@riejs/renderer-vue2';
  public static packer = '@riejs/packer-vue2';

  public option: RendererOption;

  private innerRenderer: BundleRenderer;
  private devPacker;
  private app;
  private waiting: Promise<void>;

  public constructor(option: RendererOption) {
    this.option = option;
    this.initInnerRenderer();
  }

  public async render(context: BaseContext): Promise<string> {
    const innerRenderer = await this.getInnerRenderer();
    const requestPath = context.path.replace(/\/$/, '');
    const isPageRequest = requestPath === this.option.route
      || requestPath === this.option.route.replace(/\/index$/, '');

    return new Promise((resolve, reject) => {
      if (!isPageRequest) {
        if (this.devPacker) {
          return this.devPacker.proxy(context);
        }
      }
      innerRenderer.renderToString({ app: this.app }, (error, res) => {
        if (error) {
          return reject(error);
        }
        resolve(res);
      });
    });
  }

  private initInnerRenderer() {
    if (!this.option.dev) {
      this.createInnerRenderer(this.option.dist);
      this.waiting = Promise.resolve();
    } else {
      this.waiting = import(Renderer.packer)
        .catch((error: Error) => {
          if (error.message.search('Cannot find module') >= 0) {
            /* eslint-disable-next-line no-param-reassign */
            error.message = `${error.message}. Try: npm i -D ${Renderer.packer}`;
          }
          throw error;
        })
        .then(({ DevPacker }) => {
          this.devPacker = new DevPacker({
            rendererType: Renderer.type,
            route: this.option.route,
            dir: this.option.dir,
            template: this.option.template,
            packerOption: this.option.packerOption,
          });
          this.devPacker.on('ready', ({ dist }) => this.createInnerRenderer(dist));
          return this.devPacker.getBuildingRenderer();
        })
        .then((innerRenderer) => {
          this.innerRenderer = innerRenderer;
        });
    }
  }

  private async getInnerRenderer() {
    if (this.innerRenderer) {
      return this.innerRenderer;
    }
    await this.waiting;
    return this.innerRenderer;
  }

  private createInnerRenderer(dist: string) {
    try {
      const { route } = this.option;
      const serverDist = resolve(dist, './server');
      const clientDist = resolve(dist, './client');

      const serverBundlePath = resolve(serverDist, 'rie.vue2.runtime.server.json');
      const manifestPath = resolve(serverDist, 'rie.vue2.runtime.manifest.json');
      const appManifestPath = resolve(clientDist, `.${route}`, 'rie.vue2.app.manifest.json');
      const appPath = resolve(serverDist, `.${route}`, 'app.js');
      const template = readFileSync(resolve(serverDist, `.${route}`, 'template.html'), 'utf-8');

      require.cache[serverBundlePath] = undefined;
      require.cache[manifestPath] = undefined;
      require.cache[appManifestPath] = undefined;
      require.cache[appPath] = undefined;

      /* eslint-disable @typescript-eslint/no-require-imports */
      const serverBundle = require(serverBundlePath);
      const manifest = require(manifestPath);
      const appManifest = require(appManifestPath);
      this.app = require(appPath).default;
      /* eslint-enable @typescript-eslint/no-require-imports */

      const clientManifest = this.mergeManifest(manifest, appManifest);
      this.innerRenderer = createBundleRenderer(serverBundle, {
        clientManifest,
        template,
        runInNewContext: false,
      });
    } catch (exception) {
      console.error(`[${Renderer.type}] createInnerRenderer Error:`);
      console.error(exception);
    }
  }

  private mergeManifest(runtime, app) {
    const route = this.option.route.replace(/^\//, '');
    const isDev = this.option.dev;
    const initialFiles = app.initial.filter((file: string) => file.startsWith(route) || isDev);
    const asyncFiles = app.async.filter((file: string) => file.startsWith(route) || isDev);
    let clientManifest = {
      publicPath: app.publicPath,
      all: runtime.all.concat(app.all),
      async: runtime.async.concat(asyncFiles),
      initial: runtime.initial.concat(initialFiles),
      modules: {},
    };
    // 如果 runtime 自定义了 publicPath，需要分别为计算成完整路径后，再合并 manifest
    if (runtime.publicPath) {
      const { publicPath: runtimePublicPath } = runtime;
      const { publicPath } = app;
      clientManifest = {
        ...clientManifest,
        publicPath: '',
        all: runtime.all
          .map(asset => resolver(runtimePublicPath, asset))
          .concat(app.all.map(asset => resolver(publicPath, asset))),
        async: runtime.async
          .map(asset => resolver(runtimePublicPath, asset))
          .concat(asyncFiles.map(asset => resolver(publicPath, asset))),
        initial: runtime.initial
          .map(asset => resolver(runtimePublicPath, asset))
          .concat(initialFiles.map(asset => resolver(publicPath, asset))),
      };
    }
    const offset = runtime.all.length;
    Object.keys(runtime.modules).forEach((hash) => {
      clientManifest.modules[hash] = [...runtime.modules[hash]];
    });
    Object.keys(app.modules).forEach((hash) => {
      const assetIds = clientManifest.modules[hash] || [];
      assetIds.push(...app.modules[hash].map(value => value + offset));
      clientManifest.modules[hash] = assetIds;
    });
    return clientManifest;
  }
}

export { Renderer, Vue };
