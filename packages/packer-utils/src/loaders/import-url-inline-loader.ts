/**
 * import-url-inline-loader
 * 支持将 <style inline> 中的 "@import url(...)" 语句，替换为实际的样式内容
 */

import * as http from 'http';
import * as https from 'https';
import { normalize, join } from 'path';
import { parse as qsParse } from 'querystring';
import { StringDecoder } from 'string_decoder';
import { URL } from 'url';

const decoder = new StringDecoder('utf8');

// 获取CSS文件内容
async function embeddedCss(cssUrl) {
  const urlParams = new URL(cssUrl);
  const domain = urlParams.host;
  const cssPath = urlParams.pathname;
  return new Promise((resolve) => {
    const request = cssUrl.indexOf('https:') === 0 ? https : http;
    const req = request.get(cssUrl, (response) => {
      const buffers = [];
      let size = 0;
      const contentType = response.headers['content-type'];
      if (!contentType.includes('css')) {
        return resolve('');
      }
      response.on('data', (data) => {
        buffers.push(data);
        size += data.length;
      });
      response.on('end', () => {
        // Buffer 是node.js 自带的库，直接使用
        let responseText = decoder.write(Buffer.concat(buffers, size));
        if (responseText) {
          const cssDir = cssPath.substring(0, cssPath.lastIndexOf('/'));
          responseText = responseText.replace(/url\((.+?)\)/gi, ($0, $1) => {
            if (
              $1 === 'about:blank'
              || $1.indexOf('//') === 0
              || $1.indexOf('https://') === 0
              || $1.indexOf('http://') === 0
              || $1.indexOf('data:') === 0
            ) {
              return $0;
            }
            if ($1.indexOf('/') === 0) {
              return `url(//${domain}${normalize($1).replace(/\\/g, '/')})`;
            }
            return `url(//${domain}${join(cssDir, $1).replace(/\\/g, '/')})`;
          });
          resolve(responseText.replace(/[\r\n]/g, '').replace(/"/g, '\''));
        }
      });
      response.on('error', (error) => {
        console.error(`[build error] download css file: ${cssUrl} response failed`, error);
        resolve('');
      });
    });
    req.on('error', (error) => {
      console.error(`[build error] download css file: ${cssUrl} req failed`, error);
      resolve('');
    });
  });
}

export const importUrlInlineLoader = async function importUrlInlineLoader(...args) {
  const query = qsParse(this.resourceQuery.slice(1));
  const isVueComponents = typeof query.vue === 'string';
  const isInlineStyle = query.type === 'style' && query.inline;
  if (isVueComponents && isInlineStyle) {
    const [content] = args;
    const callback = this.async();
    const lines = await Promise.all(content.split('\n').map((line) => {
      // e.g. 匹配 @import url(https://qzonestyle.gtimg.cn/vipstyle/vip-web/vip-owg/common-component/vip-common-pay-speedup.css));
      const matcher = line.match(/@import url\((.*?)\);?/);
      if (matcher) {
        return embeddedCss(matcher[1])
          .then((cssContent) => {
            if (cssContent) {
              return line.replace(matcher[0], cssContent);
            }
            return line;
          })
          .catch(() => line);
      }
      return line;
    }));
    callback(null, lines.join('\n'), args[1], args[2]);
  } else {
    this.callback(null, ...args);
  }
};
