import { resolve } from 'path';
import * as Koa from 'koa';
import * as mount from 'koa-mount';
import * as serve from 'koa-static';
import { rie } from '@riejs/rie';
import { config } from './config';

const app = new Koa();
const port = 3000;

const staticServerMiddleware = mount(config.publicPath || '/dist/', serve(resolve(config.dist, './client')));
app.use(staticServerMiddleware);
app.use(rie(config));

app.listen(port, () => {
  console.log(`The dev-server is running at http://127.0.0.1:${port}`);
});
