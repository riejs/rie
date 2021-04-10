import { DevRenderer } from './dev-renderer/dev-renderer';

export async function getDevRenderer(option): Promise<DevRenderer> {
  const renderer =  new DevRenderer(option);
  await renderer.initDevServer();
  return renderer;
}
