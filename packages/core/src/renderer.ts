/**
 * 渲染器配置
 */
export interface RendererOption {
  /**
   * @member {boolean} dev 当前是否为开发模式，默认false
   */
  dev: boolean;

  /**
   * @member {string} dir 页面所在目录
   */
  dir: string;

  /**
   * @member {string} route 页面路由
   */
  route: string;

  /**
   * @member {string} template 渲染模版
   */
  template: string;

  /**
   * @member {string} template 构建产物目录，非开发模式必传
   */
  dist: string;
}

/**
 * 渲染器接口
 */
export interface RendererInterface {
  /**
   * @member {RendererOption} 渲染器配置
   */
  option: RendererOption;

  /**
   * @member {Function} 渲染接口
   * @param context 渲染上下文
   * @returns 渲染结果
   */
  render(context): Promise<string>;
}

/**
 * 渲染器类
 */
export interface Renderer {
  /**
   * @static 渲染器类型
   */
  type: string;

  /**
   * @static 渲染器依赖的构建器
   */
  packer: string;

  /**
   * 构造函数
   */
  new (option: RendererOption): RendererInterface;
}
