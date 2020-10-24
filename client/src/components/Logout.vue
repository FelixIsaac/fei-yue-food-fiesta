<script>
    import Vue from "vue";
    import Component from "vue-class-component";

    @Component
    export default class Counter extends Vue {
        async beforeCreate() {
            await this.$store.dispatch("logout");
            await this.$router.push("/");
        }
    }
</script>
