<template>
  <h1>{{ name }}</h1>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  props: {
    name: String,
    image: String,
    stock: Number,
    category: String
  }
})
export default class Counter extends Vue {

}
</script>

<style scoped>

</style>
