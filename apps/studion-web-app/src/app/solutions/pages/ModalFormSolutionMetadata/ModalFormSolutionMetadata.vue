<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Modal from '@/components/general/Modal'

import FormSolutionMetadata from './components/FormSolutionMetadata'

export default {
  name: 'ModalFormSolutionMetadata',

  components: {
    FormSolutionMetadata,
    Modal,
  },

  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fieldNamesUsed: [],
      hasFieldNameUsed: false,

      formData: {
        meta: {
          name: null,
          meta_type_alias: null,
        },
        parameters: {
          required: false,
          options: [{ fields: {} }, { fields: {} }],
          options_fields: [{ name: 'name', alias: 'name', visible: true }],
          allowHidden: false,
        },
        meta_entity: {
          entity: 'course',
          extra_parameters: {
            studentShow: false,
          },
        },
      },
    }
  },

  computed: {
    ...mapGetters(['isFetching']),
    ...mapState({
      selectedMetadata: (state) => state.metadata.current,
    }),

    disableInput() {
      return (
        !this.canWrite('courses') ||
        !this.canWrite('metadata') ||
        (this.formData.id && !this.isEditing)
      )
    },
  },

  watch: {
    'formData.meta.name': function (newName) {
      if (newName && this.fieldNamesUsed.includes(newName.toLowerCase())) {
        this.hasFieldNameUsed = true
        return
      }
      this.hasFieldNameUsed = false
    },

    'formData.meta.meta_type_alias'(newType) {
      if (['select', 'multiple_select'].includes(newType)) {
        const parameters = this.formData.parameters
        if (parameters.required === null) {
          parameters.required = false
        }
        if (parameters.options === null) {
          parameters.options = [{ fields: {} }, { fields: {} }]
        }
        if (parameters.options_fields === null) {
          parameters.options_fields = [{ name: 'name', alias: 'name', visible: true }]
        }
        if (parameters.allowHidden === null) {
          parameters.allowHidden = false
        }
      }
    },
  },

  validations() {
    const defaultValidate = {
      formData: {
        meta: {
          name: {
            required,
            fieldNameUsed: () => !this.hasFieldNameUsed,
          },
          meta_type_alias: { required },
        },
      },
    }

    const isListType = ['select', 'multiple_select'].includes(this.formData.meta.meta_type_alias)
    if (!isListType) {
      return defaultValidate
    }

    defaultValidate.formData.parameters = {
      options: {
        $each: {
          fields: {
            name: {
              required,
            },
          },
        },
      },
    }

    if (this.formData.parameters.allowHidden) {
      defaultValidate.formData.parameters = {
        options_fields: {
          $each: {
            name: {
              required,
            },
          },
        },

        options: {
          $each: {
            fields: {
              [this.formData.parameters.options_fields[0].alias]: {
                required,
              },
              [this.formData.parameters.options_fields[1].alias]: {
                required,
              },
            },
          },
        },
      }
    }

    return defaultValidate
  },

  created() {
    if (this.isEditing) {
      this.formatCurrentToFormData()
    }
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptMetasCreation', 'attemptMetasUpdate']),

    goBack() {
      this.$router.push({ name: 'solutions.metadata' })
    },

    handleSubmit(data) {
      this.setFetching(true)
      const dataHandler = this.isEditing ? this.attemptMetasUpdate : this.attemptMetasCreation

      dataHandler(data)
        .then(() => {
          this.goBack()
          this.setFeedback({
            message: this.$t('solutions.metadata:form:field.name:feedback:success'),
          })
        })
        .catch((response) => {
          this.handleFeedbackError(response)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * Handle the right feedback according API response.
     * @param {Object} apiResponse
     */
    handleFeedbackError(apiResponse) {
      const response = apiResponse && apiResponse.response
      const messageError = response && response.data && response.data.message
      let feedback = 'global:error'

      if (messageError && messageError === 'meta_alias_already_exists') {
        this.fieldNamesUsed.push(this.formData.meta.name.toLowerCase())
        this.hasFieldNameUsed = true
        feedback = 'solutions.metadata:form:field.name:feedback:exists'
      }

      this.setFeedback({ message: this.$t(feedback) })
    },

    formatCurrentToFormData() {
      const meta = this.selectedMetadata && this.selectedMetadata.meta
      const entity = meta && this.selectedMetadata.entity
      const params = entity && this.selectedMetadata.parameters

      if (!params) {
        this.goBack()
        return
      }

      this.formData = {
        id: this.selectedMetadata.id,
        meta: {
          name: meta.name,
          meta_type_alias: meta.type.alias,
        },
        meta_entity: {
          entity: 'course',
          meta_entity_id: this.selectedMetadata.id,
          extra_parameters: {
            studentShow: this.selectedMetadata.studentShow,
          },
        },
        parameters: {
          required: params.required,
          allowHidden: params.optionsFields && params.optionsFields.length > 1,
          options: params.options,
          options_fields: params.optionsFields,
        },
      }
    },
  },
}
</script>

<template>
  <modal
    :active="true"
    is-page
  >
    <div class="modal-form mb-10">
      <span class="modal-subtitle">
        {{ $t('solutions:modal.subtitle') }}
      </span>
      <h2 class="modal-title text-color text-color">
        {{ $t('community.metadata:modal.title') }}
      </h2>
      <div class="modal-description text-color text-color">
        <p class="text-color">{{ $t('solutions.metadata:modal:description') }}</p>
      </div>

      <form-solution-metadata
        :value="formData"
        :validation="$v.formData"
        :disabled="disableInput"
        @submit="handleSubmit"
      />
    </div>
  </modal>
</template>
