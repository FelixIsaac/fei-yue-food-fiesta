<template>
  <section class="container">
    <div style="margin: 50px 0;">
      <b-field label="Search order" label-position="on-border" grouped>
        <b-input expanded icon="magnify"></b-input>
        <p class="control">
          <b-button class="is-success" tag="router-link" to="/qrcode-scanner">
            Open QR Code reader
          </b-button>
        </p>
      </b-field>
    </div>
  </section>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class Orders extends Vue {
  beforeCreate() {
    return;
  }
}
</script>

<style scoped>

</style>
