<template>
  <div v-if="!contents" class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <div v-else class="hello">
    <button type="button" class="btn btn-secondary" v-on:click="doBack">
      Back
    </button>
    <h3>{{ title }}</h3>
    <button type="button" class="btn btn-secondary" v-on:click="doPrev">
      previous
    </button>
    <img :src="contents.imageSrc" style="width: 800px; height:auto" />
    <button type="button" class="btn btn-secondary" v-on:click="doNext">
      Next
    </button>
    <p>
      {{ contents.content }}
    </p>
    <span>{{ contents.category }}</span
    >, <span>{{ contents.created }}</span>
  </div>
</template>

<script>
import router from '../router/';

export default {
  name: "Post",
  data() {
    return {
      contents: null,
    };
  },
  props: {
    title: String,
  },
  watch: {
    title: function() {
      this.init();
    },
  },
  mounted() {
    if (!this.$store.state.dbData2) {
      this.$store.dispatch("getFirestoreDB").then((res) => {
        this.init();
      });
    } else {
      this.init();
    }
  },
  methods: {
    init() {
      let content = this.$store.getters.getDB(this.title);
      if(typeof content.created !== "string"){
        let time = content.created;
        let date = time.toDate();
        let shortDate = date.toDateString();
        let shortTime = date.toLocaleTimeString();
        content.created = `${shortDate}, ${shortTime}`;
      }
      this.contents = content;
    },
    doBack(){
      router.go(-1);
    },
    doPrev(){
      let toTitle = this.$store.getters.getPost(this.$route.params.title, false);
      router.push(toTitle);
    },
    doNext(){
      let toTitle = this.$store.getters.getPost(this.$route.params.title, true);
      router.push(toTitle);
    }
  },
};
</script>

<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
a {
  color: #42b983;
}
</style>
