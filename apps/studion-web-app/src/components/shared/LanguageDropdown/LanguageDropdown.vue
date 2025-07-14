<script>
import { mapActions } from 'vuex'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default {
  name: 'LanguageDropdown',
  components: {
    Dropdown,
    DropdownLink,
  },
  props: {
    hasText: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'globe',
    },
    iconSize: {
      type: String,
      default: null,
    },
    classes: {
      type: String,
      default: null,
    },
  },
  computed: {
    dropdownText() {
      return this.hasText ? this.$t('global:language') : ''
    },
    dropdownIconSize() {
      return this.$media.mobile ? '' : this.iconSize
    },
  },
  methods: {
    ...mapActions(['setLanguage']),
  },
}
</script>

<template>
  <Dropdown
    :data-testid="$testId('dropdown--language')"
    :icon-size="dropdownIconSize"
    :right="$media.mobile"
    :text="dropdownText"
    :classes="classes"
    title-icon-size="small"
    :icon="icon"
  >
    <DropdownLink
      text="English"
      :data-testid="$testId('dropdown-link--en')"
      :active="$i18n.locale === 'en'"
      @click="setLanguage('en')"
    />

    <DropdownLink
      text="Español"
      :data-testid="$testId('dropdown-link--es')"
      :active="$i18n.locale === 'es'"
      @click="setLanguage('es')"
    />

    <DropdownLink
      text="Português BR"
      :data-testid="$testId('dropdown-link--pt-br')"
      :active="$i18n.locale === 'pt-br'"
      @click="setLanguage('pt-br')"
    />

    <DropdownLink
      text="Português PT"
      :data-testid="$testId('dropdown-link--pt')"
      :active="$i18n.locale === 'pt'"
      @click="setLanguage('pt')"
    />

    <DropdownLink
      text="中文"
      :data-testid="$testId('dropdown-link--zh-cn')"
      :active="$i18n.locale === 'zh-CN'"
      @click="setLanguage('zh-CN')"
    />
  </Dropdown>
</template>
