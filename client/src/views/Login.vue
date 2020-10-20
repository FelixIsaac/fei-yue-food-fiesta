<template>
  <section class="container" style="margin-top: 3rem; margin-bottom: 8rem;">
    <b-field label="Email or phone" label-position="on-border">
      <b-input
        type="input"
        v-model="email"
        pattern="^(\+65)?[689]\d{7}$|^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
        validation-message="Invalid email address or phone number"
        lazy
      ></b-input>
    </b-field>
    <b-field label="Password" label-position="on-border">
      <b-input
        type="password"
        v-model="password"
        pattern="(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$"
        validation-message="Must be at least 8 characters and include at least one; upper, lower, digit, and symbol"
        lazy
        password-reveal
      ></b-input>
    </b-field>
    <b-button
      class="is-primary"
      label="Login"
      :loading="loading"
      @click="login"
      rounded
      expanded
      >Login</b-button
    >
  </section>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";
import axios from "axios";

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
      const response = await axios.post(
        `${process.env.VUE_APP_BASE_API}/user/login`,
        {
          email: this.email,
          password: this.password
        }
      );

      console.log(
        (await axios.get(`${process.env.VUE_APP_BASE_API}/user`)).data
      );

      this.$buefy.toast.open({
        message: response.data.message,
        type:
          response.status !== 200 || response.data.statusCode !== 200
            ? "is-danger"
            : "is-success"
      });
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
