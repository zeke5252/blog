import { createRouter, createWebHistory } from 'vue-router';
import { firebase } from '@firebase/app';
require('firebase/auth');

const routes = [
  {
    path: '/',
    name: 'TheHome',
    component: () => import('../views/TheHome.vue'),
  },
  {
    path: '/posts/:title',
    component: () => import('../views/ThePost.vue'),
  },
  {
    path: '/about',
    name: 'TheAbout',
    component: () => import('../views/TheAbout.vue'),
  },
  {
    path: '/admin',
    name: 'TheAdmin',
    component: () => import('../views/TheAdmin.vue'),
  },
  {
    path: '/form',
    name: 'TheForm',
    component: () => import('../views/TheForm.vue'),
    beforeEnter: (to, from, next) => {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          next();
        } else {
          next({ name: 'TheAdmin' });
        }
      });
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'The404',
    component: () => import('../views/The404.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
