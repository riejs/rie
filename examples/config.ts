import { resolve } from 'path';
import { RieOption } from '@riejs/rie';
import { Renderer as Vue2Renderer } from '@riejs/renderer-vue2';
import { Renderer as Vue3Renderer } from '@riejs/renderer-vue3';

export const config: RieOption = {
  collections: [
    {
      dir: resolve(__dirname, './vue2'),
      route: '/vue2',
      Renderer: Vue2Renderer,
      packerOption: {
        server: {
          resolve: {
            alias: {
              '@': __dirname,
            },
          },
        },
        client: {
          resolve: {
            alias: {
              '@': __dirname,
            },
          },
        },
      },
    },
    {
      dir: resolve(__dirname, './vue3'),
      route: '/vue3',
      Renderer: Vue3Renderer,
    },
  ],
  dev: true,
  dist: resolve('./dist'),
  publicPath: '/dist/',
};
