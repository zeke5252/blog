<template>
  <div class="container-fluid">
    <div class="row mt-5">
      <main class="col-12 col-md-11 offset-md-1 vh-100 d-flex">
        <router-view />
      </main>
      <div
        v-if="isMobileMenu"
        class="w-100 h-100 fixed-top"
        style="background-color: black; opacity: 0.3"
        @click="doMenu"
      ></div>
      <nav
        :class="
          !isMobileMenu
            ? 'd-none d-md-block col-1 p-0 fixed-top justify-content-center'
            : 'col-2 px-3 fixed-top h-100 mobileBg'
        "
      >
        <router-link to="/">
          <Logo
            classLogo="my-4 px-sm-3 px-md-3 px-lg-4"
            styleLogo="width: 100%; height: 50px; margin: auto"
            clipId="desktop"
          />
        </router-link>
        <ul class="p-0">
          <router-link to="/" class="mx-auto">
            <font-awesome-icon icon="grip-horizontal" :style="isActive('')" />
          </router-link>
          <router-link to="/about" class="mx-auto">
            <font-awesome-icon icon="address-card" :style="isActive('about')" />
          </router-link>
          <router-link to="/form" class="mx-auto">
            <font-awesome-icon icon="sign-in-alt" :style="isActive('admin')" />
          </router-link>
        </ul>
      </nav>
      <Logo
        classLogo="logo--m d-block d-md-none p-0 fixed-top mt-1 mx-2"
        style="width: 40px; height: 40px"
        :doMenu="doMenu"
        clipId="mobile"
      />
    </div>
  </div>
</template>

<script>
import Logo from "./components/Logo.vue";
import { ref } from "vue";
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const isMobileMenu = ref(false);

    const doMenu = () => {
      isMobileMenu.value = !isMobileMenu.value;
    };

    const isActive = (path) => {
      let result = route.path.split("/")[1];
      return result !== path ? { opacity: 0.2 } : { opacity: 1 };
    };

    return {
      isActive,
      isMobileMenu,
      doMenu,
    };
  },
  components: {
    Logo,
  },
};
</script>

<style lang="scss">
@import "./assets/css/app.scss";
html {
  background-color: $color-bg;
}
ul {
  display: flex;
  height: 60vh;
  flex-direction: column;
  a {
    padding: 30px 0;
    svg {
      transform: scale(1.3);
    }
  }
}
.logo--m {
  cursor: pointer;
}
.mobileBg {
  background-color: $color-bg;
  z-index: 1600;
}
</style>
