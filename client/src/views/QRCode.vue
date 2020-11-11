<template>
  <section style="margin: 50px 0;">
    <b-notification
      auto-close
      has-icon
      type="is-info"
      aria-close-label="Close notification"
      class="custom-notification is-invisible-desktop"
      :duration="5000"
    >
      QR Code expiry is one day, refresh to refresh expiry
    </b-notification>
    <div class="container has-text-centered">
      <b-tooltip label="QR Code expiry is one day, refresh to refresh expiry" type="is-dark">
        <img
          :alt="`Failed to load QRCode, input this instead: ${userID}`"
          :src="QRCode"
        />
      </b-tooltip>
      <p>
        QR code not working? type this instead.
        <br />
        <code>{{ userID }}</code>
      </p>
    </div>
  </section>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component
export default class QRCode extends Vue {
  loading = true;
  userID = this.$store.state.user.userID;
  QRCode = "";

  async beforeCreate() {
    try {
      const response = await this.$store.dispatch("getQRCode");

      this.userID = response.userID;
      this.QRCode = response.QRCode;
    } catch (err) {
      this.$buefy.toast.open({
        message: err.response.data.message || err.toString(),
        type: "is-danger"
      });
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.custom-notification {
  float: right;
  max-width: 350px;
  margin-top: -30px;
  position: absolute;
}

@media screen and (max-width: 950px) {
  .custom-notification {
    position: relative;
    margin-right: 20px;
    margin-left: 0;
  }
}

@media screen and (max-width: 300px) {
  .custom-notification {
    max-width: 250px;
    position: relative;
    margin-right: 0;
    margin-left: 0;
  }

  img {
    height: 250px;
    width: 250px;
  }

  div {
    padding: 0;
  }
}

@media screen and (max-width: 250px) {
  .has-text-centered {
    text-align: left !important;
  }

  img {
    height: 200px;
    width: 200px;
    margin: 15px;
  }

  p {
    font-size: 12px;
  }
}

@media screen and (max-width: 230px) {
  .has-text-centered {
    text-align: left !important;
  }

  img {
    height: 200px;
    width: 200px;
    margin: 10px;
  }

  p {
    font-size: 10px;
  }
}

@media screen and (max-width: 201px) {
  .has-text-centered {
    text-align: left !important;
  }

  img {
    height: 165px;
    width: 165px;
    margin: 5px;
  }

  p {
    font-size: 9px;
  }
}

@media screen and (max-width: 150px) {
  .has-text-centered {
    text-align: left !important;
  }

  img {
    height: 130px;
    width: 130px;
  }

  p {
    font-size: 9px;
  }
}
</style>
