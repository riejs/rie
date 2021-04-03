import * as devMiddleware from 'webpack-dev-middleware';

/* eslint-disable no-param-reassign */
export function dev(compiler, opts) {
  const middleware = devMiddleware(compiler, opts);
  let nextFlag = false;
  const nextFn = (): void => {
    nextFlag = true;
  };
  const handler = (ctx, next): void => {
    middleware(
      ctx.req,
      {
        send: content => (ctx.body = content),
        setHeader: (name, value) => ctx.set(name, value),
        getHeader: name => ctx.get(name),
      },
      nextFn,
    );
    if (nextFlag) {
      nextFlag = false;
      return next();
    }
  };
  handler.fileSystem = middleware.fileSystem;
  return handler;
}
