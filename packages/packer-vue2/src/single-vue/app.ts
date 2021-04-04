import Vue from 'vue';
import VueMeta from 'vue-meta';

Vue.use(VueMeta);

Vue.config.devtools = true;

const createApp = function createApp(context, data): { app: Vue } {
  // functional component （通过 Vue.extend 或 vue-class-component 创建出来）
  const isFunctional = typeof context.app === 'function';
  const options = isFunctional ? context.app.options : context.app;

  // 原始的 data
  let originData = {};
  if (typeof options.data === 'function') {
    // 如果是 functional component ，在运行 data 函数的时候，需要传入一个 vue 实例作为上下文
    originData = isFunctional ? options.data.call(new Vue()) : options.data();
  }

  // 页面实例化
  const app = new Vue({
    name: 'App',
    ...options,
    // 将原始 data 和外部 data 进行合并
    data: () => ({ ...originData, ...data }),
  });
  return { app };
};

export { createApp };
