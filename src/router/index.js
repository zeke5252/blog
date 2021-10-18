import { createRouter, createWebHistory } from "vue-router";
import { firebase } from "@firebase/app";
require("firebase/auth");

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/posts/:title",
    props: true,
    component: () => import("../components/Post.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../views/Admin.vue"),
  },
  {
    path: "/form",
    name: "Form",
    component: () => import("../views/Form.vue"),
    beforeEnter: (to, from, next) => {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          next();
        } else {
          next({ name: "Admin" });
        }
      });
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../components/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
