<template>
  <b-navbar style="padding: 1.2rem;">
    <template slot="brand">
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <img
          src="/favicon.ico"
          alt="Fei Yue Family Service Centre 'Monthly Food Fiesta' web management application"
        />
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-navbar-item tag="router-link" to="/code">Show QRCode</b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-item tag="div">
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
export default {
  name: "Header"
};
</script>
