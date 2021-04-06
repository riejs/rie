<template>
  <div>
    Hello {{time}}
  </div>
</template>

<script lang="ts">
import { Vue } from '@riejs/renderer-vue2';
import Component from 'vue-class-component';
import { store } from './store';
import { mapMutations, mapState } from 'vuex';

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
  }
})
export default class User extends Vue {
  name = 'dadas';
  created() {
    console.log(this.$store.state);
  }
};
</script>
