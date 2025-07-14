<script>
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import Tooltip from '@/components/general/Tooltip'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import ValidationMessage from '@/components/general/ValidationMessage'

import MediationActionForm from '../../../../components/MediationActionForm'

export default {
  name: 'DailyActionItem',

  components: {
    Action,
    Icon,
    Tooltip,
    ValidationMessage,
    MediationActionForm,
    Dropdown,
    DropdownLink,
  },

  props: {
    mediation: {
      type: Object,
      required: true,
    },

    validation: {
      type: Object,
      required: true,
    },
  },

  computed: {
    showDispatchedLayout() {
      return this.mediation.dispatched && !this.mediation.isHidden
    },
  },
}
</script>

<template>
  <div class="daily-action-item">
    <div
      :class="{ dispatched: showDispatchedLayout }"
      class="card"
    >
      <div
        v-if="canWrite('mediation_plan')"
        class="btn__group"
      >
        <Dropdown icon="dots-vertical">
          <DropdownLink
            :text="$t('global:remove')"
            @click="$emit('remove')"
          />
          <DropdownLink
            :text="$t('mediation:scheduled.action.btn.preview')"
            @click="$emit('preview', mediation)"
          />
        </Dropdown>

        <Tooltip
          :uppercase="false"
          :width="174"
          :bold-font="false"
        >
          <template #activator="{ on }">
            <ValidationMessage
              :validation="validation"
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>
          <span>{{ $t('global:form:feedback:fields.pending') }}</span>
        </Tooltip>
      </div>
      <Action
        class="btn__toggle-hidden"
        :class="{ is_hide: mediation.isHidden }"
        flat
        icon="keyboard_arrow_up"
        type="button"
        @click="mediation.isHidden = !mediation.isHidden"
      />

      <MediationActionForm
        v-model="mediation"
        :validation="validation"
        @settings="$emit('settings', true)"
      />
    </div>

    <div
      v-if="showDispatchedLayout"
      class="message-wrapper"
    >
      <Icon
        name="error"
        wrapper
        size="small"
      />
      <span class="message">{{ $t('mediation.actions:form.information:dispatched') }}</span>
    </div>
  </div>
</template>

<style lang="scss">
@import './DailyActionItem.scss';
</style>
