<template>
  <BaseLoading v-if="!filteredPosts?.length" />
  <div v-else class="home">
    <div class="d-flex justify-content-end fixed-top pe-3 pe-md-4 mt-1">
      <select v-model="category" class="search--input py-1 px-3 me-3">
        <option
          v-for="category in categories"
          :key="category.name"
          :value="category.value"
          :selected="category.isSelected"
        >
          {{ category.name }}
        </option>
      </select>
      <label id="searchLabel" for="searchInput">
        <font-awesome-icon icon="search" />
      </label>
      <input
        class="search--input p-1"
        v-model="keyword"
        type="text"
        list="keywordListOptions"
        id="searchInput"
      />
    </div>
    <datalist v-if="keyword !== ''" id="keywordListOptions">
      <option
        v-for="post in filteredPosts"
        :key="post.title"
        :value="post.title"
      />
    </datalist>
    <div class="row row-cols-1 row-cols-md-3 g-4 pe-sm-0 pe-md-2">
      <div
        class="position-relative"
        v-for="post in filteredPosts"
        :key="post.title"
      >
        <router-link
          :to="`/posts/${post.title}`"
          style="color: white"
          :class="
            post.imageFiles !== '[]'
              ? 'card text-decoration-none styleImg'
              : 'card text-decoration-none styleImg styleTxt'
          "
        >
          <div v-if="post.isPhotoExisted" style="overflow: hidden">
            <BasePhoto
              :Url="PhotoAPI.getSrc(post.imageFiles, true)"
              :Images="post.imageFiles"
              :showExif="false"
              :showBorder="false"
            />
          </div>
          <div class="position-relative p-4">
            <h3 class="card-title fw-normal">{{ post.title }}</h3>
            <p class="card-text my-2">
              {{ post.brief }}
              <em class="moreContent">more >> </em>
            </p>
          </div>
        </router-link>
        <button
          v-if="isLogin"
          class="btn btn-primary rounded-circle translate-middle position-absolute top-0"
          @click="removePost(post)"
        >
          <font-awesome-icon icon="trash" />
        </button>
        <div
          class="position-absolute bottom-0 end-0 px-3 m-2 fw-lighter text-primary border-start border-1 border-light"
          style="letter-spacing: 4px"
        >
          {{ post.convertedTime }}
        </div>
      </div>
    </div>
    <BaseLoading v-if="isInMoreStatus && postsCollector?.length" />
  </div>
</template>

<script>
import { db, storage } from '@/firebaseDB.js';
import { firebase } from '@firebase/app';
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  defineComponent,
} from 'vue';
import { useStore } from 'vuex';
import { convertTime, ContentAPI, PhotoAPI } from '../utils/common.js';
import _ from 'lodash';

import BasePhoto from '../components/BasePhoto.vue';
import BaseLoading from '../components/BaseLoading.vue';

