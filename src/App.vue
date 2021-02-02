<template>
<div class="container-xxl">
  <div class="row">
    <div class="col-2">
      <ul class="list-group list-group-flush">
        <router-link to="/" class="list-group-item list-group-item-action">Home</router-link>
        <router-link to="/about" class="list-group-item list-group-item-action">About</router-link>
      </ul>
    </div>
    <div class="col-10">
      <router-view/>
    </div>
  </div>
</div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

</style>
