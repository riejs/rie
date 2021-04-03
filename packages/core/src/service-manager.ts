import { URL } from 'url';
import { Context } from 'koa';

interface ServiceHandler {
  handler: Function;
  instance: Function;
  method: string;
  argsIn: string;
  argsKey: string;
}
const servicesMap: {
  [path: string]: ServiceHandler;
} = {};

export const registerServices = function registerServices(path: string, serviceHandler: ServiceHandler) {
  let pathname = path;
  try {
    ({ pathname } = new URL(path));
  } catch (exception) {}

  if (typeof pathname === 'string' && pathname !== '') {
    servicesMap[pathname] = serviceHandler;
  }
};

/* eslint-disable no-param-reassign */
export const handleService = async function handleService(ctx: Context) {
  const { path, method } = ctx;
  if (servicesMap[path] && servicesMap[path].method === method.toLowerCase()) {
    const service = servicesMap[path];
    try {
      const data = await service.handler.call(service.instance);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        data,
        message: 'OK',
      };
    } catch (exception) {
      console.error('handle servier error');
      console.error(exception);
      ctx.status = 500;
      ctx.body = {
        code: -1,
        message: 'Server error',
      };
    }
  }
};
