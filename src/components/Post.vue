<template>
  <div v-if="contents" class="hello">
    <h3>{{ title }}</h3>
    <img :src="contents.imageSrc" />
    <p>
      {{ contents.content }}
    </p>
    <span>{{ contents.category }}</span
    >, <span>{{ contents.created.seconds }}</span>
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
      if(this.$store.getters.getDB(this.title)){
        this.contents = this.$store.getters.getDB(this.title);}
      
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
