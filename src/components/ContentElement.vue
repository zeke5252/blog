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
  <!-- paragraph -->
  <p v-else class="section--p">{{ element }}</p>
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
  padding: 10px;
  border: 1px $color-primary-yellow dashed;
}

.section--p {
  font-size: 16px;
  line-height: 36px;
  letter-spacing: 1px;
  font-weight: 300;
  margin: 40px 10px;
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
</style>
