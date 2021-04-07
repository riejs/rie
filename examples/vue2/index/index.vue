<template>
  <div>{{ name }} {{ test }}1</div>
</template>

<script lang="ts">
import { getContext } from '@riejs/rie';
import { Vue } from '@riejs/renderer-vue2';
import { user } from "@/services/user";

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
  mounted() {
    console.log(getContext());
  }
});
</script>
