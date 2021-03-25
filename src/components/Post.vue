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
    <section class="section--photos my-3">
      <template v-for="(el,index) in contentToArr" :key="index">    
        <PhotoItem v-if="el.includes('http')"  :File="onFile(el)" />
        <p v-else>{{el}}</p>
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
import convertTime from "../utils/common.js";
import { firebase } from "@firebase/app";
import router from '../router/';
import { db } from "../firebaseDB.js";
import { GET_DB, GET_POST, DATA_DB } from "@/store/types";

import PhotoItem from "./Photo.vue";

export default {
  name: "Post",
  data() {
    return {
      contents: null,
      isPrevDisplay: null,
      isNextDisplay: null,
      msgTitle: '',
      msg: '',
      contentToArr: []
    };
  },
  components: {
    PhotoItem
  },
  props: {
    title: String,
  },
  watch: {
    title: function() {
      this.init();
    },
  },
  computed: {
    GET_DB(){
      return this.$store.getters.GET_DB(this.title)}
  },
  mounted() {
    if (!this.$store.state[DATA_DB]) {
      this.$store.dispatch("getFirestoreDB").then((res) => {
        console.log('if')
        this.init();
      });
    } else {
       console.log('else')
      this.init();
    }
  },
  methods: {
    init() {
      let postData = this.GET_DB;
      if(postData){
        let {post, isPrevDisplay, isNextDisplay} = postData;
        this.isPrevDisplay = isPrevDisplay;
        this.isNextDisplay = isNextDisplay;
        this.msgTitle= '';
        this.msg= '';
        post.created = convertTime(post.created);
        this.doContentToArr(post.content);
        this.contents = post;
      } else {
        this.$router.push('/components/NotFound.vue')
      }

    },
    doContentToArr(content){
      let urls = content.match(/\bhttps?:\/\/\S+/gi);
      urls.forEach(url=>{
        content = content.replace(url, "URLS");
      })
      console.log('str=', content)
      let contentArr = content.split("URLS")
      console.log('arr=', contentArr)
      let i=1;
      // Insert urls to corresponding indexes.
      urls.forEach((url,index)=>{
        contentArr.splice(index+i, 0, url)
        i++
      })
      // Remove elements with only whitespace.
      this.contentToArr = contentArr.filter( el=> el.replace(/\s/g, '').length )
    },
    onFile(url){
      let result;
      JSON.parse(this.contents.imageFiles).forEach(image=>{
        if(image.imageSrc===url){
          result = image
        }
      })
      return result;
    },
    doBack(){
      router.push("/");;
    },
    doPrev(){
      let toTitle = this.$store.getters.GET_POST(this.$route.params.title, false);
      router.push(toTitle);
    },
    doNext(){
      let toTitle = this.$store.getters.GET_POST(this.$route.params.title, true);
            console.log('toTitle=', toTitle)
      router.push(toTitle);
    },
    doPostMsg(){
      db.collection("posts").where("title", "==", this.contents.title).get()
      .then( posts => {
        posts.forEach(async (post) => {
          const postRef = db.collection("posts").doc(post.id);
          postRef.update({msgs:firebase.firestore.FieldValue.arrayUnion({name: this.msgTitle, comment: this.msg})})
          .then(async res=>{ 
            let postGet = await postRef.get();
            let postData = postGet.data()
            this.contents.msgs = postData.msgs;
            alert('留言成功！')
            this.init();
          })
        })
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
    },
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

  .section--photos{
    width: 100%;

    ::deep p {
      font-size: 15px;
      line-height: 32px;
      letter-spacing: 1px;
      font-weight: 100;
      margin-top: 20px;

      &::before {
        content: "";
        background-color: $color-primary-yellow;
        position: absolute;
        margin-top: 7px;
        margin-left: 0px;
        width: 3px;
        height: 17px
      }

    img {
      margin: 28px 0;
      display: block;
      width: 80%;
    }
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
