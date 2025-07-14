<script>
import Icon from '../Icon'

export default {
  name: 'Menu',
  components: {
    Icon,
  },
  props: {
    value: {
      type: Object,
      default: () => {},
    },
    items: {
      type: Array,
      default: () => [],
    },
    itemLabel: {
      type: String,
      default: () => '',
    },
  },
  methods: {
    selectMenuItem(item) {
      this.$emit('input', item)
    },
  },
}
</script>

<template>
  <div class="menu">
    <ul class="menu__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="menu__item"
        @click="selectMenuItem(item)"
      >
        <div
          v-show="item.icon"
          class="menu__icon"
        >
          <slot
            name="item-icon"
            v-bind="{ item }"
          >
            <Icon :name="item.icon" />
          </slot>
        </div>
        <div class="menu__label">
          {{ item[`${itemLabel}`] ? item[`${itemLabel}`] : item }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
@import 'Menu.scss';
</style>
