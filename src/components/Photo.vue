<template>
  <div class="cover--photo">
    <img v-if="!isLoaded" class="getPlaceholder--logo" src="../assets/logo_m.svg" />
    <ul class="px-4  py-3 px-sm-5  py-sm-4" v-if="photoUtil.getExif(Url, Images)!=='{}' && showExif">
      <li class ="py-1 py-sm-2" v-for="info in Object.entries(photoUtil.getExif(Url, Images))" :key="info">
        <span style="font-weight:400" v-text="info[0]" /> : <span style="color:#999" v-text="info[1]" />
      </li>
    </ul>
    <img :src="photoUtil.getPlaceholderImage(Url, Images)" @load="loadLogo($event)" :class="{ photoBorder: showBorder }" />
  </div>
</template>

<script>
import { photoUtil } from "../utils/common.js";
import { toRefs, ref } from "vue";


export default {
  name: "photo-item",
  
  props: {
    Url: String,
    Images: String,
    showExif: {
      type: Boolean,
      default: true
    },
    showBorder: {
      type: Boolean,
      default: true
    }
  },

  setup(props, context) {
    const { Url, Images, showExif } = toRefs(props);
    const isLoaded = ref(false);
    const loadLogo = (e) => {
      e.target.src= Url.value;

      // When real photo is loaded, not replacement photo.
      e.target.onload = () => {
        isLoaded.value = true;
      }
    };

    return {
      photoUtil,
      Url,
      Images,
      showExif,
      loadLogo,
      isLoaded
    }  
  },
};
</script>

<style scoped lang="scss">
  @import "../assets/css/app.scss";

  .cover--photo {
    position: relative;
    display: flex;
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
      opacity: .15;
    }

    ul {
      background-color: rgba(0, 0, 0, 0.5);
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 100;
      font-size: 9px;
      height: auto;
      letter-spacing: 1px;
      pointer-events: none;
      opacity: 0;

      li{
        list-style-type: none !important;
      }
    }
  }

    @media (hover:hover) {
    .photoBorder:hover {
      outline: white 10px solid;
    }
  }

  .photoBorder {
    outline: white 0px solid;
    transition: all .2s ease-out;
  }

  label {
    color: $color-text-grey
  }

    @keyframes photoAnimation {
    0%    {outline: 2px}
    50%   {outline: 8px}
    100%  {outline: 2px}
  }

</style>
