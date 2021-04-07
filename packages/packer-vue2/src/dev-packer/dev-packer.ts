import { EventEmitter } from 'events';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { CustomPackerOption } from '@riejs/rie/lib/route';
import { getUsablePort } from '@riejs/packer-utils';
import clone from 'clone-deep';
import { createProxyServer } from 'http-proxy';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Koa from 'koa';
import serve from 'koa-static';
import webpack from 'webpack';
import { WebpackOptions } from 'webpack/declarations/WebpackOptions';
import { merge } from 'webpack-merge';
import { hot } from './middleware-hot';
import { config as base } from '../conf/webpack.base';
import { getConfig as getClientConfig } from '../conf/webpack.client';
import { getConfig as getServerConfig } from '../conf/webpack.server';
import { copy } from '../utlis/file';
import { getServerTemplate } from '../utlis/template';

const MIN_PORT = 50000;
const MAX_PORT = 60000;
const buildingHtml = readFileSync(resolve(__dirname, '../../building.html'), 'utf-8');
const defalutTemplate = readFileSync(resolve(__dirname, '../../template.html'), 'utf-8');

/**
 * 发送EventSource到客户端
 */
const sendEventSource = (event, data): string => `event:${event}\ndata: ${data}\n\n`;

interface DevPackerOption {
  /**
   * @member {string} route 页面路由
   */
  route: string;

  /**
   * @member {string} dir 页面所在目录
   */
  dir: string;

  /**
   * @member {string} template 渲染模版
   */
  template: string;

  /**
   * @member {CustomPackerOption} packerOption 自定义构建配置
   */
  packerOption?: CustomPackerOption;
}

/**
 * 开发模式构建
 */
/* eslint-disable no-param-reassign */
export class DevPacker extends EventEmitter {
  public serverBundle = resolve(__dirname, '../single-vue/server.json');
  private devServer: Koa;
  private devPort = 0;
  private route = '';

  private proxyServer;
  private streams: { [id: string]: PassThrough } = {};
  private clientConfig: WebpackOptions = clone(base);
  private serverConfig: WebpackOptions = clone(base);
  private readyStatus = { client: false, server: false };
  private dist = resolve(__dirname, '../../tmp');

  private get progress(): string {
    return `${this.route}/progress`;
  }
  private get hmrPath(): string {
    return `${this.route}/__webpack_hmr`;
  }

  public constructor({ route, dir, template, packerOption }: DevPackerOption) {
    super();
    this.route = route;

    const serverDist = resolve(this.dist, `./server${this.route}`);
    const clientDist = resolve(this.dist, `./client${this.route}`);

    if (!existsSync(serverDist)) {
      mkdirSync(serverDist, { recursive: true });
    }
    if (!existsSync(clientDist)) {
      mkdirSync(clientDist, { recursive: true });
    }
    copy([
      { from: resolve(__dirname, '../single-vue/server'), to: resolve(this.dist, './server') },
      { from: resolve(__dirname, '../single-vue/client'), to: clientDist },
    ]);

    this.serverConfig = getServerConfig(this.serverConfig, {
      mode: 'development',
      entry: resolve(dir, './index.vue'),
      dist: serverDist,
      publicPath: this.route,
      onProgress: (progress) => {
        if (progress >= 1) {
          this.ready('server');
        }
      },
    });
    this.serverConfig.plugins.push(new HtmlWebpackPlugin({
      templateContent: getServerTemplate(template || defalutTemplate, { isDev: true }),
      inject: false,
      filename: resolve(serverDist, './template.html'),
    }));
    this.serverConfig = merge(this.serverConfig, packerOption?.server ?? {});

    this.clientConfig = getClientConfig(this.clientConfig, {
      mode: 'development',
      entry: resolve(dir, './index.vue'),
      publicPath: `${this.route}/`,
      dist: clientDist,
      hmrPath: this.hmrPath,
      onProgress: (progress) => {
        if (progress >= 1) {
          this.ready('client');
        } else {
          this.sendToStreams({ percent: progress });
        }
      },
    });
    this.clientConfig = merge(this.clientConfig, packerOption?.client ?? {});
  }

  public async getBuildingRenderer() {
    await this.initDevServer();
    return {
      renderToString: (ctx, callback) => callback(null, buildingHtml.replace('{progressRoute}', this.progress)),
    };
  }
  public proxy(context): void {
    this.proxyServer.web(context.req, context.res);
  }

  private async initDevServer() {
    if (this.devServer) {
      return;
    }
    await this.runDevServer();
    this.initServerCompiler(this.serverConfig);
    this.initClientCompiler(this.clientConfig);
    this.devServer.use(async (ctx, next) => {
      if (ctx.path === this.progress) {
        const stream = new PassThrough();
        const id = `stream-${Date.now()}`;
        this.streams[id] = stream;
        ctx.req.on('close', () => this.removeStream(id));
        ctx.req.on('finish', () => this.removeStream(id));
        ctx.req.on('error', () => this.removeStream(id));
        stream.write(sendEventSource('start', ''));
        ctx.type = 'text/event-stream';
        ctx.body = stream;
      } else {
        await next();
      }
    });
    this.devServer.use(serve(resolve(this.dist, './client')));
    this.proxyServer = createProxyServer({ target: `http://127.0.0.1:${this.devPort}` });
  }

  private async runDevServer(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const port = await getUsablePort(MIN_PORT, MAX_PORT);
      if (port < 0) {
        reject(new Error('@riejs/packer-vue2 cannot create dev server, please retry.'));
        return;
      }
      const app = new Koa();
      app.listen(port, () => {
        this.devServer = app;
        this.devPort = port;
        resolve();
      });
    });
  }

  private initClientCompiler(config: any) {
    const clientCompiler = webpack(config);
    clientCompiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err);
        throw err;
      }
      const stat = stats.toJson();
      stat.errors.forEach(err => console.error(err));
      stat.warnings.forEach(err => console.warn(err));
    });
    const hotMiddleware = hot(clientCompiler, { heartbeat: 2000, path: this.hmrPath });
    this.devServer.use(hotMiddleware);
  }
  private initServerCompiler(config: any) {
    webpack(config).watch({}, (err, stats) => {
      if (err) {
        console.log(err);
        throw err;
      }
      const stat = stats.toJson();
      stat.errors.forEach(err => console.error(err));
      stat.warnings.forEach(err => console.warn(err));
    });
  }

  private sendToStreams(data) {
    const eventStr = sendEventSource('message', JSON.stringify(data));
    Object.keys(this.streams).forEach(streamId => this.streams[streamId]?.write(eventStr));
  }

  private removeStream(id) {
    this.streams[id] = null;
  }
  private removeAllStreams() {
    Object.keys(this.streams).forEach((streamId) => {
      if (this.streams[streamId]) {
        this.streams[streamId].end();
        this.removeStream(streamId);
      }
    });
  }

  private ready(type: 'client' | 'server') {
    this.readyStatus[type] = true;
    if (this.readyStatus.server && this.readyStatus.client) {
      this.readyStatus.server = false;
      this.readyStatus.client = false;
      this.emit('ready', { dist: this.dist });
      this.sendToStreams({ percent: 100, msg: 'done' });
      this.removeAllStreams();
    }
  }
}
