import { createStore } from 'vuex';
import { db } from '../firebaseDB.js';

export default createStore({
  state: {
    posts: null,
    prevPost: null,
    nextPost: null,
  },
  getters: {
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
    isPostExisted: (state) => (title) => {
      return state.posts.find((post) => {
        return post.title === title;
      });
    },
  },
  mutations: {
    updatePosts: (state, posts) => (state.posts = posts),
    updateAdjacentPost: (state, { post, isNext = true }) => {
      isNext ? (state.nextPost = post) : (state.prevPost = post);
    },
  },
  actions: {
    async fetchAdjacentPost({ commit }, { created, isNext = true }) {
      if (!created) return false;
      try {
        const querySnapshot = await db
          .collection('posts')
          .orderBy('created', `${isNext ? 'asc' : 'desc'}`)
          .startAfter(created)
          .limit(1)
          .get();

        const [post] = querySnapshot.docs.map((doc) => {
          return {
            exists: doc.exists,
            data: doc.data(),
          };
        });
        commit('updateAdjacentPost', { post, isNext });
      } catch (error) {
        console.log('Error getting documents: ', error);
      }
    },
    async fetchAllPosts({ commit }) {
      let resultPosts = [];
      let postCollection = db.collection('posts').orderBy('created', 'desc');
      await postCollection.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          resultPosts.push(doc.data());
        });
      });
      commit('updatePosts', resultPosts);
    },
  },
  modules: {},
});
