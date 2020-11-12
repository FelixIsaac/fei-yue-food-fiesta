<template>
  <section class="container">
    <div style="margin: 50px 0;">
      <b-field label="Search order" label-position="on-border" grouped>
        <b-input expanded icon="magnify" v-model="orderQuery" />
        <p class="control">
          <b-button class="is-success" @click="isQRCodeReaderActive = true">
            Open QR Code reader
          </b-button>
        </p>
      </b-field>
    </div>
    <b-table
      :data="formattedOrders"
      striped
      detailed
      mobile-cards
      show-detail-icon
    >
      <b-table-column
        field="orderID"
        label="Order ID"
        width="40"
        v-slot="props"
      >
        #{{ props.row.orderID }}
      </b-table-column>
      <b-table-column field="items" label="Items" v-slot="props">
        <span v-for="item in props.row.items" :key="item._id">
          {{ item.name }} <strong>({{ item.category.category }})</strong>,
        </span>
      </b-table-column>
      <b-table-column field="fullName" label="Full name" v-slot="props">
        {{ props.row.fullName }}
      </b-table-column>
      <b-table-column label="Actions" v-slot="props">
        <b-button class="is-success" @click="() => complete(props.row.orderID)">Complete</b-button>
        <b-button class="is-danger" @click="() => remove(props.row.orderID)">Remove</b-button>
      </b-table-column>
      <template slot="detail" slot-scope="props">
        <div class="columns is-multiline">
          <div
            class="column is-one-quarter"
            v-for="item in props.row.items"
            :key="item._id"
          >
            <Item :item="item" :category="item.category" />
          </div>
        </div>
      </template>
    </b-table>
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
            <qrcode-stream @decode="onDecode" @init="onInit" :camera="camera">
            </qrcode-stream>
          </qrcode-drop-zone>
        </section>
        <footer class="modal-card-foot">
          <b-button @click="isQRCodeReaderActive = false">Close</b-button>
          <b-button
            @click="isCodeModalActive = true"
            class="is-primary is-light"
            >Use code instead</b-button
          >
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
      v-model="order.modal"
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
            @click="order = { ...order, modal: false }"
          />
        </header>
        <section class="modal-card-body">
          {{ order.user.fullName }}'s order
        </section>
        <footer class="modal-card-foot">
          <b-button @click="order = { ...order, modal: false }"
            >Cancel</b-button
          >
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
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from "vue-qrcode-reader";
import Item from "../components/Item";

@Component({
  components: {
    QrcodeStream,
    QrcodeDropZone,
    QrcodeCapture,
    Item
  }
})
export default class Orders extends Vue {
  isQRCodeReaderActive = false;
  isCodeModalActive = false;
  orderQuery = "";
  code = "";
  camera = "auto";
  order = {
    user: { fullName: "", id: "" },
    items: [],
    token: "",
    modal: false
  };
  socket = null;

  async getTokenFromUserID(userID) {
    await this.getItems(
      (await this.$store.dispatch("getQRCode", { userID })).orderToken
    );
    this.isCodeModalActive = false;
  }

  async getItems(token) {
    this.order = {
      ...(await this.$store.dispatch("readQRCode", { token })),
      token,
      modal: true
    };
  }

  async retrieveOrder() {
    this.order = { ...this.order, modal: false };
    const order = await this.$store.dispatch("registerOrder", {
      token: this.order.token
    });

    this.socket.send(
      JSON.stringify({
        action: "REGISTER_NEW_ORDER",
        order
      })
    );
  }

  async onDecode(result) {
    this.toggleCamera();
    await this.getItems(result);
  }

  toggleCamera() {
    switch (this.camera) {
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
      if (error.name === "NotAllowedError") {
        this.error = "ERROR: you need to grant camera access permisson";
      } else if (error.name === "NotFoundError") {
        this.error = "ERROR: no camera on this device";
      } else if (error.name === "NotSupportedError") {
        this.error = "ERROR: secure context required (HTTPS, localhost)";
      } else if (error.name === "NotReadableError") {
        this.error = "ERROR: is the camera already in use?";
      } else if (error.name === "OverconstrainedError") {
        this.error = "ERROR: installed cameras are not suitable";
      } else if (error.name === "StreamApiNotSupportedError") {
        this.error = "ERROR: Stream API is not supported in this browser";
      }
    }
  }

  createSocket() {
    this.socket = new WebSocket(`${process.env.VUE_APP_BASE_WEBSOCKET}/user/orders`);

    this.socket.onmessage = async ({ data }) => {
      try {
        await this.$store.commit("SET_ITEM_ORDERS", [
          ...this.$store.state.itemOrders,
          JSON.parse(data).order
        ]);
      } catch (err) {
        console.error(err, data);
      }
    };

    this.socket.onopen = () => {
      console.info("Successfully connected to the echo websocket server...");
    };

    this.socket.onerror = err => {
      console.error("Socket died when it encountered an error: ", err.message);
      this.socket.close();
    };

    this.socket.onclose = () => {
      console.info("Socket is closing, reconnecting soon :)");
      setTimeout(() => this.createSocket(), 1000);
    };
  }

  get orders() {
    return this.$store.state.itemOrders;
  }

  get formattedOrders() {
    return this.orders.filter(({ items, user }) => (
          items.filter(({ name, category }) => (
              name.toLowerCase().includes(this.orderQuery.toLowerCase()) ||
              category.category.toLowerCase().includes(this.orderQuery.toLowerCase())
          )).length || user._id.toLowerCase().includes(this.orderQuery.toLowerCase()) ||
          user.firstName
            .toLowerCase()
            .includes(this.orderQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(this.orderQuery.toLowerCase())
    )).map(({ items, user, _id }) => ({
        fullName: `${user.firstName} ${user.lastName}`,
        orderID: user._id,
        items
      }));
  }

  async beforeCreate() {
    await this.$store.dispatch("getOrders");
  }

  created() {
    this.createSocket();
  }
}
</script>

<style scoped></style>
