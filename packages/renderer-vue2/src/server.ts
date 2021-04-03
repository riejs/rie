import { readFileSync } from 'fs';
import { resolve } from 'path';
import { RendererInterface, RendererOption } from '@riejs/rie';
import { BaseContext } from 'koa';
import * as Vue from 'vue';
import { createBundleRenderer, BundleRenderer } from 'vue-server-renderer';

class Renderer implements RendererInterface {
  public static type = '@riejs/renderer-vue2';
  public static packer = '@riejs/packer-vue2';

  public option: RendererOption;

  private innerRenderer: BundleRenderer;
  private devPacker;
  private app;

  public constructor(option: RendererOption) {
    this.option = option;
    if (!this.option.dev) {
      this.createInnerRenderer(this.option.dist);
    }
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

  private async getInnerRenderer() {
    if (this.innerRenderer) {
      return this.innerRenderer;
    }
    if (this.option.dev) {
      const { DevPacker } = await import(Renderer.packer).catch((error: Error) => {
        if (error.message.search('Cannot find module') >= 0) {
          /* eslint-disable-next-line no-param-reassign */
          error.message = `${error.message}. Try: npm i -D ${Renderer.packer}`;
        }
        throw error;
      });
      this.devPacker = new DevPacker({
        rendererType: Renderer.type,
        route: this.option.route,
        dir: this.option.dir,
        template: this.option.template,
      });
      this.devPacker.on('ready', ({ dist }) => this.createInnerRenderer(dist));
      this.innerRenderer = await this.devPacker.getBuildingRenderer();
      return this.innerRenderer;
    }
    this.createInnerRenderer(this.option.dist);
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

      delete require.cache[serverBundlePath];
      delete require.cache[manifestPath];
      delete require.cache[appManifestPath];
      delete require.cache[appPath];

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
    const clientManifest = {
      publicPath: app.publicPath,
      all: runtime.all.concat(app.all),
      async: runtime.async.concat(asyncFiles),
      initial: runtime.initial.concat(initialFiles),
      modules: {},
    };
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
