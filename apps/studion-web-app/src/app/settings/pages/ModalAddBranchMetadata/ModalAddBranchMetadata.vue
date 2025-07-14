<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import { required } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import SelectField from '@/components/general/SelectField'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import ModalBody from '@/components/general/ModalBody'
import Checkbox from '@/components/general/Checkbox'

import { makeTypeOptions } from './util'

export default defineComponent({
  name: 'ModalAddBranchMetadata',

  components: {
    Action,
    InputField,
    SelectField,
    Modal,
    ModalHeader,
    ModalBody,
    Checkbox,
  },

  mixins: [formScrollValidationMixin],

  validations: {
    form: {
      name: {
        required,
      },
      type: {
        required,
      },
      format: {
        required: false,
      },
    },
  },

  data() {
    return {
      form: {
        id: null,
        name: '',
        type: '',
        format: '',
        required: false,
      },
      typeOptions: [...makeTypeOptions()],
      formatTypes: [],
      allowFormatTypes: ['cnpj'],
    }
  },

  computed: {
    ...mapState(['metadata']),

    getFormatTypes() {
      return this.formatTypes.filter(({ value }) => value.includes(this.allowFormatTypes))
    },

    isEditing() {
      return !!this.$route.params.id
    },
  },

  async created() {
    const { id = null } = this.$route.params

    if (id) {
      if (!this.metadata.current) return this.$router.push(this.$route.meta.modalCloseLink)

      const {
        id = null,
        name = '',
        type = {},
        metaFormat = {},
        parameters = {},
      } = this.metadata.current.meta

      this.form = {
        ...this.form,
        id,
        name,
        type: type.alias || '',
        format: metaFormat ? metaFormat.alias || '' : null,
        required: parameters.required || false,
      }
    }

    this.setFetching(true)
    this.attemptMetasFormatsListRetrieval()
      .then(({ data: formatTypes }) => {
        this.formatTypes = formatTypes.map(({ alias, format }) => ({
          text: this.$t(`global:metadata.format.${alias.replace('_', '.')}`),
          value: alias,
          format,
        }))
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'attemptGetBranchingMetadata',
      'attemptMetasFormatsListRetrieval',
      'attemptMetasCreation',
      'attemptMetasUpdate',
      'setFetching',
      'setFeedback',
    ]),

    makePayload() {
      const payload = {
        meta: {
          name: this.form.name,
          meta_type_alias: this.form.type,
          meta_format_alias: this.form.format,
        },
        meta_entity: {
          entity: 'application_branch',
        },
        parameters: {
          required: this.form.required,
        },
      }

      if (this.isEditing) payload.meta_entity.meta_entity_id = this.$route.params.id

      return payload
    },

    async submit() {
      this.$v.$touch()

      if (this.$v.$invalid) {
        return this.scrollToInputError()
      }

      this.setFetching(true)

      const apiMethod = this.isEditing ? this.attemptMetasUpdate : this.attemptMetasCreation

      apiMethod(this.makePayload())
        .then(() => {
          this.$router.push({ name: this.$route.meta.modalCloseLink.name })
        })
        .catch(({ response }) => {
          const {
            data: { message = '' },
          } = response

          let toastMessage = 'global.request:timeout.message'

          if (message === 'meta_already_exists_in_this_entity')
            toastMessage = 'solutions.metadata:form:field.name:feedback:exists'

          this.setFeedback({ message: this.$t(toastMessage), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-add-branch-metadata')"
    active
    is-page
  >
    <ModalHeader
      :title="$t('global:metadata')"
      :sub-title="$tc('global:branch', 2)"
      :description="$t('settings.branches:modal.metadata.description')"
    />

    <ModalBody>
      <form @submit.prevent>
        <InputField
          v-model="form.name"
          :label="$t('solutions.metadata:form:field.name')"
          :disabled="!canWrite('branches')"
          :validation="$v.form.name"
          dark
        />

        <SelectField
          v-model="form.type"
          :items="typeOptions"
          :label="$t('global:form.type')"
          :validation="$v.form.type"
          required
          dark
          @input="() => {}"
        />

        <SelectField
          v-if="form.type === 'string'"
          v-model="form.format"
          :validation="$v.form.format"
          :label="$t('global:form.mask')"
          :items="getFormatTypes"
          dark
        />

        <Checkbox
          v-model="form.required"
          :items="[{ value: true, label: $t('solutions.metadata:form:required.field') }]"
          switch-type
          dark
        />

        <div class="form-submit text-center">
          <Action
            large
            secondary
            fixed-width
            type="button"
            :text="$t('global:form.save')"
            @click.prevent="submit"
          />
        </div>
      </form>
    </ModalBody>
  </Modal>
</template>