export default defineComponent({
  name: 'Home',
  components: {
    BasePhoto,
    BaseLoading,
  },
  setup() {
    firebase.auth().onAuthStateChanged((user) => {
      isLogin.value = user !== null;
    });

    const store = useStore();
    const isLogin = ref();
    const postsAmount = ref(7);
    const postsTimes = ref(0);
    const isInMoreStatus = ref(false);
    const category = ref('');
    const keyword = ref('');
    const postsCollector = ref([]);
    const keywordPosts = ref([]);

    const loadMore = _.debounce(() => {
      const postsToAdd = store.getters.extraPosts({
        times: postsTimes.value,
        amount: postsAmount.value,
      });
      postsCollector.value = postsCollector.value?.concat(postsToAdd);
      postsTimes.value++;
      if (postsToAdd.length === 0) {
        document.removeEventListener('scroll', calcCursorPosition);
      }
      isInMoreStatus.value = false;
    }, 1000);

    const categories = computed(() => [
      {
        name: '全部分類',
        value: '',
        isSelected: true,
      },
      {
        name: '照相',
        value: 'photography',
      },
      {
        name: '程式',
        value: 'programming',
      },
      {
        name: '生活',
        value: 'life',
      },
      {
        name: '設計',
        value: 'Design',
      },
    ]);

    const filteredPosts = computed(() => {
      return postsCollector.value
        ?.filter((post) => {
          if (category.value !== '' && keyword.value !== '') {
            return (
              post.category === category.value &&
              post.title.includes(keyword.value)
            );
          } else if (category.value !== '') {
            return post.category === category.value;
          } else if (keyword.value !== '') {
            return post.title.includes(keyword.value);
          } else {
            return post;
          }
        })
        .map((post) => {
          return formatPost(post);
        });
    });

    function calcCursorPosition() {
      const { clientHeight, scrollTop, scrollHeight } =
        document.documentElement;
      const isScrollNearBottom =
        scrollTop + clientHeight >= (scrollHeight * 4) / 5;

      if (!isInMoreStatus.value && isScrollNearBottom) {
        isInMoreStatus.value = true;
        loadMore();
      }
    }

    async function removePost(post) {
      try {
        const postCollection = db
          .collection('posts')
          .where('title', '==', post.title);
        const querySnapshot = await postCollection.get();
        const batch = db.batch();
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        await store.dispatch('fetchAllPosts');
        postsCollector.value = store.state.posts;
        if (post.imageFiles !== '[]') {
          removePostImages(post);
        }
      } catch (error) {
        console.error('Error removing document: ', error);
      }
    }

    async function removePostImages(post) {
      const imagesUrls = PhotoAPI.getSrc(post.imageFiles);
      // Need to use new RegExg() instead of .match(/.../) to avoid error in js
      const re = new RegExp('(?<=%2F).*(?=,)|(?<=%2F).*(?=\\?)', 'g');
      const imagesToDelete = imagesUrls.map((url) => url.match(re)[0]);
      try {
        let storageRef = storage.ref();
        for (let image of imagesToDelete) {
          await storageRef.child(`${post.category}/${image}`).delete();
        }
        alert('The post has been deleted!');
      } catch (error) {
        console.log('Error deleting images: ', error);
      }
    }

    function formatPost(post) {
      return {
        ...post,
        isPhotoExisted: post.imageFiles !== '[]',
        convertedTime: convertTime(post.created, false),
        brief: getBrief(post.content),
      };
    }

    function getBrief(content) {
      const contentsArr = ContentAPI.splitPost(content);
      if (!contentsArr || !Array.isArray(contentsArr))
        return contentsArr || 'No contents!';
      const result = contentsArr.find((el) => el.substring(0, 4) !== 'http');
      return result
        ? ContentAPI.limitStrSize(ContentAPI.removeMarks(result), 150)
        : 'No contents!';
    }

    onMounted(async () => {
      await store.dispatch('fetchAllPosts');
      loadMore();
      document.addEventListener('scroll', calcCursorPosition);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('scroll', calcCursorPosition, true);
    });

    return {
      isLogin,
      PhotoAPI,
      postsCollector,
      category,
      keyword,
      keywordPosts,
      isInMoreStatus,
      removePost,
      categories,
      filteredPosts,
    };
  },
});
</script>

<style lang="scss">
@import '../assets/scss/app.scss';

#searchLabel {
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.moreContent {
  font-size: 10px;
  border: $color-primary-yellow 1px dotted;
  border-radius: 10px;
  color: $color-primary-yellow;
  padding: 1px 5px 2px 6px;
  margin-top: 10px;
}

@media (hover: hover) {
  .styleImg:hover {
    outline: $color-primary-yellow 8px solid;
  }

  .styleImg:hover img[src*='https'] {
    transform: scale(1.2);
  }
}

.styleImg {
  background-color: $color-card-bg;
  outline: $color-bg 0px solid;
  transition: 0.2s ease-out;
  animation: cardAnimation ease-out 0.4s;
  overflow: hidden;
  border-radius: 0;
  height: 100%;

  .card-text {
    line-height: 2.1;
    letter-spacing: 0.5px;
    color: $color-text-grey;

    &::before {
      content: '';
      background-color: $color-primary-yellow;
      position: absolute;
      margin-top: 7px;
      margin-left: -8px;
      width: 2px;
      height: 12px;
    }
  }

  // Select every <img> element whose src attribute value contains the substring "https"
  img[src*='https'] {
    transform: scale(1);
    height: 24vh;
    object-fit: cover;
    transition: 0.2s ease-out;
  }
}

.styleTxt {
  background-color: $color-bg;
  transition: 0.2s ease-out;
  height: 100%;
  animation: cardAnimation ease-out 0.4s;
  overflow: hidden;
  border-width: 0px;
  border-radius: 0px;

  .card-text {
    line-height: 2.1;
    letter-spacing: 0.5px;
    color: #888;

    &::before {
      content: '';
      background-color: $color-primary-yellow;
      position: absolute;
      margin-top: 7px;
      margin-left: -8px;
      width: 2px;
      height: 12px;
    }
  }
}

.loading {
  border-top: white 2px solid;
  border-bottom: white 2px solid;
  width: 80px;
  display: flex;
  justify-content: center;
  animation: moreAnimation ease 0.3s;
  animation-fill-mode: forwards;
  position: relative;
  margin: auto;
  top: 40vh;

  &::before {
    content: '';
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
      content: '';
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

.search--input {
  width: 30%;
  max-width: 200px;
  height: 36px;
  background-color: $color-bg;
  opacity: 0.8;
  color: white;
  border-bottom: 1px white solid !important;
}

.search--img {
  width: 36px;
  height: 36px;
  background-color: $color-bg;
}

@keyframes cardAnimation {
  from {
    top: -30px;
    opacity: 0;
  }

  to {
    top: 0px;
    opacity: 1;
  }
}

@keyframes loadAnimation {
  0% {
    border-width: 2px;
  }

  50% {
    border-width: 8px;
  }

  100% {
    border-width: 2px;
  }
}
</style>
