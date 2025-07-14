<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, url } from 'vuelidate/lib/validators'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { formatFileSize, getFileTypes } from '@/support/utils/storageUnit'
import { previewModal } from '@/components/general/ModalPreview/methods'
import { validatorChatbot } from '@/support/http'
import { libraryMixin } from '@/mixins/libraryMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import FileField from '@/components/general/FileField'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import LibraryDatatable from '@/components/general/Library/LibraryDatatable.vue'
import SelectField from '@/components/general/SelectField'
import Tooltip from '@/components/general/Tooltip'
import Pagination from '@/components/general/Pagination'
import TextareaField from '@/components/general/TextareaField'
import ModalConfirm from '@/components/general/ModalConfirm'
import ModalAddImport from '@/app/classroom/modules/library/pages/ModalAddImport'
import ModalPreview from '@/components/general/ModalPreview'
import TitleDescription from '@/components/general/TitleDescription'
import AddFolderModal from '../../components/AddFolderModal.vue'
import FilterListOrder from '@/components/general/FilterListOrder'

import { defaultFilterListOrderOptions } from './options'

import { parseTools } from '@/support/utils/tools'

import pageMixin from '../../mixins/pageMixin'
import sharedMixin from '@/app/classroom/modules/classroom/pages/sharedDataMixin.js'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'SolutionTools',
  components: {
    Action,
    ActionBar,
    ActionSubmenu,
    Checkbox,
    ContentHeader,
    FileField,
    Icon,
    InputField,
    LibraryDatatable,
    SelectField,
    Modal,
    ModalConfirm,
    Pagination,
    TextareaField,
    ModalAddImport,
    ModalPreview,
    Tooltip,
    TitleDescription,
    AddFolderModal,
    FilterListOrder,
  },
  mixins: [paginateMixin, pageMixin, sharedMixin, libraryMixin],
  data() {
    return {
      modalMediaActive: false,
      modalPreviewActive: false,
      modalAddFolderActive: false,
      showSubmenu: false,
      media: null,
      biometricTool: false,
      biometricToolConfigs: [],
      biometricWorkloadFlags: [
        'exceeded_limit_continuously',
        'class_first_access_after_break',
        'exceeded_day_limit',
      ],
      oldFormData: {},
      formData: {
        custom_classroom_redirect: 'panel',
        media: {
          title: null,
          description: null,
          file: null,
          type: null,
          url: null,
          parent_folder_id: null,
        },
        tools: ['998', '997'],
        mediaLinks: [],
      },
      forumScore: null,
      tools: [
        {
          value: '997',
          label: this.$t('solutions:tools.calendar'),
          disabled: true,
        },
      ],
      mediaItems: [],
      course: {},
      backUrl: { name: 'solutions.index' },
      modalConfirm: false,
      modalLeave: false,
      themeDark: true,
      confirmToolsModal: {
        active: false,
        adding: false,
        payload: {},
      },
      customClassroomRedirectOptions: [
        {
          text: this.$t('global:menu.classroom.panel'),
          value: 'panel',
        },
        {
          text: this.$t('global:menu.classroom.lessons'),
          value: 'class',
        },
      ],
      ai_tutor_code: null,
      ai_tutor_vendor: null,
      validCode: true,
      breadcrumbsList: [
        {
          text: this.$t('library:tab.link.1'),
          key: 0,
          isEditable: true,
        },
      ],
      modalImportActive: false,
      selectedOption: 'folders',
      horizontalSwitchOptions: [
        { text: this.$t('library:tab.folders'), value: 'folders' },
        { text: this.$t('library:tab.medias'), value: 'medias' },
      ],
      disabledAction: false,
      queryParams: {
        order: { name: 'desc' },
      },
      closeModalConfirmDelete: false,
      currentDeleteMedia: null,
    }
  },
  validations: {
    formData: {
      custom_classroom_redirect: { required },
      media: {
        type: { required },
        title: { required },
        description: { required },
        url: {
          url,
          required: requiredIf(function () {
            return this.formData.media.type === 'external_link'
          }),
        },
        file: {
          required: requiredIf(function () {
            return this.formData.media.id === undefined && this.formData.media.type === 'file'
          }),
        },
      },
    },
    biometricToolConfigs: {
      required: requiredIf(function () {
        return this.biometricTool
      }),
    },
    ai_tutor_code: {
      required,
      validatorTutorCode: function () {
        return this.validCode
      },
    },
  },
  computed: {
    ...mapState(['accessibility', 'Courses', 'isSavingBlocked', 'Library']),

    fileTypeOptions() {
      return [
        {
          text: this.$tc('global:attachment', 1),
          value: 'file',
        },
        {
          text: this.$t('global:external.media'),
          value: 'external_link',
        },
      ]
    },

    linkedMediaIds() {
      return this.formData.mediaLinks ? this.formData.mediaLinks.map((item) => item.id) : []
    },

    isEditing() {
      return this.$route.params.id || false
    },

    confirmToolsModalTitle() {
      return this.confirmToolsModal.adding
        ? this.$t('solutions.create.tools:confirm_modal.add.title')
        : this.$t('solutions.create.tools:confirm_modal.remove.title')
    },

    confirmToolsModalBtn() {
      return this.confirmToolsModal.adding
        ? this.$t('solutions.create.tools:confirm_modal.add.btn')
        : this.$t('solutions.create.tools:confirm_modal.remove.btn')
    },

    getBackRoute() {
      const routeName =
        this.pageCount && this.pageCount === 5 ? 'solutions.metadata.register' : 'solutions.update'

      return {
        name: routeName,
        params: {
          id: this.$route.params.id,
        },
      }
    },

    isLibraryActive() {
      const libraryTool = this.tools.find((tool) => {
        return this.parseToolName(tool.alias) === 'session.library'
      })

      if (!libraryTool) return false

      return !!this.formData.tools.find((tool) => {
        return Number(tool) === Number(libraryTool.value)
      })
    },

    aiTool() {
      return (
        this.Courses &&
        this.Courses.current &&
        this.Courses.current.tool_meta &&
        this.Courses.current.tool_meta.data &&
        this.Courses.current.tool_meta.data.ai_tutor_code
      )
    },
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },
  },

  mounted() {
    this.$emit('fixed-header', true)
    this.$emit('change-theme-footer', { dark: this.themeDark })
  },

  destroyed() {
    this.$emit('fixed-header', false)
    this.$emit('change-theme-footer', { dark: false })
  },

  created() {
    let notDarkFlag = getComputedStyle(document.body).getPropertyValue('--light-generic-background')
    this.themeDark = notDarkFlag && !(notDarkFlag === '1')
    this.$emit('fixed-header', true)
    let courseId = this.$route.params.id

    this.setFetching(true)

    Promise.all([this.attemptToolListRetrieval(), this.attemptCourseRetrieval({ courseId })])
      .then(([tools, course]) => {
        tools.data.forEach((tool) => {
          return this.tools.push(this.formatTool(tool))
        })
        course.data.available_tools.map((value) => {
          if (!Number.isInteger(value.id)) {
            return
          }
          this.formData.tools.push(String(value.id))
        })

        this.course = course.data
        this.forumScore = course.data.tool_meta.data ? course.data.tool_meta.data.forum_score : null
        this.ai_tutor_code = course.data.tool_meta.data
          ? course.data.tool_meta.data.ai_tutor_code
          : null

        this.formData.custom_classroom_redirect =
          this.course.tool_meta.data.custom_classroom_redirect

        this.oldFormData = this.deepClone(this.formData.tools)

        this.loadCourseLibraryfiles()

        this.formData.tools = this.formData.tools.filter((item) => {
          return this.$hiddenTools.indexOf(item) === -1
        })

        this.tools = this.tools.filter((item) => {
          return this.$hiddenTools.indexOf(item.value) === -1
        })

        if (this.$isEnabledFeature('biometrics')) {
          const toolId = this.tools.find((tool) => tool.alias === 'Biometrics').value
          const currentCourse = this.Courses.current

          if (currentCourse.available_tools.find((tool) => tool.id === toolId)) {
            this.biometricTool = true
            this.biometricToolConfigs = currentCourse.tool_meta.data.biometrics_configs
          }
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptCourseRetrieval',
      'attemptToolListRetrieval',
      'attemptCourseSaveAvailableTools',
      'attemptCourseLibraryRetrieval',
      'attemptLibraryFileCreationOnResource',
      'attemptAddFilesOnCourse',
      'attemptLibraryFileCourseDisassociation',
      'attemptLibraryFileDeleteLibraryOnSession',
      'attemptDownloadLibraryFileRetrieval',
      'attemptRetrieveLibraryFile',
    ]),

    previewModal,

    formatTool(tool) {
      const { id, description } = tool

      return {
        label: this.getToolTranslations(description),
        value: id,
        disabled: !this.canWrite('courses'),
        alias: description,
        additionalConfigs: tool.configs || false,
      }
    },

    async submit(next, toPage = null) {
      let tools = this.formData.tools.filter(
        (value) => ['998', '997'].indexOf(value) === -1 && parseInt(value) > 0
      )
      const payload = {
        courseId: this.$route.params.id,
        data: {
          available_tools: tools,
          custom_classroom_redirect: this.formData.custom_classroom_redirect,
        },
      }

      if (this.formData.tools.some((tool) => tool === '12')) {
        this.setFetching(true)
        this.ai_tutor_vendor = 'aiDot'
        this.validCode = await validatorChatbot(this.ai_tutor_code)
        this.setFetching(false)
        this.$v.ai_tutor_code.$touch()
        if (this.$v.ai_tutor_code.$invalid) {
          this.$refs.pagination.forceToPage(2)
          return
        }

        if (this.validCode) {
          payload.data.ai_tutor_code = this.ai_tutor_code
          payload.data.ai_tutor_vendor = this.ai_tutor_vendor
        }
      }

      this.$v.biometricToolConfigs.$touch()
      if (this.$v.biometricToolConfigs.$invalid) return

      if (!this.canWrite('courses')) {
        return this.canReadAction(next)
      }

      this.setFetching(true)

      if (this.aiTool && !this.ai_tutor_code) {
        payload.data.ai_tutor_code = this.aiTool
      }

      if (this.$isEnabledFeature('forum_evaluation')) {
        payload.data.forum_score = this.forumScore
      }

      if (this.$isEnabledFeature('biometrics')) {
        const toolId = this.tools.find((tool) => tool.alias === 'Biometrics').value

        if (this.biometricTool) {
          if (!payload.data.available_tools.includes(toolId)) {
            payload.data.available_tools.push(toolId.toString())
          }
          payload.data.biometrics_configs = this.biometricToolConfigs
        } else {
          payload.data.available_tools = payload.data.available_tools.filter(
            (value) => value !== toolId.toString()
          )
        }
      }

      this.attemptCourseSaveAvailableTools(payload)
        .then(() => {
          if (next) {
            if (toPage) {
              this.$_goToPage(toPage)
            } else if (this.modalLeave) {
              this.$router.push(this.backUrl)
              this.setFeedback({ message: this.$t('solutions.create:feedback.saved') })
            } else {
              this.$router.push({
                name: 'solutions.create.classes',
                params: { id: this.$route.params.id },
              })
            }
          } else {
            this.setFeedback({ message: this.$t('solutions.create:feedback.saved') })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    canReadAction(next) {
      if (next) {
        if (this.modalLeave) {
          this.$router.push(this.backUrl)
        } else {
          this.$router.push({
            name: 'solutions.create.classes',
            params: { id: this.$route.params.id },
          })
        }
      }
    },

    addNewMedia() {
      this.$v.formData.media.$touch()
      if (this.$v.formData.media.$invalid) {
        return
      }
      let resource = {
        resourceName: 'courses',
        resourceId: this.$route.params.id,
      }
      if (this.$isEnabledFeature('branching')) {
        this.formData.media.branchId = this.course.branches.map((branch) => branch.id)
      }

      this.setFetching(true)
      this.attemptLibraryFileCreationOnResource({ data: this.formData.media, resource: resource })
        .then((response) => {
          this.pushMediaList(response.data)
          this.closeModalAddMedia()
          this.setFeedback({
            message: this.$t('library:feedback.upload.file'),
          })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('library:feedback.upload.file.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    openSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },

    loadCourseLibraryfiles() {
      this.setFetching(true)
      const filter = {
        filter: {
          parent_folder_id: this.formData.media.parent_folder_id,
          course_id: this.$route.params.id,
          course_files_in: 1,
        },
        ...this.queryParams,
      }

      this.attemptCourseLibraryRetrieval({
        courseId: this.$route.params.id,
        data: filter,
      })
        .then(({ data }) => {
          if (Array.isArray(data)) {
            this.mediaItems = data
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    accessFolder(item) {
      if (!item.isFolder) return
      this.formData.media.parent_folder_id = item.id
      !item.editable ? (this.disabledAction = true) : (this.disabledAction = false)
      const filter = {
        filter: {
          parent_folder_id: item.id || null,
          course_id: this.$route.params.id,
          course_files_in: 1,
        },
        ...this.queryParams,
      }

      this.setFetching(true)
      this.attemptCourseLibraryRetrieval({ courseId: this.$route.params.id, data: filter })
        .then(({ data }) => {
          if (Array.isArray(data)) {
            this.mediaItems = data
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
      this.breadcrumbsList.push({ text: item.filename, key: item.id, isEditable: item.editable })
    },

    goToFolder(folderId) {
      this.formData.media.parent_folder_id = folderId
      this.currentFolderId = folderId

      const breadcrumbIndex =
        this.breadcrumbsList.findIndex((breadcrumb) => breadcrumb.key === folderId) + 1

      if (breadcrumbIndex !== -1) {
        const breadcrumb = this.breadcrumbsList[breadcrumbIndex - 1]
        this.disabledAction = !breadcrumb.isEditable
      }

      this.breadcrumbsList = this.breadcrumbsList.slice(0, breadcrumbIndex)

      const filter = {
        filter: {
          parent_folder_id: folderId,
          course_id: this.$route.params.id,
          course_files_in: 1,
        },
      }

      this.setFetching(true)
      this.attemptCourseLibraryRetrieval({ courseId: this.$route.params.id, data: filter })
        .then(({ data }) => {
          if (Array.isArray(data)) {
            this.mediaItems = data
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    openModalPreview(media) {
      if (media.url) {
        this.media = media
        this.modalPreviewActive = true
        return
      }
      this.setFetching(true)
      this.attemptRetrieveLibraryFile(media.id)
        .then((response) => {
          media.url = window.URL.createObjectURL(response.data)
          this.media = media
          this.modalPreviewActive = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    closeModalPreview() {
      this.modalPreviewActive = false
      this.media = null
    },

    openModalAddMedia() {
      this.modalMediaActive = true
    },

    openModalAddMediaOrFolder(isFolder, item) {
      this.formData.media.parent_folder_id = item.id
      if (isFolder) {
        return this.openAddFolderModal()
      }

      this.openModalAddMedia()
    },

    openModalImportMedia(item) {
      this.formData.media.parent_folder_id = item.id
      this.modalImportActive = true
    },

    openAddFolderModal() {
      this.modalAddFolderActive = true
    },

    closeModalAddMedia() {
      this.modalMediaActive = false
      this.resetData()
    },
    resetData() {
      this.formData.media = {
        title: null,
        description: null,
        file: null,
        parent_folder_id: null,
      }
      this.$v.$reset()
    },

    resetMediaForm() {
      this.$v.$reset()
      this.formData.type === 'file' ? (this.formData.url = null) : (this.formData.file = null)
    },

    pushMediaList(media) {
      const parentFolderId = this.formData.media.parent_folder_id
      if (parentFolderId) {
        let folderFound = false
        this.mediaItems = this.mediaItems.map((item) => {
          if (item.id === parentFolderId) {
            folderFound = true
            item.countFiles = (item.countFiles || 0) + 1
          }
          return item
        })
        if (folderFound) {
          this.formData.media.parent_folder_id = null
        } else {
          this.mediaItems.push(media)
        }
      } else {
        this.mediaItems.push(media)
      }
    },

    sliceMediaList(media) {
      this.mediaItems.push(...media)
    },

    parseMediaData(media) {
      return {
        id: media.id,
        title: media.title,
        size: formatFileSize(parseInt(media.vendorMeta.size)),
        type: getFileTypes(media.vendorMeta.getcontenttype),
        metaType: media.meta.type,
        fileName: media.filename,
        description: media.description,
        linked: this.linkedMediaIds.indexOf(media.id) !== -1,
        countFiles: media.countFiles,
      }
    },

    addMediaLink(add, item) {
      if (add) {
        this.formData.mediaLinks.push(item)
      } else {
        let idx = this.linkedMediaIds.indexOf(item.id)
        if (idx > -1) {
          this.formData.mediaLinks.splice(idx, 1)
        }
      }
    },

    saveLinks(links) {
      if (links.length === 0) return

      let filesIds = links.map((item) => {
        return item.id
      })
      let courseId = this.$route.params.id

      const params = {
        filesIds,
        parent_folder_id: this.formData.media.parent_folder_id,
      }

      this.setFetching(true)
      this.attemptAddFilesOnCourse({ courseId, params })
        .then(({ data }) => {
          if (Array.isArray(data)) {
            data.map(this.pushMediaList)
          }
          this.setFeedback({ message: this.$t('library:feedback.import.link') })
          this.closeModalImportMedia()
        })
        .finally(() => {
          this.formData.media.parent_folder_id = 0
          this.setFetching(false)
        })
    },

    deleteLink(media, courseId, filesIds) {
      this.attemptLibraryFileDeleteLibraryOnSession({ courseId, filesIds })
        .then(() => {
          let idx = this.mediaItems.map((item) => item.id).indexOf(media.id)
          if (idx > -1) {
            this.mediaItems.splice(idx, 1)
          }
          if (media.isFolder) {
            this.setFeedback({ message: this.$t('library:feedback.delete.folder') })
          } else {
            this.setFeedback({ message: this.$t('library:feedback.removed.file') })
          }
          this.closeDeleteModalConfirm()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    disassociationLink(media, courseId, filesIds) {
      this.attemptLibraryFileCourseDisassociation({ courseId, filesIds })
        .then(() => {
          let idx = this.mediaItems.map((item) => item.id).indexOf(media.id)
          if (idx > -1) {
            this.mediaItems.splice(idx, 1)
          }
          if (media.isFolder) {
            this.setFeedback({ message: this.$t('library:feedback.delete.folder') })
          } else {
            this.setFeedback({ message: this.$t('library:feedback.removed.file') })
          }
          this.closeDeleteModalConfirm()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    confirmDelete(item) {
      this.currentDeleteMedia = item
      this.closeModalConfirmDelete = true
    },

    closeDeleteModalConfirm() {
      this.closeModalConfirmDelete = false
    },

    removeLink() {
      let filesIds = [this.currentDeleteMedia.id]
      let courseId = this.$route.params.id
      const media = this.currentDeleteMedia

      this.setFetching(true)
      media.courses.length > 0
        ? this.disassociationLink(media, courseId, filesIds)
        : this.deleteLink(media, courseId, filesIds)
    },

    downloadMedia(media) {
      this.setFetching(true)
      this.attemptDownloadLibraryFileRetrieval(media).finally(() => {
        this.setFetching(false)
      })
    },

    openModalConfirm() {
      if (!this.canWrite('courses')) {
        return this.leave()
      }
      this.modalConfirm = true
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

    changeTools(payload) {
      if (!this.course.active) return
      this.confirmToolsModal.payload = { ...payload }
      this.confirmToolsModal.active = true
      this.confirmToolsModal.adding = payload.checked
    },

    cancelChangeTools() {
      this.confirmToolsModal.active = false
      const toolValue = this.confirmToolsModal.payload.value
      if (!toolValue) return

      if (this.confirmToolsModal.adding) {
        const index = this.formData.tools.findIndex((tool) => tool === `${toolValue}`)
        if (index !== -1) this.formData.tools.splice(index, 1)
      } else this.formData.tools.push(toolValue)
    },

    confirmChangeTools() {
      this.confirmToolsModal.active = false
    },

    parseToolName(tool) {
      if (!tool) return
      let toolName = tool.toLowerCase().replaceAll(' ', '.')
      if (toolName in parseTools) toolName = parseTools[toolName]
      return toolName
    },

    getToolTranslations(tool) {
      return this.$t('solutions:tools.' + this.parseToolName(tool))
    },

    getToolConfigs(tool) {
      const tConfigs = this.tools
        .find((t) => t.alias === tool)
        .additionalConfigs.map((item) => {
          return {
            value: item,
            label: this.$t(`solutions:tools.${tool.toLowerCase()}.${item}`),
          }
        })

      if (tool === 'Biometrics' && !this.Courses.current.workloadLimit) {
        return tConfigs.filter((item) => !this.biometricWorkloadFlags.includes(item.value))
      }

      return tConfigs
    },
    resetChatbotForm() {
      this.validCode = true
      this.$v.ai_tutor_code.$reset()
    },

    closeModalImportMedia() {
      this.modalImportActive = false
    },
    closeModalAddFolder() {
      this.modalAddFolderActive = false
    },
    updateOrders(item) {
      let order = {}
      if (item && item.property) {
        order[item.property] = item.type
      }
      this.queryParams.order = order

      this.loadCourseLibraryfiles()
    },
  },
}
</script>

<template>
  <div class="solutions-create step-02">
    <ContentHeader
      :title="isEditing ? Courses.current.name : $t('solutions.create:header.title')"
      light-theme
      fixed
    >
      <Action
        slot="back"
        :text="$t('global:back.solutions')"
        type="button"
        icon="keyboard_backspace"
        class="btn-back text-color"
        @click="openModalConfirm()"
      />
      <ActionBar
        slot="actionbar"
        profile
      />
      <Action
        v-if="notEqualsProfile('student') && canWrite('courses')"
        slot="buttons"
        :text="$t('global:form.save')"
        :dark="accessibility"
        type="button"
        flat
        @click="submit(false)"
      />
    </ContentHeader>
    <div class="mt-4 bg-black-50">
      <div class="center">
        <div
          class="solutions-create-header"
          :class="{ 'theme-dark': themeDark }"
        >
          <h2 class="solutions-create-title text-color">
            {{ $t('global:form.step', { num: getActivePage(2) }) }}
          </h2>
          <p class="solutions-create-description text-color">
            {{ $t('solutions.create.tools:header.description') }}
          </p>
        </div>
        <div class="tools">
          <form class="form clearfix text-color">
            <checkbox
              v-model="formData.tools"
              :items="tools.filter((tool) => !tool.additionalConfigs)"
              :dark="themeDark"
              class="tools"
              switch-type
              @change="changeTools"
            >
              <template
                v-if="data.item.value"
                slot="additional-fields"
                slot-scope="data"
              >
                <section
                  v-if="
                    data.item.item.label === $t('solutions:tools.forum') &&
                    $isEnabledFeature('forum_evaluation')
                  "
                  class="checkbox__options"
                >
                  <div class="checkbox__description">
                    <p class="text-color">{{ $t('solutions:tools.forum.description') }}</p>
                  </div>

                  <div class="flex gap-3 align-items-center mt-2">
                    <p class="text-color">{{ $t('global:max.grade') }}</p>
                    <InputField
                      v-model="forumScore"
                      :max="10"
                      :min="0"
                      :step="0.1"
                      :validation="$v.forumScore"
                      type="number"
                      class="text-color flex-1"
                    />

                    <Tooltip
                      :width="300"
                      :uppercase="false"
                      :bold-font="false"
                      medium-font
                      arrow
                    >
                      <template #activator="{ on }">
                        <Icon
                          name="help"
                          size="small"
                          wrapper
                          class="text-color cursor-pointer"
                          pack="material"
                          @mouseenter.native="on.mouseenter"
                          @mouseleave.native="on.mouseleave"
                        />
                      </template>
                      <span class="text">{{ $t('solutions:tools.forum.max.grade:tooltip') }}</span>
                    </Tooltip>
                  </div>
                </section>
                <section
                  v-if="data.item.item.label === $t('solutions:tools.ai.tutor')"
                  class="checkbox__options"
                >
                  <div class="checkbox-description__chatbot">
                    <p class="text-color">{{ $t('solutions:tools.chatbot.integration.code') }}</p>
                  </div>

                  <div class="chatbot__input">
                    <InputField
                      v-model="ai_tutor_code"
                      dark
                      :counter="50"
                      placeholder="00000000"
                      :validation="$v.ai_tutor_code"
                      prevent-focus
                      @input="resetChatbotForm"
                    />
                  </div>
                </section>
              </template>
            </checkbox>

            <div
              v-if="$isEnabledFeature('biometrics')"
              class="tools__facial-recognition"
            >
              <Checkbox
                v-model="biometricTool"
                :items="[{ label: $t('solutions:tools.biometrics'), value: true }]"
                class="tools"
                switch-type
              />

              <div
                v-if="biometricTool"
                class="tools__facial-recognition-options"
              >
                <!-- eslint-disable -->
                <p
                  v-html="$t('solutions.create.tools:biometrics')"
                  class="form__description text-color mb-3"
                ></p>
                <!-- eslint-enable -->

                <Checkbox
                  v-model="biometricToolConfigs"
                  :items="getToolConfigs('Biometrics')"
                  :dark="themeDark"
                  :validation="$v.biometricToolConfigs"
                  class="biometric-tool"
                />
              </div>
            </div>
          </form>
        </div>
        <div
          v-if="!hasCustomClassroomRedirectEnv"
          class="form"
        >
          <TitleDescription
            :title="$t('solutions.create.tools:redirect.student.title')"
            :description="$t('solutions.create.tools:redirect.student.description')"
            dark
          >
            <SelectField
              v-model="formData.custom_classroom_redirect"
              class="mt-6"
              :label="$t('solutions.create.tools:redirect.student.input.title')"
              :validation="$v.formData.custom_classroom_redirect"
              :items="customClassroomRedirectOptions"
              :allow-clear="false"
              dark
            />
            <TitleDescription
              class="preview-wrapper"
              :description="$t('global:preview')"
            >
              <img
                :src="`/assets/images/themes/default/fto/preview_${
                  formData.custom_classroom_redirect || 'panel'
                }.jpg`"
                :alt="$t('global:preview')"
              />
            </TitleDescription>
          </TitleDescription>
        </div>

        <div v-if="notEqualsProfile('student') && canWrite('courses') && isLibraryActive">
          <h3 class="library-title text-color">{{ $t('solutions:tools.medias.course.title') }}</h3>
          <p class="library-description text-color">{{ $t('solutions:tools.medias.course.description') }}</p>

          <div class="flex gap-3 align-items-center justify-content-between content-tools-actions">
            <ActionSubmenu
              class="library-actions-submenu"
              :show.sync="showSubmenu"
            >
              <Action
                slot="button"
                :text="$t('solutions.create.tools:library.add')"
                type="button"
                secondary
                large
                :disabled="disabledAction"
                @click="openSubmenu"
              />
              <template slot="actions">
                <Action
                  :text="$t('solutions.create.tools:library.import')"
                  :dark="themeDark"
                  type="button"
                  icon="folder-multiple-image"
                  icon-size="small"
                  secondary
                  small
                  @click="modalImportActive = true"
                />

                <Action
                  :text="$t('solutions.create.tools:library.upload')"
                  :dark="themeDark"
                  type="button"
                  icon="file_upload"
                  icon-size="small"
                  secondary
                  small
                  @click="openModalAddMedia()"
                />

                <Action
                  :text="$t('library:modal.title.add.folder')"
                  :dark="themeDark"
                  type="button"
                  icon="folder"
                  icon-size="small"
                  secondary
                  small
                  @click="openAddFolderModal()"
                />
              </template>
            </ActionSubmenu>
            <div class="solution-tools-order">
              <FilterListOrder
                slot="order"
                :options="filterListOrderOptions"
                on-server
                @update-orders="updateOrders"
              />
            </div>
          </div>
          <div class="py-4 h-auto">
            <LibraryDatatable
              :items="mediaItems"
              :breadcrumbs-list="breadcrumbsList"
              class="library-datatable-solution"
              @openAddMediaModal="openModalAddMediaOrFolder"
              @openAddImportModal="openModalImportMedia"
              @removeFile="confirmDelete"
              @accessFolderContent="accessFolder"
              @goToFolder="goToFolder"
              @openModalPreview="openModalPreview"
            />
          </div>
        </div>

        <Pagination
          v-if="pageCount"
          ref="pagination"
          class-wrapper="mx-auto my-8"
          :active-first-last="false"
          :active-page="getActivePage(2)"
          :dark="themeDark"
          :prev-page="getBackRoute"
          :page-count="pageCount"
          :float="$media.mobile"
          disable-items-per-page
          block-layout
          show-all-pages
          @next-page="submit(true)"
          @previous-page="submit(false, getBackRoute)"
          @go-to-page="($e) => submit(true, $e)"
        />
      </div>
    </div>

    <AddFolderModal
      v-if="modalAddFolderActive"
      :parent-id="formData.media.parent_folder_id"
      @close="closeModalAddFolder"
      @refresh="pushMediaList"
    />

    <ModalAddImport
      v-if="modalImportActive"
      :modal-import-active="modalImportActive"
      :selected-option="selectedOption"
      :horizontal-switch-options="horizontalSwitchOptions"
      :title="isEditing ? Courses.current.name : $t('solutions.create:header.title')"
      :prop-id="$route.params.id"
      @closeModalImportMedia="closeModalImportMedia"
      @add-links="saveLinks"
    />

    <Modal
      :active.sync="modalMediaActive"
      @close="closeModalAddMedia()"
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('library:modal.subtitle') }}</span>
        <h2 class="modal-title text-color">{{ $t('library:modal.title.add') }}</h2>
        <form @submit.prevent="addNewMedia">
          <SelectField
            v-model="formData.media.type"
            :label="$t('global:form.type')"
            :show-optional="false"
            :items="fileTypeOptions"
            :validation="$v.formData.media.type"
            dark
            @input="resetMediaForm"
          />
          <InputField
            v-model="formData.media.title"
            :label="$t('global:form.title')"
            :counter="100"
            :validation="$v.formData.media.title"
            dark
          />
          <TextareaField
            v-model="formData.media.description"
            :label="$t('global:form.description')"
            :counter="280"
            :rows="1"
            :max-rows="5"
            :validation="$v.formData.media.description"
            auto-grow
            dark
          />
          <div v-if="formData.media.type === 'file'">
            <FileField
              v-model="formData.media.file"
              :label="$t('global:form.attach.file')"
              :validation="$v.formData.media.file"
              dark
            />
          </div>
          <div v-if="formData.media.type === 'external_link'">
            <InputField
              v-model="formData.media.url"
              :label="$t('global:external.media.url')"
              :validation="$v.formData.media.url"
              dark
            />
          </div>
          <div class="form-submit text-center">
            <Action
              :text="$t('global:add')"
              type="button"
              secondary
              large
              submit
              fixed-width
            />
          </div>
        </form>
      </div>
    </Modal>

    <ModalPreview
      v-if="media"
      :media="media"
      :is-active="modalPreviewActive"
      @close="closeModalPreview"
      @download="downloadMedia(media)"
    />

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
          <h3 class="modal-confirm-title">{{ $t('solutions.create:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('solutions.create:modal.confirm.message') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            v-if="isEditing && !isDeeplyEqual(oldFormData, formData.tools)"
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
      :active="confirmToolsModal.active"
      :cancel="false"
    >
      <ModalConfirm
        :active="confirmToolsModal.active"
        :title="confirmToolsModalTitle"
        :confirm-btn-text="confirmToolsModalBtn"
        @close="cancelChangeTools"
        @confirm="confirmChangeTools"
      >
        <p v-if="confirmToolsModal.adding">
          {{ $t('solutions.create.tools:confirm_modal.add.message') }}
        </p>
        <p v-else>{{ $t('solutions.create.tools:confirm_modal.remove.message') }}</p>
      </ModalConfirm>
    </Modal>

    <ModalConfirm
      :title="$t('library:modal.confirm.title')"
      :active="closeModalConfirmDelete"
      :confirm-btn-text="$t('global:confirm')"
      @close="closeDeleteModalConfirm"
      @confirm="removeLink"
    >
    </ModalConfirm>

    <RouterView
      :course="course"
      @download="downloadMedia"
    />
  </div>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';

.library-datatable-solution {
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 40px;
}
</style>
