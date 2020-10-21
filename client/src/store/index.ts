import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import Cookies from "js-cookie";
import axios from "axios";

Vue.use(Vuex);

const initUser = {
    avatar: "",
    admin: false,
    fullName: "",
    userID: null
};

export default new Vuex.Store({
    state: {
        user: initUser
    },
    plugins: [createPersistedState({
        paths: ["user"],
        storage: {
            getItem: key => Cookies.get(key),
            setItem: (key, value) => Cookies.set(key, value, {
                "expires": 13,
                "secure": process.env.NODE_ENV === "production",
                "sameSite": "Strict"
            }),
            removeItem: key => Cookies.remove(key)
        }
    })],
    mutations: {
        SET_USER(state, user = initUser) {
            state.user = user;
        }
    },
    actions: {
        async login({ commit }, { email, password }: { email: string, password: string }) {
            const response = await axios.post(
              `${process.env.VUE_APP_BASE_API}/user/login`,
              { email, password },
              { withCredentials: true, method: "POST" }
            );

            commit("SET_USER", response.data.data);
        },
        async logout({ commit }) {
            await axios.get(`${process.env.VUE_APP_BASE_API}/user/logout`, { withCredentials: true });
            commit("SET_USER");
        }
    },
    modules: {}
});
