<template>
  <div>
    <keep-alive>
      <Info v-if="tab === 'info'"/>
      <Contact v-if="tab === 'contact'" />
    </keep-alive>
    Example info {{ info }}
    <div>
      <button v-for="item in tabs" :key="item" style="margin-right: 12px;" @click="switchTab(item)">
        show {{item}}
      </button>
    </div>
    <Items :items="tabs" />
  </div>
</template>

<script lang="ts">
import { getContext } from '@riejs/rie';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';
import { common } from './mixins';
import Info from './info.vue';
import Contact from './contact.vue';
import Items from './Items.vue';
import { exampleServices } from '../../services/example';

@Component({
  metaInfo: {
    title: 'data',
  },
  async asyncData() {
    return exampleServices.getExampleData();
  },
  components: {
    Info,
    Contact,
    Items,
  },
})
export default class Example extends mixins(common()) {
  private tabs = ['info', 'contact', 'address'];
  private tab = this.tabs.find(tab => getContext().query.tab === tab) ?? 'info';

  public switchTab(tab) {
    this.tab = tab;
  }
}
</script>
