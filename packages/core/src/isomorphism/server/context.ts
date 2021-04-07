import * as asyncHooks from 'async_hooks';
import { Context } from 'koa';
import { AsyncLocalStorage as SelfAsyncLocalStorage } from './async-local-storage';
import { RieContext } from '../common/context';

// Node 12.17.0 版本，原生支持 AsyncLocalStorage
const AsyncLocalStorage = asyncHooks.AsyncLocalStorage || SelfAsyncLocalStorage;
const asyncLocalStorage = new AsyncLocalStorage<RieContext>();

export function setContext(ctx: RieContext, callback) {
  return asyncLocalStorage.run(ctx, callback);
};

export function getContext(): RieContext {
  return asyncLocalStorage.getStore();
};

export function convertKoaCtx(ctx: Context): RieContext {
  return {
    cookie: {
      get: ctx.cookies.get.bind(ctx.cookies),
      set: ctx.cookies.set.bind(ctx.cookies),
      del: (name: string, options) => {
        ctx.cookies.set(name, '', {
          maxAge: -1,
          ...options,
        });
      },
    },
    query: ctx.query,
    env: 'server',
    ua: ctx.get('User-Agent'),
    header: {
      get: ctx.get.bind(ctx),
      set: ctx.set.bind(ctx),
    },
    rawContext: ctx,
  };
};
