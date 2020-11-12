<template>
  <section class="container">
    <div style="margin-bottom: 50px;">
      <b-field label="Search items" label-position="on-border">
        <b-input v-model="itemSearch" expanded icon="magnify"></b-input>
      </b-field>
    </div>
    <Items
      v-for="category in filteredItems"
      v-bind:key="category._id"
      :items="category.items"
      :category="category"
      selectable
    />
  </section>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";
import Items from "../components/Items.vue";

@Component({ components: { Items } })
export default class SelectItems extends Vue {
  loading = false;
  itemSearch = "";

  get itemCategories() {
    return this.$store.state.itemCategories;
  }

  get filteredItems() {
    return this.itemCategories.map((category) => ({
      ...category,
      items: category.items.filter(({ name, stock }) => ((
          name.toLowerCase().includes(this.itemSearch.toLowerCase()) ||
          category.category.toLowerCase().includes(this.itemSearch.toLowerCase())
        ) && stock
      ))
    }));
  }

  async beforeCreate() {
    try {
      await this.$store.dispatch("getItemCategories");
      await this.$store.commit(
        "SET_SELECTED_ITEMS",
        (await this.$store.dispatch("getUser", {})).items
      );
    } catch (err) {
      this.loading = false;
      this.$buefy.toast.open({
        message: err.response.data.message || err.toString(),
        type: "is-danger"
      });
    }
  }
}
</script>
