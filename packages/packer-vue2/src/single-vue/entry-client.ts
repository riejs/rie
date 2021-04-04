import { createApp } from './app';
import Vue from 'vue';
import { getAsyncData as getAsyncDataFromServer } from './async-data';

/* eslint-disable no-underscore-dangle */
interface ExtendedWindow extends Window {
  /**
   * @member {Object} __INITIAL_ASYNCDATA__ data from server
   */
  __INITIAL_ASYNCDATA__?: object;
  /**
   * @member {Object} __INITIAL_STATE__ state from server
   */
   __INITIAL_STATE__?: object;
}

declare const window: ExtendedWindow;

const getAsyncData = async function getAsyncData(app) {
  return window.__INITIAL_ASYNCDATA__ || getAsyncDataFromServer(app);
};

const init = async function init(page: Vue) {
  const data = await getAsyncData(page);
  const { app } = createApp({ app: page }, data);
  if (window.__INITIAL_STATE__) {
    app.$store?.replaceState(window.__INITIAL_STATE__);
  }
  const dom = document.querySelector('[data-server-rendered="true"]') || document.getElementById('app');
  app.$mount(dom);
};

export { Vue, init };
