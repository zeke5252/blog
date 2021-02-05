import { createStore } from 'vuex'
import { db } from "@/firebaseDB.js";

export default createStore({
  state: {
    dbData2: null
  },
  getters: {
    getDB: state => state.dbData
  },
  mutations: {
    updateDB(state, p){
      state.dbData = p;
    }
  },
  actions: {
    async  getFirestoreDB({commit}){
      let dbData = [];
      let postsRef = db.collection("posts");
      await postsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          dbData.push(doc.data());
        });
      });
      commit('updateDB', dbData)
    }
  },
  modules: {
  }
})