<template>
  <div class="columns is-multiline">
    <div class="column is-one-quarter" v-for="item in items" v-bind:key="item._id">
      <Item
        :item="item"
        :category="category"
        :show-admin-controls="showAdminControls"
      />
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";
import Item from "./Item.vue";

@Component({ props: { items: Array, category: {}, showAdminControls: Boolean }, components: { Item } })
export default class Counter extends Vue {}
</script>
