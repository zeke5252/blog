<template>
<div class="container-xxl">
  <div class="row">
    <div class="col-4 col-md-2">
      <img src="https://via.placeholder.com/150" alt="zeke blog logo">
      <ul class="list-group list-group-flush">
        <router-link to="/" class="list-group-item list-group-item-action">Home</router-link>
        <router-link to="/about" class="list-group-item list-group-item-action">About</router-link>
        <router-link to="/form" class="list-group-item list-group-item-action">Form</router-link>
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

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

</style>
