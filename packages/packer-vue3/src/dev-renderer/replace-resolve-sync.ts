/**
 * Vite use 'resolve module' for looking for the location of packages.
 * The module will replace the sync method of 'resolve module'.
 * To locate some unresolved packages from this package's node_modules.
 */
import { resolve as pathResolve } from 'path';
import * as resolve from 'resolve';

try {
  const vitePath = resolve.sync('vite', { basedir: __dirname });
  const resolvePath = resolve.sync('resolve', { basedir: vitePath });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const preResolve = require(resolvePath);
  const { sync } = preResolve;

  // replace sync method
  preResolve.sync = (...args) => {
    const [id, options = {}] = args;
    try {
      return sync(id, {
        ...options,
        basedir: pathResolve(__dirname, '../../node_modules'),
      });
    } catch {}
    return sync(id, options);
  };
} catch (exception) {
  console.error('@riejs/packer-vue3 replace resolve.sync error:');
  console.error(exception);
}
