/**
 * Augment the typings of Vue.js
 */

import Vue from 'vue';
import 'vuex';
import 'vue-meta';
import { RendererInterface, RendererOption } from '@riejs/rie';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    /**
     * Rie 的扩展方法，用于渲染前获取异步数据。并将数据与组件本身的 data 进行混合
     */
    asyncData?: Function;
  }
}

declare class Renderer implements RendererInterface {
  public static type: string;
  public static packer: string;
  public option: RendererOption;
  public render: () => Promise<string>;
}

export { Vue, Renderer };
