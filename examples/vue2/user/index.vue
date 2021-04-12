<template>
  <div>
    <keep-live>
      <Info v-if="testStatus === '123'" />
    </keep-live>
    Hello {{time}} {{ test }}
  </div>
</template>

<script lang="ts">
import { Vue } from '@riejs/renderer-vue2';
import Component from 'vue-class-component';
import { store } from './store';
import { mapMutations, mapState } from 'vuex';
import Info from './info.vue';

@Component({
  store,
  metaInfo: {},
  async asyncData() {
    store.commit('setTest', 'on asyncData');
    return { time: Math.random() };
  },
  computed: {
    ...mapState(['test']),
  },
  methods: {
    ...mapMutations(['setTest']),
  },
  components: {
    Info,
  },
})
export default class User extends Vue {
  public name = 'dadas';
  private testStatus = '';
  constructor() {
    super();
    this.testStatus = '123';
  }
};
</script>

<style lang="less">
body {
  background-color: #fdd;
}
.dasta {
  & > .data {
    font-size: 12px;
  }
}
</style>
