<script>
import Tooltip from '@/components/general/Tooltip'
import Icon from '@/components/general/Icon'
import { mapState } from 'vuex'

export default {
  name: 'SessionLimit',
  components: {
    Tooltip,
    Icon,
  },

  computed: {
    ...mapState(['Account']),

    conferencesUsersQuota() {
      return this.Account.user.conferences_users_quota
    },
  },
}
</script>

<template>
  <div class="session-limit">
    <p>{{ $t('bind.sessions:modal.student.limit') }}</p>

    <span>{{ conferencesUsersQuota }}</span>

    <Tooltip
      :uppercase="false"
      :dark="true"
      shadow
      :width="370"
    >
      <template #activator="{ on }">
        <div v-on="on">
          <Icon
            name="help"
            class="question-feedback-icon"
            size="small"
            wrapper
          />
        </div>
      </template>

      <span>
        {{ $t('bind.sessions:modal.student.limit.description') }}
      </span>
    </Tooltip>
  </div>
</template>

<style lang="scss">
@import 'SessionLimit.scss';
</style>
