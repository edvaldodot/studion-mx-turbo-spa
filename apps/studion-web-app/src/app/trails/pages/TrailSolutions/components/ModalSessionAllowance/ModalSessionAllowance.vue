<script>
import { mapActions } from 'vuex'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'

import DateFrequencyField from '@/app/community/components/DateFrequencyField'
import DatatableScheduleBlocks from '@/app/community/components/DatatableScheduleBlocks'

import { scheduleBlocksSort, checkDuplicates } from '@/support/utils/scheduleBlock'

import {
  getDefaultScheduleBlock,
  parseScheduleBlock,
} from '@/app/community/pages/ModalAddSession/scheduleBlock'

export default {
  name: 'ModalSessionAllowance',
  components: {
    Modal,
    Action,
    Checkbox,
    DateFrequencyField,
    DatatableScheduleBlocks,
  },
  props: {
    session: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      hasAllowance: false,
      currentScheduleAllowed: getDefaultScheduleBlock(),
      formData: {
        schedule_grant_access: [],
      },
      originalScheduleAllowance: [],
    }
  },
  created() {
    this.formData.schedule_grant_access = this.session.schedule_grant_access || []
    this.originalScheduleAllowance = this.deepClone(this.formData.schedule_grant_access)
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptSaveTrailSessionAllowance',
      'attemptDeleteTrailSessionAllowance',
    ]),
    closeModal() {
      this.$emit('close')
    },
    addScheduleAllowance() {
      this.$refs.datefrequencefieldallowed &&
        this.$refs.datefrequencefieldallowed.touchRequiredFields()

      const isSessionBlockValid = !this.$refs.datefrequencefieldallowed.$v.value.$invalid
      if (!isSessionBlockValid) return

      const newScheduleAllowance = parseScheduleBlock(this.currentScheduleAllowed)

      const isDuplicate = checkDuplicates(newScheduleAllowance, this.formData.schedule_grant_access)

      if (isDuplicate) {
        this.setFeedback({
          type: 'info',
          message: this.$t('community.sessions:session.allowance.duplicate.warning'),
        })
        return
      }

      this.formData.schedule_grant_access.push(newScheduleAllowance)
      this.currentScheduleAllowed = getDefaultScheduleBlock()
      this.$refs.datefrequencefieldallowed.resetValidations()
    },
    removeScheduleAllowance(index) {
      this.formData.schedule_grant_access.sort(scheduleBlocksSort).splice(index, 1)
    },

    submit() {
      const payload = this.formData.schedule_grant_access.map((item) => {
        return {
          ...item,
          sessionId: this.session.session_id,
        }
      })

      const itemsToCreate = payload.filter((item) => !item.id)
      const itemsToDelete = this.originalScheduleAllowance
        .filter((item) => {
          return !payload.find((i) => i.id === item.id)
        })
        .map((item) => {
          return { id: item.id }
        })

      if (itemsToCreate.length || itemsToDelete.length) {
        this.setFetching(true)
      }

      const promises = []

      if (itemsToCreate.length) {
        promises.push(this.attemptSaveTrailSessionAllowance(itemsToCreate))
      }
      if (itemsToDelete.length) {
        promises.push(this.attemptDeleteTrailSessionAllowance(itemsToDelete))
      }

      Promise.all(promises)
        .then(() => {
          this.setFeedback({
            message: this.$t('community.sessions.add:session.allowance.success'),
          })
          this.closeModal()
        })
        .catch(( {response} ) => {
          const grantAccessMessage = 'session_has_current_access';
          const errorMessage = response.data.message === grantAccessMessage
            ? `community.sessions.add:${response.data.message.replace(/_/g, '.')}`
            : 'community.sessions.add:session.allowance.error';

          this.setFeedback({
            message: this.$t(errorMessage),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>
<template>
  <Modal
    :active="!!session"
    :cancel="false"
    is-page
  >
    <Action
      :text="$t('global:back')"
      class="btn-back text-color"
      icon="keyboard_backspace"
      icon-size="medium"
      type="button"
      @click="closeModal"
    />
    <div class="modal-form modal-schedule-allowance">
      <span class="modal-subtitle">{{ $t('community.sessions.add:session.allowance.label') }}</span>
      <h2 class="modal-title text-color">{{ session.course_name }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('trails.allowance:modal.description') }}</p>
      </div>
      <div class="modal-body">
        <div class="form-section theme-dark modal-form-box-inner schedule-allowed bg-black-300">
          <div class="optional">
            <h3 class="form-section-title">
              {{ $t('community.sessions.add:session.allowance.label') }}
            </h3>
            <Checkbox
              v-model="hasAllowance"
              :items="[{ value: true }]"
              dark
              switch-type
            />
          </div>
          <p class="form-section-hint">
            {{ $t('community.sessions.add:session.allowance.hint') }}
          </p>
          <DateFrequencyField
            v-if="hasAllowance"
            ref="datefrequencefieldallowed"
            v-model="currentScheduleAllowed"
          />
          <Action
            v-if="hasAllowance"
            class="schedule-allowed__add"
            type="button"
            :text="$t('community.sessions.add:modal.add.schedule.allowance')"
            flat
            dark
            @click="addScheduleAllowance"
          />
        </div>

        <DatatableScheduleBlocks
          class="mt-12"
          :title="$t('schedule.block:datatable.added.allowances')"
          :items="formData.schedule_grant_access"
          @remove="removeScheduleAllowance"
        />
      </div>
      <div class="text-center my-4">
        <Action
          :text="$t('global:save')"
          type="button"
          secondary
          large
          fixed-width
          @click="submit"
        />
      </div>
    </div>
  </modal>
</template>
<style lang="scss">
.modal-schedule-allowance {
  width: 600px;
  max-width: 100%;
  margin: 0 auto;

  .form-section {
    &.schedule-allowed,
    &.schedule-block {
      margin-top: 80px;
      margin-bottom: 20px;
    }

    &.modal-form-box-inner {
      border-radius: 8px;
    }

    .optional {
      display: flex;
      justify-content: space-between;
    }

    .form-section-hint {
      font-style: italic;
      font-size: 1.4em;
    }
  }

  .schedule-allowed__add,
  .schedule-block__add {
    margin-top: 40px;
    margin-bottom: 20px;
  }
}
</style>
