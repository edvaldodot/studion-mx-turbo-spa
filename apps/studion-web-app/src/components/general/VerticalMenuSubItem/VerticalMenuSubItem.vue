<script>
import Icon from '../Icon'

export default {
  name: 'VerticalMenuSubItem',

  components: {
    Icon,
  },

  props: {
    text: {
      type: String,
      default: '',
    },
    link: {
      type: Object,
      default: () => {},
    },
    icon: {
      type: String,
      default: '',
    },
  },
}
</script>

<template>
  <li
    :data-testid="$testId('vertical-menu')"
    class="submenu-item"
  >
    <RouterLink
      :to="link"
      class="menu-link no-underline"
    >
      <Icon
        v-if="icon"
        :name="icon"
        size="medium"
        wrapper
      />

      <span class="text">{{ $t(text) }}</span>
    </RouterLink>
  </li>
</template>
