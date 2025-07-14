<script>
import { mapState } from 'vuex'

export default {
  name: 'spinner',
  computed: {
    ...mapState(['fetching'])
  }
}
</script>

<template>
  <div class="spinner-container" v-if="!!fetching">
    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 600" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
      <g id="ellipse-1" transform="translate(300,300) rotate(0)">
        <ellipse rx="10.037943" ry="11.164552" transform="scale(0.99622,0.895692) translate(1.958028,-223.35703)" fill="#139BA8" stroke-width="0"/>
      </g>
      <g id="ellipse-2" transform="translate(300,300) rotate(0)">
        <ellipse rx="20.075887" ry="22.329104" transform="scale(0.99622,0.895692) translate(0.541421,-223.498668)" fill="#139BA8" stroke-width="0"/>
      </g>
      <g id="ellipse-3" transform="translate(300,300) rotate(0)">
        <ellipse rx="30.11383" ry="32.076024" transform="scale(0.99622,0.935278) translate(1.018274,-215.131133)" fill="#139BA8" stroke-width="0"/>
      </g>
      <g id="ellipse-4" transform="translate(300,300) rotate(0)">
        <ellipse rx="37.5" ry="37.5" transform="translate(1.862742,-201.380144)" fill="#139BA8" stroke-width="0"/>
      </g>
      <g id="ellipse-5" transform="translate(300,300) rotate(0)">
        <ellipse rx="43" ry="43" transform="scale(1.2,1.2) translate(0.256298,-166.628894)" fill="#139BA8" stroke-width="0"/>
      </g>
    </svg>
  </div>
</template>

<style lang="scss">@import "Spinner.scss";</style>
