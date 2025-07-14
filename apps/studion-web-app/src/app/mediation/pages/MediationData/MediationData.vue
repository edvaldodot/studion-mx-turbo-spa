<template>
  <div class="main-content  mediation-create">
    <mediation-small-header
      :title="!isEditing ? $t('mediation.add:header.title') : formData.name"
      confirm-modal
      @onSubmit="saveAndGoToPage(2)"
    />
    <div class="mb-5 mediation">
      <div class="mt-4">
        <div class="mediation-data-header">
          <h2 class="mediation-data-title">{{ $t('global:form.step', { num: 1 }) }}</h2>
          <p class="mediation-data-description">{{ $t('mediation.add:step.1.description') }}</p>
          <p class="mediation-data-tip">{{ $t('mediation.add:step.1.tip') }}</p>
        </div>
        <mediation-form
          v-model="formData"
          :validations="$v"
        />

        <Pagination
          :active-first-last="false"
          :active-page="1"
          :page-count="3"
          :show-all-pages="Boolean($route.params.id)"
          float
          block-layout
          disable-scroll
          disable-items-per-page
          custom-routing
          class-wrapper="mx-auto my-8"
          @next-page="saveAndGoToPage(2)"
          @go-to-page="saveAndGoToPage($event)"
        />

        <modal-confirm
          :active="editModal"
          :title="$t('mediation.modal:confirm.edit')"
          @close="editModal = false"
          @confirm="saveAndGoToPage(pageToGo)"
        >
          <p class="text-color">{{ $t('mediation.modal:confirm.edit.description') }}</p>
        </modal-confirm>
      </div>
    </div>
  </div>
</template>

<script>
import MediationForm from '../../components/MediationForm'
import MediationSmallHeader from '../../components/MediationSmallHeader'
import ModalConfirm from '@/components/general/ModalConfirm'
import Pagination from '@/components/general/Pagination'

import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import pageMixin from '../../mixins/pageMixin'

export default {
  name: 'MediationData',
  components: {
    MediationForm,
    MediationSmallHeader,
    ModalConfirm,
    Pagination,
  },
  mixins: [pageMixin],
  data() {
    return {
      formData: {
        name: null,
      },
      editModal: false,
      pageToGo: 2,
    }
  },
  computed: {
    ...mapState(['Mediation']),
    isEditing() {
      return Boolean(this.$route.params.id)
    },
  },
  mounted() {
    if (this.isEditing) {
      this.formData = this.deepClone(this.Mediation.current.mediationPlan)
    }
  },
  methods: {
    ...mapActions([
      'attemptMediationCreation',
      'attemptMediationEdit',
      'setFetching',
      'setFeedback',
      'setMediationPlan',
    ]),
    submitData(callback) {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)

        const actionType = this.isEditing ? 'edit' : 'creation'

        let currentId = null

        const submitAction = this.isEditing
          ? this.attemptMediationEdit
          : this.attemptMediationCreation

        submitAction(this.formData)
          .then((response) => {
            this.editModal = false
            currentId = response.id || response.data.id
            this.setMediationPlan(response.data)
            this.setFeedback({ message: this.$t(`mediation.${actionType}.feedback.success`) })
          })
          .catch(() => {
            this.$impersonateFeedbackError()
            this.setFeedback({ message: this.$t(`mediation.${actionType}.feedback.error`) })
          })
          .finally(() => {
            this.setFetching(false)
            callback && callback(currentId)
          })
      }
    },
    isAnyDirty() {
      return this.$v.formData.name.$dirty || this.$v.formData.description.$dirty
    },
    saveAndGoToPage(page) {
      this.pageToGo = page

      let callback = (id) => {
        page && this.$_goToPage(page, id)
      }

      if (!this.canWrite('mediation_plan')) {
        callback()
      } else if (!this.isEditing || this.editModal) {
        this.submitData(callback)
      } else if (this.isAnyDirty()) {
        this.editModal = true
      } else {
        callback()
      }
    },
  },
  validations: {
    formData: {
      name: { required },
      description: { required },
      applicability: { required },
    },
  },
}
</script>

<style lang="scss">
@import '../../styles.scss';
</style>
