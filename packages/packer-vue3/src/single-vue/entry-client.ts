import { createSSRApp } from 'vue';
// @ts-ignore
import App from './Main.vue';

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
function createApp() {
  const app = createSSRApp(App);
  return { app };
};

const { app } = createApp();

// wait until router is ready before mounting to ensure hydration match
const instance = app.mount('#app');
// @ts-ignore
app._container._vnode = instance.$.vnode;
