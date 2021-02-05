<template>
  <div class="home">
    <div class="list-group">
      <router-link :to="`/posts/${el.title}`" v-for="el in getDB" :key="el" class="list-group-item list-group-item-action">
        <h3>{{ el.title }}</h3>
        <p>
          {{ el.content }}
        </p>
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
// @ is an alias to /src
import Post from "@/components/Post.vue";
import obj from "@/assets/data.js";

export default {
  name: "Home",
  components: {
    Post,
  },
  data() {
    return {
      contents: obj
    };
  },
  computed:{
    getDB(){
      return this.$store.getters.getDB
    }
  },
  mounted() {
    this.$store.dispatch('getFirestoreDB')
  },
};
</script>
