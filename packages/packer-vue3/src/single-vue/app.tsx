import { createSSRApp, defineComponent, Suspense } from 'vue';

export function createApp(App) {
  const Root = defineComponent({
    name: 'Root',
    setup: () => (() => (
      <Suspense>
        <App />
      </Suspense>
    )),
  });
  const app = createSSRApp(Root);
  return { app };
}
