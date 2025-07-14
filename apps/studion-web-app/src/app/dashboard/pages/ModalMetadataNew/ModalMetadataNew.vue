<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Datepicker from '@/components/general/Datepicker'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import OptInField from '@/components/general/OptInField'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import config from '@/config'

const { FORCE_METADATA_FILL } = config

export default {
  name: 'ModalMetadataNew',
  components: {
    Action,
    Datepicker,
    InputField,
    OptInField,
    Modal,
    SelectField,
    TextareaField
  },
  data () {
    return {
      showModal: true,
      formData: {
        metadata: {
        }
      },
      metadataList: [],
      isMetaRequired: this.blockMetaOptIn()
    }
  },
  validations () {
    let defaultValidate = {
      formData: {
        metadata: {}
      }
    }
    this.metadataList.map(item => {
      let rule = {}
      rule[item.alias] = {}
      if (item.required) {
        rule[item.alias] = {
          required
        }
      }
      defaultValidate.formData.metadata = Object.assign(rule, defaultValidate.formData.metadata)
    })
    return defaultValidate
  },
  computed: {
    ...mapState(['fetching', 'Account', 'accessibility']),

    forceMetadataFill() {
      return FORCE_METADATA_FILL
    },
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptGetUserMetadata',
      'attemptSaveUserMetadata',
      'attemptUserAccountRetrieval',
      'setUserMetaStatus'
    ]),
    closeModal () {
      this.$router.push({ name: 'dashboard' })
    },
    submit () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.isMetaRequired = false
        this.attemptSaveUserMetadata(this.createObjMetadata()).then(({ data }) => {
          this.setUserMetaStatus(data.currentMetaStatus)
          this.attemptUserAccountRetrieval().then(({ data }) => {
            this.$router.push({ name: 'dashboard' })
            this.setFeedback({ message: this.$t('profile:feedback.save.success') })
          }).finally(() => {
            this.setFetching(false)
          })
        }).catch(() => {
          this.setFetching(false)
          this.isMetaRequired = true
        }).finally(() => {
          this.setFetching(false)
        })
      }
    },
    createObjMetadata () {
      let data = { values: {} }
      this.metadataList.map(item => {
        data.values[item.alias] = this.formData.metadata[item.alias]
      })
      return data
    },
    validateData (value, index) {
      this.formData.metadata[index] = value === '(' ? '' : value
    }
  },
  created () {
    this.setFetching(true)
    this.attemptUserAccountRetrieval().then(() => {
      if (this.Account.user.metaStatus === 'completed') {
        this.$router.push({ name: 'dashboard' })
      } else {
        this.setFetching(true)
        this.attemptGetUserMetadata().then(({ data }) => {
          this.metadataList = data.map(item => {
            this.$set(this.formData.metadata, item.alias, item.value)
            if (item.type === 'select' || item.type === 'multiple_select') {
              item.options = item.options.map(option => {
                let propertyName = Object.keys(option.fields)[0]
                return {
                  text: option.fields[propertyName],
                  value: option.id
                }
              })
            }
            return item
          })
        }).finally(() => {
          this.setFetching(false)
        })
      }
    }).finally(() => {
      this.setFetching(false)
    })
  }
}
</script>

<template>
  <modal :active="showModal" :cancel="false" is-page>
    <action type="button" icon="keyboard_backspace" icon-size="medium" :text="$t('dashboard.profile:modal.back')" class="btn-back text-color" @click="closeModal"   v-if="!forceMetadataFill && !isMetaRequired"></action>
    <div class="modal-form modal-form-first-access">
      <h2 class="modal-title text-color">{{ $t('dashboard.profile.new:modal.title') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('dashboard.profile.new:modal.description.1') }}</p>
        <p v-if="!isMetaRequired">{{ $t('dashboard.profile.new:modal.description.2') }}</p>
      </div>
      <form @submit.prevent="submit">
        <template v-for="(metadata, index) in metadataList">
          <datepicker :label="metadata.name" v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" allow-input :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" v-if="metadata.type === 'date'"></datepicker>
          <datepicker :label="metadata.name" v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" time :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" v-if="metadata.type === 'datetime'"></datepicker>
          <textarea-field :label="metadata.name" v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" auto-grow v-if="metadata.type === 'text'"></textarea-field>
          <input-field :label="metadata.name" v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" :mask="metadata.valueFormat.format.format" :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" v-if="metadata.type === 'string'" @input="validateData($event, metadata.alias)"></input-field>
          <input-field :label="metadata.name" v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" type="number" v-if="metadata.type === 'int'" ></input-field>
          <select-field :label="metadata.name" v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" :items="metadata.options" :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" v-if="metadata.type === 'select'"></select-field>
          <select-field :label="metadata.name" v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" :items="metadata.options" multiple :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" v-if="metadata.type === 'multiple_select'"></select-field>
          <opt-in-field v-model="formData.metadata[metadata.alias]" :validation="$v.formData.metadata[metadata.alias]" :config="metadata.parameters.config" :key="index" dark :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'" v-if="metadata.type === 'opt_in'"></opt-in-field>
        </template>
        <div class="form-submit text-center">
          <action type="button" :text="$t('global:form.save')" submit secondary dark large fixed-width></action>
        </div>
      </form>
    </div>
  </modal>
</template>
