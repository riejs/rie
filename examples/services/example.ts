import { clientFetch } from '@riejs/rie';

class ExampleServices {
  @clientFetch({ url: '/api/example' })
  getExampleData() {
    return { info: 'example in services' };
  }
};

export const exampleServices = new ExampleServices();
