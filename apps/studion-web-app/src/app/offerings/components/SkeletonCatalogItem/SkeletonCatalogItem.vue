<script>
import { ContentLoader } from 'vue-content-loader'
import Skeleton from '@/components/general/Skeleton'

export default {
  name: 'SkeletonCatalogItem',
  components: {
    ContentLoader,
    Skeleton,
  },
  props: {
    hideHeader: Boolean,
  },
  computed: {
    columns() {
      if (this.$media.desktop) return 4
      if (this.$media.tablet) return 2
      if (this.$media.mobile) return 1
      return 4
    },
  },
}
</script>

<template>
  <div class="skeleton-catalog-item mt-4 mb-4">
    <Skeleton
      :grid="$media.desktop"
      :columns="columns"
      class="mt-4 mb-4"
    >
      <ContentLoader
        v-for="n in columns"
        :key="n"
        :width="480"
        :height="480"
        :speed="2"
      >
        <rect
          x="0"
          y="0"
          rx="10"
          ry="10"
          width="480"
          height="480"
        />
      </ContentLoader>
    </Skeleton>
  </div>
</template>
