import request, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ClientFetchOption, argsKey, encodeArgs } from '../common/clientFetch';

const defaultOption: ClientFetchOption = {
  autoAppendPageQueryString: true,
};

const isSamesite = function isSamesite(url: string, currentHost = location.host) {
  if (typeof url !== 'string' || url === '') {
    return false;
  }
  try {
    // 判断 url 是否以 https:// 、http://、// 开头
    if (url.match(/^(https?:)?\/\//)) {
      return currentHost === new URL(url.replace(/^\/\//, 'https://')).host;
    }
    // url 为 /xxx 或 ./xxx ，和页面同域
    return true;
  } catch (exception) {}
  return false;
};

const qsParse = function qsParse(payload = {}) {
  return Object.keys(payload)
    .map(key => `${key}=${encodeURIComponent(decodeURIComponent(payload[key]))}`)
    .join('&');
};

const formDataParse = function formDataParse(payload = {}) {
  const formData = new FormData();
  Object.keys(payload).forEach(key => formData.append(key, payload[key]));
  return formData;
};

const concatQueryString = function concatQueryString(originBody = {}, payload = {}) {
  if (typeof originBody === 'object') {
    const newPayload = { ...originBody, ...payload };
    return qsParse(newPayload);
  }

  const qs = qsParse(payload);
  if (typeof originBody === 'string' && originBody !== '') {
    return `${originBody}&${qs}`;
  }
  return qs;
};

const contatFormData = function contatFormData(originBody = {}, payload = {}) {
  if (originBody instanceof FormData) {
    Object.keys(payload);
  }

  if (typeof originBody === 'object') {
    const newPayload = { ...originBody, ...payload };
    return formDataParse(newPayload);
  }

  return formDataParse(payload);
};

const getPayloadFromArgs = function getPayloadFromArgs(url, args) {
  let payload = {};

  // 函数参数，如果是同域，放在 [argsKey] 属性中
  if (isSamesite(url)) {
    payload = { [argsKey]: encodeArgs(args) };
  } else if (args[0] && typeof args[0] === 'object') {
    //  不同域，取第一个参数作为 payload
    payload = { ...args[0] };
  }
  return payload;
};

const getBody = function getBody(contentType: string, originBody = {}, url = '', args = []) {
  const payload = getPayloadFromArgs(url, args);

  // application/json
  if (contentType.indexOf('application/json') >= 0) {
    return { ...originBody, ...payload };
  }

  // application/x-www-form-urlencoded
  if (contentType.indexOf('x-www-form-urlencoded') >= 0) {
    return concatQueryString(originBody, payload);
  }

  // multipart/form-data
  if (contentType.indexOf('multipart/form-data') >= 0) {
    return contatFormData(originBody, payload);
  }
};

/**
 * 请求预处理，把调用参数放到请求中
 */
const argsHandler: {
  [prop: string]: (config: AxiosRequestConfig, option: ClientFetchOption, args?) => AxiosRequestConfig;
} = {
  // 处理 POST 请求
  post(config, option, args = []) {
    if (option.argsIn === 'url') {
      return argsHandler.default(config, option, args);
    }
    const { headers } = config;
    const contentType: string = headers['content-type'] || headers['Content-Type'] || 'application/json';

    // 将参数放在 body 中
    return {
      ...config,
      data: getBody(contentType.toLowerCase(), config.data, config.url, args),
    };
  },

  // 处理其他请求
  default(config, option, args = []) {
    const newParams = { ...config.params, ...getPayloadFromArgs(config.url, args) };

    // 将参数放入 url 中
    return { ...config, params: newParams };
  },
};

/* eslint-disable no-param-reassign */

/**
 * 装饰器 clientFetch 工厂函数，客户端实现
 * @param {AxiosRequestConfig} config 请求参数
 * @param {ClientFetchOption} option 装饰器选项
 */
export const clientFetch = function clientFetch(config: AxiosRequestConfig, option: ClientFetchOption = {}): Function {
  return (target, name, descriptor): void => {
    const fetchOption = { ...defaultOption, ...option };

    // 替代原有方法，直接发起 ajax 请求
    descriptor.value = function (...args): Promise<AxiosResponse> {
      let reqConfig: AxiosRequestConfig = { ...config };
      const method = config.method?.toLowerCase() || 'get';
      if (args.length > 0) {
        const handler = argsHandler[method] || argsHandler.default;
        try {
          reqConfig = handler(reqConfig, fetchOption, args);
        } catch (exception) {
          console.error(exception);
        }
      }

      // 同域的请求，页面有请求参数，并且需要追加到请求参数后面
      if (isSamesite(reqConfig.url) && location.search && option.autoAppendPageQueryString) {
        const connector = reqConfig.url.indexOf('?') > 0 ? '&' : '?';
        reqConfig.url = `${reqConfig.url}${connector}${location.search.substring(1)}`;
      }
      return request(reqConfig).then(res => res.data);
    };
  };
};
