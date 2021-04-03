import { resolve } from 'path';
import { render } from '../src/render';
import { RendererInterface, RendererOption } from '../src/renderer';

class MockRender implements RendererInterface {
  public static type = 'mocker';
  public static packer = 'mocker';
  public option: RendererOption;

  public constructor(option: RendererOption) {
    this.option = option;
  }
  public async render() {
    return this.option.template || 'defalut template';
  }
}

describe('Render render test', () => {
  it('invoke render without custom template', async () => {
    const content = await render({} as any, {
      page: { dir: '', route: '/1', template: '', Renderer: MockRender },
      dev: true,
      dist: '',
    });
    expect(content).toContain('defalut template');
  });

  it('invoke render with custom template', async () => {
    const content = await render({} as any, {
      page: {
        dir: '',
        route: '/2',
        template: resolve(__dirname, '../../../examples/vue2/custom.template.html'),
        Renderer: MockRender,
      },
      dev: true,
      dist: '',
    });
    expect(content).toContain('custom template');
  });
  it('invoke render with custom template again', async () => {
    const content = await render({} as any, {
      page: {
        dir: '',
        route: '/2',
        template: resolve(__dirname, '../../../examples/vue2/custom.template.html'),
        Renderer: MockRender,
      },
      dev: true,
      dist: '',
    });
    expect(content).toContain('custom template');
  });
});
