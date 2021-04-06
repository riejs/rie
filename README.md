<p align="center">
  <img width="220" src="https://qzonestyle.gtimg.cn/aoi/sola/20210222201100_PfN9K2MNrh.png" alt="RIE">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/node-%3E=10-green.svg" alt="node package">
  <img src="https://img.shields.io/badge/npm-%3E%3D6.0.0-blue" alt="npm package">
  <img src="https://img.shields.io/npm/l/vue.svg" alt="License">
</p>

# RIE

Render it easily(RIE, /raɪ/). 通用服务端渲染(Server Side Render, SSR)方案

## 特性

* 📦 开箱即用：Koa Middleware 方式接入 Koa 、EggJS 服务端项目
* 💡 优雅降级：SSR 失败可以自动降级为 CSR 版本
* 🛠 自动路由：由目录结构自动生成页面路由
* ⚡️ CLI：快速构建

## 接入

### 1. 安装

```shell
# 安装 内核 + Vue2 渲染器
tnpm i @riejs/rie
tnpm i @riejs/renderer-vue2

# 安装 CLI + Vue2 构建器
tnpm i -D @riejs/cli
tnpm i -D @riejs/packer-vue2
```

### 2. 编写入口配置

```ts
// rie.config.ts

import { resolve } from 'path';
import { RieOption } from '@riejs/rie';
import { Renderer as Vue2Renderer } from '@riejs/renderer-vue2';

export const config: RieOption = {
  // 页面集合
  collections: [
    {
      dir: resolve(__dirname, './pages'),
      route: '/',
      Renderer: Vue2Renderer,
    },
  ],
  // 构建产物目录
  dist: '/path/to/dist',
  // 开发模式（可选，默认 false）
  dev: true,
  // 构建产物的 publicPath（可选，默认 /dist）
  publicPath: '/dist',
  // SSR 失败回调
  onError: (error, ctx) => {},
};
```

### 3. 模块引入

```ts
import * as Koa;
import { rie } from '@riejs/rie';
import { config } from './rie.config';

const app = new Koa();
app.use(rie(config));
```

### 4. 打包构建

```shell
npx rie build -c /path/to/rie.config.ts
```
