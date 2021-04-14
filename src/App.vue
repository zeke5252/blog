<template>
<div class="container-fluid">
 <img src="./assets/logo_m.svg" class= "logo--m d-block d-sm-none p-1 fixed-top mt-1 mx-2" style="width: 40px; height: 40px" v-on:click=""/>
  <div class="row mt-5">
    <nav class="d-none d-md-block col-2 p-0 fixed-top" >
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
    <main class="col-12 col-md-10 offset-md-2">
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

</style>