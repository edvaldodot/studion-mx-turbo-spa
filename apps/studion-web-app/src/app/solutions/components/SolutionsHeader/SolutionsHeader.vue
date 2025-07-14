<script>
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'

export default {
  name: 'SolutionsHeader',
  components: {
    ActionBar,
    ContentHeader,
  },

  props: {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
}
</script>

<template>
  <ContentHeader
    :title="title"
    :description="description"
    class="header-admin"
    :tag="$t('global:solutions')"
  >
    <ActionBar slot="actionbar" />
  </ContentHeader>
</template>
