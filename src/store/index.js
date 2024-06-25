import { createStore } from 'vuex';
import { db } from '../firebaseDB.js';

export default createStore({
  state: {
    posts: null,
  },
  getters: {
    postByTitle: (state) => (title) => {
      let result;
      state.posts.forEach((post, index) => {
        if (post['title'] === title) {
          let isPrevDisplay = index !== 0 ? true : false;
          let isNextDisplay = index !== state.posts.length - 1 ? true : false;
          result = { post, isPrevDisplay, isNextDisplay };
        }
      });
      return result;
    },
    extraPosts:
      (state) =>
      (obj = null) => {
        const { times, amount } = obj;
        return (
          state.posts &&
          state.posts.filter((post, index) => {
            if (index >= times * amount && index < (times + 1) * amount)
              return post;
          })
        );
      },
    nextOrPrevPost:
      (state) =>
      (title, isNext = false) => {
        let result;
        state.posts.forEach((post, index) => {
          if (post['title'] === title) {
            let indexP;
            if (isNext) {
              indexP = index + 1;
              result =
                index !== state.posts.length - 1
                  ? indexP
                  : state.posts.length - 1;
            } else {
              indexP = index - 1;
              result = index !== 0 ? indexP : 0;
            }
          }
        });
        return state.posts[result].title;
      },
    isPostExisted: (state) => (title) => {
      return state.posts.find((post) => {
        return post.title === title;
      });
    },
  },
  mutations: {
    updatePost: (state, p) => (state.posts = p),
  },
  actions: {
    async fetchAllPosts({ commit }) {
      let resultPosts = [];
      let postCollection = db.collection('posts').orderBy('created', 'desc');
      await postCollection.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          resultPosts.push(doc.data());
        });
      });
      commit('updatePost', resultPosts);
    },
  },
  modules: {},
});
