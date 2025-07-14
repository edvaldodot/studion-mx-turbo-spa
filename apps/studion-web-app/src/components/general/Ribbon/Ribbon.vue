<script>
export default {
  name: 'Ribbon',
  props: {
    text: {
      required: true
    },
    color_agent: {
      required: false,
      default: ''
    }
  }
}
</script>
<template>
  <div class="ribbon" :class="color_agent">
    <span>{{ text }}</span>
  </div>
</template>

<style lang="scss">@import "Ribbon.scss";</style>
