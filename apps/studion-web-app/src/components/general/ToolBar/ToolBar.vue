<script>
import { Profile, Button } from '@/components/general'
import DropdownAccessibility from '@/components/shared/DropdownAccessibility'
import LanguageDropdown from '@/components/shared/LanguageDropdown'

export default {
  name: 'ToolBar',
  components: {
    Button,
    Profile,
    LanguageDropdown,
    DropdownAccessibility,
  },
  methods: {
    openMenu() {
      this.$emit('open-menu')
    },
  },
}
</script>
<template>
  <div class="toolbar">
    <div class="toolbar__prepend">
      <Button
        class="lg:hidden xl:hidden"
        icon="menu"
        variant="icon"
        @click="openMenu()"
      ></Button>
      <slot name="prepend" />
    </div>
    <div class="toolbar__content">
      <slot name="content" />
    </div>
    <div class="toolbar__append">
      <slot name="append" />
      <DropdownAccessibility />
      <LanguageDropdown
        classes="action-bar-link"
        :has-text="false"
      />
      <Profile />
    </div>
  </div>
</template>
<style lang="scss">
@import 'ToolBar.scss';
</style>
