<p align="center">
  <img width="220" src="https://qzonestyle.gtimg.cn/aoi/sola/20210222201100_PfN9K2MNrh.png" alt="RIE">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/node-%3E=10-green.svg" alt="node package">
  <img src="https://img.shields.io/badge/npm-%3E%3D6.0.0-blue" alt="npm package">
  <img src="https://img.shields.io/npm/l/vue.svg" alt="License">
</p>

# RIE

> Render it easily(RIE, /raɪ/). 通用同构服务端渲染方案

## 特性

* 📦 开箱即用：npm package 方式快速接入 Koa 、EggJS 服务端项目
* 💡 多渲染场景：渲染器插件化，支持 Vue 2.0，支持渐进式升级
* 🛠 自动路由：由目录结构自动生成页面路由
* ⚡️ CLI：快速构建

## 快速接入

### 1. 安装

```shell
tnpm i @riejs/rie

# 安装渲染器，支持 Vue2
tnpm i @riejs/renderer-vue2

# 安装构建器和CLI工具
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
  collections: [
    {
      dir: resolve(__dirname, './pages'),
      route: '/',
      Renderer: Vue2Renderer,
    },
  ],
  dev: true,
};
```

### 3. 模块引入

```ts
import { rie } from '@riejs/rie';
import { config } from './rie.config';

app.use(rie(config));
```

### 4. 打包构建

```shell
npx rie build
```
