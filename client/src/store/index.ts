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
        user: initUser,
        itemCategories: []
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
        },
        SET_ITEM_CATEGORIES(state, itemCategories) {
            state.itemCategories = itemCategories;
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
        },
        async updateUser({ commit }) {
            const response = await axios.get(
              `${process.env.VUE_APP_BASE_API}/user/updatedUserFromLogin`,
              { withCredentials: true }
            );

            commit("SET_USER", response.data.data);
        },
        async getItemCategories({ commit }) {
            const response = await axios.get(`${process.env.VUE_APP_BASE_API}/item/categories`, { withCredentials: true });
            commit("SET_ITEM_CATEGORIES", response.data.data);
            return response;
        },
        async createNewCategory({ commit, dispatch }, { newCategory }) {
            const response = await axios.post(
              `${process.env.VUE_APP_BASE_API}/item`,
              { name: newCategory.category, ...newCategory },
              { withCredentials: true }
            );

            await dispatch("getItemCategories");
            return response;
        },
        async createNewItem({ commit, dispatch }, { newItem }) {
            const response = await axios.post(
              `${process.env.VUE_APP_BASE_API}/item/${newItem.category}`,
              { ...newItem },
              { withCredentials: true }
            );

            await dispatch("getItemCategories");
            return response;
        },
        async updateItemName({ commit, state }, { category, item, name }) {
            const response = await axios.patch(
                `${process.env.VUE_APP_BASE_API}/item/${category}/${item}/name`, { name }, { withCredentials: true }
            );

            const updatedItemCategories = state.itemCategories;
            const categoryObject = updatedItemCategories.find(({ _id }) => _id === category);

            if (!categoryObject) return;
            const itemObject = categoryObject.items.find(({ _id }: { _id: string }) => _id === item);
            itemObject.name = name;

            commit("SET_ITEM_CATEGORIES", updatedItemCategories);
            return response;
        },
        async updateItemImage({ commit, state }, { category, item, image }) {
            const response = await axios.patch(
                `${process.env.VUE_APP_BASE_API}/item/${category}/${item}/image`, { image }, { withCredentials: true }
            );

            const updatedItemCategories = state.itemCategories;
            const categoryObject = updatedItemCategories.find(({ _id }) => _id === category);

            if (!categoryObject) return;
            const itemObject = categoryObject.items.find(({ _id }: { _id: string }) => _id === item);
            itemObject.image = image;

            commit("SET_ITEM_CATEGORIES", updatedItemCategories);
            return response;
        },
        async updateItemCategory({ commit, state }, { item, category, newCategory }) {
            const response = await axios.put(
                `${process.env.VUE_APP_BASE_API}/item/${category}/${item}`,
                { category: newCategory },
                { withCredentials: true }
            );

            const updatedItemCategories = state.itemCategories;
            const categoryObject = updatedItemCategories.find(({ _id }) => _id === category);

            if (!categoryObject) return;
            const itemObject = categoryObject.items.find(({ _id }: { _id: string }) => _id === item);
            itemObject.category = newCategory;

            commit("SET_ITEM_CATEGORIES", updatedItemCategories);
            return response;
        },
        async updateItemStock({ commit, state }, { category, item, stock }) {
            const response = await axios.patch(
              `${process.env.VUE_APP_BASE_API}/item/${category}/${item}/stock`,
              { stock },
              { withCredentials: true }
            );

            const updatedItemCategories = state.itemCategories;
            const categoryObject = updatedItemCategories.find(({ _id }) => _id === category);

            if (!categoryObject) return;
            const itemObject = categoryObject.items.find(({ _id }: { _id: string }) => _id === item);
            itemObject.stock = stock;

            commit("SET_ITEM_CATEGORIES", updatedItemCategories);
            return response;
        },
        async deleteItem({ commit, state }, { category, item }) {
            const response = await axios.delete(
              `${process.env.VUE_APP_BASE_API}/item/${category}/${item}`,
              { withCredentials: true}
            );

            const updatedItemCategories = state.itemCategories;
            const categoryObject = updatedItemCategories.find(({ _id }) => _id === category);

            if (!categoryObject) return;
            const itemIndex = categoryObject.items.findIndex(({ _id }: { _id: string }) => _id === item);
            categoryObject.items.splice(itemIndex, 1);

            commit("SET_ITEM_CATEGORIES", updatedItemCategories);
            return response;
        },
        async getUser() {
            return (await axios.get(
              `${process.env.VUE_APP_BASE_API}/user/byToken`,
              { withCredentials: true }
            )).data.data;
        },
        async editUser({ state, commit, dispatch }, { firstName, lastName, email, phone }) {
            const responses = await Promise.all([
              axios.patch(
                `${process.env.VUE_APP_BASE_API}/user/${state.user.userID}/name`,
                { firstName, lastName },
                { withCredentials: true }
              ),
              axios.patch(
                `${process.env.VUE_APP_BASE_API}/user/${state.user.userID}/phone`,
                { phone },
                { withCredentials: true }
              ),
              axios.patch(
                `${process.env.VUE_APP_BASE_API}/user/${state.user.userID}/email`,
                { email },
                { withCredentials: true }
              )
            ]);

            await this.dispatch("updateUser");
            return responses.map(({ data }) => data);
        },
        async changeUserPassword({ state }, { oldPassword, password, confirmPassword }) {
            if (password !== confirmPassword) throw "Passwords does not match";

            return await axios.patch(
              `${process.env.VUE_APP_BASE_API}/user/${state.user.userID}/password`,
              { password, oldPassword },
              { withCredentials: true }
            );
        }
    },
    modules: {}
});
