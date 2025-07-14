<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'
import minValueIf from '@/support/customValidators/minValueIf'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import filesizeValidator from '@/support/customValidators/filesizeValidator'
import { format } from 'date-fns'
import debounce from 'lodash/debounce'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datepicker from '@/components/general/Datepicker'
import FileField from '@/components/general/FileField'
import InputField from '@/components/general/InputField'
import Icon from '@/components/general/Icon'
import FormSection from '@/components/general/FormSection'
import SelectField from '@/components/general/SelectField'
import TagSelector from '@/components/general/TagSelector'
import Modal from '@/components/general/Modal'
import Upload from '@/components/general/Upload'
import ModalAddVideo from '../../components/ModalAddVideo'
import ModalConfirm from '@/components/general/ModalConfirm'
import SessionsBind from '@/app/management/pages/ManagementSessions/components/SessionsBind/SessionsBind.vue'

import EvaluationForumMandatory from './componentes/EvaluationForumMandatory.vue'
import ForumOptionsForm from '../../components/ForumOptionsForm'
import i18n from '@/support/i18n'

import ControlModalVideo from '../../mixins/controlModalVideo'
import { forumInteractionValidator } from '../../shared'
import slugValidator from '@/support/customValidators/slugValidator'
import TextEditorMedia from '@/components/shared/TextEditorMedia/TextEditorMedia'

const ALLOWED_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

