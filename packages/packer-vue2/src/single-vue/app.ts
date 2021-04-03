import Vue from 'vue';
import VueMeta from 'vue-meta';

Vue.use(VueMeta);

const createApp = function createApp(context, data): { app: Vue } {
  Vue.config.devtools = context.isDev;
  // functional component
  const options = typeof context.app === 'function' ? context.app.options : context.app;
  const originData = typeof options.data === 'function' ? options.data() : {};
  const app = new Vue({
    name: 'App',
    ...options,
    data: () => ({ ...originData, ...data }),
  });
  return { app };
};

export { createApp };
