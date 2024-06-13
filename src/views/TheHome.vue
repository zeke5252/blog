<template>
  <BaseLoading v-if="postsCollector.length === 0" />
  <div v-else class="home">
    <div class="d-flex justify-content-end fixed-top pe-3 pe-md-4 mt-1">
      <select
        class="search--input py-1 px-3 me-3"
        v-model="category"
        id="categoryLabel"
        aria-label="categoryLabel"
      >
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
        aria-label="searchInput"
      />
    </div>
    <datalist id="keywordListOptions">
      <option
        v-for="post in GET_DB_ALL"
        :key="post.title"
        :value="post.title"
      />
    </datalist>
    <div class="row row-cols-1 row-cols-md-3 g-4 pe-sm-0 pe-md-2">
      <div class="position-relative" v-for="post in posts" :key="post.title">
        <router-link
          :to="`/posts/${post.title}`"
          style="color: white"
          :class="
            post.imageFiles.length > 0
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
              {{ getFirstParagraph(post.content) }}
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
          {{ getConvertTime(post.created) }}
        </div>
      </div>
    </div>
    <BaseLoading v-if="isInMoreStatus && postsCollector.length !== 0" />
  </div>
</template>

<script>
import { db, storage } from '@/firebaseDB.js';
import { firebase } from '@firebase/app';
import { ref, computed, watch, onBeforeUnmount, defineComponent } from 'vue';
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
    const store = useStore();
    const isLogin = ref();
    const postsAmount = ref(7);
    const postsTimes = ref(0);
    const isInMoreStatus = ref(false);
    const category = ref('');
    const keyword = ref('');

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

    const posts = computed(() => {
      const results =
        keywordPosts.value.length > 0
          ? keywordPosts.value
          : postsCollector.value;
      return results.map((post) => {
        return {
          ...post,
          isPhotoExisted:
            post.imageFiles !== '[]' && post.imageFiles.length !== 0,
        };
      });
    });

    const postsCollector = ref([]);
    const keywordPosts = ref([]);
    const GET_DB_ALL = ref(() => store.getters.GET_DB_ALL());

    firebase.auth().onAuthStateChanged((user) => {
      isLogin.value = user !== null;
    });

    const filterPost = (posts) => {
      return category.value !== ''
        ? posts.filter((post) => post['category'] === category.value)
        : posts;
    };

    const loadMore = () => {
      const { clientHeight, scrollTop, scrollHeight } =
        document.documentElement;
      const isScrollNearBottom =
        scrollTop + clientHeight >= (scrollHeight * 4) / 5;

      if (!isInMoreStatus.value && isScrollNearBottom) {
        isInMoreStatus.value = true;
        setTimeout(() => {
          const postsToAdd = store.getters.GET_DB_SCROLL({
            times: postsTimes.value,
            amount: postsAmount.value,
          });
          postsCollector.value = postsCollector.value.concat(
            filterPost(postsToAdd)
          );
          postsTimes.value++;
          if (postsToAdd.length === 0) {
            document.removeEventListener('scroll', loadMore);
          }
          isInMoreStatus.value = false;
        }, 1000);
      }
    };

    store.dispatch('getFirestoreDB').then(loadMore);

    document.addEventListener('scroll', loadMore, true);

    const getConvertTime = (time) => convertTime(time, false);

    const getFirstParagraph = (content) => {
      const contentsArr = ContentAPI.splitPost(content);
      if (!contentsArr || !Array.isArray(contentsArr))
        return contentsArr || 'No contents!';
      const result = contentsArr.find((el) => el.substring(0, 4) !== 'http');
      return result
        ? ContentAPI.limitStrSize(ContentAPI.removeMarks(result), 150)
        : 'No contents!';
    };

    const removePost = (post) => {
      const query = db.collection('posts').where('title', '==', post.title);
      query
        .get()
        .then((querySnapshot) => {
          const batch = db.batch();
          querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          return batch.commit();
        })
        .then(() => {
          return store.dispatch('getFirestoreDB');
        })
        .then(() => {
          postsCollector.value = GET_DB_ALL.value();
          post.imageFiles.length !== 0 && removeDBImages(post);
        })
        .catch((error) => {
          console.error('Error removing document: ', error);
        });
    };

    const removeDBImages = (post) => {
      if (post.imageFiles.length === 0) return;

      const imagesUrls = PhotoAPI.getSrc(post.imageFiles);
      const imagesToDelete = imagesUrls.map(
        (url) => url.match(/(?<=%2F).*(?=,|$)/)[0]
      );

      const deletePromises = imagesToDelete.map((image) => {
        const storageRef = storage.ref();
        return storageRef.child(`${post.category}/${image}`).delete();
      });

      Promise.all(deletePromises).then(() => {
        alert('The post has been deleted!');
      });
    };

    const stopWatchCategory = watch(category, () => {
      keyword.value = '';
      postsCollector.value = filterPost(GET_DB_ALL.value());
    });

    const stopWatchKeyword = watch(keyword, (val) => {
      _.debounce(() => {
        keywordPosts.value = postsCollector.value.filter((post) =>
          post.title.includes(val)
        );
      }, 300)();
    });

    onBeforeUnmount(() => {
      stopWatchKeyword();
      stopWatchCategory();
      document.removeEventListener('scroll', loadMore, true);
    });

    return {
      isLogin,
      PhotoAPI,
      postsCollector,
      category,
      keyword,
      GET_DB_ALL,
      keywordPosts,
      isInMoreStatus,
      getConvertTime,
      getFirstParagraph,
      removePost,
      categories,
      posts,
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
