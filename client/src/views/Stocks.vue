<template>
  <section class="container">
    <div v-for="category in itemCategories" v-bind:key="category._id">
      <Items :items="category.items" :category="category" show-admin-controls />
    </div>
  </section>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";
import Items from "../components/Items.vue";

@Component({ components: { Items } })
export default class Counter extends Vue {
  get itemCategories() {
    return this.$store.state.itemCategories;
  }

  async beforeCreate() {
    if (!this.$store.state.user.userID) await this.$route.push("/");
    await this.$store.dispatch("getItemCategories");
  }
}
</script>

<style scoped></style>
