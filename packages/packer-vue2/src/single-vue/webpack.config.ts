import { resolve } from 'path';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';
import { WebpackOptions } from 'webpack/declarations/WebpackOptions';
import nodeExternals from 'webpack-node-externals';
import TerserPlugin from 'terser-webpack-plugin';

const dist = resolve(__dirname, '../../lib/single-vue');
const name = 'rie.vue2.runtime';

export const server: WebpackOptions = {
  entry: resolve(__dirname, './entry-server'),
  mode: 'production',
  target: 'node',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: dist,
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        loader: 'babel-loader',
        include: /single-vue/,
        options: {
          presets: [['@babel/preset-env', { targets: { node: '10' } }], '@babel/preset-typescript'],
        },
      },
    ],
  },
  plugins: [
    new VueSSRServerPlugin({
      filename: `server/${name}.server.json`,
    }),
  ],
  externals: [nodeExternals()],
};

export const client: WebpackOptions = {
  entry: {
    [name]: resolve(__dirname, './entry-client'),
  },
  mode: 'production',
  devtool: false,
  output: {
    path: resolve(dist, './client'),
    filename: '[name].[contenthash:4].js',
    library: 'rieVue2Runtime',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        loader: 'babel-loader',
        include: /single-vue/,
        options: {
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
          ],
          plugins: [['@babel/plugin-transform-runtime']],
        },
      },
    ],
  },
  plugins: [
    new VueSSRClientPlugin({
      filename: `../server/${name}.manifest.json`,
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true,
          },
          output: {
            beautify: false,
            comments: false,
          },
          mangle: true,
        },
      }),
    ],
  },
};
