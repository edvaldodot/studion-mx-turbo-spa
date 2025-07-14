<script>
import config from '@/config'
import { mapActions, mapState } from 'vuex'

import Icon from '@/components/general/Icon'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

const { USER_WAY_KEY } = config
const { VUE_APP_USERWAY_KEY } = process.env

export default {
  name: 'DropdownAccessibility',
  components: {
    Icon,
    Dropdown,
    DropdownLink,
  },
  data() {
    return {
      increaseFontDisabled: false,
      decreaseFontDisabled: true,
    }
  },
  computed: {
    ...mapState(['accessibilityFontSize']),
    canShowAccessibility() {
      const hasUserWay = USER_WAY_KEY || VUE_APP_USERWAY_KEY
      return !hasUserWay || this.notEqualsProfile('student')
    },
  },
  watch: {
    accessibilityFontSize(value) {
      this.increaseFontDisabled = value === 2
      this.decreaseFontDisabled = value === 0
    },
  },

  mounted() {
    if (this.accessibilityFontSize > 1) {
      this.increaseFontDisabled = true
      this.decreaseFontDisabled = false
    } else if (this.accessibilityFontSize < 1) {
      this.decreaseFontDisabled = true
      this.increaseFontDisabled = false
    } else {
      this.increaseFontDisabled = false
      this.decreaseFontDisabled = false
    }
  },

  methods: {
    ...mapActions(['setFontsize']),
    increaseFont() {
      this.accessibilityFontSize < 2 && this.setFontsize(this.accessibilityFontSize + 1)
    },
    decreaseFont() {
      this.accessibilityFontSize > 0 && this.setFontsize(this.accessibilityFontSize - 1)
    },
    /**
     * Opens the UserWay accessibility icon if it exists.
     */
    openUserWay() {
      const hasUserWay = document.getElementById('userwayAccessibilityIcon')
      if (hasUserWay) document.getElementById('userwayAccessibilityIcon').click()
    },
  },
}
</script>
<template>
  <div>
    <Dropdown
      v-if="canShowAccessibility"
      :classes="'action-bar-link'"
      icon="accessibility"
      right
    >
      <DropdownLink
        :text="$t('global:accessibility.increase.font')"
        :disabled="increaseFontDisabled"
        icon="format_size"
        @click="increaseFont()"
      />
      <DropdownLink
        :text="$t('global:accessibility.decrease.font')"
        :disabled="decreaseFontDisabled"
        icon="text_fields"
        @click="decreaseFont()"
      />
    </Dropdown>

    <Icon
      v-else-if="equalsProfile('student')"
      class="action-bar-link"
      name="accessibility"
      wrapper
      @click="openUserWay()"
    />
  </div>
</template>
