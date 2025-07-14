<script>
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import childrenRoutes from './pages/childrenRoutes'

import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Tabs from '@/components/general/Tabs'

export default defineComponent({
  name: 'ManagementIndex',

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
  <div class="main-content  management">
    <ContentHeader
      :title="$t('global:menu.management')"
      :description="$t('management:header.description')"
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
.management .header-admin {
  .header-bottom {
    overflow-y: auto;
    white-space: nowrap;
    max-width: 100%;
  }
}
</style>
