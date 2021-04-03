import { resolve } from 'path';
import { RieOption } from '@riejs/rie';
import { Renderer as Vue2Renderer } from '@riejs/renderer-vue2';

export const config: RieOption = {
  collections: [
    {
      dir: resolve(__dirname, './vue2'),
      route: '/vue2',
      Renderer: Vue2Renderer,
    },
  ],
  dev: true,
  dist: resolve('./dist'),
  publicPath: '/dist/',
};