export default {
  name: 'ModalAddForum',

  components: {
    Action,
    Checkbox,
    Datepicker,
    EvaluationForumMandatory,
    FileField,
    FormSection,
    ForumOptionsForm,
    Icon,
    InputField,
    Modal,
    ModalAddVideo,
    SelectField,
    SessionsBind,
    TagSelector,
    TextEditorMedia,
    Upload,
    ModalConfirm,
  },

  mixins: [ControlModalVideo],

  data() {
    return {
      formData: {
        active: true,
        title: null,
        slug: '',
        content: null,
        start_time: null,
        end_time: null,
        image: null,
        hasImage: false,
        mandatory: false,
        assets: null,
        oldAsset: null,
        allowEditPost: true,
        allowDeletePost: true,
        operator: null,
        numPosts: null,
        numComments: null,
        max_grade: null,
        avaliative: null,
        feedback_mandatory: null,
        sessions_ids: [],
        grades: [],
        multiple_sessions: false,
      },
      tempAssets: null,
      tempMediaFile: null,
      allowedImageTypes: ALLOWED_IMAGE_TYPES,
      importImage: true,
      remainingNote: null,
      tags: null,
      sessionModalIsOpen: false,
      toggleAvaliativeModal: false,
      closeToggleAvaliativeModalResult: false,
      skipNextAvaliativeWatchHandler: false,
    }
  },

  validations: {
    formData: {
      title: {
        required,
      },
      content: {
        required,
      },
      start_time: {
        required,
      },
      end_time: {
        required,
      },
      slug: {
        slugValidation: slugValidator,
      },
      max_grade: {
        required: requiredIf(function (nestedModel) {
          return nestedModel.avaliative && !this.isManagement
        }),
        minGrade: function (newValue, nestedModel) {
          if (!nestedModel.avaliative || !this.management) return true
          return newValue <= this.remainingNote
        },
        valueBiggerZero: minValueIf(0.01, function () {
          return true
        }),
      },
      sessions_ids: {
        required: requiredIf(function () {
          return this.isManagement
        }),
      },
      ...forumInteractionValidator(),
    },

    tempAssets: {
      mimeType: mimeTypeValidator(['application/pdf']),
    },

    tempMediaFile: {
      filesize: filesizeValidator(5242880),
      mimeType: mimeTypeValidator(ALLOWED_IMAGE_TYPES),
    },
  },

  computed: {
    ...mapState(['Classroom', 'forums', 'Account', 'fetching', 'accessibility']),

    isEditing() {
      return this.$route.meta.editing || false
    },
    today() {
      if (this.isEditing) {
        return ''
      }

      return format(new Date(), 'yyyy-MM-dd')
    },
    minDate() {
      if (!this.formData.start_time) {
        return ''
      }

      let date = new Date(this.formData.start_time)
      date.setMinutes(date.getMinutes() + 10)

      return format(date, 'yyyy-MM-dd-HH:mm')
    },
    current() {
      return this.forums.current
    },

    hasZeroPosts() {
      return this.formData.numPosts === 0
    },

    hasZeroComments() {
      return this.formData.numComments === 0
    },

    disableOperatorInteraction() {
      return this.hasZeroPosts || this.hasZeroComments
    },
    backOrCancel() {
      return this.$route.params.management
    },

    isManagement() {
      return this.backOrCancel && !this.current
    },
  },

  watch: {
    current: {
      immediate: true,
      handler() {
        if (!this.forums.current) return

        const {
          active,
          id,
          title,
          content,
          startTime,
          endTime,
          image,
          mandatory,
          avaliative,
          feedbackMandatory,
          maxGrade,
          assets: asset,
          meta,
          slug,
          allowEditPost,
          allowDeletePost,
          isMultiple,
        } = this.forums.current

        this.formData.active = active
        this.formData.discussion_id = id
        this.formData.title = title

        if (this.$isEnabledFeature('slug_identity')) {
          this.formData.slug = slug
        }

        this.formData.content = content
        this.formData.start_time = format(new Date(startTime), 'yyyy-MM-dd HH:mm')
        this.formData.end_time = format(new Date(endTime), 'yyyy-MM-dd HH:mm')
        this.formData.image = image
        this.formData.mandatory = mandatory
        this.formData.assets = asset ? [asset] : null
        this.formData.oldAsset = asset
        this.formData.operator = meta ? meta.operator : null
        this.formData.numPosts = meta ? meta.numPosts : null
        this.formData.numComments = meta ? meta.numComments : null
        this.formData.max_grade = maxGrade
        this.formData.avaliative = avaliative
        this.formData.feedback_mandatory = feedbackMandatory
        this.formData.allowDeletePost = allowDeletePost
        this.formData.allowEditPost = allowEditPost
        this.formData.multiple_sessions = isMultiple

        this.setRemainingNote()
      },
    },

    'formData.mandatory': {
      handler(newValue) {
        if (!this.isEditing) {
          this.setDefaultInteractionValues(newValue)
        }
      },
    },

    'formData.avaliative': {
      handler(newValue) {
        if (this.skipNextAvaliativeWatchHandler) {
          this.skipNextAvaliativeWatchHandler = false
          return
        }

        if (this.isManagement) {
          if (this.formData.sessions_ids && this.formData.sessions_ids.length) {
            this.toggleAvaliativeModal = true
            this.closeToggleAvaliativeModalResult = !newValue
          }
        }
      },
    },
  },

  created() {
    if (this.isEditing || (!this.editing && !this.isManagement)) {
      this.getRemainingNote()
    }

    this.getTagsDiscussion()
  },

  destroyed() {
    this.forums.current = null
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptDiscussionCreation',
      'attemptDiscussionUpdate',
      'attemptUploadMediaFile',
      'attemptRemainingNote',
      'attemptGetDiscussionTags',
      'attemptManagementForumsCreation',
    ]),

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        if (this.$v.formData.sessions_ids.$invalid) {
          this.setFeedback({
            message: this.$t('management:announcement.validation.replicate.class'),
          })
        }
        return
      }

      if (this.verifyGrades()) {
        return
      }

      if (!this.isManagement) {
        this.formData.forum_id = this.Classroom.data.forum.id
      }
      this.setFetching(true)
      this.formData.discussion_id ? this.submitUpdate() : this.submitCreate()
    },

    verifyGrades() {
      if (
        this.formData.avaliative &&
        this.formData.sessions_ids.length !== this.formData.grades.length
      ) {
        this.setFeedback({
          message: this.$t('management:forum.validation.replicate.class.avaliative'),
        })
        return true
      }

      const hasInvalidGrade = this.formData.grades.some(
        (grade) => grade.value === '0.00' || grade.value === ''
      )
      if (hasInvalidGrade) {
        this.setFeedback({
          message: this.$t('management:forum.validation.replicate.class.grade'),
        })
        return true
      }

      return false
    },

    submitCreate() {
      this.isManagement ? this.submitCreateManagemnte() : this.submitCreateClassroom()
    },

    forumScoreManagement() {
      if (!this.isManagement) {
        return this.Classroom.data.forum.meta.forum_score && this.formData.mandatory
      }

      return this.formData.mandatory
    },

    submitCreateClassroom() {
      this.formData.active = 1
      let promise = this.attemptDiscussionCreation({
        sessionUuid: this.$route.params.session_uuid,
        discussionId: this.formData.discussion_id,
        data: this.formData,
      })

      promise
        .then(({ data }) => {
          this.$emit('discussion-saved', data)
          this.closeModal()
          this.setFeedback({ message: this.$t('forum:feedback:created.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('forum:feedback:created.error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submitCreateManagemnte() {
      this.formData.active = 1

      this.attemptManagementForumsCreation(this.formData)
        .then(() => {
          this.closeModal()
          this.setFeedback({ message: this.$t('forum:feedback:created.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('forum:feedback:created.error'), type: 'error' })
        })
        .finally(() => {
          this.$emit('refresh')
          this.setFetching(false)
        })
    },

    submitUpdate() {
      let promise = this.attemptDiscussionUpdate({
        sessionUuid: this.$route.params.session_uuid,
        discussionId: this.formData.discussion_id,
        data: this.formData,
      })

      promise
        .then(({ data }) => {
          this.$emit('discussion-saved', data)

          this.closeModal()

          this.setFeedback({ message: this.$t('forum:feedback:updated.success') })
          if (this.$route.params.management) {
            this.$router.push({ name: this.$route.params.management })
            this.setFetching(false)
            return
          }
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('forum:feedback:updated.error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    updateHasImage() {
      this.formData.hasImage = true
    },

    closeModal() {
      if (this.isManagement) {
        this.backAction()
      } else {
        this.$router.push(this.$route.meta.modalCloseLink)
      }
    },

    hideImportImage() {
      this.importImage = false
      this.showImportImage(this)
    },

    showImportImage: debounce((context) => {
      context.importImage = true
    }, 1000),

    openMediaFile() {
      this.$refs.mediaFile.$refs.label.click()
    },

    addMediaFile() {
      if (!this.$v.tempMediaFile.$invalid) {
        this.setFetching(true)
        this.attemptUploadMediaFile({ file: this.tempMediaFile })
          .then(({ data }) => {
            let imgAttrs = { width: '100%' }
            if (this.tempMediaFile[0].type === 'image/gif') {
              imgAttrs = { 'max-width': '100%' }
            }
            this.$refs.textField.addImageUrl(data.url, imgAttrs)
            this.tempMediaFile = null
            this.$refs.mediaFile.clear()
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else if (!this.$v.tempMediaFile.mimeType) {
        this.setFeedback({
          message: this.$t('classroom.panel.announcements.card.error:invalid.file.type'),
          type: 'error',
        })
      } else {
        this.setFeedback({
          message: this.$t('classroom.panel.announcements.card.error:invalid.file.size'),
          type: 'error',
        })
      }
    },

    setDefaultInteractionValues(isMandatory) {
      this.formData.operator = isMandatory ? 'and' : null
      this.formData.numPosts = isMandatory ? 1 : null
      this.formData.numComments = isMandatory ? 1 : null
    },

    getRemainingNote() {
      if (this.Classroom.data.forum.meta.forum_score) {
        this.attemptRemainingNote().then(this.setRemainingNote)
      }
    },
    setRemainingNote() {
      if (this.Classroom.data.forum.meta.forum_score) {
        let gradeSum = this.forums.remainingNote

        if (this.formData.active && this.formData.max_grade) {
          gradeSum = (this.forums.remainingNote + this.formData.max_grade).toFixed(2)
        }

        this.remainingNote = Number(gradeSum)
      }
    },
    getTagsDiscussion() {
      this.setFetching(true)
      this.attemptGetDiscussionTags()
        .then((data) => {
          this.tags = this.getTagList(data)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    getTagList(value) {
      const tagList = Object.keys(value).map((key) => ({
        value: value[key],
        text: i18n.t(`mediation.actions:tag.item:${key.toLowerCase()}`),
      }))

      return tagList
    },
    backAction() {
      this.$router.back()
    },

    confirmToggleAvaliativeModal() {
      if (!this.formData.avaliative) {
        this.formData.grades = []
      }

      this.toggleAvaliativeModal = false
    },

    closeToggleAvaliativeModal() {
      this.toggleAvaliativeModal = false
      this.formData.avaliative = this.closeToggleAvaliativeModalResult
      this.skipNextAvaliativeWatchHandler = true
    },
  },
}
</script>

<template>
  <div>
    <Modal
      v-show="!sessionModalIsOpen"
      :active="true"
      is-page
      :cancel="!backOrCancel"
      class="modal-add-forum"
      :class="{ 'modal-add-video-open': modalAddVideo }"
      @close="backAction"
    >
      <Action
        v-if="backOrCancel"
        icon="keyboard_backspace"
        :text="$t('management:back.to.management')"
        icon-size="mediun"
        class="btn-back text-color"
        type="button"
        flat
        @click="backAction"
      />

      <div class="modal-form">
        <span
          class="modal-subtitle"
          :class="{ 'is-management text-color': isManagement }"
          >{{ $t('classroom.forum:modal.add.subtitle') }}</span
        >

        <h2
          v-if="!isManagement"
          class="modal-title text-color"
        >
          {{ Classroom.data.course.name }}
        </h2>

        <div class="modal-description text-color">
          <p class="text-color">{{ $t('classroom.forum:modal.add.description') }}</p>
        </div>

        <FileField
          ref="mediaFile"
          v-model="tempMediaFile"
          :label="$t('global:form.attach.file')"
          :validation="$v.tempMediaFile"
          class="hidden"
          :dark="accessibility"
          :accept="allowedImageTypes.join()"
          @input="addMediaFile"
        />

        <form @submit.prevent="submit()">
          <InputField
            v-model="formData.title"
            dark
            :counter="200"
            :label="$t('global:form.title')"
            :validation="$v.formData.title"
          />

          <TextEditorMedia
            ref="textForum"
            v-model="formData"
            class="input-editor-forum-form"
            :counter="8000"
            :disabled="!canWrite('forum')"
            :item="'content'"
            :label="$t('global:form.description')"
            :validation="$v.formData.content"
            :rows="{ min: 12 }"
            :writable="canWrite('forum')"
            embed-image
            embed-video
            image-manipulation
            image-enabled
            no-fixed
            free-crop
            add-image-at-fifty
            @change="hideImportImage()"
            @modalEmbedVideo="openModalAddVideo(true)"
          >
            <template #before-tools>
              <TagSelector
                v-if="tags && tags.length > 0"
                tag-label="Tags"
                :tags="tags.map((tag) => tag.value)"
                :tag-values="tags.map((tag) => tag.text)"
                @tag="$refs.textForum.$refs.textField.addTag($event)"
              />
            </template>
          </TextEditorMedia>

          <InputField
            v-if="$isEnabledFeature('slug_identity')"
            v-model="formData.slug"
            :validation="$v.formData.slug"
            :label="$t('global:slug.identity')"
            :counter="100"
            dark
            @input="(val) => (formData.slug = formData.slug.toUpperCase())"
          />

          <div
            class="form-group theme-dark clearfix"
            data-gap="40"
            data-cols="2"
          >
            <p class="form-item-description">{{ $t('global:form.section.period') }}</p>

            <Datepicker
              v-model="formData.start_time"
              dark
              time
              :min="today"
              :label="$t('global:form.start')"
              :validation="$v.formData.start_time"
            />

            <Datepicker
              :key="formData.start_time"
              v-model="formData.end_time"
              dark
              time
              :min="minDate"
              :label="$t('global:form.end')"
              :validation="$v.formData.end_time"
              :disabled="formData.start_time == null"
            />
          </div>

          <FileField
            v-model="formData.assets"
            can-remove
            class="mt-8"
            :accept="'.pdf'"
            :label="$t('global:form.attach.file.pdf')"
            :validation="$v.tempAssets"
            @input="(assets) => (tempAssets = assets)"
          />

          <Upload
            v-model="formData.image"
            dark
            :icon="'image-multiple'"
            :label="$t('global:upload.add.image')"
            :description="$t('global:upload.title')"
            :cropper="true"
            :width="1001"
            :height="546"
            :preview="0.4"
            @input="updateHasImage"
          />

          <Checkbox
            v-model="formData.mandatory"
            dark
            switch-type
            :disabled="isManagement && !current && formData.avaliative"
            :items="[
              {
                label: $t('classroom.forum:mandatory'),
                description: $t('classroom.forum:mandatory:description'),
                value: true,
              },
            ]"
          />

          <template v-if="formData.mandatory">
            <FormSection
              :title="$t('classroom.forum:interaction:title')"
              class="interaction-form"
              dark
            >
              <div class="interaction-form__container flex align-items-center">
                <InputField
                  v-model="formData.numPosts"
                  :validation="$v.formData.numPosts"
                  :max="10"
                  :min="0"
                  type="number"
                  dark
                  hide-error-details
                  @input="$v.formData.numPosts.$touch"
                />

                <p class="form-group-description text-color">
                  {{ $t('classroom.forum:interaction:post') }}
                </p>

                <SelectField
                  v-model="formData.operator"
                  :validation="$v.formData.operator"
                  :items="[
                    {
                      value: 'and',
                      text: $t('classroom.forum:interaction:operator:and'),
                    },
                    {
                      value: 'or',
                      text: $t('classroom.forum:interaction:operator:or'),
                    },
                  ]"
                  :allow-clear="false"
                  :disabled="disableOperatorInteraction"
                  dark
                  hide-error-details
                />

                <InputField
                  v-model="formData.numComments"
                  :validation="$v.formData.numComments"
                  :max="10"
                  :min="0"
                  type="number"
                  dark
                  hide-error-details
                  @input="$v.formData.numComments.$touch"
                />

                <p class="form-group-description text-color">
                  {{ $t('classroom.forum:interaction:comment') }}
                </p>
              </div>

              <div
                v-if="$v.formData.numComments.$error"
                class="form-input-messages-container dark"
              >
                <Icon
                  name="error"
                  wrapper
                  size="small"
                />
                <span class="form-input-message">{{
                  $t('classroom.forum:interaction:error:message')
                }}</span>
              </div>
            </FormSection>
          </template>

          <div v-if="forumScoreManagement()">
            <EvaluationForumMandatory
              :value="formData"
              :validation="$v.formData"
              :forum-remaining-note="remainingNote"
              :forum-max-grade="forums.fullMark"
              :is-management="isManagement"
              dark
            />
          </div>

          <ForumOptionsForm
            v-model="formData"
            dark
          />

          <FormSection
            v-if="isManagement"
            :title="$t('classroom.forum:multiple.sessions')"
            class="interaction-form"
            dark
          >
            <Checkbox
              v-model="formData.multiple_sessions"
              :items="[
                {
                  label: $t('classroom.forum:multiple.checkbox'),
                  description: $t('classroom.forum:multiple.checkbox.description'),
                  value: true,
                },
              ]"
              dark
              switch-type
            />
          </FormSection>

          <div
            v-if="isManagement"
            class="modal-poll__sessions-bind form-full-w"
          >
            <SessionsBind
              v-model="formData.sessions_ids"
              class="session-bind-class"
              :name-bind-component="$t('management:forum.replicate.name')"
              :show-extra-forum-columns="formData.avaliative"
              :avaliative-forum="formData.avaliative"
              filter-tool="forum"
              @modal-is-open="(e) => (sessionModalIsOpen = e)"
              @update-grades="
                ($e) => {
                  formData.grades = $e
                }
              "
            />
          </div>

          <div class="form-submit text-center submit-button">
            <Action
              class="mt-5"
              type="button"
              large
              submit
              secondary
              fixed-width
              :text="formData.discussion_id ? $t('global:save') : $t('global:add')"
            />
          </div>
        </form>
      </div>
    </Modal>

    <Modal
      :active="modalAddVideo"
      only-close-one-modal
      @close="closeModalAddVideo"
    >
      <ModalAddVideo @addIFrame="addIFrame" />
    </Modal>

    <ModalConfirm
      :title="$t('global:attention')"
      :active="toggleAvaliativeModal"
      @close="closeToggleAvaliativeModal"
      @confirm="confirmToggleAvaliativeModal"
    >
      <p>{{ $t('classroom.forum:confirm.toggle.avaliative.modal.description') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import './styles.scss';
</style>
