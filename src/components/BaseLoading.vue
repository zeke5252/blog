<template>
  <div class="more">
    <div class="more--circle"></div>
    <div class="more--circle"></div>
    <div>LOADING...</div>
  </div>
</template>

<script>
  export default {
    name: "BaseLoading",
  };
</script>
<style lang="scss">
@import "../assets/scss/app.scss";

.more {
  border: rgba($color: #fff, $alpha: .2) 1px dotted;
  width: 300px;
  height: 50px;
  margin: 20px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: moreAnimation ease-out 1s;
  letter-spacing: 10px;
  font-size: 11px;
  font-weight: 300;
  position: relative;
  align-self: center;

  &--circle {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: $color-primary-yellow;
    animation: clipPathAnim 0.6s linear infinite;

    &:first-child {
      animation: clipPathAnim2 0.6s linear infinite;
    }
  }
}

@keyframes moreAnimation {
  from {width: 50px; opacity: 0;}
  to {width: 300px; opacity: 1;}
}

@keyframes clipPathAnim {
  from {clip-path: circle(3% at 0% 0%); opacity: 1;}
  to {clip-path: circle(30% at 0% 0%); opacity: 0;}
}

@keyframes clipPathAnim2 {
  from {clip-path: circle(3% at 100% 100%); opacity: 1;}
  to {clip-path: circle(30% at 100% 100%); opacity: 0;}
}
</style>
