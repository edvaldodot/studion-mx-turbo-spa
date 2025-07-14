<template>
  <div>Hi! I'm a Test Component! ;)</div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Welcome Vue.js 2.7!')
})
</script>
