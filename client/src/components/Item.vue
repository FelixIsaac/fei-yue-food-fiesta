<template>
  <div class="card">
    <div class="card-image">
      <figure class="image">
        <img :src="item.image" :alt="`${item.name} image`" />
      </figure>
    </div>
    <p class="card-header-title">{{ item.name }} ({{ category.category }})</p>
    <div class="card-content">
      <b-field v-if="showAdminControls">
        <b-numberinput
          lazy
          min="0"
          v-model.lazy="stock"
          :icon="stock === 0 ? 'exclamation-circle' : stock <= 20 ? 'exclamation-triangle' : ''"
          icon-pack="fas"
        />
      </b-field>
      <div class="content" v-else>{{ stock }} remaining</div>
    </div>
    <footer class="card-footer" v-if="showAdminControls">
      <a class="card-footer-item" @click="isEditModalActive = true">Edit</a>
      <a class="card-footer-item" @click="isDeleteModalActive = true">Delete</a>

      <b-modal
        v-model="isEditModalActive"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-modal
        scroll="clip"
      >
        <div class="modal-card" style="width: auto;">
          <header class="modal-card-head">
            <p class="modal-card-title">Editing {{ item.name }}</p>
            <button
              type="button"
              class="delete"
              @click="isEditModalActive = false"
            />
          </header>
          <section class="modal-card-body">
            <b-field label="Item name" label-position="on-border">
              <b-input
                lazy
                required
                type="input"
                validation-message="Invalid item name or item name too long"
                v-model="editFormProps.name"
                maxlength="80"
              ></b-input>
            </b-field>
            <b-field label="Category" label-position="on-border" style="margin-bottom: 20px;">
              <b-autocomplete
                field="category"
                open-on-focus
                clearable
                v-model="categorySearch"
                @select="option => (editFormProps.category = option._id)"
                :data="filteredCategories"
                ref="autocomplete"
              >
                <template slot="header">
                  <a @click="isNewCategoryModalActive = true"><span> Add new... </span></a>
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
                  v-model="editFormProps.image"
                  validation-message="Invalid image URL"
                ></b-input>
              </b-field>
              <b-field label="Stock" label-position="on-border" expanded>
                <b-input
                  lazy
                  requried
                  type="number"
                  v-model="editFormProps.stock"
                  validation-message="Invalid stock value"
                ></b-input>
              </b-field>
            </b-field>
          </section>
          <footer class="modal-card-foot">
            <b-button @click="isEditModalActive = false">Cancel</b-button>
            <b-button class="is-primary" @click="editItem()" :loading="loading">Edit</b-button>
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
            <b-button class="is-primary" @click="createNewCategory()" :loading="loading">Add</b-button>
          </footer>
        </div>
      </b-modal>
      <b-modal
        v-model="isDeleteModalActive"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        :can-cancel="false"
        aria-role="dialog"
        aria-modal
      >
        <div class="modal-card" style="width: auto;">
          <header class="modal-card-head">
            <p class="modal-card-title">Delete {{ item.name }}?</p>
            <button
              type="button"
              class="delete"
              @click="isDeleteModalActive = false"
            />
          </header>
          <section class="modal-card-body">
            Are you sure you want to delete <strong>{{ item.name }}</strong>? You cannot restore this item
            back once it is deleted.
          </section>
          <footer class="modal-card-foot">
            <button
              class="button"
              type="button"
              @click="isDeleteModalActive = false"
            >
              Oops, accident
            </button>
            <b-button class="is-danger" :loading="loading" @click="deleteItem()">
              Yes, please delete
            </b-button>
          </footer>
        </div>
      </b-modal>
    </footer>
  </div>
</template>

<script>
import { Vue, Component, Watch } from "vue-property-decorator";

@Component({
  props: {
    item: {
      name: String,
      image: String,
      stock: Number
    },
    category: {},
    showAdminControls: Boolean
  }
})
export default class Item extends Vue {
  stock = this.$props.item.stock;
  isEditModalActive = false;
  editFormProps = { ...this.$props.item };
  categorySearch = "";
  isDeleteModalActive = false;
  isNewCategoryModalActive = false;
  loading = false;

  newCategory = {
    category: "",
    items: []
  }

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
      const response = await this.$store.dispatch("createNewCategory", { newCategory: this.newCategory });

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
  };

  async editItem() {
    if (
      !this.editFormProps.name ||
      !this.editFormProps.image ||
      isNaN(this.editFormProps.stock) ||
      !this.editFormProps.category
    ) {
      this.$buefy.toast.open({
        message: "Must have valid item name, image, stock, and category",
        type: "is-danger"
      });

      return;
    }

    try {
      this.loading = true;
      const responses = [];

      if (this.item.name !== this.editFormProps.name) (
        responses.push(await this.$store.dispatch("updateItemName", {
          category: this.category._id,
          item: this.editFormProps._id,
          name: this.editFormProps.name
        }))
      )

      if (this.item.stock !== this.editFormProps.stock) {
        this.stock = parseInt(this.editFormProps.stock);
        responses.push({ data: { message: "Updated stock" } });
      };

      if (this.item.image !== this.editFormProps.image) (
        responses.push(await this.$store.dispatch("updateItemImage", {
          category: this.category._id,
          item: this.editFormProps._id,
          image: this.editFormProps.image
        }))
      )

      if (this.item.category !== this.editFormProps.category) (
        responses.push(await this.$store.dispatch("updateItemCategory", {
          category: this.category._id,
          item: this.editFormProps._id,
          newCategory: this.editFormProps.category
        }))
      )

      this.isEditModalActive = false;
      this.loading = false;

      if (responses.length)
        this.$buefy.toast.open({
          message: responses.map(({ data }) => data.message).join(", "),
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

  async deleteItem() {
    this.loading = true;

    await this.$store.dispatch("deleteItem", {
      category: this.category._id,
      item: this.item._id
    });

    this.loading = false;
    this.isDeleteModalActive = false;
  }

  get filteredCategories() {
    return this.$store.state.itemCategories.filter(({ category }) => (
      category.toString().toLowerCase().indexOf(this.categorySearch.toLowerCase()) >= 0
    ));
  }

  @Watch("stock")
  updateStock(newStock) {
    this.editFormProps.stock = newStock;
    return this.$store.dispatch("updateItemStock", {
      category: this.category._id,
      item: this.item._id,
      stock: newStock
    });
  }

  @Watch("isEditModalActive")
  async onEditModalActive() {
    setTimeout(() => this.$refs.autocomplete.value = this.category.category, 0)
  }
}
</script>

<style>
.fa-exclamation-triangle {
  color: #ffb957;
}

.fa-exclamation-circle {
  color: #f14668;
}
</style>
