<template>
  <div>
    <keep-live>
      <Info v-if="testStatus === true" />
    </keep-live>
    Hello {{time}}
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
  public testStatus = true;
  created() {
    console.log(this.$store.state);
  }
};
</script>

<style>
body {
  background-color: #fdd;
}
</style>
