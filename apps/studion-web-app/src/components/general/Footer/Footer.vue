<script>
import { mapState } from 'vuex'
import Logo from '../Logo'
import config from '@/config'

const { NEW_FOOTER } = config

export default {
  name: 'VueFooter',

  components: {
    Logo,
  },

  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    isEvaluationQuestionFeedbackMobile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      studentLink: 'https://studionmx.zendesk.com/hc/pt-br',
      adminLink: 'https://dotgroupsupport.zendesk.com/hc/pt-br',
      NEW_FOOTER: NEW_FOOTER,
    }
  },

  computed: {
    ...mapState(['accessibility', 'Auth']),

    footerClasses() {
      return {
        'theme-dark': this.dark || this.accessibility,
        'footer-margin-bottom-mobile':
          this.$media.mobile === true ? this.isEvaluationQuestionFeedbackMobile : false,
        'auth-footer': !this.Auth.token,
      }
    },

    helpLink() {
      return this.equalsProfile('admin') || (this.hasAccountInfo() && !this.isStudent())
        ? this.adminLink
        : this.studentLink
    },
  },
}
</script>

<template>
  <footer
    class="footer"
    :class="footerClasses"
  >
    <logo :dark="dark || accessibility"></logo>
    <span class="copyright"
      >© COPYRIGHT 2017 | DOT digital group | {{ $t('global:terms') }}
      <a
        v-if="!NEW_FOOTER"
        class="help-link"
        :href="helpLink"
        target="_blank"
      >
        HelpCenter StudiOn
      </a>
      <span
        v-else
        class="help-link__wrapper --multiple"
      >
        <a
          class="help-link"
          :href="studentLink"
          target="_blank"
        >
          {{ $t('footer:help.center.students') }}
        </a>
        {{ $t('footer:and') }}
        <a
          class="help-link"
          :href="adminLink"
          target="_blank"
        >
          {{ $t('footer:help.center.admin') }}
        </a>
      </span>
    </span>
  </footer>
</template>

<style lang="scss">
@import 'Footer.scss';
</style>
