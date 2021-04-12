<template>
  <div>
    Info
  </div>
</template>

<script lang="ts">
import { common } from './mixins';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';

@Component
export default class Info extends mixins(common()) {
  private mounted() {
    console.log('Info mounted');
  }
}
</script>
