<template>
  <section class="container">
    <div style="margin-bottom: 50px;">
      <b-field label="Search items" label-position="on-border" grouped>
        <b-input v-model="itemSearch" expanded icon="magnify"></b-input>
        <p class="control">
          <b-button class="is-success" @click="isNewItemModalActive = true">
            Add new item
          </b-button>
        </p>
        <p class="control">
          <b-button class="is-success" @click="isNewCategoryModalActive = true">
            Add new category
          </b-button>
        </p>
      </b-field>
    </div>
    <Items
      :items="category.items"
      :category="category"
      show-admin-controls
      v-for="category in filteredItems"
      v-bind:key="category._id"
    />

    <b-modal
      v-model="isNewItemModalActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
      scroll="clip"
    >
      <div class="modal-card" style="width: auto;">
        <header class="modal-card-head">
          <p class="modal-card-title">Add new item</p>
          <button
            type="button"
            class="delete"
            @click="isNewItemModalActive = false"
          />
        </header>
        <section class="modal-card-body">
          <b-field label="Item name" label-position="on-border">
            <b-input
              lazy
              required
              type="input"
              validation-message="Invalid item name or item name too long"
              v-model="newItem.name"
              maxlength="80"
            ></b-input>
          </b-field>
          <b-field
            label="Category"
            label-position="on-border"
            style="margin-bottom: 20px;"
          >
            <b-autocomplete
              field="category"
              open-on-focus
              clearable
              v-model="categorySearch"
              @select="option => (newItem.category = option._id)"
              :data="filteredCategories"
            >
              <template slot="header">
                <a @click="isNewCategoryModalActive = true"
                  ><span> Add new... </span></a
                >
              </template>
            </b-autocomplete>
          </b-field>
          <b-field grouped>
            <b-field label="Image" label-position="on-border" expanded>
              <b-input
                lazy
                pattern="https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)"
                required
                type="input"
                v-model="newItem.image"
                validation-message="Invalid image URL"
              ></b-input>
            </b-field>
            <b-field label="Stock" label-position="on-border" expanded>
              <b-input
                lazy
                requried
                type="number"
                v-model="newItem.stock"
                validation-message="Invalid stock value"
              ></b-input>
            </b-field>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button @click="isNewItemModalActive = false">Cancel</b-button>
          <b-button class="is-primary" @click="createNewItem" :loading="loading"
            >Add</b-button
          >
        </footer>
      </div>
    </b-modal>
    <b-modal
      v-model="isNewCategoryModalActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
      scroll="clip"
    >
      <div class="modal-card" style="width: auto;">
        <header class="modal-card-head">
          <p class="modal-card-title">Add new category</p>
          <button
            type="button"
            class="delete"
            @click="isNewCategoryModalActive = false"
          />
        </header>
        <section class="modal-card-body">
          <b-field label="Category name" label-position="on-border">
            <b-input
              lazy
              required
              type="input"
              validation-message="Invalid category  name or category name too long"
              v-model="newCategory.category"
              maxlength="80"
            ></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button @click="isNewCategoryModalActive = false">Cancel</b-button>
          <b-button
            class="is-primary"
            @click="createNewCategory"
            :loading="loading"
            >Add</b-button
          >
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";
import Items from "../components/Items.vue";

@Component({ components: { Items } })
export default class Stocks extends Vue {
  isNewItemModalActive = false;
  isNewCategoryModalActive = false;
  loading = false;
  categorySearch = "";
  itemSearch = "";

  newItem = {
    name: "",
    image: "",
    stock: 0,
    category: ""
  };

  newCategory = {
    category: "",
    items: []
  };

  async createNewCategory() {
    if (!this.newCategory.category) {
      this.$buefy.toast.open({
        message: "Must have valid category name",
        type: "is-danger"
      });

      return;
    }

    try {
      this.loading = true;
      const response = await this.$store.dispatch("createNewCategory", {
        newCategory: this.newCategory
      });

      this.isNewCategoryModalActive = false;
      this.loading = false;
      this.$buefy.toast.open({
        message: response.data.message,
        type: "is-success"
      });
    } catch (err) {
      this.loading = false;
      this.$buefy.toast.open({
        message: err.response.data.message || err.toString(),
        type: "is-danger"
      });
    }
  }

  async createNewItem() {
    if (
      !this.newItem.name ||
      !this.newItem.image ||
      !this.newItem.category ||
      isNaN(this.newItem.stock)
    ) {
      this.$buefy.toast.open({
        message: "Must have valid item name, image, category, and stock",
        type: "is-danger"
      });

      return;
    }

    try {
      this.loading = true;
      const response = await this.$store.dispatch("createNewItem", {
        newItem: this.newItem
      });

      this.isNewItemModalActive = false;
      this.loading = false;
      this.$buefy.toast.open({
        message: response.data.message,
        type: "is-success"
      });
    } catch (err) {
      this.loading = false;
      this.$buefy.toast.open({
        message: err.response.data.message || err.toString(),
        type: "is-danger"
      });
    }
  }

  get itemCategories() {
    return this.$store.state.itemCategories;
  }

  get filteredCategories() {
    return this.itemCategories.filter(({ category }) =>
      category
        .toString()
        .toLowerCase()
        .indexOf(this.categorySearch.toLowerCase() >= 0)
    );
  }

  get filteredItems() {
    return this.itemCategories.map((category) => ({
      ...category,
      items: category.items.filter(({ name }) => (
          name.toLowerCase().includes(this.itemSearch.toLowerCase()) ||
          category.category.toLowerCase().includes(this.itemSearch.toLowerCase())
      ))
    }));
  }

  async beforeCreate() {
    if (!this.$store.state.user.userID) await this.$router.push("/");

    try {
      await this.$store.dispatch("getItemCategories");
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
