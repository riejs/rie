export async function getAsyncData(app) {
  // functional component
  const options = typeof app === 'function' ? app.options : app;
  const { asyncData } = options || {};
  return typeof asyncData === 'function' ? await asyncData() : {};
};

export function getState(app) {
  const options = typeof app === 'function' ? app.options : app;
  return options?.store?.state || null;
}
