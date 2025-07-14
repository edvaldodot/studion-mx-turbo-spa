<script>
import InlineSvg from 'vue-inline-svg'
import config from '@/config'

const { FOOTER_DOUBTS, CUSTOM_HELP_LINK, THEME_NAME, WHITE_LABEL } = config
import { PRIVACY_POLICIES, LANGUAGES } from '@/support/constants/privacyPolicies'

export default {
  name: 'FooterV2',

  components: {
    InlineSvg,
  },

  data() {
    return {
      studentLink: 'https://studionmx.zendesk.com/hc/pt-br',
      adminLink: 'https://dotgroupsupport.zendesk.com/hc/pt-br',
      FOOTER_DOUBTS: FOOTER_DOUBTS,
      CUSTOM_HELP_LINK: CUSTOM_HELP_LINK,
      THEME_NAME: THEME_NAME,
    }
  },

  computed: {
    helpLink() {
      if (this.CUSTOM_HELP_LINK) return this.CUSTOM_HELP_LINK

      return this.equalsProfile('admin') || (this.hasAccountInfo() && !this.isStudent())
        ? this.adminLink
        : this.studentLink
    },

    currentYear() {
      return new Date().getFullYear()
    },

    showPolicies() {
      const hasDocument = PRIVACY_POLICIES[this.THEME_NAME] || false
      return hasDocument
    },

    isWhiteLabel() {
      return WHITE_LABEL
    },
  },

  methods: {
    /**
     * @desc Opens the language-specific privacy policy PDF in a new browser tab.
     */
    openPolicy() {
      const parsedName = PRIVACY_POLICIES[this.THEME_NAME]
      const parsedLanguage = LANGUAGES[this.$i18n.locale]

      if (!this.showPolicies) return

      window.open(`/pdf/policies/Política de privacidade - ${parsedName} - ${parsedLanguage}.pdf`)
    },
  },
}
</script>

<template>
  <div class="flex flex-column justify-content-center gap-2 mb-2">
    <div
      v-if="!isWhiteLabel"
      class="flex justify-content-center align-items-center gap-3"
    >
      <div class="footer-v2__logo-studion">
        <InlineSvg
          width="100%"
          height="100%"
          src="/assets/images/svg/logos/studion.mx.dark.svg"
        />
      </div>
      <div class="text-sm lato-regular">Powered by</div>
      <div class="footer-v2__logo-dot">
        <InlineSvg
          width="100%"
          height="100%"
          src="/assets/images/svg/logos/dot.dark.svg"
        />
      </div>
    </div>
    <span
      class="flex align-items-center flex-wrap justify-content-center gap-1 text-sm lato-regular"
    >
      <div
        v-if="!isWhiteLabel"
        class="flex justify-content-between align-items-center w-9 xl:w-auto"
      >
        <div class="w-6 xl:w-auto footer-v2-copyright">© COPYRIGHT 2017-{{ currentYear }}</div>
        <div class="col-1 xl:w-auto text-center">|</div>
        <div class="w-5 xl:w-auto">DOT digital group</div>
      </div>
      <div
        v-if="FOOTER_DOUBTS && !isWhiteLabel"
        class="hidden xl:block"
      >
        |
      </div>
      <div
        v-if="FOOTER_DOUBTS && !isWhiteLabel"
        class="flex gap-1 align-items-center w-6 text-center xl:w-auto"
      >
        {{ $t('global:terms') }}
        <a
          class="footer-v2__help-link"
          :href="helpLink"
          target="_blank"
        >
          {{ $t('global:support') }}
        </a>
      </div>
      <template v-if="showPolicies">
        <span v-if="!isWhiteLabel">|</span>
        <a
          class="footer-v2__help-link policies"
          @click="openPolicy"
        >
          {{ $t('global:policy') }}
        </a>
      </template>
    </span>
  </div>
</template>

<style lang="scss">
@import 'Footer.scss';
</style>
