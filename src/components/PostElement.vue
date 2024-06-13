<template>
  <div
    v-if="
      ContentAPI.isDisplay(props.element, 'photo') &&
      props.imageFiles.length !== 0
    "
    class="me-sm-0"
  >
    <BasePhoto :Url="props.element" :Images="props.imageFiles" />
  </div>
  <a
    v-else-if="ContentAPI.isDisplay(props.element, 'link')"
    :href="props.element"
  >
    {{ ContentAPI.limitStrSize(props.element, 40) }}
  </a>
  <p
    v-else-if="ContentAPI.isDisplay(props.element, 'code')"
    class="section--p fw-light lh-lg fs-5 my-4 mx-2 section--code p-4 fw-light"
  >
    {{ ContentAPI.removeMarks(props.element) }}
  </p>
  <template v-else>
    <p class="section--p fw-light lh-lg fs-5 my-4 mx-2">
      <span
        v-for="(el, index) in ContentAPI.splitParagraph(props.element)"
        :class="ContentAPI.isDisplay(el, 'bold') ? 'section--bold' : ''"
        :key="index"
      >
        {{ ContentAPI.isDisplay(el, 'bold') ? ContentAPI.removeMarks(el) : el }}
      </span>
    </p>
  </template>
</template>

<script setup>
import { ContentAPI } from '../utils/common.js';
import BasePhoto from './BasePhoto.vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  imageFiles: {
    type: String,
    default: () => '',
  },
  element: {
    type: String,
    default: '',
  },
});
</script>

<style scoped lang="scss">
@import '../assets/scss/app.scss';

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

// fw-light fs-5
.section {
  &--p {
    white-space: pre-wrap;

    &:first-of-type::before {
      content: '';
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
