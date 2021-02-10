<template>
  <div class="home">
    <div v-show="isBrowseShow" class="list-group">
      <router-link :to="`/posts/${el.title}`" v-for="el in getDB" :key="el" class="list-group-item list-group-item-action">
        <h3>{{ el.title }}</h3>
        <p>
          {{ el.content }}
        </p>
      </router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>

export default {
  name: "Home",
  data() {
    return {
      isBrowseShow: true
    }
  },
  computed:{
    getDB(){
      return this.$store.getters.getDB()
    }
  },
  mounted() {
    console.log('App mount')
    this.$store.dispatch('getFirestoreDB')
  },
};
</script>
