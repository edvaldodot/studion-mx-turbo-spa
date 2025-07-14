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
  <div
    class="tags-discussion-content"
    :data-testid="$testId('tag-discussion')"
  >
    <span class="text-base">{{ text }}</span>
    <ul>
      <li
        class="text-base mt-2 text-primary cursor-pointer"
        v-for="(tag, index) in tags"
        :key="index"
        @click="addTag(tag)"
      >
        {{ tag.text }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
</style>
