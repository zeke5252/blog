import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Post from "../components/Post.vue";
import obj from "../assets/data.js";
import NotFound from "../components/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/posts/:title",
    name: "Post",
    component: Post,
    beforeEnter(to, from, next) {
      let result = obj.find((el) => el["title"] === to.params.title);
      if (!result) {
        next({name:"NotFound"})
      } else {
        next();
      }
    },
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
