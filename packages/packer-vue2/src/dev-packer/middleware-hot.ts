import { PassThrough } from 'stream';
import hotMiddleware from 'webpack-hot-middleware';

/* eslint-disable no-param-reassign */
export function hot(compiler, opts) {
  const middleware = hotMiddleware(compiler, {
    path: '/__webpack_hmr',
    ...opts,
  });
  return async (ctx, next): Promise<void> => {
    if (ctx.request.path !== opts.path) {
      return await next();
    }
    const stream = new PassThrough();
    ctx.body = stream;
    middleware(
      ctx.req,
      {
        write: stream.write.bind(stream),
        writeHead: (status, headers) => {
          ctx.status = status;
          Object.keys(headers).forEach((key) => {
            ctx.set(key, headers[key]);
          });
        },
        end: () => stream.end(),
      },
      next,
    );
  };
}
