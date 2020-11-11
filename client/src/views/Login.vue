<template>
  <section class="container">
    <form>
      <b-field label="Email or phone" label-position="on-border">
        <b-input
          lazy
          pattern="^(\+65)?[689]\d{7}$|^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
          required
          type="text"
          v-model="email"
          validation-message="Invalid email address or phone number"
        ></b-input>
      </b-field>
      <b-field label="Password" label-position="on-border">
        <b-input
          lazy
          password-reveal
          pattern="(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$"
          required
          type="password"
          v-model="password"
          validation-message="Must be at least 8 characters and include at least one; upper, lower, digit, and symbol"
        ></b-input>
      </b-field>
      <b-button
        :loading="loading"
        @click="login"
        class="is-primary"
        expanded
        label="Login"
        rounded
        >Login
      </b-button>
    </form>
  </section>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class Counter extends Vue {
  loading = false;
  email = null;
  password = null;

  async login() {
    if (!this.email || !this.password) {
      this.$buefy.toast.open({
        message: "Include credentials",
        type: "is-danger"
      });

      return;
    }

    try {
      this.loading = true;

      await this.$store.dispatch("login", {
        email: this.email,
        password: this.password
      });
      await this.$router.push("/");
    } catch (err) {
      this.loading = false;
      this.$buefy.toast.open({
        message: err.response.data.message || err.toString(),
        type: "is-danger"
      });
    }
  }

  beforeCreate() {
    this.$store.state.user.userID && this.$router.push("/");
  }
}
</script>
