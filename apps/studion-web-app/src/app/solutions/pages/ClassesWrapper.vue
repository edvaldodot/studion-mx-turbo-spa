<template>
  <router-view
    @fixed-header="props => $emit('fixed-header', props)"
    @change-theme-footer="props => $emit('change-theme-footer', props)"
    :page-count="pageCount"
  />
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ClassesWrapper',

  data () {
    return {
      pageCount: null
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptGetCourseListMetadata',
      'setMetadataData'
    ])
  },

  created () {
    if (!this.$isEnabledFeature('course_metas')) {
      this.pageCount = 4
      return
    }

    this.setFetching(true)
    this.attemptGetCourseListMetadata()
      .then(response => {
        if (!response.length) {
          this.pageCount = 4
          return
        }

        this.pageCount = 5
      })
      .finally(() => this.setFetching(false))
  },

  beforeDestroy () {
    this.setMetadataData({ path: 'items', value: [] })
  }
}
</script>
