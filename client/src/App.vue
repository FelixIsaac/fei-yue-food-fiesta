<template>

  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default {
  components: {
    Header,
    Footer
  }
};
</script>

<style scoped>
.container {
  margin-top: 3rem;
  margin-bottom: 8rem;
}
</style>
