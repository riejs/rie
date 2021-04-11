import { createApp } from './app';

interface ExtendedWindow extends Window {
  /**
   * @member {Object} rieApp Vue PageComponent
   */
   rieApp?: object;
}

declare const window: ExtendedWindow;

const { app } = createApp(window.rieApp);

const instance = app.mount('#app');
/* eslint-disable no-underscore-dangle */
// @ts-ignore
app._container._vnode = instance.$.vnode;
