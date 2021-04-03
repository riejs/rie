import { createApp } from './app';
import Vue from 'vue';
import { getAsyncData as getAsyncDataFromServer } from './async-data';

interface ExtendedWindow extends Window {
  /**
   * @member {Object} __INITIAL_ASYNCDATA__ data from server side render
   */
  __INITIAL_ASYNCDATA__?: object;
}

declare const window: ExtendedWindow;

const getAsyncData = async function getAsyncData(app) {
  // eslint-disable-next-line no-underscore-dangle
  return window.__INITIAL_ASYNCDATA__ || getAsyncDataFromServer(app);
};

const init = async function init(page: Vue, isDev = false) {
  const data = await getAsyncData(page);
  const { app } = createApp({ app: page, isDev }, data);
  const dom = document.querySelector('[data-server-rendered="true"]') || document.getElementById('app');
  app.$mount(dom);
};

export { Vue, init };
