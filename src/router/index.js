import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Post from "../components/Post.vue";
import store from '../store/'
import NotFound from "../components/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    children: [
      {
        path: "posts/:title",
        component: Post,
        props: true,
        async beforeEnter(to, from, next) {
          // Refreshing will erase store state. 
          if(!allPosts){
            await store.dispatch('getFirestoreDB')
          }
          let allPosts = store.getters.getDB();
          let result = allPosts.find((el) => {
            return el["title"] === to.params.title 
          })
          if (!result) {
            next({name:"NotFound"})
          } else {
           
            next();
          }
        },
      },
    ]
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/form",
    name: "Form",
    component: () =>
      import("../views/Form.vue"),
  },
  {
    path: '/:pathMatch(.*)*',
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
