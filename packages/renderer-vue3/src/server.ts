import { RendererInterface, RendererOption } from '@riejs/rie';

class Renderer implements RendererInterface {
  public static type = '@riejs/renderer-vue3';
  public static packer = '@riejs/packer-vue3';

  public option: RendererOption;

  private innerRenderer;
  private waiting: Promise<void>;

  public constructor(option) {
    this.option = option;
    this.initInnerRenderer();
  }

  public async render(ctx) {
    const innerRenderer = await this.getInnerRenderer();
    return innerRenderer.render(ctx);
  }

  private initInnerRenderer() {
    this.waiting = import(Renderer.packer)
      .catch((error: Error) => {
        if (error.message.search('Cannot find module') >= 0) {
          /* eslint-disable-next-line no-param-reassign */
          error.message = `${error.message}. Try: npm i -D ${Renderer.packer}`;
        }
        throw error;
      })
      .then(({ getDevRenderer }) => getDevRenderer({
        rendererType: Renderer.type,
        route: this.option.route,
        dir: this.option.dir,
        template: this.option.template,
        packerOption: this.option.packerOption,
      }))
      .then(innerRenderer => this.innerRenderer = innerRenderer);
  }

  private async getInnerRenderer() {
    if (this.innerRenderer) {
      return this.innerRenderer;
    }
    await this.waiting;
    return this.innerRenderer;
  }
}

export { Renderer };
