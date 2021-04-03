<template>
  <div>{{ name }} {{ test }}1</div>
</template>

<script lang="ts">
import { user } from "../services/user";
import { Vue } from '@riejs/renderer-vue2';

export default Vue.extend({
  metaInfo: {
    title: "dsada",
  },
  data() {
    return { test: "i" };
  },
  asyncData() {
    return user.getInfo();
  },
  mixins: [
    {
      data: () => ({da: 1234}),
    }
  ],
});
</script>
