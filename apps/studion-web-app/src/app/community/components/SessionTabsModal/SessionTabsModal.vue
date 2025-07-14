<template>
  <tabs
    class="session-tabs"
    v-if="renderingCondition"
    :links="tabLinks"
    :index-active="tabLinkActive"
    @tabChange="changeTab"
    :show-bottom-border="true"
    dark
  />
</template>

<script>
import Tabs from '@/components/general/Tabs'

export default {
  name: 'SessionTabsModal',

  components: {
    Tabs
  },

  props: {
    renderingCondition: {
      type: Boolean,
      default: true
    },

    showMediationPlanTab: {
      type: Boolean,
      required: false
    },

    tabLinkActive: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      tabLinks: [
        {
          text: 'community.sessions:modal.tab.link.info',
          link: 'community.session.edit'
        },
        {
          text: 'community.sessions:modal.tab.link.students',
          link: 'community.sessions.enrollments'
        },
        {
          text: 'global:menu.mediation',
          link: 'community.sessions.mediation',
          disabled: !this.showMediationPlanTab
        }
      ]
    }
  },

  methods: {
    changeTab (index) {
      const link = this.tabLinks[index] && this.tabLinks[index].link
      if (!link) return
      this.$router.push({ name: link })
    }
  }
}
</script>

<style lang="scss">
@import "./SessionTabsModal.scss";
</style>
