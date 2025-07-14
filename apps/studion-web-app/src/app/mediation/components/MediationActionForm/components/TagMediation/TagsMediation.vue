<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TagsMediation',

  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    text: {
      type: String,
      default: '',
    },
  },

  methods: {
    addTag(tag) {
      this.$emit('add:tag', tag)
    },
  },
})
</script>

<template>
  <div>
    <span>{{ text }}</span>
    <ul>
      <li
        v-for="(tag, index) in tags"
        :key="index"
        @click="addTag(tag)"
      >
        {{ tag.text }}
      </li>
    </ul>
  </div>
</template>
