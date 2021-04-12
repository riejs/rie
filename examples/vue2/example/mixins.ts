import { Vue } from '@riejs/renderer-vue2';
import { Component } from 'vue-property-decorator';

export function common() {
  @Component
  class Main extends Vue {
    private mounted() {
      console.log('mixin mounted');
    }
  }
  return Main;
}
