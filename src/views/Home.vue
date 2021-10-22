<template>
  <div v-if="!postsAccumulator" class="loading"></div>
  <div v-else class="home">
    <div class="d-flex justify-content-end fixed-top pe-3 pe-md-4 mt-1">
      <label id="searchLabel" for="searchInput">
        <font-awesome-icon icon="search" />
      </label>
      <input
        class="search--input p-1"
        v-model="keyword"
        type="text"
        list="keywordlistOptions"
        id="searchInput"
        aria-label="searchInput"
      />
    </div>
    <datalist id="keywordlistOptions">
      <option
        v-for="post in GET_DB_ALL"
        :key="post.title"
        :value="post.title"
      />
    </datalist>
    <div class="row row-cols-1 row-cols-md-3 g-4 pe-sm-0 pe-md-2">
      <div
        class="col"
        v-for="post in !keyResults ? postsAccumulator : keyResults"
        :key="post.title"
      >
        <button
          v-if="isLogin"
          class="removeButton"
          style="padding: 2px 25px"
          @click="removePost(post)"
        >
          <font-awesome-icon icon="trash" />
        </button>
        <router-link
          :to="`/posts/${post.title}`"
          :class="
            post.imageFiles.length > 0
              ? 'card styleImg border-0'
              : 'card styleTxt'
          "
        >
          <div v-if="post.imageFiles.length > 0" style="overflow: hidden">
            <Photo
              :Url="PhotoAPI.getSrc(post.imageFiles, true)"
              :Images="post.imageFiles"
              :showExif="false"
              :showBorder="false"
            />
          </div>
          <div class="card-body">
            <div class="createdDate">{{ getConvertTime(post.created) }}</div>
            <h5 class="card-title">{{ post.title }}</h5>
            <p class="card-text my-2">
              {{ getFirstParagraph(post.content) }}
              <em class="moreContent">more >> </em>
            </p>
          </div>
        </router-link>
      </div>
    </div>
    <div v-if="isInMoreStatus && postsAccumulator" class="more">
      <div class="more--box"></div>
      <div class="more--word h7">MORE...</div>
    </div>
  </div>
</template>

<script>
import { db, storage } from "@/firebaseDB.js";
import { firebase } from "@firebase/app";
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { convertTime, ContentAPI, PhotoAPI } from "../utils/common.js";
import _ from "lodash";

import Photo from "../components/Photo.vue";

export default {
  name: "Home",

  setup() {
    const store = useStore();
    const isLogin = ref();
    const postsAmount = ref(5);
    const postsTimes = ref(0);
    const isInMoreStatus = ref(false);
    const keyword = ref("");
    const keyResults = ref(null);

    const postsAccumulator = ref([]);
    const GET_DB_ALL = computed(() => store.getters.GET_DB_ALL());

    firebase.auth().onAuthStateChanged(function (user) {
      if (user != null) {
        isLogin.value = true;
      } else {
        isLogin.value = false;
      }
    });

    const loadMore = () => {
      const getWindowHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const isMouseNearAllContentBottom =
        scrollTop + getWindowHeight >= (scrollHeight * 4) / 5;

      if (!isInMoreStatus.value && isMouseNearAllContentBottom) {
        isInMoreStatus.value = true;
        setTimeout(() => {
          let postsToAdd;
          isInMoreStatus.value = false;
          postsToAdd = store.getters.GET_DB_SCROLL({
            times: postsTimes.value,
            amount: postsAmount.value,
          });
          postsAccumulator.value = postsAccumulator.value.concat(postsToAdd);
          postsTimes.value++;
          if (postsToAdd.length === 0)
            document.removeEventListener("scroll", loadMore, true);
        }, 1000);
      }
    };

    store.dispatch("getFirestoreDB").then(() => {
      loadMore();
    });

    document.addEventListener("scroll", loadMore, true);

    const getConvertTime = (time) => convertTime(time, false);

    const getFirstParagraph = (content) => {
      let contentsArr;
      contentsArr = ContentAPI.splitContents(content);
      if (!contentsArr) {
        return "No contents!";
      } else if (!Array.isArray(contentsArr)) {
        return contentsArr;
      } else {
        return contentsArr.find((el) => el.substring(0, 4) !== "http");
      }
    };

    const removePost = (post) => {
      let posts = db.collection("posts");
      let query = posts.where("title", "==", post.title);
      query
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            posts
              .doc(doc.id)
              .delete()
              .then(() => {
                store.dispatch("getFirestoreDB").then(() => {
                  postsAccumulator.value = store.getters.GET_DB_ALL();
                });
              })
              .then(() => {
                console.log("removeDBImages: ", removeDBImages);
                removeDBImages(post);
              })
              .catch((error) => {
                console.error("Error removing document: ", error);
              });
          });
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    };

    const removeDBImages = (post) => {
      if (post.imageFiles === 0) return;
      console.log("not return: ");
      let imagesUrls = PhotoAPI.getSrc(post.imageFiles);
      // Need to use new RegExg() instead of .match(/.../) to avoid error in js
      let re = new RegExp("(?<=%2F).*(?=,)|(?<=%2F).*(?=\\?)", "g");
      let imagesToDelete = imagesUrls.map((url) => url.match(re)[0]);
      let filesAllPromises = imagesToDelete.map((image) => {
        let storageRef = storage.ref();
        storageRef.child(`${post.category}/${image}`).delete();
      });

      Promise.all(filesAllPromises).then(() => {
        alert("The post has been deleted!");
      });
    };

    watch(keyword, (val) => {
      _.debounce(function () {
        let all = GET_DB_ALL.value;
        let results = all.filter((post) => post.title.includes(val));
        keyResults.value = results;
      }, 500)();
    });

    onBeforeUnmount(() => {
      document.removeEventListener("scroll", loadMore, true);
    });

    return {
      isLogin,
      isInMoreStatus,
      PhotoAPI,
      keyword,
      keyResults,
      removePost,
      getConvertTime,
      getFirstParagraph,
      postsAccumulator,
      GET_DB_ALL,
    };
  },

  components: {
    Photo,
  },
};
</script>

