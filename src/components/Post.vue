<template>
  <div v-if="!contents" class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <div v-else class="hello">
    <button type="button" class="btn btn-secondary" v-on:click="doBack">
      Back
    </button>
    <h3>{{ title }}</h3>
    <button v-show="isPrevDisplay" type="button" class="btn btn-secondary" v-on:click="doPrev">
      previous
    </button>
    <img :src="contents.imageSrc" style="width: 800px; height:auto" />
    <button v-show="isNextDisplay" type="button" class="btn btn-secondary" v-on:click="doNext">
      Next
    </button>
    <p>
      {{ contents.content }}
    </p>
    <span>{{ contents.category }}</span
    >, <span>{{ contents.created }}</span>
  </div>
  <div class="row">
    <input
      v-model="msgTitle"
      type="text"
      class="form-control"
      id="formTitle"
      aria-label="Title"
      placeholder="Name"
    />
    <textarea
      v-model="msg"
      class="form-control"
      style="white-space: pre"
      placeholder="Comment"
    ></textarea>
    <button type="button" class="btn btn-secondary" v-on:click="doPostMsg">
      Post message
    </button>
    <ul v-if="contents ">
      <li v-for="msg in contents.msgs" :key="msg">{{msg.name}} - {{msg.comment}}</li>
    </ul>
  </div>
</template>

<script>
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
      let {post, isPrevDisplay, isNextDisplay} = this.$store.getters.getDB(this.title);
      this.isPrevDisplay = isPrevDisplay;
      this.isNextDisplay = isNextDisplay;
      this.msgTitle= '';
      this.msg= '';
      if(typeof post.created !== "string"){
        let time = post.created;
        let date = time.toDate();
        let shortDate = date.toDateString();
        let shortTime = date.toLocaleTimeString();
        post.created = `${shortDate}, ${shortTime}`;
      }
      this.contents = post;
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
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  a {
    color: #42b983;
  }
</style>
