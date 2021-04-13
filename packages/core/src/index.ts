import { Middleware } from 'koa';
import { render, initRenderer } from './render';
import { scanPages, matchPage, PageCollection } from './route';
import { handleService } from './service-manager';
import { getContext, setContext, convertKoaCtx } from './isomorphism/server/context';

export { Renderer, RendererOption, RendererInterface } from './renderer';
export { clientFetch } from './isomorphism/server/clientFetch';
export { getContext };

/**
 * Rie 配置
 */
export interface RieOption {
  /**
   * @member {Array<PageCollection>} collections 页面集合列表
   */
  collections: PageCollection[];

  /**
   * @member {boolean} dev 是否是开发模式，默认 false
   */
  dev?: boolean;

  /**
   * @member {string} dist 构建产物目录，非开发模式必传
   */
  dist?: string;

  /**
   * @member {string} publicPath 构建产物的 publicPath，默认: /dist/
   */
  publicPath?: string;

  /**
   * @member {string} runtimePublicPath 运行时的 publicPath，可选
   */
  runtimePublicPath?: string;

  /**
   * @member {Function} onError 错误回调函数
   */
  onError?: (Error: Error, BaseContext) => void;
}

/**
 * Rie 入口
 * @param {RieOption} RieOption - rie 配置
 * @returns {Middleware} Koa SSR 中间件
 */
export function rie({ collections, dev = false, onError = null, dist, runtimePublicPath }: RieOption): Middleware {
  if (!Array.isArray(collections) || collections.length === 0) {
    throw new Error('pageDirs must be a nonempty array');
  }
  const targetPages = scanPages(collections);
  if (!dev) {
    targetPages.forEach(page => initRenderer(page, { dev, dist, runtimePublicPath }));
  }

  /* eslint-disable no-param-reassign */
  return async (ctx, next) => setContext(convertKoaCtx(ctx), async () => {
    await handleService(ctx);

    if (ctx.body && ctx.status !== 404) {
      return next();
    }

    const isMethodMatched = ctx.method === 'HEAD' || ctx.method === 'GET';
    if (!isMethodMatched) {
      return next();
    }

    const target = matchPage(targetPages, ctx.path);
    if (!target) {
      return next();
    }

    try {
      ctx.body = await render(ctx, { dev, dist, page: target });
    } catch (exception) {
      console.error(exception);
      ctx.status = 500;
      ctx.body = 'internal error';
      if (dev) {
        ctx.body = `${exception?.toString()}\n${exception?.stack?.toString()}`;
      }
      if (typeof onError === 'function') {
        await onError(exception, ctx);
      }
    }
    return next();
  });
}
