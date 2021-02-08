import { createStore } from "vuex";
import { db } from "@/firebaseDB.js";

export default createStore({
  state: {
    dbData2: null,
  },
  getters: {
    getDB: (state) => (title) => {
      if (title && title !== "") {
        return state.dbData2.find( post => post["title"] === title );
      } else {
        return state.dbData2;
      }
    },
  },
  mutations: {
    updateDB(state, p) {
      state.dbData2 = p;
    },
  },
  actions: {
    async getFirestoreDB({ commit }) {
      let dbData = [];
      let postsRef = db.collection("posts");
      await postsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          dbData.push(doc.data());
        });
      });
      commit("updateDB", dbData);
    },
  },
  modules: {},
});
