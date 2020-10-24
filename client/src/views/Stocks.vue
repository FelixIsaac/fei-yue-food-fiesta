<template>

</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class Counter extends Vue {
  async beforeCreate() {
    if (!this.$store.state.user.userID) await this.$route.push("/");


  }
}
</script>

<style scoped>

</style>
