<template>
  <div v-if="elementType === ELEMENT_TYPE_PHOTO" class="me-sm-0">
    <BasePhoto :url="element" :Images="imageFiles" />
  </div>
  <a v-else-if="elementType === ELEMENT_TYPE_LINK" :href="element">
    {{ elementContents[ELEMENT_TYPE_LINK] }}
  </a>
  <p
    v-else-if="elementType === ELEMENT_TYPE_CODE"
    class="section--p fw-light lh-lg fs-5 my-4 mx-2 section--code p-4 fw-light"
  >
    {{ elementContents[ELEMENT_TYPE_CODE] }}
  </p>
  <p v-else class="section--p fw-light lh-lg fs-5 my-4 mx-2">
    <span
      v-for="(el, index) in elementContents[ELEMENT_TYPE_PARAGRAPH]"
      :key="index"
      :class="el.isBold ? 'section--bold' : ''"
    >
      {{ el.content }}
    </span>
  </p>
</template>

<script>
import { computed, defineComponent } from 'vue';
import { useContent } from '../composables/useContent.js';
import BasePhoto from './BasePhoto.vue';

const ELEMENT_TYPE_PHOTO = 'photo';
const ELEMENT_TYPE_LINK = 'link';
const ELEMENT_TYPE_CODE = 'code';
const ELEMENT_TYPE_BOLD = 'bold';
const ELEMENT_TYPE_PARAGRAPH = 'p';

export default defineComponent({
  name: 'PostElement',
  components: {
    BasePhoto,
  },
  props: {
    imageFiles: {
      type: String,
      default: () => '',
    },
    element: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { limitStrSize, removeMarks, splitParagraph, isTypeOf } =
      useContent();

    const elementType = computed(() => isTypeOf(props.element));
    const elementContents = computed(() => {
      return {
        link: limitStrSize(props.element, 40),
        code: removeMarks(props.element),
        p: splitParagraph(props.element).map((el) => {
          return {
            content: isTypeOf(el) === ELEMENT_TYPE_BOLD ? removeMarks(el) : el,
            isBold: isTypeOf(el) === ELEMENT_TYPE_BOLD,
          };
        }),
      };
    });

    return {
      elementType,
      elementContents,
      ELEMENT_TYPE_PHOTO,
      ELEMENT_TYPE_LINK,
      ELEMENT_TYPE_CODE,
      ELEMENT_TYPE_BOLD,
      ELEMENT_TYPE_PARAGRAPH,
    };
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
