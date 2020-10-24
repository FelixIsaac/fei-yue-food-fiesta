<template>
  <b-navbar style="padding: 1.2rem;">
    <template slot="brand">
      <b-navbar-item :to="{ path: '/' }" tag="router-link">
        <img
          alt="Fei Yue Family Service Centre 'Monthly Food Fiesta' web management application"
          src="/favicon.ico"
        />
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-navbar-item tag="router-link" to="/code">Show QRCode</b-navbar-item>
      <b-navbar-item tag="router-link" to="/order">Select items</b-navbar-item>
      <template v-if="user.admin && user.userID">
        <b-navbar-item tag="router-link" to="/stocks">Stocks</b-navbar-item>
        <b-navbar-item tag="router-link" to="/analytics">Analytics</b-navbar-item>
      </template>
    </template>
    <template slot="end">
      <b-navbar-dropdown :label="user.fullName" v-if="user.userID">
        <b-navbar-item tag="router-link" to="/settings">
          Settings
        </b-navbar-item>
        <b-navbar-item tag="router-link" to="/logout">
          Logout
        </b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-item tag="div" v-else>
        <div class="buttons">
          <b-button class="is-primary" tag="router-link" to="/login">
            <strong>Log in</strong>
          </b-button>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class Counter extends Vue {
  get user() {
    return this.$store.state.user;
  }
}
</script>
