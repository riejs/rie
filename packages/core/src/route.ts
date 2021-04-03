import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Renderer } from './renderer';

/**
 * 页面集合，对应多个页面
 */
export interface PageCollection {
  /**
   * @member {string} dir 页面集合所在路径
   */
  dir: string;

  /**
   * @member {Render} Renderer 依赖的渲染器
   */
  Renderer: Renderer;

  /**
   * @member {string} route 路由前缀（默认 '/'），e.g. 集合中包含 'user' 页面，则 /user 可以访问到该页面
   */
  route?: string;

  /**
   * @member {string} template 自定义渲染模版的路径
   */
  template?: string;
}

/**
 * 页面
 */
export interface Page {
  /**
   * @member {string} dir 单个页面所在路径
   */
  dir: string;

  /**
   * @member {string} route 页面路由
   */
  route: string;

  /**
   * @member {string} template 自定义渲染模版
   */
  template: string;

  /**
   * @member {Renderer} Renderer 所依赖的渲染器
   */
  Renderer: Renderer;
}

// 保留目录名
const preserveDirs = ['components', 'assets', 'layout', 'utils', 'static', 'services'];

/**
 * 页面目录扫描
 * @param {Array<PageDir>} collections - 页面集合列表
 * @returns {Array<Page>} 扫描到的页面列表
 */
export function scanPages(collections: PageCollection[]): Page[] {
  const pages: Page[] = [];
  const pageMap = {};
  collections.forEach((pageDir) => {
    const { dir, Renderer, route = '', template = '' } = pageDir;
    const connector = route.match(/\/$/) ? '' : '/';
    readdirSync(dir, { withFileTypes: true })
      .filter(sub => sub.isDirectory() && preserveDirs.indexOf(sub.name) < 0)
      .forEach((sub) => {
        const page = `${route}${connector}${sub.name}`;
        if (pageMap[page] === undefined) {
          pageMap[page] = true;
          pages.push({
            Renderer,
            template,
            dir: resolve(dir, sub.name),
            route: page,
          });
        }
      });
  });
  return pages;
}

/**
 * 路由-页面匹配
 * @param {Array<Page>} pages - 页面列表
 * @param {string} route - 当前访问路由
 * @returns {Page|null} 返回匹配到的页面，为 null 则没匹配到
 */
export function matchPage(pages: Page[], route: string): Page | null {
  /**
   * 当前路由为 /foo/* ，会匹配到页面 /foo
   */
  const target = pages.find(page => new RegExp(`^${page.route}\\b\\/?`).exec(route));
  if (target) {
    return target;
  }

  /**
   * 当前路由为 / ，会匹配到页面 /index
   */
  const connector = route.match(/\/$/) ? '' : '/';
  const indexPage = `${route}${connector}index`;
  return pages.find(page => page.route === indexPage) || null;
}