<style lang="scss">
@import "../assets/css/app.scss";

.createdDate {
  height: 20px;
  background-color: $color-card-bg;
  position: absolute;
  right: 0;
  top: -22px;
  text-align: center;
  letter-spacing: 1px;
  padding: 8px 20px 14px 20px;
  font-weight: 700;
  color: $color-primary-yellow;
}

#searchLabel {
  width: 30px;
  height: 40px;
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
  background-color: $color-bg;
}

.removeButton {
  position: relative;
  transform: translateY(100%);
  z-index: 1;
}

@media (hover: hover) {
  .styleImg:hover {
    outline: $color-primary-yellow 8px solid;
  }

  .styleImg:hover img[src*="https"] {
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

  .card-text {
    line-height: 2.1;
    letter-spacing: 0.5px;
    color: $color-text-grey;

    &::before {
      content: "";
      background-color: $color-primary-yellow;
      position: absolute;
      margin-top: 7px;
      margin-left: -8px;
      width: 2px;
      height: 12px;
    }
  }

  // Select every <img> element whose src attribute value contains the substring "https"
  img[src*="https"] {
    transform: scale(1);
    height: 24vh;
    object-fit: cover;
    transition: 0.2s ease-out;
  }
}

.styleTxt {
  background-color: #eee;
  outline: $color-bg 0px solid;
  transition: 0.2s ease-out;
  animation: cardAnimation ease-out 0.4s;
  overflow: hidden;
  border-width: 0px;
  border-radius: 2px;
  color: black !important;

  .card-text {
    line-height: 2.1;
    letter-spacing: 0.5px;
    color: #888;

    &::before {
      content: "";
      background-color: $color-primary-yellow;
      position: absolute;
      margin-top: 7px;
      margin-left: -8px;
      width: 2px;
      height: 12px;
    }
  }
}

.card-body {
  position: relative;
  padding: 26px 20px 30px 20px;
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
    content: "";
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
      content: "";
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

.more {
  border-top: white 2px solid;
  border-bottom: white 2px solid;
  width: 80px;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: moreAnimation ease-out 0.3s;
  animation-fill-mode: forwards;
  letter-spacing: 1px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    background-color: white;
    width: 12px;
    height: 4px;
    left: 0;
    top: -6px;
  }

  &--box {
    width: 2px;
    height: 14px;
    background-color: $color-primary-yellow;
    animation: spin 0.5s linear infinite;
  }
  &--word {
    font-weight: 500;
    margin: 0 0 0 16px;
  }
}

.search--input {
  height: 36px;
  background-color: $color-bg;
  opacity: 0.8;
  color: white;
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

@keyframes moreAnimation {
  from {
    padding: 0px 0px;
    opacity: 0;
  }
  to {
    padding: 12px 0px;
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
