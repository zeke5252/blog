import { createStore } from "vuex";
import { db } from "@/firebaseDB.js";
import { storage } from "../firebaseDB.js";

export default createStore({
  state: {
    dbData2: null,
  },
  getters: {
    getDB: (state) => (title, amount) => {
      if (title && title !== "") {
        return state.dbData2.find( post => post["title"] === title );
      } else if(amount) {
        return state.dbData2 && state.dbData2.filter( ( post, index ) => {
          if(index < amount) return post
        });
      } else {
        return state.dbData2
      }
    },
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    },
    getPost: (state) => (title, isNext = false) => {
      let result;
      state.dbData2.forEach( (post,index) => {
        if(post["title"] === title){
          let indexP;
          if(isNext){
            indexP = index+1;
            result = index !== (state.dbData2.length-1) ? indexP : state.dbData2.length-1;
          } else {
            indexP = index-1;
            result = index !== 0 ? indexP : 0;
          }
        }
      }
      );
      return state.dbData2[result].title;
    }
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
