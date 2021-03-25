<template>
  <div class="cover--photo">
    <img :src="File.imageSrc" />
    <ul v-if="File.exif!=='{}'">
      <li v-for="info in Object.entries(File.exif && JSON.parse(File.exif))" :key="info">
        <span style="font-weight:400" v-text="info[0]" /> : <span style="color:#999" v-text="info[1]" />
      </li>
    </ul>
  </div>
</template>

<script>

// Only single image file will be used. No JSON parsing.

export default {
  name: "photo-item",
  data() {
    return {
    };
  },
  props: {
    File: Object,
  },
  computed: {
  },
  created() {
  },
  methods: {
    init() {
    },
  },
};
</script>

<style scoped lang="scss">
  
  @import "../assets/css/app.scss";

  .cover--photo {
    position: relative;
    display: flex;
    width: 80%;

     &:hover ul {
      opacity: 1 !important;
    }

    img {
      width: 100%;
      height: auto;
         margin: 28px 0;
         display: block;
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

  label {
    color: $color-text-grey
  }

</style>
