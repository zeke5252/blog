<template>
<div class="container-fluid">
  <div class="row">
    <nav class="col-4 col-md-2 m-0 mt-3 p-0" style="position:fixed; left: 0;">
      <div class="menu--img--stripe">
        <img src="./assets/logo.svg" alt="zeke blog logo">
      </div>
      <ul class="p-0 mt-5">
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
    <!-- Leave empty column for menu -->
    <div class="col-4 col-md-2">
    </div>
    <main class="col-8 col-md-10">
      <router-view/>
    </main>
  </div>
</div>
</template>

<script>
export default {
  methods: {
    isActive(path){
      let result = this.$route.path.split('/')[1]; 
      if(result !== path){
        return "opacity: .2"
      }
  }
  },
}
</script>

<style lang="scss">
@import "./assets/css/app.scss";

html { 
  background: $color-bg url(./assets/bg.jpg) no-repeat center center fixed; 
  background-blend-mode: soft-light;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

.menu--img--stripe {
    position: relative;
  &::before {
    content:"";
    width: 5px;
    height: 100%;
    background-color: $color-primary-yellow;
    position: absolute;
    left: 0
  }
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

</style>