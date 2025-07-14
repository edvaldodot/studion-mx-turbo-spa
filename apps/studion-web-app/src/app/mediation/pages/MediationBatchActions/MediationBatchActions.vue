<script>
import { defineComponent } from 'vue'
import { required } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'

import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import fileExtensionValidator from '@/support/customValidators/fileExtensionValidator'

import Action from '@/components/general/Action'
import FileField from '@/components/general/FileField'
import HorizontalTopicList from '@/components/general/HorizontalTopicList'
import ModalSolid from '@/components/general/ModalSolid'
import ModalHeader from '@/components/general/ModalHeader'

const ALLOWED_FILE_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/excel',
  'application/vnd.ms-excel',
  'application/msexcel',
  'xlsx',
  'csv',
]
const ALLOWED_FILE_EXTENSIONS = ['csv', 'xlsx', 'xls']

export default defineComponent({
  name: 'MediationBatchActions',

  components: {
    Action,
    HorizontalTopicList,
    FileField,
    ModalSolid,
    ModalHeader,
  },

  data() {
    return {
      file: null,
      topicItems: [
        { text: this.$t('mediation.batch:topics.1') },
        { text: this.$t('mediation.batch:topics.2') },
        { text: this.$t('mediation.batch:topics.3') },
        { text: this.$t('mediation.batch:topics.4') },
        { text: this.$t('mediation.batch:topics.5') },
        { text: this.$t('mediation.batch:topics.6') },
      ],
    }
  },

  validations: {
    file: {
      required,
      mimeType: mimeTypeValidator(ALLOWED_FILE_TYPES),
      extension: fileExtensionValidator(ALLOWED_FILE_EXTENSIONS),
    },
  },

  methods: {
    ...mapActions([
      'attemptCreateMediationActionBatch',
      'attemptGetMediationBatchesSheetModel',
      'setFetching',
      'setFeedback',
    ]),

    downloadModel() {
      this.setFetching(true)
      this.attemptGetMediationBatchesSheetModel()
        .then(() => {
          this.setFeedback({ message: this.$t('global:download.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('global:download.error') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      const payload = {
        mediation_plan_id: this.$route.params.id,
        file: this.file[0],
      }

      this.setFetching(true)
      this.attemptCreateMediationActionBatch(payload)
        .then(() => {
          this.$emit('status', 'processing')
          this.$emit('refresh')
          this.$router.push({ name: 'mediation.batch.list' })
        })
        .catch(({ response }) => {
          if (response.data.message === 'invalid_mime_type') {
            this.setFeedback({
              message: this.$t('global:validation.mimetype'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <ModalSolid
    class="mediation-batch-actions"
    :data-testid="$testId('mediation-batch-actions')"
    active
    is-page
  >
    <template #content>
      <ModalHeader
        :title="$t('mediation.batch:title')"
        :sub-title="$t('global:menu.mediation')"
      />

      <p class="text-center">{{ $t('mediation.batch:text') }}</p>

      <Action
        :text="$t('mediation.batch:sheet.download')"
        type="button"
        flat
        @click="downloadModel"
      />

      <HorizontalTopicList
        :topic-items="topicItems"
        light
        link-topics-on-mobile
        thin-connector
      />

      <form @submit.prevent="submit">
        <FileField
          v-model="file"
          accept=".csv,.xlsx"
          :label="$t('global:form.attach.file')"
          :validation="$v.file"
        />

        <Action
          :text="$t('global:import')"
          type="button"
          fixed-width
          secondary
          submit
          large
        />
      </form>
    </template>
  </ModalSolid>
</template>

<style lang="scss">
.mediation-batch-actions {
  p {
    color: var(--black-500);
  }
  .btn:not(.btn-back) {
    margin: 24px auto;
    display: block;
    max-width: max-content;
  }
  .form-item {
    max-width: 420px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .btn-back {
      margin-bottom: 34px;
    }

    .modal-subtitle {
      margin-bottom: 6px;
      font-size: 1.125rem;
      line-height: 1.4375rem;
    }

    .modal-title {
      font-size: 1.5rem;
      line-height: 1.875rem;
      margin-bottom: 34px;
    }

    .text-center {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #000000b3;
    }
  }

  @media (max-width: 435px) {
    .modal {
      padding: 16px;
    }
  }
}
</style>
