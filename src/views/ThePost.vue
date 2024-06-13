<template>
  <div>
    <template v-if="!contents">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </template>
    <template v-else>
      <div class="me-sm-0 me-md-5">
        <header
          class="d-flex position-relative justify-content-center align-items-center mb-5 fixed-top"
        >
          <font-awesome-icon
            icon="chevron-left"
            class="u-btn__prev"
            :style="{ opacity: !isPrevDisplay ? 0.3 : 1 }"
            @click="doPrev"
          />
          <div class="d-flex flex-column align-items-center px-5">
            <h1 class="fw-normal" v-text="props.title" />
            <span class="fw-light fs-6 opacity-75" v-text="postCaption" />
            <div v-if="contents.msgs" class="d-inline-flex mt-2">
              <img src="../assets/msg.svg" class="msg me-1" />
              <span style="color: white">
                {{ contents.msgs.length }}
              </span>
            </div>
          </div>
          <font-awesome-icon
            icon="chevron-right"
            class="u-btn__next"
            :style="{ opacity: !isNextDisplay ? 0.3 : 1 }"
            @click="doNext"
          />
        </header>
        <section class="my-3">
          <PostElement
            v-for="(el, index) in contentToArr"
            :key="index"
            :element="el"
            :imageFiles="contents.imageFiles"
          />
        </section>
      </div>
    </template>
    <div class="row">
      <div class="col-sm-6">
        <label class="form-label h6 mb-3 mt-5" for="formTitle"> 留言 </label>
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
export default {
  name: 'Post',
};
</script>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { convertTime, ContentAPI } from '../utils/common.js';
import { firebase } from '@firebase/app';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { db } from '../firebaseDB.js';
import { DATA_DB } from '@/store/types';

import PostElement from '../components/PostElement.vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  title: String,
});
const store = useStore();
const router = useRouter();
const route = useRoute();

const contents = ref(null);
const isPrevDisplay = ref(null);
const isNextDisplay = ref(null);
const msgTitle = ref('');
const msg = ref('');
const contentToArr = ref([]);

const postCaption = computed(
  () => contents.value.category + ' / ' + contents.value.created
);

const init = () => {
  let postData = store.getters.GET_DB_BY_TITLE(props.title);
  if (postData) {
    isPrevDisplay.value = postData.isPrevDisplay;
    isNextDisplay.value = postData.isNextDisplay;
    msgTitle.value = '';
    msg.value = '';
    postData.post.created = convertTime(postData.post.created);
    contentToArr.value = ContentAPI.splitPost(postData.post.content);
    contents.value = postData.post;
  } else {
    router.push({ name: 'The404' });
  }
};

const doPrev = () => {
  let toTitle = store.getters.GET_NEXT_OR_PREV_POST(route.params.title, false);
  router.push(toTitle);
};

const doNext = () => {
  let toTitle = store.getters.GET_NEXT_OR_PREV_POST(route.params.title, true);
  router.push(toTitle);
};

const doPostMsg = () => {
  db.collection('posts')
    .where('title', '==', contents.value.title)
    .get()
    .then((posts) => {
      posts.forEach(async (post) => {
        const postRef = db.collection('posts').doc(post.id);
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
        init();
      });
    })
    .catch((error) => {
      console.log('Error getting documents: ', error);
    });
};

onMounted(() => {
  if (!store.state[DATA_DB]) {
    store.dispatch('getFirestoreDB').then(() => {
      init();
    });
  } else {
    init();
  }
});

watch(() => props.title, init);
</script>

<style scoped lang="scss">
@import '../assets/scss/app.scss';

.u-btn {
  &__next {
    position: absolute;
    color: white;
    width: 40px;
    height: 40px;
    padding: 12px;
    margin: 0;
    right: 0;
    cursor: pointer;
  }
  &__prev {
    position: absolute;
    color: white;
    width: 40px;
    height: 40px;
    padding: 12px;
    margin: 0;
    left: 0;
    cursor: pointer;
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
