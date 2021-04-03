import { RieContext } from '../common/context';

export const getContext = function getContext(): RieContext {
  return {
    cookie: {
      get: key => key,
      set() {},
      del() {},
    },
    header: {
      get: key => key,
      set() {},
    },
    query: {},
    ua: '',
    env: 'server',
    rawContext: {},
  };
};
