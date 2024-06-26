<template>
  <div>
    <div v-if="!contents" class="spinner-border" role="status">
      <span class="visually-hidden"> Loading... </span>
    </div>
    <div v-else class="me-sm-0 me-md-5">
      <header
        class="d-flex position-relative justify-content-center align-items-center mb-5 fixed-top"
      >
        <font-awesome-icon
          icon="chevron-left"
          :class="`u-btn u-btn__prev ${!contents.prevPost?.exists ? 'u-btn__grey' : ''}`"
          @click="doPrev"
        />
        <div class="d-flex flex-column align-items-center px-5">
          <h1 class="fw-normal" v-text="title" />
          <span class="fw-light fs-6 opacity-75">{{
            contents.postCaption
          }}</span>
          <div v-if="contents.msgs" class="d-inline-flex mt-2">
            <img src="../assets/msg.svg" class="msg me-1" />
            <span style="color: white">
              {{ contents.msgs.length }}
            </span>
          </div>
        </div>
        <font-awesome-icon
          icon="chevron-right"
          :class="`u-btn u-btn__next ${!contents.nextPost?.exists ? 'u-btn__grey' : ''}`"
          @click="doNext"
        />
      </header>
      <section class="my-3">
        <PostElement
          v-for="(element, index) in contents.postElements"
          :key="index"
          :element="element"
          :imageFiles="contents.imageFiles"
        />
      </section>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <label class="form-label h6 mb-3 mt-5" for="formTitle"> 留言 </label>
        <input
          v-model="msgTitle"
          type="text"
          class="form-control mb-2 border-0"
          id="formTitle"
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
      <div class="col-sm-6 mb-6">
        <button
          type="button"
          class="btn btn-primary col-12 col-md-6 offset-md-6 mb-5 mt-1"
          v-on:click="doPostMsg"
        >
          Post message
        </button>
      </div>
    </div>
    <ul class="px-0" v-if="contents">
      <li v-for="msg in contents.msgs" :key="msg">
        <div class="h6 msg--div__title mb-0">
          {{ msg.name }}
        </div>
        <p class="msg--p__text mb-2">
          {{ msg.comment }}
        </p>
        <hr />
      </li>
    </ul>
    <footer class="my-5"></footer>
  </div>
</template>

<script>
import { ref, computed, watch, defineComponent } from 'vue';
import { convertTime, ContentAPI } from '../utils/common.js';
import { firebase } from '@firebase/app';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { db } from '../firebaseDB.js';

import PostElement from '../components/PostElement.vue';

export default defineComponent({
  name: 'Post',
  components: {
    PostElement,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const contents = ref(null);
    const msgTitle = ref('');
    const msg = ref('');

    const title = computed(() => route.params.title);

    async function init() {
      contents.value = null;

      try {
        const querySnapshot = await db
          .collection('posts')
          .where('title', '==', title.value)
          .get();

        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          contents.value = postData;
          contents.value.postCaption = `${postData.category} / ${convertTime(postData.created)}`;
          contents.value.postElements = ContentAPI.splitPost(postData.content);
        });
        contents.value.nextPost = await store.getters.adjacentPost(
          contents.value.created
        );
        contents.value.prevPost = await store.getters.adjacentPost(
          contents.value.created,
          false
        );
      } catch (error) {
        console.log('Error getting documents: ', error);
        router.replace({ name: 'The404' });
      }
    }

    function doPrev() {
      if (contents.value.prevPost?.data?.title) {
        router.push(contents.value.prevPost.data.title);
      }
    }

    function doNext() {
      if (contents.value.nextPost?.data?.title) {
        router.push(contents.value.nextPost.data.title);
      }
    }

    async function doPostMsg() {
      try {
        const posts = await db
          .collection('posts')
          .where('title', '==', contents.value.title)
          .get();
        posts.forEach(async (post) => {
          const postRef = db.collection('posts').doc(post.id);
          if (msgTitle.value.trim() === '' || msg.value.trim() === '') {
            alert('Please enter a name and message before posting.');
            return;
          }
          await postRef.update({
            msgs: firebase.firestore.FieldValue.arrayUnion({
              name: msgTitle.value,
              comment: msg.value,
            }),
          });
          let postGet = await postRef.get();
          let postData = postGet.data();
          contents.value.msgs = postData.msgs;
          alert('留言成功！');
        });
        init();
      } catch (error) {
        // Display user-friendly error message
        alert('An error occurred while posting the message. Please try again.');
      }
    }

    watch(
      title,
      () => {
        init();
      },
      { immediate: true }
    );

    return {
      title,
      contents,
      msgTitle,
      msg,
      doPrev,
      doNext,
      doPostMsg,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../assets/scss/app.scss';

.u-btn {
  position: absolute;
  color: white;
  width: 40px;
  height: 40px;
  padding: 12px;
  margin: 0;
  cursor: pointer;
  &__next {
    right: 0;
  }
  &__prev {
    left: 0;
  }
  &__grey {
    opacity: 0.3;
    cursor: default;
  }
}

.msg {
  width: 16px;
  height: 16px;
}

label {
  color: $color-text-grey;
}

.msg--div__title {
  font-size: 15px;
  font-weight: 500;
}

.msg--p__text {
  margin-top: 10px;
  color: $color-text-grey;
}

hr {
  border-top: 1px dashed $color-text-grey;
}
</style>
