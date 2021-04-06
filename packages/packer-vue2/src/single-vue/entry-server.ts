import Vue from 'vue';
import Vuex from 'vuex';
import { createApp } from './app';
import { getAsyncData, getState } from './async-data';

Vue.use(Vuex);

/* eslint-disable no-param-reassign */
export default async (context) => {
  const data = await getAsyncData(context.app);
  const { app } = createApp(context, data);
  context.meta = app.$meta();
  context.asyncData = data;
  const state = getState(context.app);
  if (state) {
    context.state = state;
  }
  return app;
};
