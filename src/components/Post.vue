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
    </header>
    <section>
      <BIconChevronRight v-if="isNextDisplay" class= "u-btn u-btn__next" @click="doNext"/>
      <BIconChevronLeft v-if="isPrevDisplay" class= "u-btn u-btn__prev" @click="doPrev"/>
      <img :src="contents.imageSrc" class="section--img"/>
      <ul>
        <li v-for="info in Object.entries(contents.exif && JSON.parse(contents.exif))" :key="info">
          <span style="font-weight:400" v-text="info[0]" /> : <span style="color:#999" v-text="info[0]" />
        </li>
      </ul>
    </section>
      <p class="section--p__text my-3">
        {{ contents.content }}
      </p>
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
import { GET_DB, GET_POST, DATA_DB } from "@/store/types"

export default {
  name: "Post",
  data() {
    return {
      contents: null,
      isPrevDisplay: null,
      isNextDisplay: null,
      msgTitle: '',
      msg: '',
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
        this.contents = post;
      } else {
        this.$router.push('/components/NotFound.vue')
      }

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
    width: 60px; 
    height: 60px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    
    &__back {
      color:white; 
      width: 40px; 
      height: 40px;
      padding: 10px;
    }
    &__prev {
      opacity: 0;
      left: 0;
      &:hover {
        opacity: 1 !important;
      }
    }
    &__next {
      opacity: 0;
      right: 0;
      &:hover {
        opacity: 1 !important;
      }
    }
  }

  section {
    position: relative;
    display: flex;
    flex-direction: column;

    &:hover svg, &:hover ul {
      opacity: 1 !important;
    }

    ul {
      background-color: rgba(0, 0, 0, 0.5);
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 100;
      padding: 40px 60px;
      font-size: 9px;
      height: auto;
      letter-spacing: 1px;
      pointer-events: none;
      opacity: 0;

      li{
        padding: 10px 0;
        list-style-type: none !important;
      }
    }

    img {
      max-width: 100%;
      height: auto;
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

  .section--p__text{
    font-size: 15px;
    line-height: 32px;
    letter-spacing: 1px;
    padding-left: 10px;
    font-weight: 100;
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
