<script>
import { mapActions } from 'vuex'
import config from '@/config'

import AnnounceKit from '@/components/shared/AnnounceKit'
import Profile from '../Profile'
import { LanguageDropdown, DropdownAccessibility } from '@/components/shared'

const { DEFAULT_ACCESSIBILITY } = config

export default {
  name: 'ActionBar',

  components: {
    AnnounceKit,
    Profile,
    LanguageDropdown,
    DropdownAccessibility,
  },

  props: {
    profile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      defaultAccessibility: DEFAULT_ACCESSIBILITY,
    }
  },

  computed: {
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  methods: {
    ...mapActions(['setAccessibility']),
    highContrast() {
      this.setAccessibility()
    },
  },
}
</script>

<template>
  <div
    v-if="!profile"
    class="flex py-2 justify-content-end bg-white absolute w-full shadow-1"
  >
    <div class="action-bar-item">
      <DropdownAccessibility v-show="defaultAccessibility" />
    </div>
    <AnnounceKit class="action-bar-item" />
    <div class="action-bar-item">
      <LanguageDropdown
        classes="action-bar-link"
        :has-text="false"
      />
    </div>
    <div class="action-bar-item">
      <Profile class="mr-3" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'ActionBar.scss';
</style>
