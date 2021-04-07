import { createHook, executionAsyncId } from 'async_hooks';

/**
 * Store context info between async functions
 */
export class AsyncLocalStorage<T> {
  private storeMap: Map<Number, T>;

  public constructor() {
    this.storeMap = new Map();
    this.createHook();
  }

  public run(store: T, callback) {
    this.storeMap.set(executionAsyncId(), store);
    return callback();
  }

  public getStore() {
    return this.storeMap.get(executionAsyncId());
  }

  private createHook() {
    const hook = createHook({
      init: (asyncId, type, triggerAsyncId) => {
        if (this.storeMap.has(triggerAsyncId)) {
          this.storeMap.set(asyncId, this.storeMap.get(triggerAsyncId));
        }
      },
      destroy: (asyncId) => {
        this.storeMap.delete(asyncId);
      },
    });
    hook.enable();
  }
}
