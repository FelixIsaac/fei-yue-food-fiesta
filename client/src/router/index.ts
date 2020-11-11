import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [{
    "path": "/login",
    "name": "Login",
    "component": () => import("../views/Login.vue")
}, {
    "path": "/logout",
    "name": "Logout",
    "component": () => import("../components/Logout.vue")
}, {
    "path": "/settings",
    "name": "Settings",
    "component": () => import("../views/Settings.vue")
}, {
    "path": "/stocks",
    "name": "Stocks",
    "component": () => import("../views/Stocks.vue")
}, {
    "path": "/code",
    "name": "QRCode",
    "component": () => import("../views/QRCode.vue")
}, {
    "path": "/order",
    "name": "SelectItems",
    "component": () => import("../views/SelectItems.vue")
}, {
    "path": "/orders",
    "name": "Orders",
    "component": () => import("../views/Orders.vue")
}, {
    "path": "/qrcode-scanner",
    "name": "QRCodeReader",
    "component": () => import("../views/QRCodeReader.vue")
}, {
}];

const router = new VueRouter({
    "mode": "history",
    "base": process.env.BASE_URL,
    routes
});

export default router;
