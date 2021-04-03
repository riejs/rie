import { createApp } from './app';
import { getAsyncData } from './async-data';

/* eslint-disable no-param-reassign */
export default async (context) => {
  const data = await getAsyncData(context.app);
  const { app } = createApp(context, data);
  context.meta = app.$meta();
  context.asyncData = data;
  return app;
};
