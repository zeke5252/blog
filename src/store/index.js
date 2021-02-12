import { createStore } from "vuex";
import { db } from "@/firebaseDB.js";
import { storage } from "../firebaseDB.js";

export default createStore({
  state: {
    dbData2: null,
  },
  getters: {
    getDB: (state) => (title, amount= 5) => {
      if (title && title !== "") {
        return state.dbData2.find( post => post["title"] === title );
      } else {
        return state.dbData2 && state.dbData2.filter( ( post, index ) => {
          if(index < amount) return post
        });
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
      let postsRef = db.collection("posts").orderBy("created", "desc");
      await postsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          dbData.push(doc.data());
        });
      });
      // < convert gs to http download url >
      // let urlPromises=[];
      // dbData.forEach((post,i)=>{
      //    let t = storage.refFromURL(post.imageSrc).getDownloadURL()
      //   .then(res=>{
      //     post.imageSrc = res
      //   });
      //   urlPromises.push(t);
      // });
      // await Promise.all(urlPromises)
      commit("updateDB", dbData);
    },
  },
  modules: {},
});
