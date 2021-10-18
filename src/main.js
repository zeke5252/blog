import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTrash,
  faAddressCard,
  faSignInAlt,
  faGripHorizontal,
  faSearch,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faTrash,
  faAddressCard,
  faSignInAlt,
  faGripHorizontal,
  faSearch,
  faChevronLeft,
  faChevronRight
);

// Vue.component('font-awesome-icon', FontAwesomeIcon)

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(store).use(router).mount("#app");

// <!--study--!>

// different version of vue study
// submit page (done)
// Firestore crud (half)
// BootstrapVue(done)
// 404(done)
// infinite scrolling(done)
// auth login(done)
// hide api key
// firestore storage (done)
// form validator
// order by created time(done)
// post search (done)
// fullscreen image
// sitemap for seo
// The following entrypoint(s) combined asset size exceeds the recommended limit
