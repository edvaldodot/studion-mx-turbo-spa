<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DiscussionStatusTag',

  props: {
    status: {
      type: String,
      required: true,
      validator(value) {
        return ['inactive', 'closed', 'active'].includes(value)
      },
    },
    content: {
      type: String,
      required: true,
    },
  },

  methods: {
    getColor(status) {
      const colorMap = {
        inactive: 'var(--alert-500)',
        closed: 'var(--alert-500)',
        active: 'var(--primary-color)',
      }
      return colorMap[status]
    },
  },
})
</script>

<template>
  <div
    :style="{ backgroundColor: getColor(status) }"
    :data-testid="$testId('discussion-status-tag')"
    class="discussion-status-tag"
  >
    <p>{{ content }}</p>
  </div>
</template>

<style scoped lang="scss">
.discussion-status-tag {
  padding: 5px 9px;
  border-radius: 6px;
  width: max-content;
  position: absolute;
  bottom: -2px;
  left: 20px;
  z-index: 10;

  p {
    font-size: 14px;
    line-height: 18px;
    color: var(--text-contrast-primary-color);
  }
}
</style>
