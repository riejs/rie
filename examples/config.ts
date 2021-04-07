import { resolve } from 'path';
import { RieOption } from '@riejs/rie';
import { Renderer as Vue2Renderer } from '@riejs/renderer-vue2';

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
  ],
  dev: false,
  dist: resolve('./dist'),
  publicPath: '/dist/',
};
