import cp from 'stream-cp';
import { statSync, createReadStream, createWriteStream } from 'fs';

export interface copyPattern {
  from: string;
  to: string;
}

export const copy = async function copy(patterns: copyPattern[]): Promise<boolean[]> {
  const copyTasks = patterns.map(({ from, to }): Promise<boolean> => new Promise((resolve, reject) => {
    const isFile = statSync(from).isFile();
    // 如果是文件，直接复制到目标目录
    if (isFile) {
      createReadStream(from)
        .pipe(createWriteStream(to))
        .on('finish', () => resolve(true))
        .on('error', reject);
    } else {
      cp(
        from,
        to,
        file => file,
        (err) => {
          err ? reject(err) : resolve(true);
        },
      );
    }
  }));
  return Promise.all(copyTasks);
};
