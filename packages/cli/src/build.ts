import { existsSync } from 'fs';
import { resolve } from 'path';
import { RieOption } from '@riejs/rie';
import { scanPages, Page } from '@riejs/rie/lib/route';

type Config = RieOption | { default?: RieOption; config?: RieOption };

const isRieOption = function isRieOption(option): option is RieOption {
  return Array.isArray(option.collections);
};

const normalizeConfig = function normalizeConfig(config: Config): RieOption {
  if (isRieOption(config)) {
    return config;
  }
  if (config.default && isRieOption(config.default)) {
    return config.default;
  }
  if (config.config && isRieOption(config.config)) {
    return config.config;
  }
  throw new Error('Cannot find rie option.');
};

export const build = async function build({ config: configPath = '', mode = 'production' }) {
  const cwd = process.cwd();
  let fullConfigPath = configPath ? resolve(cwd, configPath) : '';
  const jsConfigFile = resolve(cwd, './rie.config.js');
  const tsConfigFile = resolve(cwd, './rie.config.ts');

  const hasCustomConfig = fullConfigPath ? existsSync(fullConfigPath) : false;
  if (!hasCustomConfig && !existsSync(jsConfigFile) && !existsSync(tsConfigFile)) {
    console.log(`rie build error: no such config file ${fullConfigPath || jsConfigFile}`);
    console.log('usage: rie build -c /path/to/config');
    process.exit(-1);
  }

  fullConfigPath = fullConfigPath || jsConfigFile || tsConfigFile;
  let option: RieOption;
  const isTsFile = fullConfigPath.match(/\.ts$/);
  try {
    isTsFile && (await import('ts-node/register'));
    const config = await import(fullConfigPath);
    option = normalizeConfig(config);
  } catch (exception) {
    const message = exception.message || '';
    if (isTsFile && message.search('Cannot find module') >= 0) {
      console.error('rie build error: import a ts config file.');
      console.error('please install these packages: npm i -D typescript ts-node');
    } else {
      console.error(exception);
    }
    process.exit(-1);
  }

  const pages = scanPages(option.collections);
  const packerMap: { [packer: string]: Page[] } = {};
  pages.forEach((page) => {
    packerMap[page.Renderer.packer] = packerMap[page.Renderer.packer] || [];
    packerMap[page.Renderer.packer].push(page);
  });
  const packers = Object.keys(packerMap);
  await Promise.all(packers.map(async (packer) => {
    try {
      const { Packer } = await import(packer);
      await new Packer({
        mode,
        pages: packerMap[packer],
        dist: option.dist,
        publicPath: option.publicPath || '/dist/',
      }).build();
    } catch (exception) {
      if (exception.message.search('Cannot find module') >= 0) {
        /* eslint-disable-next-line no-param-reassign */
        exception.message = `${exception.message}. Try: npm i -D ${packer}`;
      }
      throw exception;
    }
  }));
  console.log('rie build finished.');
};
