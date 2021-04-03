import { RieContext } from '../common/context';

export const getContext = function getContext(): RieContext {
  return {
    cookie: {
      get: key => key,
      set() {},
      del() {},
    },
    query: {},
    ua: '',
    env: 'browser',
  };
};
