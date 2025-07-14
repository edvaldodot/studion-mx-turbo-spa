<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'

export default {
  name: 'ModalAddMetadata',
  mixins: [formScrollValidationMixin],
  components: {
    Action,
    Checkbox,
    Datatable,
    FormSection,
    InputField,
    Modal,
    SelectField,
    TextareaField
  },
  data () {
    return {
      formData: {
        meta: {
          name: null,
          meta_type_alias: null,
          meta_format_alias: null
        },
        meta_entity: {
          entity: 'application_user',
          extra_parameters: {
            allowedProfiles: [],
            allowedAllProfiles: false,
            requiredProfiles: [],
            requiredAllProfiles: false,
            adminWrite: false,
            adminShow: false
          }
        },
        parameters: {
          required: false,
          options: [],
          config: {},
          options_fields: [{ name: 'name', alias: 'name', visible: true }],
          entity_options: null
        }
      },
      datetime: null,
      customName: false,
      linkedAll: false,
      profiles: [],
      allTypeOptions: null,
      optionsTypeAvailable: ['select', 'multiple_select'],
      typeOptions: [
        {
          text: this.$t('global:metadata.type.date'),
          value: 'date'
        },
        {
          text: this.$t('global:metadata.type.integer'),
          value: 'int'
        },
        {
          text: this.$t('global:metadata.type.text.mask'),
          value: 'string'
        },
        {
          text: this.$t('global:metadata.type.text'),
          value: 'text'
        },
        {
          text: this.$t('global:metadata.type.select'),
          value: 'select'
        },
        {
          text: this.$t('global:metadata.type.multiple.select'),
          value: 'multiple_select'
        },
        {
          text: this.$t('global:metadata.type.opt_in'),
          value: 'opt_in'
        }
      ],
      typeOptionsValue: null,
      formatOptions: []
    }
  },
  validations () {
    let defaultValidate = {
      formData: {
        meta: {
          name: {
            required
          },
          meta_type_alias: {
            required
          }
        }
      }
    }

    if (this.typeOptionsValue === 'string') {
      defaultValidate.formData.meta.meta_format_alias = { required }
    }

    if (this.customName) {
      defaultValidate.formData.parameters = {
        options_fields: {
          $each: {
            name: {
              required
            }
          }
        },
        options: {
          $each: {
            fields: {
              [this.formData.parameters.options_fields[0].alias]: {
                required
              },
              [this.formData.parameters.options_fields[1].alias]: {
                required
              }
            }
          }
        }
      }
    } else if (this.typeOptionsValue === 'opt_in') {
      defaultValidate.formData.parameters = {
        config: {
          head: {
            required
          },
          title: {
            required
          }
        }
      }
    } else {
      defaultValidate.formData.parameters = {
        options: {
          $each: {
            fields: {
              name: {
                required
              }
            }
          }
        }
      }
    }
    return defaultValidate
  },
  computed: {
    ...mapState(['fetching', 'metadata']),
    linkedAllComp () {
      return this.profiles.length === this.profiles.filter(item => item.linked).length
    },
    isEditing () {
      return this.$route.meta.editing === true
    }
  },
  watch: {
    linkedAllComp () {
      this.linkedAll = this.linkedAllComp
    }
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptMetasTypesListRetrieval',
      'attemptMetasFormatsListRetrieval',
      'attemptProfileListRetrieval',
      'attemptMetasCreation',
      'attemptMetasUpdate',
      'setMetadataCurrent',
      'addMetadataItems'
    ]),
    closeModal () {
      this.$router.push(this.$route.meta.modalCloseLink)
    },
    submit () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.formData.id ? this.submitUpdate() : this.submitCreation()
      }

      this.$nextTick(() => this.scrollToInputError())
    },
    submitCreation () {
      this.attemptMetasCreation(this.formData).then(({ data }) => {
        this.addMetadataItems({
          id: data.id,
          name: data.meta.name,
          type: data.meta.type.alias === 'datetime' ? this.$t(`global:metadata.type.datetime`) : this.typeOptions.find(type => type.value === data.meta.type.alias).text,
          type_alias: data.meta.type.alias,
          metaFormat: data.meta.metaFormat ? data.meta.metaFormat.alias : null,
          entity: data.entity.alias,
          visible: data.adminShow,
          filled: data.adminWrite,
          required: data.parameters.required,
          options: data.parameters.options ? data.parameters.options : [],
          optionsFields: data.parameters.optionsFields ? data.parameters.optionsFields : [],
          linkedProfiles: data.allowedProfiles,
          allowedAllProfiles: data.allowedAllProfiles,
          requiredProfiles: data.requiredProfiles,
          requiredAllProfiles: data.requiredAllProfiles,
          dropdown: false
        })
        this.closeModal()
        this.setFeedback({ message: this.$t('community.metadata:feedback.create.success') })
      }).catch((response) => {
        this.closeModal()
        this.setFeedback({message: this.$t('community.metadata:feedback.create.error'), type: 'error'})
      }).finally(() => {
        this.setFetching(false)
      })
    },
    submitUpdate () {
      this.attemptMetasUpdate(this.formData).then(({ data }) => {
        this.setMetadataCurrent({
          id: data.id,
          name: data.meta.name,
          type: data.meta.type.alias === 'datetime' ? this.$t(`global:metadata.type.datetime`) : this.typeOptions.find(type => type.value === data.meta.type.alias).text,
          type_alias: data.meta.type.alias,
          metaFormat: data.meta.metaFormat ? data.meta.metaFormat.alias : null,
          entity: data.entity.alias,
          visible: data.adminShow,
          filled: data.adminWrite,
          required: data.parameters.required,
          options: data.parameters.options ? data.parameters.options : [],
          optionsFields: data.parameters.optionsFields ? data.parameters.optionsFields : [],
          linkedProfiles: data.allowedProfiles,
          allowedAllProfiles: data.allowedAllProfiles,
          requiredProfiles: data.requiredProfiles,
          requiredAllProfiles: data.requiredAllProfiles,
          dropdown: false
        })
        this.closeModal()
        this.setFeedback({ message: this.$t('community.metadata:feedback.update.success') })
      }).catch(() => {
        this.closeModal()
        this.setFeedback({message: this.$t('community.metadata:feedback.update.error'), type: 'error'})
      }).finally(() => {
        this.setFetching(false)
      })
    },
    checkType (value) {
      this.formData.meta.meta_type_alias = value
      if (this.formData.meta.meta_type_alias === 'opt_in') {
        this.typeOptionsValue = 'opt_in'
      } else if (this.optionsTypeAvailable.indexOf(this.formData.meta.meta_type_alias) >= 0) {
        this.formData.parameters.options = [{fields: {}}, {fields: {}}]
        this.formData.parameters.options_fields = [{ name: 'name', alias: 'name', visible: true }]
      } else {
        this.formData.parameters.options = []
      }
    },
    addTime (value) {
      this.formData.meta.meta_type_alias = value ? 'datetime' : 'date'
    },
    removeOption (index) {
      this.formData.parameters.options.splice(index, 1)
    },
    addOption () {
      this.formData.parameters.options.push({fields: {}})
    },
    addProfileRequired (add, id) {
      if (add) {
        this.formData.meta_entity.extra_parameters.requiredProfiles.push(id)
      } else {
        let index = this.formData.meta_entity.extra_parameters.requiredProfiles.indexOf(id)
        this.formData.meta_entity.extra_parameters.requiredProfiles.splice(index, 1)
      }
    },
    addProfileLinked (add, id) {
      if (add) {
        this.formData.meta_entity.extra_parameters.allowedProfiles.push(id)
      } else {
        this.formData.meta_entity.extra_parameters.requiredAllProfiles = false
        this.profiles.find(item => item.id === id).required = false
        let index = this.formData.meta_entity.extra_parameters.allowedProfiles.indexOf(id)
        this.formData.meta_entity.extra_parameters.allowedProfiles.splice(index, 1)
      }
    },
    checkLinked (value) {
      this.profiles = this.profiles.map(item => ({ ...item, linked: value }))
    },
    checkRequired (value) {
      this.profiles = this.profiles.map(item => ({ ...item, required: value }))
    },
    disableRequired (value) {
      if (value) {
        this.formData.parameters.required = false
        this.formData.meta_entity.extra_parameters.requiredAllProfiles = false
        this.checkRequired(false)
      } else {
        this.formData.meta_entity.extra_parameters.adminShow = false
      }
    },
    addOptionsFields (add) {
      if (add) {
        this.formData.parameters.options_fields = [{ name: null, alias: null, visible: true }, { name: null, alias: null, visible: false }]
      } else {
        this.formData.parameters.options_fields = [{ name: 'name', alias: 'name', visible: true }]
      }
      this.formData.parameters.options = [{fields: {}}, {fields: {}}]
    },
    createFieldAlias (index) {
      this.formData.parameters.options_fields[index].alias = this.formData.parameters.options_fields[index].name.toLowerCase().replace(new RegExp(' ', 'g'), '-')
    },
    getProfileName (name) {
      switch (name) {
        case 'Student':
          return this.$t('global:student')
        case 'Admin':
          return this.$t('global:admin')
        default:
          return name
      }
    }
  },
  created () {
    let requestPromises = [
      this.attemptMetasTypesListRetrieval(),
      this.attemptMetasFormatsListRetrieval(),
      this.attemptProfileListRetrieval({limit: 1000})
    ]

    this.setFetching(true)
    Promise.all(requestPromises).then(([ metaTypesListResponse, metaFormatsListResponse, profilesListResponse ]) => {
      this.profiles = profilesListResponse.data.data.map(item => ({
        id: item.id,
        name: item.name,
        required: false,
        linked: false
      }))

      this.allTypeOptions = metaTypesListResponse.data

      this.formatOptions = metaFormatsListResponse.data.map(item => ({
        text: this.$t(`global:metadata.format.${item.alias.replace('_', '.')}`),
        value: item.alias,
        format: item.format
      }))

      if (this.isEditing && this.metadata.current) {
        this.customName = this.metadata.current.optionsFields.length > 1
        this.formData = {
          id: this.metadata.current.id,
          meta: {
            name: this.metadata.current.name,
            meta_type_alias: this.metadata.current.type_alias,
            meta_format_alias: this.metadata.current.metaFormat
          },
          meta_entity: {
            entity: 'application_user',
            meta_entity_id: this.metadata.current.id,
            extra_parameters: {
              allowedProfiles: this.metadata.current.linkedProfiles.map(item => item.id),
              allowedAllProfiles: this.metadata.current.allowedAllProfiles,
              requiredProfiles: this.metadata.current.requiredProfiles.map(item => item.id),
              requiredAllProfiles: this.metadata.current.requiredAllProfiles,
              adminWrite: this.metadata.current.filled,
              adminShow: this.metadata.current.visible
            }
          },
          parameters: {
            required: this.metadata.current.required,
            options: this.metadata.current.options,
            config: this.metadata.current.config,
            options_fields: this.metadata.current.optionsFields,
            entity_options: this.metadata.current.entityOptions
          }
        }
        if (this.metadata.current.type_alias === 'datetime') {
          this.typeOptionsValue = 'date'
          this.datetime = true
        } else {
          this.typeOptionsValue = this.metadata.current.type_alias
        }
        this.profiles.map(profile => {
          profile.required = this.metadata.current.requiredAllProfiles === true || this.metadata.current.requiredProfiles.filter(item => item.id === profile.id).length > 0
          profile.linked = this.metadata.current.allowedAllProfiles === true || this.metadata.current.linkedProfiles.filter(item => item.id === profile.id).length > 0
          return profile
        })
      }
    }).finally(() => {
      this.setFetching(false)
    })
  }
}
</script>

