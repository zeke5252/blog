<template>
  <div class="home">
    <ul>
      <li v-for="el in contents" :key="el">
        <router-link :to="`/posts/${el.title}`">
          <h3>{{ el.title }}</h3>
          <p>
            {{ el.content }}
          </p>
        </router-link>
      </li>
    </ul>
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
  mounted() {
  },
};
</script>
