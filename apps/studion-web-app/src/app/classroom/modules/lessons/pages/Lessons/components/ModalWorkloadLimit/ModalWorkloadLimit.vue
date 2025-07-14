<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import ModalInformation from '@/components/general/ModalInformation'
import Icon from '@/components/general/Icon'
import Action from '@/components/general/Action'

export default defineComponent({
  name: 'ModalWorkloadLimit',

  components: {
    ModalInformation,
    Icon,
    Action,
  },

  props: {
    active: {
      type: Boolean,
      default: false,
    },
    workloadData: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    ...mapState({
      workload: (state) => state.Classroom.data.userWorkloadValue,
      user: (state) => state.Account.user,
    }),

    workloadLimit() {
      return this.user && this.user.workload_limit
    },
  },
})
</script>

<template>
  <ModalInformation
    :active="
      active &&
      workload &&
      ['exceeded_limit_continuously', 'exceeded_day_limit'].includes(workload.status)
    "
    class="modal-workload-limit"
    closable
    is-page
    @close="$emit('close')"
  >
    <template #pre-content>
      <Icon
        name="watch"
        wrapper
      />
      <p class="text-color">{{ $t('classroom.lessons:workload.limit') }}</p>
    </template>

    <template
      v-if="workload && workload.status"
      #title
    >
      {{ $t(`classroom.lessons:workload.limit.modal.${workload.status}.title`) }}
    </template>

    <template #description>
      <div class="text-center">
        <p
          v-if="workload && workload.status"
          class="mb-1"
        >
          {{
            $t(`classroom.lessons:workload.limit.modal.${workload && workload.status}.description`)
          }}
        </p>
        <span
          v-if="workload && workload.status === 'exceeded_limit_continuously'"
          class="modal-workload-limit__timer"
        >
          {{ workloadLimit && workloadLimit.break_time_minutes }}
          {{ $t('global:minutes') }}
        </span>
      </div>
    </template>

    <template #actions>
      <Action
        :text="$t('global:understood')"
        type="button"
        flat
        @click="$emit('close')"
      />
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import 'ModalWorkloadLimit.scss';
</style>
