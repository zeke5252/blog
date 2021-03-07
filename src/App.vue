<template>
<div class="container-fluid" >
  <div class="row">
    <div class="col-4 col-md-2">
      <img src="./assets/logo.svg" alt="zeke blog logo">
      <ul class="list-group list-group-flush">
        <router-link to="/" class="list-group-item list-group-item-action">posts</router-link>
        <router-link to="/about" class="list-group-item list-group-item-action">about</router-link>
        <router-link to="/form" class="list-group-item list-group-item-action">admin</router-link>
      </ul>
    </div>
    <div class="col-8 col-md-10">
      <router-view/>
    </div>
  </div>
</div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
@import "./assets/css/app.scss";

ul {
  font-size: 14px; 
  line-height: 2.6;
}

ul a {
  background-color: $color-bg !important;
}

</style>
