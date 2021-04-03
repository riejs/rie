import { createServer } from 'net';

export function isUsablePort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer().listen(port);
    server.on('listening', () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => resolve(false));
  });
};

/**
 * 获取指定区间可用的端口号
 * @param {number} min - 最小端口号
 * @param {number} max - 最大端口号
 * @param {number} maxTryTimes - 最大尝试次数，默认 30
 * @returns {number} 可用的端口，查找失败则返回 -1
 */
export async function getUsablePort(min: number, max: number, maxTimes = 30): Promise<number> {
  if (min <= 0 || max >= 65536) {
    return -1;
  }
  const minPort = Math.max(min, 1);
  const maxPort = Math.min(max, 65535);
  let times = 0;
  while (times < maxTimes) {
    const port = Math.floor(Math.random() * (maxPort - minPort)) + minPort;
    if (await isUsablePort(port)) {
      return port;
    }
    times += 1;
  }
  return -1;
};
