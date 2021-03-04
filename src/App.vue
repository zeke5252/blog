<template>
<div class="container-fluid" >
  <div class="row">
    <div class="col-4 col-md-2">
      <img src="https://via.placeholder.com/150/212121" alt="zeke blog logo">
      <ul class="list-group list-group-flush l-nav">
        <router-link to="/" class="list-group-item list-group-item-action">首頁</router-link>
        <router-link to="/about" class="list-group-item list-group-item-action">關於</router-link>
        <router-link to="/form" class="list-group-item list-group-item-action">管理員</router-link>
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
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300&display=swap');

#app {
  font-family: Avenir, Helvetica, Arial, Noto Sans TC, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.l-nav {
 font-size: 14px; 
 line-height: 2.6;
}
</style>
