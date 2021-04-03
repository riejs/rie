import { resolve } from 'path';
import { scanPages, matchPage } from '../src/route';
import { RendererInterface, RendererOption } from '../src/renderer';

class MockRender implements RendererInterface {
  public static type = 'mocker';
  public static packer = 'mocker';
  public option: RendererOption;

  public constructor(option: RendererOption) {
    this.option = option;
  }
  public async render() {
    return '';
  }
}

describe('Route scanPages test', () => {
  it('invoke scanPages', () => {
    const pages = scanPages([{ dir: resolve(__dirname, '../../../examples/vue2'), Renderer: MockRender }]);
    expect(pages.length).toBeGreaterThan(0);

    const twicePages = scanPages([
      { dir: resolve(__dirname, '../../../examples/vue2'), Renderer: MockRender },
      { dir: resolve(__dirname, '../../../examples/vue2'), Renderer: MockRender },
    ]);
    expect(twicePages.length).toEqual(pages.length);
  });
});

describe('Route matchPage test', () => {
  it('invoke matchPage', () => {
    const pages = scanPages([{ dir: resolve(__dirname, '../../../examples/vue2'), Renderer: MockRender }]);
    expect(matchPage(pages, '/')).toBeTruthy();
    expect(matchPage(pages, '/index')).toBeTruthy();
    expect(matchPage(pages, '/index/')).toBeTruthy();
    expect(matchPage(pages, '/user')).toBeTruthy();
    expect(matchPage(pages, '/user/123')).toBeTruthy();
    expect(matchPage(pages, '/user123')).toBeNull();

    const preFixPages = scanPages([
      { dir: resolve(__dirname, '../../../examples/vue2'), Renderer: MockRender, route: '/acts/' },
    ]);
    expect(matchPage(preFixPages, '/acts')).toBeTruthy();
    expect(matchPage(preFixPages, '/acts/')).toBeTruthy();
    expect(matchPage(preFixPages, '/acts/index')).toBeTruthy();
    expect(matchPage(preFixPages, '/acts/index/')).toBeTruthy();
    expect(matchPage(preFixPages, '/acts/user')).toBeTruthy();
    expect(matchPage(preFixPages, '/acts/user/123')).toBeTruthy();
    expect(matchPage(preFixPages, '/index')).toBeNull();
  });
});
