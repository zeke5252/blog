<template>
  <svg
    id="logo"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    :class="props.classLogo"
    :style="props.styleLogo"
    viewBox="0 0 342 131.9"
    @click="props.doMenu"
  >
    <clipPath :id="'clipJP_1_' + props.clipId + '_'">
      <circle id="clipJP" cx="64.3" cy="67.5" r="64.3" />
    </clipPath>
    <g id="jpGroup" :clip-path="'url(#clipJP_1_' + props.clipId + '_)'">
      <path
        id="P"
        class="st"
        d="M242.1,0h44.9c30.3,0,53.6,10.4,53.6,42.8c0,31.3-23.3,45.2-52.9,45.2h-18.4v40.7h-27.1V0z M285.9,66.4 c18.8,0,27.8-8,27.8-23.7c0-16-10.1-21.2-28.9-21.2h-15.3v44.9H285.9z"
      />
      <path
        id="J"
        class="st"
        d="M175.6,0v82.4c0,18.8-6.3,25.4-18.1,25.4c-1.7,0-3.5-0.3-5.2-0.7c-3.1,7.3-7.7,14.3-12.5,20.2 c6.3,2.4,12.9,4.2,21.2,4.2c29.2,0,42.1-20.9,42.1-46.6V0H175.6z"
      />
    </g>
    <path
      id="bgP"
      class="st0"
      d="M242.1,0h44.9c30.3,0,53.6,10.4,53.6,42.8c0,31.3-23.3,45.2-52.9,45.2h-18.4v40.7h-27.1V0z M285.9,66.4 c18.8,0,27.8-8,27.8-23.7c0-16-10.1-21.2-28.9-21.2h-15.3v44.9H285.9z"
    />
    <path
      id="bgJ"
      class="st0"
      d="M175.6,0v82.4c0,18.8-6.3,25.4-18.1,25.4c-1.7,0-3.5-0.3-5.2-0.7c-3.1,7.3-7.7,14.3-12.5,20.2 c6.3,2.4,12.9,4.2,21.2,4.2c29.2,0,42.1-20.9,42.1-46.6V0H175.6z"
    />
    <g id="leafsGroup">
      <!-- clip id should be unique to prevent from displaying 2 logos on screen simultaneously -->
      <clipPath :id="'clipCircle_1_' + props.clipId + '_'">
        <circle id="clipCircle" cx="64.3" cy="67.5" r="64.3" />
      </clipPath>
      <g id="leafs" :clip-path="'url(#clipCircle_1_' + props.clipId + '_)'">
        <circle id="leafBg" class="st3" cx="64.3" cy="67.5" r="106.3" />
        <g id="leafSpin" transform-origin="64.3 67.5">
          <rect
            id="leaf6"
            x="-412"
            y="-130.4"
            transform="matrix(0.9659 -0.2588 0.2588 0.9659 -29.248 -48.3318)"
            class="st4"
            width="427.7"
            height="434.7"
          />
          <rect
            id="leaf5"
            x="-263.9"
            y="87.2"
            transform="matrix(0.2588 -0.9659 0.9659 0.2588 -331.2918 177.3486)"
            class="st4"
            width="427.7"
            height="434.7"
          />
          <rect
            id="leaf4"
            x="-1.4"
            y="67.7"
            transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 161.0604 636.9291)"
            class="st4"
            width="427.7"
            height="434.7"
          />
          <rect
            id="leaf3"
            x="113"
            y="-169.3"
            transform="matrix(-0.9659 0.2588 -0.2588 -0.9659 655.0333 9.8304)"
            class="st4"
            width="427.7"
            height="434.7"
          />
          <polygon
            id="leaf2"
            class="st4"
            points="24.2,-432.4 -45.9,-170.9 1,4.1 333.4,93.2 444.1,-319.9 "
          />
          <polygon
            id="leaf1"
            class="st4"
            points="-47.9,-178.4 14.4,54.1 221.1,-152.7 -81.3,-455.1 -388.7,-147.7 -340.9,-99.9 "
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'Logo'
}
</script>
<script setup>
// eslint-disable-next-line no-undef
const props = defineProps(['clipId', 'classLogo', 'styleLogo', 'doMenu'])
</script>
<style lang="scss">
@import '../assets/scss/app.scss';
.logo--m {
  cursor: pointer;
}
.st {
  opacity: 1;
  fill: #fff;
}
.st0 {
  opacity: 0.1;
  fill: #f2f2f2;
}
#leafSpin {
  transform: scale(2);
  animation: logoSpin $logo-shutter-spin-duration
    cubic-bezier(0.74, 0.01, 0.48, 1.01) $logo-start-at 1 normal forwards
    running;
}
#clipJP {
  transform-origin: center;
  transform-box: fill-box;
  animation: enlargeBg 3s cubic-bezier(0, 0.64, 0.33, 0.99)
    calc(#{$logo-start-at} + #{$logo-shutter-spin-duration} - 0.3s) 1 normal
    forwards running;
}
.st3 {
  fill: $color-primary-yellow;
  transform-origin: center;
  transform-box: fill-box;
  animation: bgCircle calc(#{$logo-start-at} + #{$logo-shutter-spin-duration})
    cubic-bezier(0.74, 0.01, 0.48, 1.01) 0s 1 normal forwards running;
}
#J,
#bgJ {
  transform-origin: center;
  transform-box: fill-box;
  animation: alphabetSpin 2s cubic-bezier(0.02, 0.71, 0.43, 0.97)
    calc(#{$logo-start-at} + #{$logo-shutter-spin-duration} - 0.15s) 1 normal
    forwards running;
}
#P,
#bgP {
  transform-origin: center;
  transform-box: fill-box;
  animation: alphabetSpin 2s cubic-bezier(0.02, 0.71, 0.43, 0.97)
    calc(#{$logo-start-at} + #{$logo-shutter-spin-duration} + 0.25s) 1 normal
    forwards running;
}
.st4 {
  fill: #ffffff;
  stroke: #0f0f0f;
  stroke-width: 2;
  stroke-miterlimit: 10;
}
</style>
