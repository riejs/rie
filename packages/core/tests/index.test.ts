import { resolve } from 'path';
import * as Koa from 'koa';
import * as request from 'request-promise';
import { rie } from '../src/index';
import { RendererInterface, RendererOption } from '../src/renderer';

class MockRender implements RendererInterface {
  public static type = 'mocker';
  public static packer = 'mocker';
  public option: RendererOption;

  public constructor(option: RendererOption) {
    this.option = option;
  }
  public async render() {
    if (this.option.route.includes('/user')) {
      throw new Error('mock render error');
    }
    return 'mock render result';
  }
}

describe('Index rie test', () => {
  const app = new Koa();
  const port = 12345;
  let server;
  beforeAll(async () => {
    await new Promise((res) => {
      server = app.listen(port, () => res(true));
    });
  });
  afterAll(() => server.close());

  it('invoke rie with dev mode', async () => {
    const middleware = rie({
      collections: [{ dir: resolve(__dirname, '../../../examples/vue2'), Renderer: MockRender }],
      dev: true,
    });
    app.use(middleware);

    const res = await request(`http://localhost:${port}`);
    expect(res).toBe('mock render result');

    const noFoundRes = await request(`http://localhost:${port}/no-exist-route`).catch(res => res);
    expect(noFoundRes.statusCode).toBe(404);

    const errorRes = await request(`http://localhost:${port}/user`).catch(res => res);
    expect(errorRes.statusCode).toBe(500);
    expect(errorRes.error).toContain('at MockRender.render');
  });

  it('invoke rie with production mode', async () => {
    const middleware = rie({
      collections: [{ dir: resolve(__dirname, '../../../examples/vue2'), Renderer: MockRender, route: '/test' }],
      onError() {},
    });
    app.use(middleware);

    const res = await request(`http://localhost:${port}/test`);
    expect(res).toBe('mock render result');

    const noFoundRes = await request(`http://localhost:${port}/test/no-exist-route`).catch(res => res);
    expect(noFoundRes.statusCode).toBe(404);

    const errorRes = await request(`http://localhost:${port}/test/user`).catch(res => res);
    expect(errorRes.statusCode).toBe(500);
    expect(errorRes.error).toBe('internal error');
  });

  it('invoke rie with null or undefined or empty array', () => {
    try {
      rie(null);
    } catch (exception) {
      expect(exception.message).toMatch(/Cannot destructure property .* of 'undefined' or 'null'./);
    }
    try {
      rie(undefined);
    } catch (exception) {
      expect(exception.message).toMatch(/Cannot destructure property .* of 'undefined' or 'null'./);
    }
    try {
      rie({ collections: [] });
    } catch (exception) {
      expect(exception.message).toEqual('pageDirs must be a nonempty array');
    }
  });
});
