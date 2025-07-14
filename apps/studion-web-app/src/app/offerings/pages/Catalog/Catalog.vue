<script>
import { mapActions } from 'vuex'

import { ToolBar } from '@/components/general'

export default {
  name: 'CatalogView',
  components: {
    ToolBar,
  },
  data() {
    return {
      headerData: null,
    }
  },
  methods: {
    ...mapActions(['openMenu']),
    changeHeader(data) {
      this.headerData = data
    },
  },
}
</script>

<template>
  <div>
    <ToolBar @open-menu="openMenu" />
    <router-view @changeHeader="changeHeader"></router-view>
  </div>
</template>
