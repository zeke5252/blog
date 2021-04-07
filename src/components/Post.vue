<template>
  <div v-if="!contents" class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <div v-else>
    <header>
      <BIconChevronLeft class= "u-btn__back" v-on:click="doBack"/>
      <h4 v-text="title" />
      <span v-text="contents.category" />
      <span v-text="  '&sol;'  " />
      <span v-text="contents.created" />
      <BIconChevronRight v-if="isNextDisplay" class= "u-btn u-btn__next" @click="doNext"/>
      <BIconChevronLeft v-if="isPrevDisplay" class= "u-btn u-btn__prev" @click="doPrev"/>
    </header>
    <section class="my-3">
      <template v-for="(el,index) in contentToArr" :key="index">    
        <PhotoItem v-if="el.substring(0,4)==='http'"  :Url="el" :Images="contents.imageFiles" />
        <p class="section--p  " v-else>{{el}}</p>
      </template>
    </section>
  </div>
  <div class="row">
    <div class="col-sm-4">
      <label class="form-label h6 mb-3 mt-5 " for="formTitle"> 留言 </label>
      <input
        v-model="msgTitle"
        type="text"
        class="form-control mb-2 border-0"
        id="formTitle"
        aria-label="Title"
        placeholder="大名"
      />
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 mb-2">
      <textarea
        v-model="msg"
        class="form-control border-0"
        style="white-space: pre"
        placeholder="內容"
      ></textarea>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4">
      <button type="button" class="btn mb-5 msg--btn__submit" v-on:click="doPostMsg">
        Post message
      </button>
    </div>
  </div>
  <ul class="px-0" v-if="contents ">
    <li v-for="msg in contents.msgs" :key="msg">
      <div class="h6 msg--div__title mb-0">{{msg.name}}</div>
      <p class="msg--p__text mb-2">{{msg.comment}}</p>
      <hr/>
    </li>
  </ul>
    <footer class="my-5"></footer>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import {convertTime,splitContents} from "../utils/common.js";
import { firebase } from "@firebase/app";
import router from '../router/';
import { useStore } from "vuex";
import { useRouter, useRoute } from 'vue-router'
import { db } from "../firebaseDB.js";
import { GET_DB, GET_POST, DATA_DB } from "@/store/types";

import PhotoItem from "./Photo.vue";

export default {
  name: "Post",

  props: {
    title: String,
  },

  setup(props) {

    const store = useStore();

    const router = useRouter()
    const route = useRoute()

    const contents= ref(null);
    const isPrevDisplay= ref(null);
    const isNextDisplay= ref(null);
    const msgTitle= ref('');
    const msg= ref('');
    const contentToArr= ref([]);

    const GET_DB = computed(()=> store.getters.GET_DB(props.title))

    const getConvertTime = (time) => convertTime(time, false);

    const init = () => {
      let postData = GET_DB.value;
      console.log('data=', postData)
      if(postData){
        // let {post, isPrevDisplay, isNextDisplay} = postData.;
        isPrevDisplay.value = postData.isPrevDisplay;
        isNextDisplay.value = postData.isNextDisplay;
        msgTitle.value= '';
        msg.value= '';
        postData.post.created = convertTime(postData.post.created);
        contentToArr.value = splitContents(postData.post.content);
        contents.value = postData.post;
      } else {
        router.push('/components/NotFound.vue')
      }
    };

    const doBack = () => {
      router.push("/");
    };

    const doPrev = () => {
      let toTitle = store.getters.GET_POST(route.params.title, false);
      router.push(toTitle);
    };

    const doNext = () => {
      let toTitle = store.getters.GET_POST(route.params.title, true);
      router.push(toTitle);
    };

    const doPostMsg = () => {
      db.collection("posts").where("title", "==", contents.value.title).get()
      .then( posts => {
        posts.forEach(async (post) => {
          const postRef = db.collection("posts").doc(post.id);
          postRef.update({msgs:firebase.firestore.FieldValue.arrayUnion({name: msgTitle.value, comment: msg.value})})
          .then(async res=>{ 
            let postGet = await postRef.get();
            let postData = postGet.data()
            this.contents.msgs = postData.msgs;
            alert('留言成功！')
            init();
          })
        })
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
    };

    onMounted(() => {
      if (store.state[DATA_DB]) {
        store.dispatch("getFirestoreDB").then((res) => {
          console.log('yes')
          init();
        });
      } else {
        console.log('no')
        init();
      }
      }
    );

    watch(props.title, (val, pre) => {
      init();
    })

    return {
      getConvertTime,
      GET_DB,
      contents,
      isPrevDisplay,
      isNextDisplay,
      msgTitle,
      msg,
      contentToArr
    }
  },

  components: {
    PhotoItem
  },
};
</script>

<style scoped lang="scss">
  
  @import "../assets/css/app.scss";

  header {
    display:flex; 
    align-items: center;
    margin-bottom: 10px;

    h4 {
      margin-bottom: 0;
      margin-right: 10px;
    }

    span {
      color:white; 
      font-size:15px; 
      margin-left: 10px; 
      color: #777;
      transform: translateY(20%); font-weight: 400
    }
  }

  .u-btn {
    color:white; 
    width: 40px; 
    height: 40px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
    
    &__back {
      color:white; 
      width: 40px; 
      height: 40px;
      padding: 10px;
    }
    &__prev {
     // left: 0;
    }
    &__next {
     // right: 0;
    }
  }

  label {
    color: $color-text-grey
  }

  .msg--btn__submit {
    background-color: $color-primary-yellow;
    width: 40%;
    transform: translateX(150%);
  }

  .section--p {
      font-size: 15px;
      line-height: 32px;
      letter-spacing: 1px;
      font-weight: 100;
      margin: 40px 0;
      text-indent: 10px;

      &::before {
        content: "";
        background-color: $color-primary-yellow;
        position: absolute;
        margin-top: 7px;
        margin-left: -10px;
        width: 3px;
        height: 17px
      }
  }

  .msg--div__title{
    font-size: 14px;
    font-weight: 500;
  }

  .msg--p__text{
    color: $color-text-grey;
  }

  hr {
    border-top: 1px dashed $color-text-grey;
  }

</style>
