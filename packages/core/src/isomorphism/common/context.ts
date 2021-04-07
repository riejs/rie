/**
 * Rie Cookie
 */
export interface RieCookie {
  get(key: string, option?: {
    signed?: boolean; // 是否是签名的 cookie
  }): string|null;
  set(
    key: string,
    value: string,
    options?: {
      domain?: string; // cookie 的域
      expires?: Date; // cookie 到期时间
      httpOnly?: boolean; // 是否仅能发送
      maxAge?: number; // cookie 有效时长，单位：毫秒
      path?: string; // cookie 的路径
      signed?: boolean; // 是否要对 cookie 进行签名
      overwrite?: boolean; // 是否要覆盖以前
    },
  ): void;
  del(key: string, options?: {
    domain?: string; // cookie 的域
    path?: string; // cookie 的路径
  }): void;
}

/**
 * Rie 请求头
 */
export interface RieHeader {
  get(key: string): string;
  set(key: string, value: string): void;
}

/**
 * Rie QueryString
 */
export interface RieQuery {
  [prop: string]: string|string[];
}

/**
 * Rie 上下文
 */
export interface RieContext {
  /**
   * @member {RieCookie} cookie Cookie
   */
  cookie: RieCookie;

  /**
   * @member {RieQuery} query QueryString
   */
  query: RieQuery;

  /**
   * @member {string} ua UserAgent
   */
  ua: string;

  /**
   * @member {string} env 当前环境, server 服务端，browser 浏览器
   */
  env: 'server' | 'browser';

  /**
   * @member {RieHeader} header 请求头，仅在服务端有效
   */
  header?: RieHeader;

  /**
   * @member rawContext 原生上下文，Koa 环境为 koa ctx，仅在服务端有效
   */
  rawContext?: any;
}
