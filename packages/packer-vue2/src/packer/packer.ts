import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import webpack from 'webpack';
import { WebpackOptions } from 'webpack/declarations/WebpackOptions';
import { config as base } from '../conf/webpack.base';
import { getConfig as getClientConfig } from '../conf/webpack.client';
import { getConfig as getServerConfig } from '../conf/webpack.server';
import clone from 'clone-deep';
import { Page } from '@riejs/rie/lib/route';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import { copy, copyPattern } from '../utlis/file';
import { getClientTemplate, getServerTemplate } from '../utlis/template';

const defaultTemplate = readFileSync(resolve(__dirname, '../../template.html'), 'utf-8');

/**
 * 正式环境构建
 */
export class Packer {
  public option;
  private clientConfig: WebpackOptions = clone(base);
  private serverConfig: WebpackOptions = clone(base);
  private patterns: copyPattern[] = [];

  private get clientDist(): string {
    return resolve(this.option.dist, 'client');
  }
  private get serverDist(): string {
    return resolve(this.option.dist, 'server');
  }
  private get serverRuntimeManifest(): string {
    return resolve(this.serverDist, './rie.vue2.runtime.manifest.json');
  }

  public constructor(option) {
    this.option = option;

    const entry = {};
    const clientPlugins = [];
    const serverPlugins = [];
    const appManifest = 'rie.vue2.app.manifest.json';
    this.patterns.push(
      {
        from: resolve(__dirname, '../single-vue/server'),
        to: this.serverDist,
      },
      {
        from: resolve(__dirname, '../single-vue/client'),
        to: this.clientDist,
      },
    );

    option.pages.forEach((page: Page) => {
      const chunkId = page.route.replace(/^\//, '');
      entry[chunkId] = `${page.dir}/index.vue`;
      this.patterns.push({
        from: resolve(this.clientDist, `./${appManifest}`),
        to: resolve(this.clientDist, `.${page.route}`, `./${appManifest}`),
      });
      const template = page.template || defaultTemplate;
      const isDev = option.mode === 'development' || option.mode === 'test';
      clientPlugins.push(new HtmlWebpackPlugin({
        scriptLoading: 'defer',
        templateContent: getClientTemplate(template, {
          publicPath: option.runtimePublicPath || option.publicPath,
          isDev,
        }),
        chunks: [chunkId],
        filename: resolve(this.clientDist, `.${page.route}`, './index.html'),
        minify: false,
      }));
      serverPlugins.push(new HtmlWebpackPlugin({
        inject: false,
        templateContent: getServerTemplate(template, { isDev }),
        chunks: [chunkId],
        filename: resolve(this.serverDist, `.${page.route}`, './template.html'),
        minify: false,
      }));
    });

    this.clientConfig = getClientConfig(this.clientConfig, {
      mode: 'production',
      dist: this.clientDist,
      entry,
      publicPath: option.publicPath,
    });
    this.clientConfig.plugins.push(...clientPlugins);
    this.clientConfig = merge(this.clientConfig, option.packerOption?.client ?? {});

    this.serverConfig = getServerConfig(this.serverConfig, {
      mode: 'production',
      dist: this.serverDist,
      entry,
      publicPath: option.publicPath,
      onProgress() {},
    });
    this.serverConfig.plugins.push(...serverPlugins);
    this.serverConfig = merge(this.serverConfig, option.packerOption?.server ?? {});
  }

  /**
   * vue 2.0 文件打包
   */
  public async build() {
    await this.compile([this.serverConfig, this.clientConfig]);
    await copy(this.patterns);
    if (this.option.runtimePublicPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const runtimeManifest = require(this.serverRuntimeManifest);
      runtimeManifest.publicPath = this.option.runtimePublicPath;
      writeFileSync(this.serverRuntimeManifest, JSON.stringify(runtimeManifest, null, 2), 'utf-8');
    }
  }

  private compile(options: WebpackOptions[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      webpack(options, (err, stats) => {
        if (err) {
          return reject(err);
        }
        const info = stats.toJson();
        if (stats.hasErrors()) {
          return reject(info.errors[0]);
        }
        return resolve(true);
      });
    });
  }
}
