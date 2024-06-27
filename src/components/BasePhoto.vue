<template>
  <div class="cover--photo">
    <img
      :src="url"
      @load="removeImgLogo($event)"
      :class="{ photoBorder: showBorder }"
    />
    <img
      v-if="!isLoaded"
      class="getPlaceholder--logo"
      src="../assets/logo_placeholder.svg"
    />
    <ul
      class="px-4 py-3 px-sm-5 py-sm-4"
      v-if="getExif(url, Images) !== '{}' && showExif"
    >
      <li
        class="py-1 py-sm-2"
        v-for="info in Object.entries(getExif(url, Images))"
        :key="info"
      >
        <span style="font-weight: 400" v-text="info[0]" /> :
        <span style="color: #999" v-text="info[1]" />
      </li>
    </ul>
  </div>
</template>
<script>
import { usePhoto } from '../composables/usePhoto.js';
import { ref, defineComponent } from 'vue';
// eslint-disable-next-line no-undef
export default defineComponent({
  name: 'BasePhoto',
  props: {
    url: String,
    Images: String,
    showExif: {
      type: Boolean,
      default: true,
    },
    showBorder: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const isLoaded = ref(false);

    const { getSrc, getExif } = usePhoto();

    const removeImgLogo = () => (isLoaded.value = true);
    return {
      isLoaded,
      getSrc,
      getExif,
      removeImgLogo,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../assets/scss/app.scss';

.cover--photo {
  position: relative;
  display: flex;
  width: 100%;
  background-color: black;

  &:hover ul {
    opacity: 1 !important;
  }

  img {
    width: 100%;
    align-self: start;
  }

  .getPlaceholder--logo {
    position: absolute;
    width: 10%;
    transform: translateX(450%);
    align-self: center;
    opacity: 0.15;
  }

  ul {
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 100;
    font-size: 11px;
    height: auto;
    letter-spacing: 1px;
    pointer-events: none;
    opacity: 0;

    li {
      list-style-type: none !important;
    }
  }
}

@media (hover: hover) {
  .photoBorder:hover {
    outline: white 10px solid;
  }
}

.photoBorder {
  outline: white 0px solid;
  transition: all 0.2s ease-out;
}

label {
  color: $color-text-grey;
}
</style>
