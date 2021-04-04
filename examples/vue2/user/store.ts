import { Vue } from '@riejs/renderer-vue2';
import Vuex from 'vuex';

Vue.use(Vuex);

/* eslint-disable no-param-reassign */
export const store = new Vuex.Store({
  state: {
    test: 'dadas',
  },
  mutations: {
    setTest(state, payload) {
      state.test = payload;
    },
  },
});
