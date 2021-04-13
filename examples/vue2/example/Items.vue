<template>
  <div>
    <p v-for="item in items" :key="item">{{ item }} - {{ activeTab }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Items extends Vue {
  @Prop()
  items: any[];

  activeTab = this.items.findIndex(tab => tab === 'info');

  constructor() {
    super();
  }

  mounted() {
    console.log('32132132432432432432');
  }
}
</script>
