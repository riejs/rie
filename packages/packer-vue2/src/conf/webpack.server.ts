import * as webpack from 'webpack';
import { WebpackOptions } from 'webpack/declarations/WebpackOptions';
import nodeExternals from 'webpack-node-externals';

interface GetConfigOption {
  mode: 'development' | 'production';
  entry: string | object;
  publicPath: string;
  dist: string;
  onProgress: (percent: number, msg: string) => void;
}

export const getConfig = function getConfig(base: WebpackOptions, option: GetConfigOption): WebpackOptions {
  const isDev = option.mode === 'development';

  const entry = typeof option.entry === 'string' ? { app: option.entry } : { ...option.entry };
  const config: WebpackOptions = {
    ...base,
    entry,
    mode: option.mode,
    devtool: '#source-map',
    target: 'node',
    externals: [nodeExternals()],
    output: {
      filename: isDev ? '[name].js' : '[name]/app.js',
      libraryTarget: 'commonjs2',
      path: option.dist,
      publicPath: option.publicPath,
    },
    optimization: {
      minimize: false,
    },
  };
  config.module.rules.push(
    {
      test: /\.(ts|js)x?$/,
      loader: 'babel-loader',
      options: {
        cwd: __dirname,
        presets: [['@babel/preset-env', { targets: { node: '10' } }], '@babel/preset-typescript'],
        plugins: [['@babel/plugin-proposal-decorators', { legacy: true }], ['@babel/plugin-proposal-class-properties']],
      },
    },
    {
      test: /\.css$/,
      use: ['null-loader'],
    },
    {
      test: /\.less$/,
      use: ['null-loader'],
    },
  );
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || option.mode),
    'process.env.VUE_ENV': JSON.stringify('server'),
  }));

  if (isDev) {
    config.plugins.push(new webpack.ProgressPlugin(option.onProgress));
  }
  return config;
};
