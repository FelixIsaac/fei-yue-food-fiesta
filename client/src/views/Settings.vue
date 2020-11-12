<template>
  <section class="container">
    <form>
      <b-field grouped label="Name">
        <b-field label="First name" expanded label-position="on-border">
          <b-input
            placeholder="Your first name"
            required
            type="text"
            v-model="user.firstName"
            validation-message="First name required"
          ></b-input>
        </b-field>
        <b-field label="Last name" expanded label-position="on-border">
          <b-input
            placeholder="Your last name"
            type="text"
            v-model="user.lastName"
          ></b-input>
        </b-field>
      </b-field>
      <b-field grouped label="Contact">
        <b-field label="Email" label-position="on-border" expanded>
          <b-input
            lazy
            required
            pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            type="email"
            icon="email"
            v-model="user.email"
            validation-message="Invalid email address"
          ></b-input>
        </b-field>
        <b-field label="Phone number" label-position="on-border" expanded>
          <b-input
            lazy
            required
            type="tel"
            icon="phone"
            pattern="^(\+65)?[689]\d{7}$"
            v-model="user.phone"
            validation-message="Invalid phone number"
          ></b-input>
        </b-field>
      </b-field>
      <div class="buttons" style="float: right;">
        <b-button
          label="Change password"
          @click="isPasswordModalActive = true"
          rounded
        ></b-button>
        <b-button
          :loading="loading"
          @click="editUser"
          class="is-primary"
          label="Edit user"
          rounded
        ></b-button>
      </div>
    </form>

    <b-modal
      v-model="isPasswordModalActive"
      has-modal-card
      trap-focus
      aria-modal
      :destroy-on-hide="false"
      aria-role="dialog"
      scroll="clip"
    >
      <div class="modal-card password-modal" style="width: auto;">
        <header class="modal-card-head">
          <p class="modal-card-title">Change {{ user.firstName }}'s password</p>
          <button
            type="button"
            class="delete"
            @click="isPasswordModalActive = false"
          />
        </header>
        <section class="modal-card-body">
          <b-field label="Old password" expanded>
            <b-input
              pattern="(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$"
              type="password"
              validation-message="Must be at least 8 characters and include at least one; upper, lower, digit, and symbol"
              v-model="oldPassword"
              lazy
              password-reveal
              required
            ></b-input>
          </b-field>
          <b-field label="New password" expanded>
            <b-input
              type="password"
              pattern="(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$"
              validation-message="Must be at least 8 characters and include at least one; upper, lower, digit, and symbol"
              v-model="password"
              lazy
              password-reveal
              required
            ></b-input>
          </b-field>
          <b-field label="Confirm new password" expanded>
            <b-input
              type="password"
              pattern="(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$"
              validation-message="Must be at least 8 characters and include at least one; upper, lower, digit, and symbol"
              v-model="confirmPassword"
              lazy
              password-reveal
              required
            ></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button @click="isPasswordModalActive = false">Cancel</b-button>
          <b-button
            class="is-primary"
            @click="changePassword"
            :loading="loading"
            >Change password</b-button
          >
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class Settings extends Vue {
  loading = false;
  isPasswordModalActive = false;
  oldPassword = "";
  password = "";
  confirmPassword = "";
  user = { firstName: "", lastName: "", email: "", phone: 0 };

  async editUser() {
    this.loading = true;

    try {
      const responses = await this.$store.dispatch("editUser", {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone
      });

      const errors = responses.filter(({ error }) => error);

      if (errors.length)
        this.$buefy.toast.open({
          message: errors.map(({ message }) => message).join("\n"),
          type: "is-danger"
        });
      else
        this.$buefy.toast.open({ message: "Updated user", type: "is-success" });
    } catch (err) {
      console.error(err);
      this.$buefy.toast.open({
        message: err.response.data.message || err.toString(),
        type: "is-danger"
      });
    } finally {
      this.loading = false;
    }
  }

  async changePassword() {
    if (this.password !== this.confirmPassword) {
      this.$buefy.toast.open({
        message: "Passwords must match",
        type: "is-danger"
      });

      return;
    }

    this.loading = true;
    this.isPasswordModalActive = false;

    try {
      const response = await this.$store.dispatch("changeUserPassword", {
        oldPassword: this.oldPassword,
        password: this.password,
        confirmPassword: this.confirmPassword
      });

      this.$buefy.toast.open({
        message: response.data.message,
        type: response.data.error ? "is-danger" : "is-success"
      });
    } catch (err) {
      console.error(err);
      this.$buefy.toast.open({
        message: err.response?.data?.message || err.toString(),
        type: "is-danger"
      });
    } finally {
      this.loading = false;
    }
  }

  async beforeCreate() {
    this.user = await this.$store.dispatch("getUser", { selector: "", decryptEmail: true, decryptPhone: true });
  }
}
</script>

<style scoped>
.password-modal {
  min-width: 600px;
}

@media screen and (max-width: 768px) {
  .password-modal {
    min-width: auto;
  }
}
</style>
