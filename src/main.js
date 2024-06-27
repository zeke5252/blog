import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTrash,
  faAddressCard,
  faSignInAlt,
  faGripHorizontal,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faLink,
  faCode,
  faBold,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faTrash,
  faAddressCard,
  faSignInAlt,
  faGripHorizontal,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faLink,
  faCode,
  faBold
);

// Vue.component('font-awesome-icon', FontAwesomeIcon)

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(store).use(router).mount('#app');
