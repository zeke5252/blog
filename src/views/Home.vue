<template>
  <div class="home">
    <div v-if="!getDB" class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div v-else class="row" @scroll="loadMore">
      <div class="card col-sm-6 m-1 p-0 text-white cardStyle border-0 " v-for="el in getDB" :key="el">
        <router-link :to="`/posts/${el.title}`">
          <img :src="`https://via.placeholder.com/${el.resolution[0]}x${el.resolution[1]}/333/111?Text=Zeke+blog`" @load="onImgLoad($event, el)" :style="getRatio(el.resolution[0], el.resolution[1])" alt="...">
          <div class="card-body">
            <div class="createdDate">{{getConvertTime(el.created)}}</div>
            <h6>{{ el.title }}</h6>
            <p class="card-text" >{{ el.content }}</p>
          </div>
          </router-link>
      </div>
    </div>
    <div v-show="loading">Loading content...</div>
  </div>
</template>

<script>
import convertTime from "../utils/common.js"

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
    getRatio(w, h){
      if( w < h ){
        return "object-fit: cover"
      }
    },
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
		},
    onImgLoad(e, el){
     e.target.src = el.imageSrc;
    },
    getConvertTime(time){
      return convertTime(time, false)
    }
  },
  mounted() {
    this.loadMore();
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

<style lang="scss">

  @import "../assets/css/app.scss";
  
  .createdDate {
    width: auto;
    height: 20px;
    background-color: $color-card-bg;
    position: absolute;
    right: 0;
    top: -26px;
    border-radius: 30px 0 0 0;
    text-align: center;
    padding: 10px 16px 16px 16px;
    font-weight: 300;
    color: $color-primary-yellow;
  }

  .cardStyle {
    width: 17rem;
  }

  a img {
      width: 100%;
      height: 22vh;
      object-fit: cover;
  }

  .card-body {
    background-color: $color-card-bg;
    position: relative;
    padding: 26px 20px 40px 20px;
  }
  .card-text {
      width: 100%;
      height: 20vh;
      line-height: 2;
      overflow:hidden;
      color: $color-text-grey;
      &::before {
      content: "";
      background-color: $color-primary-yellow;
      position: absolute;
      margin-top: 7px;
      margin-left:-8px;
      width: 2px;
      height: 12px
      }
  }

</style>