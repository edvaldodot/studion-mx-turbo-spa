<script>
import { mapActions, mapState } from 'vuex'
import config from '@/config'

import Icon from '../Icon'
import Dropdown from '../Dropdown'
import DropdownLink from '../DropdownLink'
import LanguageDropdown from '@/components/shared/LanguageDropdown'

const { DEFAULT_ACCESSIBILITY } = config

export default {
  name: 'LinksBar',
  components: {
    Icon,
    Dropdown,
    DropdownLink,
    LanguageDropdown,
  },
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      defaultAccessibility: DEFAULT_ACCESSIBILITY,
      increaseFontDisabled: false,
      decreaseFontDisabled: true,
    }
  },
  computed: {
    ...mapState(['accessibilityFontSize', 'accessibility']),
    inValidateCertificateView() {
      return this.$route.name === 'validate.certificate'
    },
  },
  watch: {
    accessibilityFontSize: function (value) {
      this.increaseFontDisabled = value === 2
      this.decreaseFontDisabled = value === 0
    },
  },
  created() {
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
    ...mapActions(['setAccessibility', 'setFontsize']),
    highContrast() {
      this.setAccessibility()
    },
    increaseFont() {
      this.accessibilityFontSize < 2 && this.setFontsize(this.accessibilityFontSize + 1)
    },
    decreaseFont() {
      this.accessibilityFontSize > 0 && this.setFontsize(this.accessibilityFontSize - 1)
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('links-bar')"
    class="flex align-items-center gap-4 h-5rem px-3"
    :class="[{ 'theme-dark': dark }, customClass]"
  >
    <div class="flex gap-1 align-items-center">
      <Icon
        class="text-black-600 icon-fill-1"
        name="settings_accessibility"
        pack="material"
      />
      <Dropdown
        class="text-black-600 lato-regular text-sm xl:text-base"
        :data-testid="$testId('dropdown--accessibility')"
        :text="$t('global:accessibility')"
        :icon-size="$media.mobile ? '' : 'small'"
        :title="$t('global:accessibility')"
        :right="$media.mobile"
      >
        <DropdownLink
          :data-testid="$testId('dropdown-link--increase')"
          :text="$t('global:accessibility.increase.font')"
          :disabled="increaseFontDisabled"
          icon="format_size"
          @click="increaseFont()"
        />
        <DropdownLink
          :data-testid="$testId('dropdown-link--decrease')"
          :text="$t('global:accessibility.decrease.font')"
          :disabled="decreaseFontDisabled"
          icon="text_fields"
          @click="decreaseFont()"
        />
      </Dropdown>
    </div>

    <div class="flex gap-1 align-items-center">
      <Icon
        class="text-black-600 icon-fill-1"
        name="g_translate"
        pack="material"
      />
      <LanguageDropdown
        class="text-black-600 lato-regular text-sm xl:text-base"
        icon=""
        icon-size="small"
      />
    </div>

    <div>
      <router-link
        :data-testid="$testId('link--validate-certificate')"
        to="/external/validate-certificate"
        class="flex gap-1 align-items-center"
      >
        <Icon
          :class="['text-black-600 icon-fill-1', { 'text-primary': inValidateCertificateView }]"
          name="school"
          pack="material"
        />
        <span
          :class="[
            'font-base text-black-600 lato-regular text-sm xl:text-base',
            { 'text-primary': inValidateCertificateView },
          ]"
        >
          {{ $t('external.certificates.validate') }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss">
@import 'LinksBar.scss';
</style>
