<template>
  <div class="home">

    <div class="row" @scroll="loadMore">
      <div class="card col-sm-6 m-3 p-0 text-white cardStyle border-0 " v-for="el in getDB" :key="el.title">
        <router-link :to="`/posts/${el.title}`" @mouseover="onMouseover">
          <img :src="`https://via.placeholder.com/${el.resolution[0]}x${el.resolution[1]}/111/111?Text=Zeke+blog`" @load="onImgLoad($event, el)" :alt="el.title">
          <div class="card-body">
            <div class="createdDate">{{getConvertTime(el.created)}}</div>
            <h6>{{ el.title }}</h6>
            <p class="card-text mt-2" >{{ el.content }}</p>
          </div>
        </router-link>
      </div>
    </div>
    <!-- v-show="loading && getDB" -->
    <div  class="loading">
      <div class="loading--box" ></div>
      <div class="loading--word h6">Loading...</div>
    </div>
  </div>
</template>

<script>
import convertTime from "../utils/common.js"

export default {
  name: "Home",
  data() {
    return {
      items: 5,
		  loading: false,
      show: false
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
		},
    onImgLoad(e, el){
     e.target.src = el.imageSrc;
    },
    getConvertTime(time){
      return convertTime(time, false)
    }
  },
  created() {
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
    width: 28%;
    background-color: $color-card-bg;
    outline: $color-bg 2px solid;
    transition: .2s ease-out;
    overflow: hidden;
    animation: cardAnimation .5s;

    &:hover {
      outline: $color-primary-yellow 8px solid;
      width: 30%;
    }
    &:hover img{
      transform: scale(1.2);
    }

    img {
      width: 100%;
      height: 22vh;
      object-fit:cover;
      transition: all .5s ease;
    }
  }

  .card-body {
    background-color: $color-card-bg;
    position: relative;
    padding: 26px 20px 40px 20px;
  }
  .card-text {
      width: 100%;
      height: 20vh;
      line-height: 2.1;
      letter-spacing: .5px;
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
  .loading{
    background-color: $color-bg;
    border-top: $color-text-grey 3px solid;
    border-bottom: $color-text-grey 3px solid;
    padding: 14px 0;
    width: 100px;
    margin: 24px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    &--box {
      width: 2px;
      height: 14px;
      background-color: $color-primary-yellow;
      animation:spin .5s linear infinite;
    }
    &--word {
      font-weight: 500;
      margin: 0 0 0 16px;
    }
  }

  @keyframes cardAnimation {
    from  {top: -30px; opacity: 0;}
    to    {top: 0px; opacity: 1;}
  }
</style>