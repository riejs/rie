import { clientFetch, getContext } from '@riejs/rie';

class UserServices {
  @clientFetch({
    url: '/ddd/dsadas',
  })
  public getInfo() {
    const context = getContext();
    return {
      name: 'test',
      ...context.query,
    };
  }

  public getCommon() {}
}

export const user = new UserServices();
