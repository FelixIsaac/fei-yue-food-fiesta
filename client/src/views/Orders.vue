<template>
  <section class="container">
    <div style="margin: 50px 0;">
      <b-field label="Search order" label-position="on-border" grouped>
        <b-input expanded icon="magnify"></b-input>
        <p class="control">
          <b-button class="is-success" @click="isQRCodeReaderActive = true">
            Open QR Code reader
          </b-button>
        </p>
      </b-field>
    </div>

    <b-modal
      v-model="isQRCodeReaderActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
      scroll="clip"
    >
      <div class="modal-card" style="width: auto;">
        <header class="modal-card-head">
          <p class="modal-card-title">QR Code reader</p>
          <button
            type="button"
            class="delete"
            @click="isQRCodeReaderActive = false"
          />
        </header>
        <section class="modal-card-body">
          <qrcode-drop-zone @decode="onDecode" @init="logErrors">
            <qrcode-stream @decode="onDecode" @init="onInit" :camera="camera"> </qrcode-stream>
          </qrcode-drop-zone>
        </section>
        <footer class="modal-card-foot">
          <b-button @click="isQRCodeReaderActive = false">Close</b-button>
          <b-button @click="isCodeModalActive = true" class="is-primary is-light">Use code instead</b-button>
          <qrcode-drop-zone @decode="onDecode" @init="logErrors">
            <div class="field file is-primary">
              <label class="upload control file-label">
                <span class="file-cta">
                  <span class="icon file-icon">
                    <i class="mdi mdi-upload mdi-24px" />
                  </span>
                  <span class="file-label">
                    Select picture from device
                  </span>
                </span>
                <qrcode-capture @decode="onDecode" />
              </label>
            </div>
          </qrcode-drop-zone>
        </footer>
      </div>
    </b-modal>
    <b-modal
      v-model="isCodeModalActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
      scroll="clip"
    >
      <div class="modal-card" style="width: auto; min-width: 400px;">
        <header class="modal-card-head">
          <p class="modal-card-title">Input code to retrieve order</p>
          <button
            type="button"
            class="delete"
            @click="isCodeModalActive = false"
          />
        </header>
        <section class="modal-card-body">
          <form>
            <b-field label="Code">
              <b-input v-model="code" />
            </b-field>
          </form>
        </section>
        <footer class="modal-card-foot">
          <b-button @click="isCodeModalActive = false">Close</b-button>
          <b-button @click="getTokenFromUserID" class="is-primary">
            Retrieve order
          </b-button>
        </footer>
      </div>
    </b-modal>
    <b-modal
      v-model="order.items.length"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
      scroll="clip"
    >
      <div class="modal-card" style="width: auto; min-width: 500px;">
        <header class="modal-card-head">
          <p class="modal-card-title">Order #{{ order.user.id }}</p>
          <button
            type="button"
            class="delete"
            @click="isCodeModalActive = false"
          />
        </header>
        <section class="modal-card-body">
          {{ order.user.fullName }}'s order

        </section>
        <footer class="modal-card-foot">
          <b-button @click="order = { user: { fullName: '', id: '' }, items: [] }">Cancel</b-button>
          <b-button @click="retrieveOrder" class="is-primary">
            Retrieve order
          </b-button>
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'

@Component({
  components: {
    QrcodeStream,
    QrcodeDropZone,
    QrcodeCapture
  }
})
export default class Orders extends Vue {
  isQRCodeReaderActive = false;
  isCodeModalActive = false;
  code = "";
  camera = "auto";
  order = { user: { fullName: "", id: "" }, items: [] };

  async getTokenFromUserID(userID) {
    await this.getItems((await this.$store.dispatch("getQRCode", { userID })).orderToken);
    this.isCodeModalActive = false;
  }

  async getItems(token) {
    this.order = await this.$store.dispatch("readQRCode", { token });
  }

  async retrieveOrder() {
    return 0;
  }

  async onDecode(result) {
    this.toggleCamera();
    await this.getItems(result);
  }

  toggleCamera() {
    switch(this.camera) {
      case "auto":
        this.camera = "off";
        break;
      case "off":
        this.camera = "auto";
        break;
    }
  }

  logErrors(promise) {
    promise.catch(console.error);
  }

  async onInit(promise) {
    try {
      await promise;
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        this.error = "ERROR: you need to grant camera access permisson";
      } else if (error.name === 'NotFoundError') {
        this.error = "ERROR: no camera on this device";
      } else if (error.name === 'NotSupportedError') {
        this.error = "ERROR: secure context required (HTTPS, localhost)";
      } else if (error.name === 'NotReadableError') {
        this.error = "ERROR: is the camera already in use?";
      } else if (error.name === 'OverconstrainedError') {
        this.error = "ERROR: installed cameras are not suitable";
      } else if (error.name === 'StreamApiNotSupportedError') {
        this.error = "ERROR: Stream API is not supported in this browser";
      }
    }
  }

  beforeCreate() {
    return;
  }
}
</script>

<style scoped>

</style>