<template>
  <modal :active="!fetching" is-page>
    <div class="modal-form modal-form-event">
        <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
        <h2 class="modal-title text-color">{{ $t('community.metadata:modal.title') }}</h2>
        <div class="modal-description text-color">
          <p class="text-color">{{ $t('community.metadata:modal.description') }}</p>
        </div>
        <form @submit.prevent="submit()">
          <input-field :label="$t('global:form.name')" v-model="formData.meta.name" :validation="$v.formData.meta.name" dark :counter="55" :disabled="!canWrite('metadata')"></input-field>
          <select-field :label="$t('global:form.type')" v-model="typeOptionsValue" :items="typeOptions" :validation="$v.formData.meta.meta_type_alias" dark @input="checkType($event)" :disabled="!canWrite('metadata')"></select-field>
          <select-field :label="$t('global:form.mask')" v-model="formData.meta.meta_format_alias" :items="formatOptions" :validation="$v.formData.meta.meta_format_alias" dark v-if="typeOptionsValue === 'string'" :disabled="!canWrite('metadata')"></select-field>
          <checkbox :items="[{ value:true, label: $t('community.metadata:modal.form.datetime') }]" v-model="datetime" switch-type dark v-if="typeOptionsValue === 'date'" @input="addTime($event)" :disabled="!canWrite('metadata')"></checkbox>
          <template v-if="formData.meta.meta_type_alias === 'opt_in'">
            <textarea-field :label="$t('community.metadata:modal.form.name.opt_in.head')" v-model="formData.parameters.config.head" :validation="$v.formData.parameters.config.head" dark auto-grow  :disabled="!canWrite('metadata')"></textarea-field>
            <textarea-field :label="$t('community.metadata:modal.form.name.opt_in.title')" v-model="formData.parameters.config.title" :validation="$v.formData.parameters.config.title" dark auto-grow  :disabled="!canWrite('metadata')"></textarea-field>
          </template>
          <template v-if="formData.parameters.options.length">
            <checkbox :items="[{ value:true, label: $t('community.metadata:modal.form.insert.hidden.field') }]" v-model="customName" switch-type dark @input="addOptionsFields($event)" :disabled="!canWrite('metadata')"></checkbox>
            <template v-if="customName">
              <input-field :label="$t('community.metadata:modal.form.name.visible.field')" v-model="formData.parameters.options_fields[0].name" :validation="$v.formData.parameters.options_fields.$each[0].name" dark @input="createFieldAlias(0)" :disabled="!canWrite('metadata')"></input-field>
              <input-field :label="$t('community.metadata:modal.form.name.hidden.field')" v-model="formData.parameters.options_fields[1].name" :validation="$v.formData.parameters.options_fields.$each[1].name" dark @input="createFieldAlias(1)" :disabled="!canWrite('metadata')"></input-field>
            </template>
            <template v-for="(option, index) in formData.parameters.options">
              <template v-if="!customName">
                <input-field :label="$t('global:form.option', {'num': index + 1})" v-model="option.fields[formData.parameters.options_fields[0].alias]" :validation="$v.formData.parameters.options.$each[index].fields.name" dark :key="index" :disabled="!canWrite('metadata')">
                  <action type="button" slot="button" icon="close" @click="removeOption(index)" v-if="formData.parameters.options.length > 2"></action>
                </input-field>
              </template>
              <template v-else>
                <div class="modal-form-box" :key="index">
                  <h3 class="modal-form-box-title">{{ $t('global:form.option', {'num': index + 1}) }}</h3>
                  <div class="modal-form-box-inner">
                    <action type="button" icon="close" class="modal-form-box-close" @click="removeOption(index)" v-if="formData.parameters.options.length > 2 && canWrite('metadata')"></action>
                    <input-field :label="formData.parameters.options_fields[0].name || $t('community.metadata:modal.form.visible.field')" v-model="option.fields[formData.parameters.options_fields[0].alias]" :validation="$v.formData.parameters.options.$each[index].fields[formData.parameters.options_fields[0].alias]" :disabled="customName && formData.parameters.options_fields[0].name === null || !canWrite('metadata')" dark></input-field>
                    <input-field :label="formData.parameters.options_fields[1].name || $t('community.metadata:modal.form.hidden.field')" v-model="option.fields[formData.parameters.options_fields[1].alias]" :validation="$v.formData.parameters.options.$each[index].fields[formData.parameters.options_fields[1].alias]" :disabled="customName && formData.parameters.options_fields[1].name === null || !canWrite('metadata')" dark></input-field>
                  </div>
                </div>
              </template>
            </template>
            <action type="button" :text="$t('global:form.alternative.add')" @click="addOption()" flat dark v-if="canWrite('metadata')"></action>
          </template>
          <form-section>
            <checkbox :items="[{ value:true, label: $t('community.metadata:modal.form.filled') }]" v-model="formData.meta_entity.extra_parameters.adminWrite" switch-type dark @input="disableRequired($event)" :disabled="!canWrite('metadata')"></checkbox>
            <checkbox :items="[{ value:true, label: $t('community.metadata:modal.form.visible') }]" v-model="formData.meta_entity.extra_parameters.adminShow" switch-type dark :disabled="!formData.meta_entity.extra_parameters.adminWrite || !canWrite('metadata')"></checkbox>
          </form-section>
          <form-section>
            <checkbox :items="[{ value:true, label: $t('community.metadata:modal.form.linked') }]" v-model="formData.meta_entity.extra_parameters.allowedAllProfiles" switch-type dark @input="checkLinked($event)" :disabled="!canWrite('metadata')"></checkbox>
            <checkbox :items="[{ value:true, label: $t('community.metadata:modal.form.required') }]" v-model="formData.meta_entity.extra_parameters.requiredAllProfiles" :disabled="!formData.meta_entity.extra_parameters.allowedAllProfiles || formData.meta_entity.extra_parameters.adminWrite || !canWrite('metadata')" switch-type dark @input="checkRequired($event)"></checkbox>
          </form-section>
          <datatable :items="profiles" dark>
            <template slot="thead">
              <tr>
                <th class="th">{{ $t('community.metadata:modal.datatable.header.1') }}</th>
                <th class="th text-center" width="120">{{ $t('community.metadata:modal.datatable.header.3') }}</th>
                <th class="th text-center" width="120">{{ $t('community.metadata:modal.datatable.header.2') }}</th>
              </tr>
            </template>
            <template slot="tbody" slot-scope="props">
              <tr class="small">
                <td class="td">
                  <span class="td-text">{{ getProfileName(props.item.name) }}</span>
                </td>
                <td class="td text-center">
                  <checkbox :items="[{ value:true }]" v-model="props.item.linked" :disabled="formData.meta_entity.extra_parameters.allowedAllProfiles || !canWrite('metadata')" switch-type dark @value="addProfileLinked($event, props.item.id)"></checkbox>
                </td>
                <td class="td text-center">
                  <checkbox :disabled="formData.meta_entity.extra_parameters.requiredAllProfiles || formData.parameters.required || !props.item.linked || formData.meta_entity.extra_parameters.adminWrite || !canWrite('metadata')" :items="[{ value:true }]" @value="addProfileRequired($event, props.item.id)" dark switch-type v-model="props.item.required"></checkbox>
                </td>
              </tr>
            </template>
          </datatable>
          <div class="text-center my-3">
            <action type="button" :text="$t('global:form.save')" secondary large fixed-width submit v-if="canWrite('metadata')"></action>
          </div>
        </form>
      </div>
  </modal>
</template>
