<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, url } from 'vuelidate/lib/validators'
import {
  reportTypes,
  deleteFields,
  makePaginatedReportItems,
  makeOpenOnEditModeItems,
  makeAdminOnlyVisibleItems,
  makeAllProfilesAllowedItems,
  makeActiveReportItems,
  makeIsHighlightReportItems,
} from '../../util'

import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import Upload from '@/components/general/Upload'

export default defineComponent({
  name: 'ModalAddReport',

  components: {
    Action,
    Checkbox,
    InputField,
    SelectField,
    TextareaField,
    Upload,
    Modal: () => import('@/components/general/Modal'),
  },

  mixins: [formScrollValidationMixin],

  data() {
    return {
      formData: {
        id: null,
        title: null,
        image: null,
        description: null,
        reportType: null,
        url: null,
        secret_key: null,
        report_id: null,
        workspace_id: null,
        dataset_id: null,
        profiles: [],
        admin_only_visible: false,
        admin_only_visible_disabled: false,
        all_profiles_allowed: false,
        all_profiles_allowed_disabled: false,
        is_highlight: false,
        paginatedReport: false,
        openOnEditMode: false,
      },
      paginatedReportItems: [...makePaginatedReportItems()],
      openOnEditModeItems: [...makeOpenOnEditModeItems()],
      adminOnlyVisibleItems: [...makeAdminOnlyVisibleItems()],
      allProfilesAllowedItems: [...makeAllProfilesAllowedItems()],
      activeReport: [...makeActiveReportItems()],
      isHighlightReport: [...makeIsHighlightReportItems()],
      profileList: [],
      reportTypes: reportTypes,
    }
  },

  validations: {
    formData: {
      title: {
        required,
      },
      description: {
        required,
      },
      url: {
        url,
        required: requiredIf(function () {
          return !this.isPowerBi
        }),
      },
      reportType: {
        required,
      },
      secret_key: {},
      profiles: {
        required: requiredIf(function () {
          return this.profileActive && this.profileList.length > 0
        }),
      },
      workspace_id: {
        required: requiredIf(function () {
          return this.isPowerBi
        }),
      },
      report_id: {
        required: requiredIf(function () {
          return this.isPowerBi
        }),
      },
      dataset_id: {
        required: requiredIf(function () {
          return this.isPaginatedReport
        }),
      },
    },
  },

  computed: {
    ...mapState(['reports', 'fetching']),
    reportId() {
      return this.$route.params.id
    },
    isEditing() {
      return !!this.reportId
    },
    validatedProfiles() {
      return this.profileActive ? this.formData.profiles : []
    },
    profileActive() {
      return !this.formData.admin_only_visible && !this.formData.all_profiles_allowed
    },
    isPowerBi() {
      return this.formData.reportType === 'powerbi'
    },
    isPaginatedReport() {
      return this.isPowerBi && this.formData.paginatedReport
    },
  },

  watch: {
    'reports.current': {
      handler() {
        if (this.isEditing && this.reports.current) {
          this.formData.id = this.reports.current.id
          this.formData.title = this.reports.current.title
          this.formData.description = this.reports.current.description
          this.formData.url = this.reports.current.url
          this.formData.image = this.reports.current.imagePath
            ? this.reports.current.imagePath
            : null
          this.formData.active = this.reports.current.active
          this.formData.profiles =
            this.reports.current.adminOnlyVisible || this.reports.current.allProfilesAllowed
              ? []
              : this.reports.current.allowedProfiles
          this.formData.is_highlight = this.reports.current.isHighlight
          this.formData.reportType = this.reports.current.vendor

          if (this.isPowerBi) {
            const { workspace_id, report_id, dataset_id, paginated_report, open_on_edit_mode } =
              this.reports.current.vendorMeta

            this.formData.workspace_id = workspace_id
            this.formData.report_id = report_id
            if (dataset_id) this.formData.dataset_id = dataset_id

            this.formData.url = null

            this.formData.paginatedReport = !!parseInt(paginated_report)
            this.formData.openOnEditMode = !!parseInt(open_on_edit_mode)
          }

          this.formData.admin_only_visible = this.reports.current.adminOnlyVisible

          this.formData.all_profiles_allowed =
            !this.reports.current.adminOnlyVisible && this.reports.current.allProfilesAllowed

          this.formData.admin_only_visible_disabled = this.formData.all_profiles_allowed
          this.adminOnlyVisibleItems.disabled = this.formData.all_profiles_allowed

          this.formData.all_profiles_allowed_disabled = this.formData.admin_only_visible
          this.allProfilesAllowedItems.disabled = this.formData.admin_only_visible
        }
      },
    },
  },

  created() {
    this.setFetching(true)

    let actions = [this.attemptReportsProfileListRetrieval()]
    if (this.isEditing) actions.push(this.attemptReportRetrieval(this.reportId))

    Promise.all(actions)
      .then(([profiles]) => {
        this.profileList = profiles.data.map((item) => {
          return {
            text: item.name,
            value: item.id,
          }
        })
      })
      .catch(() => {
        this.$router.push({ name: 'reports.list' })
      })
      .finally(() => {
        this.setFetching(false)
      })

    this.formData.active = true
  },

  destroyed() {
    this.clearCurrentReport()
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptReportCreation',
      'attemptReportUpdate',
      'attemptReportsProfileListRetrieval',
      'attemptReportRetrieval',
      'clearCurrentReport',
    ]),
    clearProfileList() {
      this.formData.profiles = []
    },
    addNewReport() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.formData.id ? this.submitUpdate() : this.submitCreate()
      }

      this.$nextTick(() => this.scrollToInputError())
    },
    /**
     * Check report type and parse formData before submit
     */
    parseFormData() {
      this.formData.allowedProfiles = this.validatedProfiles
      this.formData.vendor = this.formData.reportType

      if (this.isPowerBi) {
        this.formData.vendor_meta = {
          report_id: this.formData.report_id,
          workspace_id: this.formData.workspace_id,
          paginated_report: this.formData.paginatedReport ? 1 : 0,
          open_on_edit_mode: this.formData.openOnEditMode ? 1 : 0,
        }

        if (this.isPaginatedReport && this.formData.dataset_id) {
          this.formData.vendor_meta.dataset_id = this.formData.dataset_id
        }

        delete this.formData.url
      }

      deleteFields(this.formData, [
        'reportType',
        'workspace_id',
        'report_id',
        'dataset_id',
        'paginatedReport',
        'openOnEditMode',
      ])
    },

    submitCreate() {
      this.parseFormData()

      this.attemptReportCreation(this.formData)
        .then(() => {
          this.setFeedback({ message: this.$t('reports:feedback.created.success') })
          this.$router.push({ name: 'reports.list' })
          this.$emit('saved-report')
        })
        .catch(({ response }) => {
          this.setFeedback({
            message: this.$t(
              `reports:feedback.created.error:${response.data.message.replace(/_/g, '.')}`
            ),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submitUpdate() {
      this.parseFormData()
      this.formData.hasImage = this.formData.image instanceof Blob
      this.attemptReportUpdate(this.formData)
        .then(() => {
          this.setFeedback({ message: this.$t('reports:feedback.updated.success') })
          this.$router.push({ name: 'reports.list' })
          this.$emit('saved-report')
        })
        .catch(() => {
          this.setFeedback({ message: this.$t(`reports:feedback.updated.error`) })
          this.$router.push({ name: 'reports.list' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    getValueAdminOnly(selected) {
      this.formData.admin_only_visible = selected
      this.formData.all_profiles_allowed_disabled = selected
      this.allProfilesAllowedItems[0].disabled = selected
    },
    getValueAllProfiles(selected) {
      this.formData.all_profiles_allowed = selected
      this.formData.admin_only_visible_disabled = selected
      this.adminOnlyVisibleItems[0].disabled = selected
    },
    disableOpenOnEditMode() {
      this.formData.openOnEditMode = false
    },
    disablePaginatedReport() {
      this.formData.paginatedReport = false
      this.formData.dataset_id = null
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-add-report')"
    :active="!fetching"
    is-page
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('reports:header.title') }}</span>

      <h2 class="modal-title text-color">
        {{ formData.id ? $t('reports:modal.edit.title') : $t('reports:modal.add.title') }}
      </h2>

      <div class="modal-description text-color">
        <p class="text-color">{{ $t('reports:modal.add.description') }}</p>
      </div>

      <form class="flex flex-column gap-4" @submit.prevent="addNewReport">
        <InputField
          v-model="formData.title"
          :label="$t('global:form.title')"
          :counter="100"
          :validation="$v.formData.title"
          dark
        />

        <div class="text-color form-section-title">
          {{ $t('global:upload.title') }}
        </div>
        <Upload
          class="-mt-4"
          v-model="formData.image"
          :icon="'image-multiple'"
          :label="$t('global:upload.add.image')"
          :width="300"
          :height="200"
          cropper
          dark
        />

        <TextareaField
          v-model="formData.description"
          :label="$t('global:form.description')"
          :validation="$v.formData.description"
          :counter="100"
          :rows="1"
          :max-rows="5"
          auto-grow
          dark
        />

        <SelectField
          v-model="formData.reportType"
          :label="$t('reports:modal.report.type')"
          :items="reportTypes"
          :validation="$v.formData.reportType"
          :disabled="isEditing"
          :select-all-option="false"
          dark
        />

        <template v-if="formData.reportType && !isPowerBi">
          <InputField
            v-model="formData.url"
            :label="$t('reports:modal.add.link')"
            :counter="600"
            :validation="$v.formData.url"
            dark
          />

          <InputField
            v-if="!isEditing"
            v-model="formData.secret_key"
            :label="$t('reports:modal.add.secret')"
            :validation="$v.formData.secret_key"
            dark
          />
        </template>

        <template v-if="isPowerBi">
          <InputField
            v-model="formData.report_id"
            :label="$t('reports:modal.report.id')"
            :validation="$v.formData.report_id"
            dark
          />

          <InputField
            v-model="formData.workspace_id"
            :label="$t('reports:modal.workspace.id')"
            :validation="$v.formData.workspace_id"
            dark
          />

          <Checkbox
            v-model="formData.paginatedReport"
            :items="paginatedReportItems"
            switch-type
            dark
            @input="disableOpenOnEditMode"
          />

          <InputField
            v-if="formData.paginatedReport"
            v-model="formData.dataset_id"
            :label="$t('reports:modal.dataset.id')"
            :validation="$v.formData.dataset_id"
            dark
          />

          <Checkbox
            v-model="formData.openOnEditMode"
            :items="openOnEditModeItems"
            switch-type
            dark
            @input="disablePaginatedReport"
          />
        </template>

        <Checkbox
          v-model="formData.admin_only_visible"
          :items="adminOnlyVisibleItems"
          :disabled="formData.admin_only_visible_disabled"
          switch-type
          dark
          @input="clearProfileList"
          @value="getValueAdminOnly"
        />

        <Checkbox
          v-model="formData.all_profiles_allowed"
          :items="allProfilesAllowedItems"
          :disabled="formData.all_profiles_allowed_disabled"
          switch-type
          dark
          @input="clearProfileList"
          @value="getValueAllProfiles"
        />

        <SelectField
          v-model="formData.profiles"
          :label="$t('reports:modal.add.profile.access')"
          :items="profileList"
          :validation="$v.formData.profiles"
          :disabled="!profileActive || profileList.length === 0"
          :select-all-option="false"
          multiple
          dark
        />

        <Checkbox
          v-model="formData.active"
          :items="activeReport"
          switch-type
          dark
        />

        <Checkbox
          v-model="formData.is_highlight"
          :items="isHighlightReport"
          switch-type
          dark
        />

        <div class="form-submit text-center">
          <Action
            :text="formData.id ? $t('global:save') : $t('global:register')"
            type="button"
            fixed-width
            secondary
            large
            submit
          />
        </div>
      </form>
    </div>
  </Modal>
</template>
