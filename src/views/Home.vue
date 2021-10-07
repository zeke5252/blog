<template>
  <div v-if="!GET_DB" class="loading"><div></div>
  </div>
  <div v-else class="home">
      <div class="d-flex justify-content-end fixed-top pe-3 pe-md-4 mt-1">
        <label id="searchLabel" for="searchInput" >
          <font-awesome-icon icon="search"/>
        </label>
        <input
          class="search--input p-1"
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
    <div class="row row-cols-1 row-cols-md-3 g-4 pe-sm-0 pe-md-2 ">
      <div class="col"  v-for="(post, index) in !keyResults? GET_DB : keyResults" :key="post.title">
        <button v-if="isLogin" class="removeButton" @click="removePost(post)">
          <font-awesome-icon icon="trash" />
        </button>
        <router-link :to="`/posts/${post.title}`" :class="post.imageFiles.length > 0 ? 'card styleImg border-0' : 'card styleTxt' " >
          <div v-if="post.imageFiles.length > 0" style="overflow: hidden;">
            <PhotoItem :Url="photoUtil.getSrc(post.imageFiles, true)" :Images="post.imageFiles" :showExif="false" :showBorder="false" />
          </div>
          <div class="card-body">
            <div class="createdDate">{{getConvertTime(post.created)}}</div>
            <h5 class="card-title">{{ post.title }}</h5>
            <p class="card-text my-2" >{{ getFirstParagraph(post.content) }}</p>
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
import { db, storage } from "@/firebaseDB.js";
import { firebase } from "@firebase/app";
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
    const isLogin = ref();
    const count= ref(5);
		const isMore= ref(false);
    const keyword= ref("");
    const keyResults= ref(null);

    const GET_DB = computed(()=> store.getters.GET_DB(null, count.value))
    const GET_DB_ALL = computed(()=> store.getters.GET_DB())

    firebase.auth().onAuthStateChanged(function(user) {
      if (user != null) {
        isLogin.value = true;
      } else {
        isLogin.value = false;;
      }
    });

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
      let contentsArr;
      contentsArr = splitContents(content);
      if(!contentsArr){
        return "No contents!";
      } else if(!Array.isArray(contentsArr)){
        return contentsArr
      } else {
        return contentsArr.find( el=> el.substring(0, 4)!=="http" )
      }
    };

    const removePost= (post) => {
      let posts = db.collection("posts");
      let query = posts.where("title", "==", post.title);
      query.get()
      .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            posts.doc(doc.id).delete().then(() => {
                  store.dispatch('getFirestoreDB')
              }).then(() => {
                  removeDBImages(post);
              }).catch((error) => {
                  console.error("Error removing document: ", error);
              });
          });
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });
    };

    const removeDBImages= (post) => {
      // Regex will cause issues on iOS devices
      // let imagesUrls = photoUtil.getSrc(post.imageFiles);
      // let imagesToDelete = imagesUrls.map( url => url.match(/(?<=%2F)[\w- \.]*/)[0]);
      // let filesAllPromises =  imagesToDelete.map(image => {
      //   let storageRef = storage.ref();
      //   storageRef.child(`${post.category}/${image}`).delete();
      // });

      // Promise.all(filesAllPromises).then(res=>{
      //   alert('The post has been deleted!')
      // })
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
      isLogin,
      isMore,
      photoUtil,
      keyword,
      keyResults,
      removePost,
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

  .createdDate {
    height: 20px;
    background-color: $color-card-bg;
    position: absolute;
    right: 0;
    top: -22px;
    text-align: center;
    letter-spacing: 1px;
    padding: 8px 20px 14px 20px;
    font-weight: 700;
    color: $color-primary-yellow;
  }

  #searchLabel {
    width: 30px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .removeButton {
    position: relative; 
    transform: translateY(100%); 
    z-index: 1
  }

  @media (hover:hover) {
    .styleImg:hover {
      outline: $color-primary-yellow 8px solid;
    };

    .styleImg:hover img[src*="https"]{
      transform: scale(1.2);
    };
  }

  .styleImg {
    background-color: $color-card-bg;
    outline: $color-bg 0px solid;
    transition: .2s ease-out;
    animation: cardAnimation ease-out .4s;
    overflow: hidden;
    border-radius: 0;

      .card-text {
      line-height: 2.1;
      letter-spacing: .5px;
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

    // Select every <img> element whose src attribute value contains the substring "https"
    img[src*="https"] {
      transform: scale(1);
      height: 24vh;
      object-fit: cover;
      transition: .2s ease-out; 
    }
  }

  .styleTxt {
    background-color: #eee;
    outline: $color-bg 0px solid;
    transition: .2s ease-out;
    animation: cardAnimation ease-out .4s;
    overflow: hidden;
    border-width: 0px;
    border-radius: 2px;
    color: black !important;

    .card-text {
      line-height: 2.1;
      letter-spacing: .5px;
      color: #888;

      &::before {
      content: "";
      background-color: $color-primary-yellow;
      position: absolute;
      margin-top: 7px;
      margin-left:-8px;
      width: 2px;
      height: 12px;
      }
    }
  }

  .card-body {
    position: relative;
    padding: 26px 20px 30px 20px;
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
      height: 36px;
      background-color: $color-bg;
      opacity: .8;
      color: white;
  }
  
  .search--img{
    width: 36px;
    height: 36px;
    background-color: $color-bg;
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