<template>
  <div v-if="!contents" class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <div v-else>
    <header style="display:flex; align-items: center;">
      <BIconChevronLeft class= "u-btn" v-on:click="doBack"/>
      <h4>{{ title }}</h4>
      <span style="color:white; font-size:14px; margin-left: 10px; color: #777 ;transform: translateY(20%); font-weight: 600" >{{ contents.category }}</span>
      <span style="color:white; font-size:14px; margin-left: 10px; color: #777 ;transform: translateY(20%); font-weight: 600" >  /  </span>
      <span style="color:white; font-size:14px; margin-left: 10px; color: #777 ;transform: translateY(20%); font-weight: 600">{{ contents.created }}</span>
    </header>
    <main>
      <BIconChevronLeft v-show="isPrevDisplay" class= "u-btn__prev" v-on:click="doPrev"/>
      <img :src="contents.imageSrc" class="main--img" />
      <BIconChevronRight v-show="isNextDisplay" class= "u-btn__next" v-on:click="doNext"/>
      <ul>
        <li v-for="info in Object.entries(contents.exif && JSON.parse(contents.exif))" :key="info">
          <span style="font-weight:600">{{info[0]}}</span> : <span style="color:#999">{{info[1]}}</span>
        </li>
      </ul>
    </main>
      <p class="main--p__text">
        {{ contents.content }}
      </p>
  </div>
  <div class="row">
    <div class="col-sm-4">
      <label class="form-label h5 mb-3" for="formTitle">
      留言
      </label>
      <input
        v-model="msgTitle"
        type="text"
        class="form-control mb-3 border-0"
        id="formTitle"
        aria-label="Title"
        placeholder="大名"
      />
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 mb-3">
      <textarea
        v-model="msg"
        class="form-control border-0"
        style="white-space: pre"
        placeholder="內容"
      ></textarea>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 mb-3">
      <button type="button" class="btn mb-5 msg--btn__submit" v-on:click="doPostMsg">
        Post message
      </button>
    </div>
  </div>
    <ul v-if="contents ">
      <li v-for="msg in contents.msgs" :key="msg">
        <div class="h5 msg--div__title">{{msg.name}}</div>
        <p class="msg--p__text">{{msg.comment}}</p>
        <hr class="mb-4" style="height:1px;border:none;border-top:1px dashed #ffffff;opacity:.4"/>
      </li>
    </ul>
    <footer class="m-5 "></footer>
</template>

<script>
import convertTime from "../utils/common.js";
import { firebase } from "@firebase/app";
import router from '../router/';
import { db } from "@/firebaseDB.js";


export default {
  name: "Post",
  data() {
    return {
      contents: null,
      isPrevDisplay: null,
      isNextDisplay: null,
      msgTitle: '',
      msg: ''
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
  computed: {

  },
  mounted() {
    if (!this.$store.state.dbData2) {
      this.$store.dispatch("getFirestoreDB").then((res) => {
        this.init();
      });
    } else {
      this.init();
    }
  },
  methods: {
    init() {
      let postData = this.$store.getters.getDB(this.title);
      if(postData){
        let {post, isPrevDisplay, isNextDisplay} = postData;
        this.isPrevDisplay = isPrevDisplay;
        this.isNextDisplay = isNextDisplay;
        this.msgTitle= '';
        this.msg= '';
        post.created = convertTime(post.created);
        this.contents = post;
      } else {
        this.$router.push('/components/NotFound.vue')
      }

    },
    doBack(){
      router.push("/");;
    },
    doPrev(){
      let toTitle = this.$store.getters.getPost(this.$route.params.title, false);
      router.push(toTitle);
    },
    doNext(){
      let toTitle = this.$store.getters.getPost(this.$route.params.title, true);
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
    }
  },
};
</script>

<style scoped lang="scss">
@import "../assets/css/app.scss";
  h4 {
    letter-spacing: 1px;
    font-weight: 500;
    color: white;
    line-height: 40px;
    margin: 0;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }
  a {
    color: #42b983;
  }
  .u-btn {
    color:white; 
    width: 40px; 
    height: 40px;
    padding: 10px;
    margin: 0;
  }
  main {
    position: relative;
    display: flex;
    flex-direction: column;
    .u-btn__prev {
    color:white; 
    width: 60px; 
    height: 60px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
  }
    .u-btn__next {
    color:white; 
    width: 60px; 
    height: 60px;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
  }
  ul {
    background-color: rgba(0, 0, 0, 0.7);
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 100;
    color: white;
    padding: 20px 40px;
    font-size: 10px;
    margin-bottom: 0;
  }
  li {
    letter-spacing: 2px;
    padding: 7px 0;
  }
    img {
      max-width: 100%;
      height: auto;
      margin-top: 10px;
    }
  }
  label {
    margin-top: 30px;
    color: #7e7e7e
  }
  .msg--btn__submit {
    background-color: $color-primary-yellow;
    color: black;
    width: 40%;
    transform: translateX(150%);
  }
  .main--p__text{
    color: white;
    font-size: 15px;
    margin: 20px 0 20px 0;
    line-height: 32px;
    padding-left: 10px;
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
    color: rgb(255, 255, 255);
    font-size: 14px;
    font-weight: 500;
  }
  .msg--p__text{
    color: rgba(255, 255, 255, 0.603);
    font-size: 14px;
  }
</style>
