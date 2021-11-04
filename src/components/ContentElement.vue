<template>
  <!--
  目前是先分以下再弄成陣列
  photo   純字串判斷  整行 
  link    純字串判斷  行內
  code    標記判斷    整行 
  p       純字串判斷  整行  >>   bold  標記判斷    行內
                                span  純字串判斷  行內
  -->
  <div v-if="ContentAPI.isDisplay(element, 'photo')" class="me-sm-0">
    <Photo :Url="element" :Images="imageFiles" />
  </div>
  <a v-else-if="ContentAPI.isDisplay(element, 'link')" :href="element">{{
    ContentAPI.limitStrSize(element, 40)
  }}</a>
  <p
    v-else-if="ContentAPI.isDisplay(element, 'code')"
    class="section--p section--code"
  >
    {{ ContentAPI.removeMark(element, ContentAPI.CODES) }}
  </p>
  <template v-else>
    <p class="section--p">
      <span
        v-for="(el, index) in ContentAPI.splitParagraph(element)"
        :class="ContentAPI.isDisplay(el, 'bold') ? 'section--bold' : ''"
        :key="index"
      >
        {{
          ContentAPI.isDisplay(el, "bold")
            ? ContentAPI.removeMark(el, ContentAPI.BOLDS)
            : el
        }}
      </span>
    </p>
  </template>
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
    return {
      Photo,
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
    color: $color-secondary-yellow;
    background: $color-card-bg-notice;
    font-size: 15px;
    line-height: 32px;
    font-weight: 300;
    padding: 20px;
    border-radius: 5px 0 0 5px;
  }
  &--bold {
    color: $color-primary-yellow;
    font-size: 16px;
    line-height: 32px;
    font-weight: 600;
    margin: 0 2px;
  }
}
</style>
