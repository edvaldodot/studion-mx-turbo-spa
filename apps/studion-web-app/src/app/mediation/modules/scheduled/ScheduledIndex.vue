<script>
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import childrenRoutes from './pages/childrenRoutes'

import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Tabs from '@/components/general/Tabs'

export default defineComponent({
  name: 'ScheduledIndex',

  components: {
    ActionBar,
    ContentHeader,
    Tabs,
  },

  computed: {
    ...mapGetters(['findDeniedContext']),

    /*
     * Get all routes that are active to the current profile.
     */
    availableRoutes() {
      return childrenRoutes.filter((route) => !this.findDeniedContext(route.meta.context)) || []
    },
    /*
     * Generate tabLinks based on childrenRoutes meta tabLink attribute.
     */
    tabLinks() {
      return this.availableRoutes.map((route) => route.meta.tabLink)
    },
  },
})
</script>

<template>
  <div class="main-content  scheduled">
    <ContentHeader
      :title="$t('mediation:scheduled.action.title')"
      :description="$t('mediation:scheduled.action.description')"
      :tag="$t('global:menu.mediation')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />

      <Tabs
        slot="tabs"
        :links="tabLinks"
        dark
      />
    </ContentHeader>

    <RouterView />
  </div>
</template>

<style lang="scss">
.scheduled {
  .header-admin {
    padding-bottom: 10px;
  }
  .header-tag {
    margin-bottom: 10px;
  }
}
</style>
