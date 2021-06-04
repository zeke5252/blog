<template>
  <div v-if="!contents" class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <div class="me-sm-0 me-md-5" v-else>
    <header class="mb-5 fixed-top">
      <img src="../assets/prev.svg" class= "u-btn__prev" :style="!isPrevDisplay && 'opacity: .3'" @click="doPrev"/>
      <div class="header--info">
        <h2 v-text="title" />
        <span v-text="contents.category + '&nbsp;&nbsp;&sol;&nbsp;&nbsp;' + contents.created" />
        <div v-if="contents.msgs" class="d-inline-flex mt-2">    
          <img src="../assets/msg.svg" class= "msg me-1" />
          <span style="color: white">{{contents.msgs.length}}</span>
        </div>
      </div>
      <img src="../assets/next.svg" class= "u-btn__next" :style="!isNextDisplay && 'opacity: .3'" @click="doNext"/>
    </header>
    <section class="my-3">
      <template v-for="(el,index) in contentToArr" :key="index">    
        <div v-if="el.substring(0,4)==='http'" class="me-sm-0 ">  
          <PhotoItem :Url="el" :Images="contents.imageFiles" />
        </div>
        <p class="section--p  " v-else>{{el}}</p>
      </template>
    </section>
  </div>
  <div class="row">
    <div class="col-sm-6">
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
    <div class="col-sm-6 mb-2">
      <textarea
        v-model="msg"
        class="form-control border-0"
        style="white-space: pre-line"
        placeholder="內容"
      ></textarea>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-6 mb-6 ">
      <button type="button" class="col-12 col-md-6 offset-md-6 mb-5 mt-1 " style="height: 40px;" v-on:click="doPostMsg">
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
import { convertTime, splitContents } from "../utils/common.js";
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
    const router = useRouter();
    const route = useRoute();

    const contents= ref(null);
    const isPrevDisplay= ref(null);
    const isNextDisplay= ref(null);
    const msgTitle= ref('');
    const msg= ref('');
    const contentToArr= ref([]);

    const GET_DB = computed(()=> store.getters.GET_DB(props.title))

    const init = () => {
      let postData = GET_DB.value;
      if(postData){
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

    const getConvertTime = (time) => convertTime(time, false);

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
            contents.value.msgs = postData.msgs;
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
      if (!store.state[DATA_DB]) {
        store.dispatch("getFirestoreDB").then((res) => {
          init();
        });
      } else {
        init();
      }
      }
    );

    watch(()=>props.title, () => {
      console.log('watch')
      init();
    })

    return {
      getConvertTime,
      GET_DB,
      contents,
      isPrevDisplay,
      isNextDisplay,
      doBack,
      doPrev,
      doNext,
      msgTitle,
      msg,
      contentToArr,
      doPostMsg
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
    position: relative;
    justify-content: center;
    align-items: center;

    .header--info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    h2 {
      letter-spacing: 3px;
      font-weight: 500;
    }

    span {
      font-size: 12px; 
      color: #777;
      letter-spacing: 1px;
    }
  }

  .u-btn {
    &__next {
      position:absolute;
      color:white; 
      width: 40px; 
      height: 40px;
      padding: 12px;
      margin: 0;
      right: 0;
      cursor: pointer
    }
    &__prev {
      position:absolute;
      color:white; 
      width: 40px; 
      height: 40px;
      padding: 12px;
      margin: 0;
      left: 0;
      cursor: pointer
    }
  }

  .msg {
    width: 16px; 
    height: 16px;
  }

  label {
    color: $color-text-grey
  }

  .section--p {
      font-size: 16px;
      line-height: 36px;
      letter-spacing: 1px;
      font-weight: 300;
      margin: 40px 10px;
      text-indent: 10px;
      white-space: pre-wrap;

      &:first-of-type {
      text-indent: 0px;
      }

      &:first-of-type::before {
        content: "";
        background-color: $color-primary-yellow;
        position: absolute;
        margin-top: 10px;
        margin-left:-10px;
        width: 2px;
        height: 14px
      }
  }

  .msg--div__title{
    font-size: 15px;
    font-weight: 500;
    
  }

  .msg--p__text{
    margin-top: 10px;
    color: $color-text-grey;
  }

  hr {
    border-top: 1px dashed $color-text-grey;
  }

</style>
