<template>
  <!-- photo -->
  <div
    v-if="element.substring(0, 4) === 'http' && element.includes(imageHostName)"
    class="me-sm-0"
  >
    <Photo :Url="element" :Images="imageFiles" />
  </div>
  <!-- link -->
  <template v-else-if="element.substring(0, 4) === 'http'">
    <font-awesome-icon icon="link" id="iconLink" class="mx-2" />
    <a :href="element">{{ ContentAPI.limitStrSize(element, 40) }}</a>
  </template>
  <!-- code -->
  <template v-else-if="element.substring(0, 6) === 'codeS_'">
    <p class="section--p section--code col-lg-10">
      {{ ContentAPI.removeCodeMark(element) }}
    </p>
  </template>
  <!-- paragraph -->
  <p v-else class="section--p col-lg-10">{{ element }}</p>
</template>

<script>
import { ContentAPI } from "../utils/common.js";
import Photo from "./Photo.vue";

export default {
  name: "photo-item",

  props: {
    imageFiles: {
      type: String,
      default: "",
    },
    element: {
      type: String,
      default: "",
    },
  },

  setup() {
    const imageHostName = "firebasestorage.googleapis.com";
    return {
      Photo,
      imageHostName,
      ContentAPI,
    };
  },
};
</script>

<style scoped lang="scss">
@import "../assets/css/app.scss";

#iconLink {
  color: $color-primary-yellow;
}

a {
  color: $color-primary-yellow;
  font-weight: 300;
  letter-spacing: 1px;
  padding: 10px;
  border: 1px $color-primary-yellow solid;
  border-radius: 3px;
}

.section {
  &--p {
    font-size: 16px;
    line-height: 36px;
    letter-spacing: 1px;
    font-weight: 300;
    margin: 20px 10px;
    white-space: pre-wrap;

    &:first-of-type::before {
      content: "";
      background-color: $color-primary-yellow;
      position: absolute;
      margin-top: 10px;
      margin-left: -10px;
      width: 2px;
      height: 14px;
    }
  }
  &--code {
    color: #cacaca;
    background: $color-card-bg-notice;
    background: linear-gradient(
      90deg,
      $color-card-bg-notice 0%,
      $color-card-bg 100%
    );
    font-size: 15px;
    line-height: 32px;
    font-weight: 300;
    padding: 20px;
    border-radius: 5px 0 0 5px;
  }
}
</style>
