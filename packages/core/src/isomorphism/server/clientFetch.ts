import { AxiosRequestConfig } from 'axios';
import { ClientFetchOption, argsKey } from '../common/clientFetch';
import { registerServices } from '../../service-manager';

/* eslint-disable no-param-reassign */
export const clientFetch = function clientFetch(config: AxiosRequestConfig, option: ClientFetchOption = {}) {
  const { argsIn = 'url', shouldRegister } = option;
  return (target, name, descriptor): void => {
    const handler = descriptor.value;
    const { url } = config;

    // 是否为合法 URL
    const isValidUrl = typeof url === 'string' && url !== '';
    // 判断是否为 /xxx 格式的 URL
    const isAbsoluteUrl = url.startsWith('/') && !url.startsWith('//') && shouldRegister !== false;
    // 判断 url 是否以 https:// 、http://、// 开头
    const isOuterUrl = url.match(/^(https?:)?\/\//i) !== null && shouldRegister;

    if (isValidUrl && (isAbsoluteUrl || isOuterUrl)) {
      registerServices(url.replace(/^\/\//, 'https://'), {
        argsIn,
        argsKey,
        handler,
        instance: target,
        method: config.method ? config.method.toLowerCase() : 'get',
      });
    }
  };
};
