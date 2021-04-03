/**
 * clientFetch 配置
 */
export interface ClientFetchOption {
  /**
   * @member {string} argsIn 将参数放在 URL 或 请求体 里传过去，默认: get 请求放在 url 里，post 请求放在 body 里
   */
  argsIn?: 'url' | 'body';

  /**
   * @member {boolean} autoAppendPageQueryString 自动带上当前页的 querystring，默认: true
   */
  autoAppendPageQueryString?: boolean;

  /**
   * @member {boolean} shouldRegister 是否需要注册这个服务，url 为 /xxx 时，默认 true，url 为 https://、http://、//xxx 默认为 false
   */
  shouldRegister?: boolean;
}

export const argsKey = 'isomorphism-args';

export const encodeArgs = (args) => {
  let value = '';
  try {
    if (args && typeof args === 'object') {
      value = btoa(JSON.stringify(args));
    }
  } catch (exception) {}
  return encodeURIComponent(value);
};

export const decodeArgs = () => {};
