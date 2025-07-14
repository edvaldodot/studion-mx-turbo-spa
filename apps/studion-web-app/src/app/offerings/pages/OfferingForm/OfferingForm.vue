<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/Accordion'
import AutocompleteBranches from '@/components/shared/AutocompleteBranches'
import AutocompleteCategories from '@/components/shared/AutocompleteCategories'
import Checkbox from '@/components/general/Checkbox'
import ChipInput from '@/components/general/ChipInput'
import ContentHeader from '@/components/general/ContentHeader'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import ModalInformation from '@/components/general/ModalInformation'
import Pagination from '@/components/general/Pagination'
import TextareaField from '@/components/general/TextareaField'
import Upload from '@/components/general/Upload'

import pageMixin from '../../mixins/pageMixin'
import commonsMixin from '../../mixins/commonsMixin'

export default {
  name: 'OfferingForm',

  components: {
    Action,
    ActionBar,
    AutocompleteBranches,
    AutocompleteCategories,
    Checkbox,
    ChipInput,
    ContentHeader,
    FormSection,
    InputField,
    Pagination,
    ModalInformation,
    TextareaField,
    Upload,
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    Modal: () => import('@/components/general/Modal'),
  },

  mixins: [formScrollValidationMixin, pageMixin, commonsMixin],

  data() {
    return {
      initialLoading: true,
      formData: {
        offering_id: null,
        title: '',
        description: '',
        audience: '',
        categories: [],
        image: null,
        published: null,
        keywords: [],
        branch: [],
        meta: {
          programContent: '',
        },
      },
      courses: [],
      backUrl: { name: 'offerings.list' },
      modalConfirm: false,
      modalLeave: false,
      modalPublishingError: false,
      hasChanges: false,
      publishingErrors: [],
      isAutocompleteLoading: false,
      autocompleteItems: [],
      themeDark: true,
      showAlert: false,
      hideAlert: false,
      showFeedback: true,
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
      audience: {
        required,
      },
      branch: {
        required: requiredIf(function () {
          return this.$isEnabledFeature('branching')
        }),
      },
      image: {
        required,
      },
    },
  },

  computed: {
    ...mapState(['offerings', 'accessibility']),

    isEditing() {
      return !!this.$route.params.id
    },

    offeringId() {
      return this.$route.params.id
    },
  },

  async created() {
    this.themeDark = !this.$hasBoolBgVariable('--light-generic-background')

    this.$emit('fixed-header', true)
    this.setFetching(true)

    await this.loadCourses()

    this.canShowAlert()

    if (this.offeringId) return this.setupFormdata()

    return this.setOfferingsData({ path: 'current', value: null })
  },

  destroyed() {
    this.$emit('change-theme-footer', { dark: false })
    this.$emit('fixed-header', false)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptOfferingCreation',
      'attemptOfferingUpdate',
      'attemptOfferingRetrieval',
      'attemptCourseListRetrieval',
      'attemptOfferingPublishing',
      'attemptKeywordsRetrievalByName',
      'setOfferingsData',
    ]),

    canShowAlert() {
      this.showAlert = !this.getFromLocalStorage('hide-offering-period-alert')
    },

    /**
     * @description Load Courses and emit footer event
     */
    loadCourses() {
      const params = {
        limit: 1,
        activeOnly: true,
      }

      this.attemptCourseListRetrieval(params)
        .then(({ data }) => {
          this.courses = data.data

          if (this.courses.length) {
            this.$emit('change-theme-footer', { dark: this.themeDark })
          }

          this.initialLoading = false
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * @description In edit, set offering data in form
     */
    setupFormdata() {
      this.setFetching(true)

      this.attemptOfferingRetrieval({ offeringId: this.offeringId })
        .then(({ data }) => {
          const dataKeywords = data.keywords.map((key) => key.name)
          const dataBranch =
            this.$isEnabledFeature('branching') && !!data.branch ? [data.branch] : []
          const programContent = data.meta.data.programContent || ''

          this.formData = {
            ...data,
            offering_id: data.id,
            keywords: dataKeywords,
            branch: dataBranch,
            meta: { programContent: programContent },
          }

          this.$nextTick(() => {
            if (this.$isEnabledFeature('branching') && this.formData.branch.length === 0) {
              this.$v.formData.branch.$touch()
            }
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * @description Submit handler
     * @param {Boolean} next - Set if only save or save & go to next page
     */
    submit(next, callback) {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        return this.offeringId
          ? this.submitUpdate(next, callback)
          : this.submitCreation(next, callback)
      }

      this.$nextTick(() => this.scrollToInputError())
    },

    /**
     * Submit new offering
     * @param {Boolean} next
     */
    submitCreation(next, callback) {
      const parsedFormData = {
        ...this.formData,
        branch: this.formData.branch.length ? this.formData.branch[0].id : null,
      }

      this.setFetching(true)

      this.attemptOfferingCreation(parsedFormData)
        .then(({ data }) => {
          if (next) {
            if (this.modalLeave) return this.nextAndLeave()

            return callback && callback(data.id)
          }

          this.$router.push({ name: 'offerings.update', params: { id: data.id } })
          this.showFeedback && this.setFeedback({ message: this.$t('offerings:feedback.saved') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * Update an offering
     * @param {Boolean} next
     */
    submitUpdate(next, callback) {
      const parsedFormData = {
        ...this.formData,
        branch:
          this.formData.branch && this.formData.branch.length ? this.formData.branch[0].id : null,
      }

      if (!parsedFormData.offering_id) {
        parsedFormData.offering_id = this.offeringId
      }

      this.setFetching(true)

      this.attemptOfferingUpdate(parsedFormData)
        .then(() => {
          if (this.offerings.current) {
            this.setOfferingsData({ path: 'current.title', value: this.formData.title })
          }

          if (next) {
            if (this.modalLeave) return this.nextAndLeave()
            return
          }

          return (
            this.showFeedback && this.setFeedback({ message: this.$t('offerings:feedback.saved') })
          )
        })
        .finally(() => {
          this.setFetching(false)
          callback && callback()
        })
    },

    publishOffering() {
      this.setFetching(true)
      this.attemptOfferingPublishing(this.offeringId)
        .then(() => {
          this.$router.push({ name: 'offerings.list' })
        })
        .catch(({ response }) => {
          this.$commons_handlePublishError(response)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    async getKeywords(name) {
      if (name) {
        this.isAutocompleteLoading = true
        const response = await this.attemptKeywordsRetrievalByName(name)
        this.autocompleteItems = response.data.map((keyword) => keyword.name)
        this.isAutocompleteLoading = false
      }
    },

    /**
     * @description Go back and show feedback
     */
    nextAndLeave() {
      this.$router.push(this.backUrl)
      this.showFeedback && this.setFeedback({ message: this.$t('offerings:feedback.saved') })
    },

    closeModalPublishingError() {
      this.modalPublishingError = false
      this.publishingErrors = []
    },

    existChanges() {
      if (this.offeringId) this.hasChanges = this.$v.$anyDirty
    },

    openModalConfirm() {
      this.modalConfirm = true
      this.existChanges()
    },

    closeModalConfirm() {
      this.modalConfirm = false
    },

    leave() {
      this.modalConfirm = false
      this.$nextTick(() => {
        this.$router.push(this.backUrl)
      })
    },

    save() {
      this.modalLeave = true
      this.modalConfirm = false
      this.submit(true)
    },

    alertHandler() {
      if (this.hideAlert) this.saveToLocalStorage('hide-offering-period-alert', true)
      this.showAlert = false
    },

    saveAndGoToPage(page, next = false) {
      let callback = (id) => {
        page && this.$_goToPage(page, id)
      }

      this.showFeedback = false

      if (this.canWrite('offerings')) this.submit(next, callback)
      else callback()
    },
  },
}
</script>

<template>
  <div class="offerings-create-step-01">
    <ContentHeader
      :title="isEditing ? formData.title : $t('offerings:form.header.title')"
      light-theme
      fixed
    >
      <Action
        slot="back"
        :text="$media.mobile ? $t('global:back') : $t('global:back.offerings')"
        type="button"
        class="btn-back text-color"
        icon="keyboard_backspace"
        @click="openModalConfirm()"
      />
      <ActionBar
        slot="actionbar"
        profile
      />
      <template slot="buttons">
        <Action
          :text="$t('global:form.publish')"
          :disabled="!isEditing"
          type="button"
          flat
          @click="publishOffering()"
        />
        <Action
          :text="$t('global:form.save')"
          :disabled="!canWrite('offerings')"
          :dark="accessibility"
          type="button"
          flat
          @click="submit(false)"
        />
      </template>
    </ContentHeader>
    <div
      v-if="!initialLoading && courses.length === 0"
      class="section bg-gradient-gray p-4"
    >
      <EmptyMessage>
        <h2 class="text-color">{{ $t('offerings.create:empty.title') }}(</h2>
        <p class="text-color">{{ $t('offerings.create:empty.message') }}</p>
      </EmptyMessage>
    </div>
    <div
      v-else
      class="section"
    >
      <div class="center">
        <div class="offerings-create-header theme-dark">
          <h2 class="offerings-create-title text-color">
            {{ $t('global:form.step', { num: 1 }) }}
          </h2>
          <p class="offerings-create-description text-color">
            {{ $t('offerings.create:header.description') }}
          </p>
        </div>
        <form
          class="flex flex-column gap-4 w-12 xl:w-4 mx-auto"
          @submit.prevent="submit"
        >
          <InputField
            v-model="formData.title"
            :label="$t('global:form.title')"
            :counter="100"
            :validation="$v.formData.title"
            :dark="themeDark"
            :disabled="!canWrite('offerings')"
            type="text"
          />
          <TextareaField
            v-model="formData.description"
            :label="$t('global:form.description')"
            :max-rows="10"
            :rows="1"
            :validation="$v.formData.description"
            :dark="themeDark"
            :disabled="!canWrite('offerings')"
            auto-grow
          />
          <TextareaField
            v-model="formData.audience"
            :label="$t('global:form.audience')"
            :max-rows="10"
            :rows="1"
            :counter="250"
            :validation="$v.formData.audience"
            :dark="themeDark"
            :disabled="!canWrite('offerings')"
            auto-grow
          />
          <TextareaField
            v-if="$isEnabledFeature('bidding')"
            v-model.trim="formData.meta.programContent"
            :label="$t('global:form.programContent')"
            :max-rows="10"
            :rows="1"
            :counter="500"
            :dark="themeDark"
            :disabled="!canWrite('offerings')"
            auto-grow
          />

          <FormSection
            :title="$t('offerings.create:form.section.categories.title')"
            :dark="themeDark"
          >
            <p class="text-color">{{ $t('offerings.create:form.section.categories.description') }}</p>

            <AutocompleteCategories
              v-model="formData.categories"
              :floating-label="false"
              :label="$t('offerings.create:form.section.categories.autocomplete.placeholder')"
              :dark="themeDark"
            />
          </FormSection>

          <FormSection
            :title="$t('offerings.create:form.section.keywords.title')"
            :dark="themeDark"
          >
            <p class="text-color">{{ $t('offerings.create:form.section.keywords.description') }}</p>
            <ChipInput
              v-model="formData.keywords"
              :autocomplete-loading="isAutocompleteLoading"
              :autocomplete-options="autocompleteItems"
              :label="$t('offerings.create:form.section.keywords.placeholder')"
              autocomplete
              @search="getKeywords"
            />
          </FormSection>

          <AutocompleteBranches
            v-if="$isEnabledFeature('branching') && (!isEditing || formData.branch)"
            v-model="formData.branch"
            :validation="$v.formData.branch"
            :label="$tc('global:branch')"
            :dark="themeDark"
            floating-label
          />

          <FormSection :title="$t('global:upload.title')">
            <Upload
              v-model="formData.image"
              :dark="themeDark"
              :icon="'image-multiple'"
              :label="$t('global:upload.add.image')"
              :validation="$v.formData.image"
              :width="300"
              :height="200"
              :preview="$media.mobile ? 0.58 : 1"
              :disabled="!canWrite('offerings')"
              cropper
            />
          </FormSection>
        </form>

        <Pagination
          v-if="pageCount"
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="1"
          :page-count="pageCount"
          :show-all-pages="Boolean($route.params.id)"
          float
          block-layout
          disable-scroll
          disable-items-per-page
          custom-routing
          @next-page="saveAndGoToPage(2, true)"
          @go-to-page="saveAndGoToPage($event)"
        />
      </div>
    </div>

    <Modal
      :active="modalConfirm"
      :cancel="false"
    >
      <div class="modal-confirm">
        <Action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('offerings.create:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('offerings.create:modal.confirm.message') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            v-if="isEditing && canWrite('offerings') && hasChanges"
            :text="$t('global:save.leave')"
            :dark="accessibility"
            type="button"
            flat
            @click="save()"
          />
          <Action
            :text="$t('global:leave')"
            :dark="accessibility"
            type="button"
            flat
            @click="leave()"
          />
          <Action
            :text="$t('global:cancel')"
            :dark="accessibility"
            type="button"
            flat
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>

    <Modal
      :active="modalPublishingError"
      :cancel="false"
      @close="closeModalPublishingError"
    >
      <div class="modal-confirm">
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('offerings.publishing:modal.confirm.error') }}</h3>
        </div>
        <div class="modal-confirm-description">
          <p class="text-color">{{ $t('offerings.publishing:modal.confirm.error.message') }}</p>
          <ul>
            <li
              v-for="error in publishingErrors"
              :key="error"
            >
              {{ $t(`offerings.publishing:modal.confirm.error.${error}`) }}
            </li>
          </ul>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :text="$t('global:understood')"
            :dark="accessibility"
            type="button"
            flat
            @click="closeModalPublishingError()"
          />
        </div>
      </div>
    </Modal>

    <!-- TODO: Remove after user adptation to this new rule -->
    <ModalInformation
      :active="showAlert"
      closable
      width="650px"
      @close="alertHandler"
    >
      <template #pre-content>
        {{ $t('global:news') }}
      </template>

      <template #title>
        {{ $t('offerings.create:modal.period.alert.title') }}
      </template>

      <template #description>
        <!-- Avoid 'v-html' directive can lead to XSS attack. (static i18n content) -->
        <!-- eslint-disable -->
        <p
          class="text-center"
          v-html="$t('offerings.create:modal.period.alert.description')"
        ></p>
        <!-- eslint-enable -->
      </template>

      <template #actions>
        <Checkbox
          v-model="hideAlert"
          :items="[{ value: true, label: $t('global:not.show.again') }]"
        />

        <Action
          :text="$t('global:continue')"
          type="button"
          large
          flat
          @click="alertHandler"
        />
      </template>
    </ModalInformation>
  </div>
</template>

<style lang="scss">
@import '~@/app/offerings/styles.scss';
</style>
