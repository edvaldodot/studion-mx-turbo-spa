<script>
export default {
  name: 'loading',
  props: {
    dark: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template>
  <div class="loading" :class="{'theme-dark': dark}">
    <span class="loading-point loading-point-1"></span>
    <span class="loading-point loading-point-2"></span>
    <span class="loading-point loading-point-3"></span>
  </div>
</template>

<style lang="scss">@import "Loading.scss";</style>
