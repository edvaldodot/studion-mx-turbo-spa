<script>
import Icon from '../../Icon'
export default {
  components: {
    Icon,
  },
  props: {
    label: {
      type: String,
      default: '',
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    check() {
      this.$emit('check')
    },
  },
}
</script>
<template>
  <div
    :class="{ checked: checked }"
    class="checkboxfield__item"
    @click="check"
  >
    <!-- TODO: essa funcionalidade de drag and drop precisa de desenvolvida -->
    <icon
      name="six-dots"
      class="hoverable__icon"
    ></icon>
    <span class="checkboxfield__label">{{ label }}</span>
    <icon
      v-if="checked"
      name="check_box"
    ></icon>
    <icon
      v-else
      name="check_box_outline_blank"
    ></icon>
  </div>
</template>
