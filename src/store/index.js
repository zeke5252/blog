import { createStore } from "vuex";
import { db } from "../firebaseDB.js";
import { UPDATE_DB, GET_DB, GET_NEXT_OR_PREV_POST, DATA_DB, IS_POST_EXISTED } from "./types";

export default createStore({
  state: {
    [DATA_DB]: null,
  },
  getters: {
    [GET_DB] : (state) => (title, amount) => {
      if (title && title !== "") {
        let result;
        state[DATA_DB].forEach( (post,index) => { 
          if(post["title"] === title){
            let isPrevDisplay =  index !== 0  ? true : false;
            let isNextDisplay =  index !== state[DATA_DB].length-1 ? true : false;
            result = {post, isPrevDisplay, isNextDisplay};
          } })
        return result
      } else if(amount) {
        return state[DATA_DB] && state[DATA_DB].filter( ( post, index ) => {
          if(index < amount) return post
        });
      } else {
        return state[DATA_DB]
      }
    },
    [GET_NEXT_OR_PREV_POST] : (state) => (title, isNext = false) => {
      let result;
      state[DATA_DB].forEach( (post,index) => {
        if(post["title"] === title){
          let indexP;
          if(isNext){
            indexP = index+1;
            result = index !== (state[DATA_DB].length-1) ? indexP : state[DATA_DB].length-1;
          } else {
            indexP = index-1;
            result = index !== 0 ? indexP : 0;
          }
        }
      });
      return state[DATA_DB][result].title;
    },
    [IS_POST_EXISTED] : (state) => (title) => {
      return state[DATA_DB].find( (post) => {
        return post.title === title
      });
    },
  },
  mutations: {
    [UPDATE_DB] : (state, p) => state[DATA_DB] = p,
  },
  actions: {
    async getFirestoreDB({ commit }) {
      console.log('do firestore')
      let tempData = [];
      let postsRef = db.collection("posts").orderBy("created", "desc");
      await postsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          tempData.push(doc.data());
        });
      });
      commit(UPDATE_DB, tempData);
    },
  },
  modules: {},
});
