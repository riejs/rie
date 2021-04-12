<template>
  <div>
    <p v-for="item in items" :key="item">{{ item }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Items extends Vue {
  @Prop()
  items: any[];

  constructor() {
    super();
    console.log({ propItems: this.items });
  }
}
</script>
