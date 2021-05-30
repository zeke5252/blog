<template>
<div class="container-fluid">
  <div class="row mt-5">
    <main class="col-12 col-md-11 offset-md-1">
      <router-view/>
    </main>
    <div v-if="isMobileMenu" class="w-100 h-100 fixed-top" style= "background-color: black; opacity: .3;" @click="doMenu"></div>
    <nav :class="!isMobileMenu ? 'd-none d-md-block col-1 p-0 fixed-top justify-content-center' : 'col-3 px-4 fixed-top h-100 mobileBg'" >
        <img class="img-fluid my-5 px-2 px-lg-4" src="./assets/logo.svg" alt="zeke blog logo">
        <ul class="p-0">
          <router-link to="/"       class="mx-auto">
            <img src="./assets/menu_posts.svg" :style="isActive('')" alt="zeke blog menu_posts">
          </router-link>
          <router-link to="/about"  class="mx-auto">
            <img src="./assets/menu_about.svg" :style="isActive('about')" alt="zeke blog menu_about">
          </router-link>
          <router-link to="/form"   class="mx-auto" >
            <img src="./assets/menu_admin.svg" :style="isActive('form')"  alt="zeke blog menu_admin">
          </router-link>
        </ul>
    </nav>
    <img src="./assets/logo.svg" class= "logo--m d-block d-md-none p-0 fixed-top mt-1 mx-3" style="width: 40px; height: 40px;" @click="doMenu"/>
  </div>
</div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter, useRoute } from 'vue-router'

export default {

  setup(props) {
    const route = useRoute();
    const isMobileMenu = ref(false);

    const doMenu = () => {
      isMobileMenu.value = !isMobileMenu.value;
    };

    const isActive = (path) => {
        let result = route.path.split('/')[1]; 
        if(result !== path){
          return "opacity: .2"
        }
    };

    return {
      isActive,
      isMobileMenu,
      doMenu,
    }
  }
}
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

    img {
        width: 30px;
        height: auto;
        padding: 20px 0;
      }

  }

  .logo--m {
      cursor: pointer
  }

  .mobileBg {
    background-color: $color-bg;
    z-index: 1600;
  }

</style>