<template>
  <ContentHeader
    :title="$t(title)"
    :description="$t(description)"
    class="header-admin"
    :tag="$t('global:menu.mediation')"
  >
    <ActionBar slot="actionbar" />
  </ContentHeader>
</template>

<script>
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'

export default {
  name: 'MediationContentHeader',

  components: {
    ActionBar,
    ContentHeader,
  },

  props: {
    title: {
      type: String,
      default: 'mediation:header.title',
    },
    description: {
      type: String,
      default: 'mediation:header.description',
    },
  },
}
</script>
