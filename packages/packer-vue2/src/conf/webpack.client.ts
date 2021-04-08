import MiniCssExtractPlugin, { loader as MiniCssExtractLoader } from 'mini-css-extract-plugin';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';
import * as webpack from 'webpack';
import { WebpackOptions } from 'webpack/declarations/WebpackOptions';
interface GetConfigOption {
  mode: 'development' | 'production';
  entry: string | object;
  publicPath: string;
  dist: string;
  hmrPath?: string;
  onProgress?: (percent: number, msg: string) => void;
}

export const getConfig = function getConfig(base: WebpackOptions, option: GetConfigOption): WebpackOptions {
  const isDev = option.mode === 'development';

  // 设置 entry，开发模式支持 hmr
  let entry = {};
  if (typeof option.entry === 'string') {
    entry = {
      app: isDev ? [`webpack-hot-middleware/client?path=${option.hmrPath}`, option.entry] : option.entry,
    };
  } else {
    entry = { ...option.entry };
  }

  const config: WebpackOptions = {
    ...base,
    entry,
    mode: option.mode,
    devtool: isDev ? '#source-map' : false,
    output: {
      filename: isDev ? '[name].js' : '[name]/app.[contenthash:4].js',
      path: option.dist,
      publicPath: option.publicPath,
      libraryTarget: 'umd',
      library: 'rieApp',
    },
    externals: {
      vue: {
        commonjs2: ['rieVue2Runtime', 'Vue'],
        commonjs: ['rieVue2Runtime', 'Vue'],
        root: ['rieVue2Runtime', 'Vue'],
      },
    },
  };

  config.module.rules.push(
    {
      test: /\.(ts|js)x?$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cwd: __dirname,
            sourceType: 'unambiguous',
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['ios >= 9', 'Android >= 6.0'],
                  },
                },
              ],
              '@babel/preset-typescript',
              'babel-preset-typescript-vue',
            ],
            plugins: [
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties'],
            ],
          },
        },
        '@riejs/packer-utils/lib/loaders/client-fetch-loader',
      ],
    },
    {
      test: /\.css$/,
      use: [isDev ? 'vue-style-loader' : MiniCssExtractLoader, { loader: 'css-loader', options: { esModule: false } }],
    },
    {
      test: /\.less$/,
      use: [
        isDev ? 'vue-style-loader' : MiniCssExtractLoader,
        { loader: 'css-loader', options: { esModule: false } },
        'less-loader',
      ],
    },
  );

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || option.mode),
      'process.env.VUE_ENV': JSON.stringify('client'),
    }),
    new VueSSRClientPlugin({
      filename: 'rie.vue2.app.manifest.json',
    }),
  );

  if (isDev) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.ProgressPlugin(option.onProgress),
    );
  } else {
    config.plugins.push(new MiniCssExtractPlugin({ filename: '[name]/app.[contenthash:4].css' }));
  }

  return config;
};
