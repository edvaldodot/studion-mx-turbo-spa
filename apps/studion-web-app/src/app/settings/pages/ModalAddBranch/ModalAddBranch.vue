<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalAddBranch',

  components: {
    Action,
    Breadcrumbs,
    Checkbox,
    InputField,
    Modal,
  },

  mixins: [formScrollValidationMixin],

  props: {
    parentId: Number,
    id: Number,
    isEditing: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formData: {
        name: null,
        active: true,
        parent_id: null,
        code: null,
        pending: false,
      },
      breadcrumbsList: [],
      metadata: null,
      metadataList: [],
      metadataValidation: {},
    }
  },

  validations() {
    return {
      formData: {
        name: {
          required,
        },
        pending: {
          required,
        },
      },
      metadata: this.metadataValidation,
    }
  },

  computed: {
    ...mapState({
      currentBranch: (state) => state.Branches.currentBranch,
      isFetching: (state) => state.fetching,
    }),

    modalTitle() {
      return this.isEditing
        ? this.$t('settings.branches:modal.edit.title')
        : this.$t('settings.branches:modal.create.title')
    },
    modalDescription() {
      return this.isEditing
        ? this.$t('settings.branches:modal.edit.description')
        : this.$t('settings.branches:modal.create.description')
    },
  },

  async created() {
    let id = this.parentId
    if (this.isEditing) id = this.id
    this.setFetching(true)
    try {
      await this.attemptSetCurrent(id)
      const { data } = await this.attemptGetBranchingMetadata()

      this.metadataList = data

      this.metadata = Object.fromEntries(
        this.metadataList.map(({ alias, parameters }) => {
          this.metadataValidation[alias] = parameters.required ? { required } : {}
          return [alias, '']
        })
      )
    } finally {
      this.setup()
      this.setFetching(false)
    }
  },

  destroyed() {
    this.attemptClearCurrent()
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptSetCurrent',
      'attemptClearCurrent',
      'attemptBranchCreation',
      'attemptBranchUpdate',
      'attemptGetBranchingMetadata',
    ]),

    setup() {
      if (this.isEditing) {
        const { id, name, active, code, pending, parentGroup, meta } = this.currentBranch
        this.formData.id = id
        this.formData.name = name
        this.formData.active = active
        this.formData.code = code
        this.formData.pending = pending
        this.mountBreadcrumbs(parentGroup)
        this.metadata = { ...meta }
      } else {
        this.formData.parent_id = this.parentId
        this.mountBreadcrumbs(this.currentBranch)
      }
    },

    mountBreadcrumbs(currentItem, acc = []) {
      if (!currentItem) return

      acc.push({
        text: currentItem.name,
        key: currentItem.id,
      })

      if (currentItem.parentGroup && typeof currentItem.parentGroup === 'object') {
        this.mountBreadcrumbs(currentItem.parentGroup, acc)
      } else {
        this.breadcrumbsList = acc.reverse()
      }
    },

    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.isEditing ? this.submitUpdate() : this.submitCreation()
      }

      this.$nextTick(() => this.scrollToInputError())
    },

    submitCreation() {
      this.attemptBranchCreation({ ...this.formData, meta: this.metadata })
        .then(({ data }) => {
          this.setFeedback({ message: this.$t('settings.branches:feedback.created.success') })
          this.$emit('saved', data.id, this.parentId)
          this.closeModal()
        })
        .catch(({ response }) => {
          if (response.data.message === 'branch_already_exists') {
            this.setFeedback({
              message: this.$t(`settings.branches:feedback.created.error:${response.data.message}`),
            })
            return
          }
          if (response.data.message === 'max_level_reached') {
            this.setFeedback({
              message: this.$t(`settings.branches:feedback.created.error:${response.data.message}`),
            })
            return
          }
          this.setFeedback({
            message: this.$t('settings.branches:feedback.created.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submitUpdate() {
      this.attemptBranchUpdate({ ...this.formData, meta: this.metadata })
        .then(({ data }) => {
          this.setFeedback({ message: this.$t('settings.branches:feedback.updated.success') })
          this.$emit('saved', data.id, data.parentGroup && data.parentGroup.id)
          this.closeModal()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('settings.branches:feedback.updated.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    closeModal() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },
  },
}
</script>

<template>
  <Modal
    :data-testid="$testId('modal-add-branch')"
    active
    is-page
  >
    <div class="modal-form modal-add-branch">
      <span class="modal-subtitle">{{ $t('settings:header.title') }}</span>

      <h2 class="modal-title text-color">
        {{ modalTitle }}
      </h2>

      <div class="modal-description text-color">
        <p class="text-color">{{ modalDescription }}</p>
      </div>

      <div class="branch-breadcrumbs">
        <Breadcrumbs
          :breadcrumbs-list="breadcrumbsList"
          size="small"
          show-last-arrow
          dark
        />
      </div>

      <form @submit.prevent>
        <InputField
          v-model.trim="formData.name"
          :label="$t('settings.branches:modal.add.name')"
          :validation="$v.formData.name"
          :disabled="!canWrite('branches')"
          dark
        />

        <template v-if="metadataList.length && metadata">
          <InputField
            v-for="meta in metadataList"
            :key="meta.id"
            v-model="metadata[meta.alias]"
            :label="meta.name"
            :mask="meta.metaFormat && meta.metaFormat.format ? meta.metaFormat.format : null"
            :validation="$v.metadata[meta.alias]"
            :disabled="!canWrite('branches')"
            dark
          />
        </template>

        <Checkbox
          v-model="formData.pending"
          :description="$t('settings.branches:modal.add.situation')"
          :items="[{ value: true, label: $t('settings.branches:modal.add.situation.pending') }]"
          :validation="$v.formData.pending"
          :disabled="!canWrite('branches')"
          switch-type
          dark
        />

        <div class="form-submit text-center">
          <Action
            v-if="canWrite('branches')"
            :text="$t('global:form.save')"
            type="button"
            large
            secondary
            fixed-width
            @click.prevent="submit"
          />
        </div>
      </form>
    </div>
  </Modal>
</template>

<style lang="scss">
@import 'ModalAddBranch.scss';
</style>
