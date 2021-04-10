import { RendererInterface, RendererOption } from '@riejs/rie';

class Renderer implements RendererInterface {
  public static type = '@riejs/renderer-vue3';
  public static packer = '@riejs/packer-vue3';

  public option: RendererOption;

  private innerRenderer;

  public constructor(option) {
    this.option = option;
  }

  public async render(ctx) {
    const innerRenderer = await this.getInnerRenderer();
    return innerRenderer.render(ctx);
  }

  private async getInnerRenderer() {
    if (this.innerRenderer) {
      return this.innerRenderer;
    }
    if (this.option.dev) {
      const { getDevRenderer } = await import(Renderer.packer).catch((error: Error) => {
        if (error.message.search('Cannot find module') >= 0) {
          /* eslint-disable-next-line no-param-reassign */
          error.message = `${error.message}. Try: npm i -D ${Renderer.packer}`;
        }
        throw error;
      });
      this.innerRenderer = await getDevRenderer({
        rendererType: Renderer.type,
        route: this.option.route,
        dir: this.option.dir,
        template: this.option.template,
        packerOption: this.option.packerOption,
      });
      return this.innerRenderer;
    }
  }
}

export { Renderer };
