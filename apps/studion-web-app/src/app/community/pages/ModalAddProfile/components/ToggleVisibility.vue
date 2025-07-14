<script>
import Icon from '@/components/general/Icon'

export default {
  name: 'ToggleVisibility',

  components: {
    Icon,
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: 'Toggle',
    },
  },

  methods: {
    toggleVisibility() {
      this.$emit('input', !this.value)
    },
  },
}
</script>

<template>
  <div
    class="title_toggle_profile_visibility"
    :class="{ 'title_toggle_profile_visibility --active': value }"
    @click="toggleVisibility"
  >
    <p>{{ label }}</p>
    <div>
      <Icon
        v-if="value"
        name="keyboard_arrow_up"
        class="group__icon"
      />
      <Icon
        v-else
        name="keyboard_arrow_down"
        class="group__icon"
      />
    </div>
  </div>
</template>

<style lang="scss">
.title_toggle_profile_visibility {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  height: 77px;
  color: var(--light-color);
  background-color: transparent;
  padding: 0 22px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  font-family: var(--font-family);
  font-size: 1em;
  font-weight: 700;
  line-height: 4.75em;
  cursor: pointer;

  &.--active {
    background: rgba(255, 255, 255, 0.2);
    border-bottom: none;
  }
}
</style>
