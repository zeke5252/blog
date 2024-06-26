import { createStore } from 'vuex';
import { db } from '../firebaseDB.js';

export default createStore({
  state: {
    posts: null,
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
    adjacentPost:
      () =>
      async (currentPost, isNext = true) => {
        if (!currentPost) return false;
        try {
          const querySnapshot = await db
            .collection('posts')
            .orderBy('created', `${isNext ? 'asc' : 'desc'}`)
            .startAfter(currentPost)
            .limit(1)
            .get();

          const [doc] = querySnapshot.docs.map((doc) => {
            return {
              exists: doc.exists,
              data: doc.data(),
            };
          });
          return doc;
        } catch (error) {
          console.log('Error getting documents: ', error);
        }
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
