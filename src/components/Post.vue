<template>
  <div v-if="contents" class="hello">
    <h3>{{ title }}</h3>
    <img :src="contents.imageSrc" style="width: 800px; height:auto"/>
    <p>
      {{ contents.content }}
    </p>
    <span>{{ contents.category }}</span
    >, <span>{{ contents.created }}</span>
  </div>
</template>

<script>
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
    if (!this.$store.state.dbData2 || this.$store.state.dbData2.length<1) {
      this.$store.dispatch("getFirestoreDB").then((res) => {
        this.init();
      });
    } else {
            console.log('with data')
      this.init();
    }
  },
  methods: {
    init() {
      let content = this.$store.getters.getDB(this.title)
      let time = content.created; 
      let date = time.toDate(); 
      let shortDate = date.toDateString(); 
      let shortTime = date.toLocaleTimeString();
      content.created = `${shortDate}, ${shortTime}`
      this.contents = content;
    },
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
