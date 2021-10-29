<template>
  <div class="more">
    <div class="more--box"></div>
    <div class="more--word h7">MORE...</div>
  </div>
</template>

<script>
export default {
  name: "Loading",
  props: {
    styleLogo: String,
  },
  setup() {
    return {};
  },
};
</script>
<style lang="scss">
@import "../assets/css/app.scss";

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
</style>
