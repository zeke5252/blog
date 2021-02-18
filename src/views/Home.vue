<template>
  <div class="home">
    <div v-if="!getDB" class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div v-else class="list-group" @scroll="loadMore">
      <router-link :to="`/posts/${el.title}`" v-for="el in getDB" :key="el" class="list-group-item list-group-item-action">
        <template class="d-flex flex-column align-items-start">
          <h5>{{ el.title }}</h5>
          <img :src="el.imageSrc" style="width: 900px; height:auto"/>
          <p>
            {{ el.content }}
          </p>
        </template>
      </router-link>
    </div>
    <div v-show="loading">Loading content...</div>
  </div>
</template>

<script>

export default {
  name: "Home",
  data() {
    return {
      items: 5,
		  loading: false
    }
  },
  computed:{
    getDB(){
      return this.$store.getters.getDB(null, this.items)
    }
  },
  methods: {
    loadMore(e) {
      const getWindowHeight = document.documentElement.clientHeight || document.body.clientHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
			if (!this.loading && scrollTop + getWindowHeight >= scrollHeight*4/5) {
				this.loading = true;
				setTimeout(() => {
					this.items+=5;
					this.loading = false;
				}, 1000);                
      }
		}
  },
  mounted() {
    document.addEventListener('scroll', this.loadMore, true)
    this.$store.dispatch('getFirestoreDB')
  },
  beforeUnmount() {
    document.removeEventListener('scroll', this.loadMore, true)
  },
  watch: {
    getDB(val, pre){
      if(this.$store.getters.getDB().length === val.length){
        document.removeEventListener('scroll', this.loadMore, true)
      }
    }
  }
};
</script>
