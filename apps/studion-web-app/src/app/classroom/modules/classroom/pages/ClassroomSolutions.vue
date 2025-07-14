<script>
import { mapState } from 'vuex/dist/vuex.common'
import SessionList from '../components/SessionList'
import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'

export default {
  components: {
    SessionList,
    ContentHeader,
    ActionBar,
  },

  computed: {
    ...mapState({
      User: (state) => state.Account.user,
    }),

    headerDescription() {
      return this.equalsProfile('student')
        ? this.$t('classroom:header.description.student')
        : this.$t('classroom:header.description')
    },
  },
}
</script>

<template>
  <div>
    <ContentHeader
      class="header-admin"
      :title="$t('global:solutions')"
      :tag="$t('global:solution.image.placeholder')"
      :description="headerDescription"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <SessionList :default-filter="{ teams_profile_id: User.currentProfileId }" />
  </div>
</template>
