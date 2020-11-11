<template>
  <div>
    <section class="hero" v-if="items.length">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            {{ category.category }} category
          </h1>
          <h2 class="subtitle">
            Items under {{ category.category.toLowerCase() }}
          </h2>
        </div>
      </div>
    </section>
    <div class="columns is-multiline">
      <div class="column is-one-quarter" v-for="item in items" v-bind:key="item._id">
        <Item
          :item="item"
          :category="category"
          :show-admin-controls="showAdminControls"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";
import Item from "./Item.vue";

@Component({ props: { items: Array, category: {}, showAdminControls: Boolean }, components: { Item } })
export default class Items extends Vue {}
</script>
