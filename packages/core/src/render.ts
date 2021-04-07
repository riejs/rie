import { BaseContext } from 'koa';
import { readFileSync } from 'fs';
import { Page } from './route';
import { RendererInterface } from './renderer';

/**
 * 渲染配置
 */
export interface RenderOption {
  /**
   * @member {boolean} dev 开发模式，默认 false
   */
  dev: boolean;

  /**
   * @member {Page} page 要渲染的页面
   */
  page: Page;

  /**
   * @member {String} dist 构建产物目录
   */
  dist: string;
}

const rendererManager: {
  [key: string]: { renderer: RendererInterface };
} = {};

export const initRenderer = function initRenderer(page: Page, { dev, dist }) {
  const { route, dir, template, packerOption } = page;
  let templateStr = '';
  if (template) {
    templateStr = readFileSync(template, 'utf-8');
  }
  try {
    const renderer = {
      renderer: new page.Renderer({
        dev,
        dir,
        dist,
        route,
        template: templateStr,
        packerOption,
      }),
    };
    rendererManager[route] = renderer;
  } catch (exception) {
    console.error(`[page: ${route}] init renderer error:`);
    console.error(exception);
  }
};

export async function render(ctx: BaseContext, { page, dev, dist }: RenderOption): Promise<string> {
  if (rendererManager[page.route] === undefined) {
    await initRenderer(page, { dev, dist });
  }
  return await rendererManager[page.route].renderer.render(ctx);
}
