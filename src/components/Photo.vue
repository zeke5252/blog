<template>
  <div class="cover--photo">
    <img :src="photoUtil.getPlaceholderImage(Url, Images)" @load="$event.target.src= Url" :class="{ photoBorder: showBorder }" />
    <ul v-if="photoUtil.getExif(Url, Images)!=='{}' && showExif">
      <li v-for="info in Object.entries(photoUtil.getExif(Url, Images))" :key="info">
        <span style="font-weight:400" v-text="info[0]" /> : <span style="color:#999" v-text="info[1]" />
      </li>
    </ul>
  </div>
</template>

<script>
import { photoUtil } from "../utils/common.js";
import { toRefs } from "vue";


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

  setup(props) {
    const { Url, Images, showExif } = toRefs(props);
    return {
      photoUtil,
      Url,
      Images,
      showExif
    }  
  },
};
</script>

<style scoped lang="scss">
  @import "../assets/css/app.scss";

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
      height: auto;
    }

    ul {
      background-color: rgba(0, 0, 0, 0.5);
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 100;
      padding: 24px 40px;
      font-size: 9px;
      height: auto;
      letter-spacing: 1px;
      pointer-events: none;
      opacity: 0;

      li{
        padding: 10px 0;
        list-style-type: none !important;
      }
    }
  }

  .photoBorder {
    outline: white 0px solid;
    transition: all .2s ease-out;
      
    &:hover{
      outline: white 10px solid;
    }
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
