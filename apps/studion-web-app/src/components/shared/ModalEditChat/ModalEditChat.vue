<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Action from '@/components/general/Action'
import { format } from 'date-fns'

const Datepicker = () => import('@/components/general/Datepicker')
const InputField = () => import('@/components/general/InputField')
const TextareaField = () => import('@/components/general/TextareaField')
const Upload = () => import('@/components/general/Upload')
import Checkbox from '@/components/general/Checkbox'
import SessionsBind from '@/app/management/pages/ManagementSessions/components/SessionsBind/SessionsBind.vue'

export default defineComponent({
  name: 'ModalEditChat',

  components: {
    Action,
    Datepicker,
    InputField,
    TextareaField,
    Upload,
    Checkbox,
    SessionsBind,
  },

  props: {
    validations: {
      type: Object,
      default: () => ({}),
    },
    chat: {
      type: Object,
      default: () => ({}),
    },
    isManagement: {
      type: Boolean,
      default: false,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    isManagementCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: null,
    }
  },

  computed: {
    ...mapState(['Classroom']),

    today() {
      return format(new Date(), 'yyyy-MM-dd-HH:mm:ss')
    },
  },

  created() {
    this.formData = this.chat
  },
})
</script>

<template>
  <div class="modal-form">
    <span class="modal-subtitle">{{ $t('classroom.chat:modal.add.subtitle') }}</span>

    <h2 class="modal-title text-color is-capitalize">{{ formData.title }}</h2>

    <div class="modal-description text-color">
      <p class="text-color">{{ $t('classroom.chat:modal.add.description') }}</p>
    </div>

    <form @submit.prevent="$emit('submit', formData)">
      <InputField
        v-model="formData.name"
        :label="$t('classroom.chat:modal.form.title')"
        :counter="100"
        :validation="validations.formData.name"
        dark
        :disabled="isPreview"
      />

      <TextareaField
        v-model="formData.description"
        auto-grow
        dark
        :label="$t('global:form.description')"
        :validation="validations.formData.description"
        :counter="500"
        :max-rows="5"
        :disabled="isPreview"
      />

      <div
        class="form-group clearfix theme-dark"
        data-cols="2"
        data-gap="40"
      >
        <p class="form-item-description">{{ $t('global:form.section.period') }}</p>

        <Datepicker
          v-model="formData.start_time"
          :label="$t('global:form.start')"
          :min="isPreview ? formData.start_time : today"
          :validation="validations.formData.start_time"
          :disabled="isPreview"
          dark
          time
        />

        <Datepicker
          v-model="formData.end_time"
          :disabled="formData.start_time == null || isPreview"
          :min="formData.start_time"
          :label="$t('global:form.end')"
          :validation="validations.formData.end_time"
          dark
          time
        />
      </div>

      <Checkbox
        v-model="formData.showTimeLeft"
        :items="[{ value: true, label: $t('classroom.chat:modal.time.left') }]"
        switch-type
        dark
      />

      <Upload
        v-model="formData.file"
        :icon="'image-multiple'"
        :label="$t('global:upload.add.image')"
        :description="$t('classroom.chat:modal.form.image')"
        :width="460"
        :cropper="true"
        :validation="validations.formData.file"
        :disabled="isPreview"
        dark
      />

      <div
        v-if="isManagementCreate"
        class="modal-form form-full-w"
      >
        <SessionsBind
          v-model="formData.sessions_ids"
          :validation="validations.formData.sessions_ids"
          :name-bind-component="$t('management:chat.replicate.name')"
          filter-tool="chat"
          @modal-is-open="(e) => $emit('session-modal-open', e)"
        />
      </div>

      <div
        v-if="!isPreview"
        class="form-submit text-center"
      >
        <Action
          :text="formData.id ? $t('global:save') : $t('global:create')"
          type="button"
          secondary
          large
          submit
          fixed-width
        />
      </div>
    </form>
  </div>
</template>

<style lang="scss">
.modal-add-achat {
  &.modal-form {
    form {
      max-width: 100%;

      > * {
        max-width: 520px;
        margin: 25px auto;

        &.form-full-w {
          max-width: 100%;
        }
      }
    }

    .modal-subtitle {
      &.is-management {
        color: var(--text-color);
        font-size: 4em;
        margin-bottom: 20px;
      }
    }
  }
}
</style>
