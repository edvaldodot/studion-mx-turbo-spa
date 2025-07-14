<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import ModalInformation from '../ModalInformation'
import Action from '../Action'

export default defineComponent({
  name: 'ModalOpenSurvey',

  components: {
    Action,
    ModalInformation,
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isActive: false,
      npsDisplay: {},
    }
  },

  computed: {
    ...mapState({
      user: ({ Account }) => Account.user,

      remindMeLaterMessage() {
        if (this.npsDisplay.delay_days === 0) {
          return this.$t('modal.open.survey:message.next.access')
        }

        return this.$t('modal.open.survey:message.days', {
          days: this.npsDisplay.delay_days,
        })
      },
      verifyShowRemindLater() {
        return this.npsDisplay.remind_later
      },
    }),
  },

  watch: {
    user(value) {
      this.npsDisplay = value.nps_display
      this.showSurveyModal(value)
    },
    isActive: {
      handler(value) {
        this.$emit('input', value)
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setShowSurvey',
      'attemptSaveSurveyDate',
      'attemptUserAccountRetrieval',
      'attemptSetDelayNps',
    ]),

    remindMeLater() {
      this.isActive = false
      this.attemptSetDelayNps(1).finally(() => {
        this.setFeedback({
          message: this.$t('modal.open.survey:feedback.success:nps.remind.later', {
            days: this.npsDisplay.delay_days,
          }),
        })
      })
    },

    openSurveyModal() {
      this.setShowSurvey(true)
      this.isActive = false

      this.saveSurveyDate()
    },

    showSurveyModal(user) {
      if (!user || !user.data) return

      if (!this.npsDisplay.enable) {
        return
      }

      this.isActive = true
    },

    saveSurveyDate() {
      this.attemptSetDelayNps(0)
    },
  },
})
</script>

<template>
  <ModalInformation
    v-if="isActive"
    :data-testid="$testId('modal-open-survey')"
    class="modal-open-survey"
    width="650px"
    is-page
  >
    <template #pre-content>
      <img
        class="modal-open-survey-img__nps"
        src="/assets/images/png/icon-modal-nps.png"
        alt="icon-modal-nps"
      />
    </template>

    <template #title>
      <h5 class="modal-open-survey-title">{{ $t('modal.open.survey:title') }}</h5>
    </template>

    <template #description>
      <p class="text-color text-center">
        {{ $t('modal.open.survey:message') }}
      </p>

      <p class="text-color text-center">
        {{ remindMeLaterMessage }}
      </p>
    </template>

    <template #actions>
      <div class="modal-open-survey-btn">
        <Action
          v-if="verifyShowRemindLater"
          type="button"
          flat
          :text="$t('modal.open.survey:decline')"
          @click="remindMeLater"
        />

        <Action
          type="button"
          secondary
          large
          fixed-width
          :text="$t('modal.open.survey:accept')"
          @click="openSurveyModal"
        />
      </div>
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import 'ModalOpenSurvey.scss';
</style>
