<template>
  <div v-if="!GET_DB" class="loading">
    <div/>
  </div>
  <div v-else class="home">
    <div class="search--input">
      <label for="searchInput" class="form-label"><img src="../assets/search.svg" class="search--img"></label>
      <input
        v-model="keyword"
        type="text"
        list="keywordlistOptions"
        id="searchInput"
        aria-label="searchInput"
      />
    </div>
    <datalist id="keywordlistOptions">
      <option v-for="post in GET_DB_ALL" :key="post.title" :value="post.title" />
    </datalist>
    <div class="row">
      <div class="card col-sm-6 mx-3 mb-3 p-0 text-white cardStyle border-0 " v-for="post in !keyResults? GET_DB : keyResults" :key="post.title">
        <router-link :to="`/posts/${post.title}`">
          <PhotoItem :Url="photoUtil.getSrc(post.imageFiles)" :Images="post.imageFiles" :showExif="false" />
          <div class="card-body">
            <div class="createdDate">{{getConvertTime(post.created)}}</div>
            <h6>{{ post.title }}</h6>
            <p class="card-text mt-2" >{{ getFirstParagraph(post.content) }}</p>
          </div>
        </router-link>
      </div>
    </div>
    <div v-if="isMore && GET_DB" class="more">
      <div class="more--box" ></div>
      <div class="more--word h7">MORE...</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { convertTime, splitContents, photoUtil } from "../utils/common.js";
import { GET_DB } from "../store/types.js";
import _ from "lodash";

import PhotoItem from "../components/Photo.vue";

export default {

  name: "Home",

  setup(props) {
    
    const store = useStore();

    const count= ref(5);
		const isMore= ref(false);
    const keyword= ref("");
    const keyResults= ref(null);

    const GET_DB = computed(()=> store.getters.GET_DB(null, count.value))
    const GET_DB_ALL = computed(()=> store.getters.GET_DB())

    const loadMore= (e) => {
            const getWindowHeight = document.documentElement.clientHeight || document.body.clientHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
			      if (!isMore.value && scrollTop + getWindowHeight >= scrollHeight*4/5) {
				      isMore.value = true;
				      setTimeout(() => {
					      count.value += 5;
					      isMore.value = false;
                if(GET_DB.value.length < count.value){
                  document.removeEventListener('scroll', loadMore, true)
                }
				      }, 1000);                
            }
          }

    document.addEventListener('scroll', loadMore, true);
    store.dispatch('getFirestoreDB').then(res=>{
      loadMore();
    });

    const getConvertTime= (time) => convertTime(time, false);
    const getFirstParagraph= (content) => {
            let result;
            result = splitContents(content);
            if(!result) return "No contents!"
            return result.find( el=> el.substring(0, 4)!=="http" )
          };

    watch(keyword, (val, pre) => {
      _.debounce(function(){
        let all = GET_DB_ALL.value;
        let results = all.filter( (post,index) => post.title.includes(val) )
        keyResults.value = results;
      }, 500)()
    })

    onBeforeUnmount(()=>{
      document.removeEventListener('scroll', loadMore, true)
    });

    return {
      isMore,
      photoUtil,
      keyword,
      keyResults,
      getConvertTime,
      getFirstParagraph,
      GET_DB,
      GET_DB_ALL,
    }
  },
  
  components: {
    PhotoItem
  },
};

</script>

<style lang="scss">

  @import "../assets/css/app.scss";
  
  .home {
    display: flex;
    flex-direction: column;
  }

  .createdDate {
    height: 20px;
    background-color: $color-card-bg;
    position: absolute;
    right: 0;
    top: -26px;
    text-align: center;
    letter-spacing: 1px;
    padding: 10px 20px 16px 20px;
    font-weight: 800;
    color: $color-primary-yellow;
  }

  .cardStyle {
    width: 29.5%;
    background-color: $color-card-bg;
    outline: $color-bg 0px solid;
    transition: .2s ease-out;
    overflow: hidden;
    animation: cardAnimation ease-out .4s;
    border-radius: 0 !important;

    &:hover {
      outline: $color-primary-yellow 8px solid;
      width: 30%;
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

  .loading {
    border-top: white 2px solid;
    border-bottom: white 2px solid;
    width: 80px;
    display: flex;
    justify-content: center;
    animation: moreAnimation ease .3s;
    animation-fill-mode: forwards;
    position: relative;
    margin: auto;
    top: 40vh;
    
    &::before {
      content:"";
      position: absolute;
      background-color: white;
      width: 12px;
      height: 4px;
      left: 0;
      top: -6px;
    }

    div {
      width: 22px;
      height: 22px;
      border: 8px solid $color-primary-yellow;
      border-radius: 16px;
      position: relative;
      animation: loadAnimation ease 1s infinite;

      &::after {
        content:"";
        position: absolute;
        background-color: white;
        width: 4px;
        height: 4px;
        right: -10px;
        top: -10px;
        border-radius: 10px;
      }
    }
  }

  .more{
    border-top: white 2px solid;
    border-bottom: white 2px solid;
    width: 80px;
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: moreAnimation ease-out .3s;
    animation-fill-mode: forwards;
    letter-spacing: 1px;
    position: relative;

    &::before {
      content:"";
      position: absolute;
      background-color: white;
      width: 12px;
      height: 4px;
      left: 0;
      top: -6px;
    }

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

  .search--input {
    display: flex;
    padding-right: 50px;
    justify-content: flex-end;
    position: fixed;
    top: 10px;
    right: 0;
    width: 100%;
    z-index: 100;

    input {
      width: 15%;
      min-width: 200px;
      height: 40px;
      padding: 5px;
      background-color: $color-bg;
      opacity: .8;
      color: white;
    }
  }
  
  .search--img{
    width: 40px;
    height: 40px;
    background-color: $color-bg;
    padding: 5px;
    opacity: .8;
  }

  @keyframes cardAnimation {
    from  {top: -30px; opacity: 0; }
    to    {top: 0px; opacity: 1;}
  }

  @keyframes moreAnimation {
    from  {padding: 0px 0px; opacity: 0}
    to    {padding: 12px 0px; opacity: 1}
  }

  @keyframes loadAnimation {
    0%    {border-width: 2px}
    50%   {border-width: 8px}
    100%  {border-width: 2px}
  }

</style>