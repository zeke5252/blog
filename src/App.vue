<template>
<div class="container-fluid">
  <div class="row mt-5">
    <main class="col-12 col-md-10 offset-md-2">
      <router-view/>
    </main>
    <div v-if="isMobileMenu" class="w-100 h-100 fixed-top" style= "background-color: transparent" @click="doMenu"></div>
    <nav :class="!isMobileMenu ? 'd-none d-md-block col-2 p-0 fixed-top' : 'col-6 p-0 fixed-top h-100 mobileBg'" >
        <img class="img-fluid mt-5" src="./assets/logo.svg" alt="zeke blog logo">
        <ul class="p-0">
          <router-link to="/"       class="mx-auto">
            <img src="./assets/menu_posts.svg" :style="isActive('')" alt="zeke blog menu_posts">
          </router-link>
          <img src="./assets/menu_devider.svg" class="mx-auto" alt="zeke blog menu_devider">
          <router-link to="/about"  class="mx-auto">
            <img src="./assets/menu_about.svg" :style="isActive('about')" alt="zeke blog menu_about">
          </router-link>
          <img src="./assets/menu_devider.svg" class="mx-auto" alt="zeke blog menu_devider">
          <router-link to="/form"   class="mx-auto" >
            <img src="./assets/menu_admin.svg" :style="isActive('form')"  alt="zeke blog menu_admin">
          </router-link>
        </ul>
    </nav>
    <img src="./assets/logo_m.svg" class= "logo--m d-block d-md-none p-1 fixed-top mt-1 mx-2" style="width: 40px; height: 40px;" @click="doMenu"/>
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
    background: $color-bg url(./assets/bg.jpg) no-repeat center center fixed; 
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
  }

  ul {
    display: flex;
    height: 60vh;
    flex-direction: column;
    &:first-child {

      content:"";
      position: absolute;
      width: 5px;
      height: 100%;
      background-color: $color-primary-yellow;
      left: 0;
      top: 0
    }

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