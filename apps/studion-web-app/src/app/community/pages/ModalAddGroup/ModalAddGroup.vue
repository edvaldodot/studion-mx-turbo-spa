<script>
import { required } from 'vuelidate/lib/validators'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import ModalConfirm from '@/components/general/ModalConfirm'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'

export default {
  components: {
    Action,
    Icon,
    Card,
    CardBody,
    FormSection,
    InputField,
    Modal,
    ModalConfirm,
    SelectField,
    TextareaField,
  },
  props: {
    groupId: Number,
  },
  data() {
    return {
      showModal: true,
      formData: {
        name: null,
        metaCards: [],
      },
      deleteConfirmModal: false,
      currentMetaId: null,
      metadataOptions: [],
      metadataList: [],
    }
  },
  validations: {
    formData: {
      name: { required },
      metaCards: {
        $each: {
          meta_key: { required },
          values: {
            required,
            validateCharacter: function (value, card) {
              if (card.values !== null) {
                return /([^;])/.test(card.values)
              }
              return true
            },
          },
        },
      },
    },
  },
  computed: {
    ...mapState({
      group: (state) => state.Groups.current,
    }),
    isEditing() {
      return this.groupId !== undefined
    },
  },
  watch: {
    group(value) {
      this.formData.name = value.name
    },
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'saveGroup',
      'setCurrentGroup',
      'saveGroupMetadata',
      'fetchGroupMetadata',
      'removeGroupMetadata',
      'fetchGroupMetadataOptions',
    ]),
    handleSubmit() {
      this.$v.formData.$touch()
      if (!this.$v.formData.$invalid) {
        if (this.groupId) {
          this.formData.id = this.groupId
        }

        this.saveGroup({ name: this.formData.name, id: this.formData.id })
          .then((data) => {
            this.formData.metaCards.groupId = this.groupId || data.id
            const newFormData = this.formData.metaCards
            this.saveGroupMetadata(newFormData)
              .then(() => {
                this.$router.replace({ name: 'community.groups' })
                this.setFeedback({ message: this.$t('community.groups:feedback.success.message') })
              })
              .catch(() => {
                if (!this.groupId) {
                  this.groupId = data.id
                }
              })
          })
          .catch((err) => {
            if (err.response.data.message === 'group_name_already_exists') {
              this.setFeedback({
                message: this.$t('community.groups.create:group.already.exists.error'),
                type: 'error',
              })
            }
          })
      }
    },
    setUp() {
      const requests = [this.fetchGroupMetadata(this.groupId), this.fetchGroupMetadataOptions()]

      Promise.all(requests).then(([metas, metasOptions]) => {
        if (metas.length === 0) {
          this.addMetadataCard()
        }

        metas.forEach((meta) => {
          const newMeta = { ...meta, values: meta.values.join(';') }
          this.formData.metaCards.push(newMeta)
          this.metadataList.push(newMeta)
        })

        this.metadataOptions = metasOptions.map((data) => ({
          text: data.meta.name,
          value: data.meta.alias,
        }))
      })
    },
    addMetadataCard() {
      this.formData.metaCards.push({ meta_key: null, values: null })
      this.metadataList.push({ meta_key: null, values: null, isLocal: true })
    },
    removeMetadataCard(metaId) {
      this.formData.metaCards.splice(metaId.index, 1)
      this.metadataList.splice(metaId.index, 1)
    },
    confirmDelete() {
      this.deleteConfirmModal = false

      const meta = this.metadataList.find((meta) => meta.id === this.currentMetaId.id)
      const payload = { metaKey: meta.meta_key, groupId: this.groupId }

      this.removeGroupMetadata(payload).then(() => {
        this.removeMetadataCard(this.currentMetaId)

        if (this.metadataList.length === 0) {
          this.addMetadataCard()
        }
      })
    },
    openDeleteModal(meta, index) {
      if (meta.isLocal) {
        this.removeMetadataCard({ id: meta.id, index })
        return
      }

      this.currentMetaId = { id: meta.id, index }
      this.deleteConfirmModal = true
    },
  },
  created() {
    if (this.groupId) {
      this.setCurrentGroup(this.groupId).then(() => {
        this.formData.name = this.group.name
      })
    }
    this.setUp()
  },
}
</script>

<template>
  <modal
    :active.sync="showModal"
    class="modal-add-group"
    is-page
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
      <h2 class="modal-title text-color">
        {{
          groupId ? $t('community.groups:modal.title.edit') : $t('community.groups:modal.title.add')
        }}
      </h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('community.groups:modal.description') }}</p>
      </div>
      <form @submit.prevent="handleSubmit">
        <input-field
          dark
          v-model.trim="formData.name"
          :label="$t('global:form.name')"
          :validation="$v.formData.name"
          :counter="120"
        ></input-field>

        <form-section
          dark
          :title="$t('community.groups.metadata:form.section.title')"
        >
          <p class="text-color">{{ $t('community.groups.metadata:form.section.description') }}</p>
        </form-section>
        <card
          rounded
          dark
          v-for="(metadata, index) in metadataList"
          :key="index"
          class="mb-5"
        >
          <card-body class="bg-black-200 border-round">
            <p class="flex gap-2 align-items-center mb-3 text-color">
              <strong class="p-0 flex-1">{{ $t('community.groups.metadata:form.strong') }}</strong>
              <span @click="openDeleteModal(metadata, index)">
                <Icon
                  v-if="metadataList.length > 1 || !metadata.isLocal"
                  name="close"
                  class="cursor-pointer text-primary p-0"
                />
              </span>
            </p>
            <select-field
              :show-optional="false"
              :floating-label="false"
              :label="$t('community.groups.metadata:form.select.label')"
              :items="metadataOptions"
              :validation="$v.formData.metaCards.$each[index].meta_key"
              v-model="formData.metaCards[index].meta_key"
              @clear="formData.metaCards[index].values = null"
            />
            <p
              v-if="formData.metaCards[index].meta_key !== null"
              class="mb-2 text-color"
            >
              {{ $t('community.groups.metadata:form.value.description') }}
            </p>
            <textarea-field
              v-if="formData.metaCards[index].meta_key !== null"
              dark
              :floating-label="false"
              :show-optional="false"
              :label="$t('community.groups.metadata:form.value')"
              :counter="10000"
              :validation="$v.formData.metaCards.$each[index].values"
              v-model.trim="formData.metaCards[index].values"
            />
          </card-body>
        </card>
        <action
          flat
          large
          fixed-width
          type="button"
          :text="$t('community.groups.metadata:btn.add')"
          @click="addMetadataCard"
        />
        <div class="form-submit text-center">
          <action
            large
            submit
            secondary
            fixed-width
            type="button"
            :text="$t('global:form.save')"
          />
        </div>
      </form>
    </div>
    <modal-confirm
      :active="deleteConfirmModal"
      :title="$t('community.groups.metadata:modal.confirm.title')"
      @close="deleteConfirmModal = false"
      @confirm="confirmDelete"
    >
      <p class="text-color">{{ $t('community.groups.metadata:modal.confirm.description') }}</p>
    </modal-confirm>
  </modal>
</template>
