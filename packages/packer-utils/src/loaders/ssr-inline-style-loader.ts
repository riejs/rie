/**
 * ssr-inline-style-loader
 * 支持把 <style inline> 写法的样式，内联到页面中进行 SSR 输出
 * 参考 vue-style-loader
 */

import { join } from 'path';
import { parse as qsParse } from 'querystring';
import loaderUtils from 'loader-utils';

export const pitch = function pitch(remainingRequest) {
  const query = qsParse(this.resourceQuery.slice(1));
  const isServer = this.target === 'node';
  const isVueComponents = typeof query.vue === 'string';
  const isInlineStyle = query.type === 'style' && query.inline;

  // 服务端构建，且是 vue 文件内部的 inline style 块
  if (isServer && isVueComponents && isInlineStyle) {
    const request = loaderUtils.stringifyRequest(this, `!!${remainingRequest}`);
    const addStylesServerPath = loaderUtils.stringifyRequest(this, `!${join(__dirname, './addStylesServer.js')}`);
    const logic = `
      // vue-inline-style-loader: Adds some css to the DOM by adding a <style> tag with inline prop
      var content = require(${request});
      if(typeof content === 'string') content = [[module.id, content, '']];
      if(content.locals) module.exports = content.locals;

      // add CSS to SSR context
      var add = require(${addStylesServerPath}).add;
      module.exports.__inject__ = function (context) {
          add(content, context);
      };
    `.trim();
    return logic;
  }
  return '';
};
