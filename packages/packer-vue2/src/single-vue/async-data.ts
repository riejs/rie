export const getAsyncData = async function getAsyncData(app) {
  // functional component
  const options = typeof app === 'function' ? app.options : app;
  const { asyncData } = options;
  return typeof asyncData === 'function' ? await asyncData() : {};
};
