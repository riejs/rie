import { clientFetch } from '@riejs/rie';

class UserServices {
  @clientFetch({
    url: '/ddd/dsadas',
  })
  public getInfo() {
    return {
      name: 'test',
    };
  }

  public getCommon() {}
}

export const user = new UserServices();
