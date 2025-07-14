<script>
import { mapActions, mapState } from 'vuex'
import { required, email, requiredIf, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
import usernameValidator from '@/support/customValidators/usernameValidator'
import { withParams } from 'vuelidate/lib/validators/common'
import flatten from 'lodash/flatten'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import BranchSelector from '@/components/shared/BranchSelector'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import Datepicker from '@/components/general/Datepicker'
import EmptyMessage from '@/components/general/EmptyMessage'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import OptInField from '@/components/general/OptInField'
import SelectField from '@/components/general/SelectField'
import Tabs from '@/components/general/Tabs'
import TextareaField from '@/components/general/TextareaField'
import PasswordForceHint from '@/components/general/PasswordForceHint'

import MIN_PASSWORD_SIZE, {
  DEFAULT_MIN_PASSWORD_SIZE,
  DEFAULT_MAX_PASSWORD_SIZE,
} from '@/support/utils/passwordSize'

const ModalConfirm = () => import('@/components/general/ModalConfirm')
const UserEnrollmentsList = () => import('./components/UserEnrollmentsList')

export default {
  name: 'ModalAddUser',

  components: {
    Action,
    BranchSelector,
    Checkbox,
    Datatable,
    Datepicker,
    EmptyMessage,
    InputField,
    Modal,
    SelectField,
    Tabs,
    TextareaField,
    OptInField,
    ModalConfirm,
    PasswordForceHint,
    UserEnrollmentsList,
  },

  mixins: [formScrollValidationMixin],

  data() {
    return {
      emailValidationFetched: false,
      emailWasValidated: false,
      lastInvalidEmail: '',
      uuid: null,
      password: null,
      placeholder: null,
      isCreated: false,
      openModalUser: false,
      openModalConfirm: false,
      deleteUserModal: {
        open: false,
        username: '',
      },
      profilesInfo: [],
      oldProfiles: [],
      userSessionTeams: [],
      availableLanguages: null,
      formData: {
        account: {
          email: null,
          name: null,
          username: null,
          password: null,
          profiles: null,
          language: null,
          branch: [],
        },
        metadata: {},
        responsible: {
          list: [],
        },
      },
      currentBranch: null,
      metadataList: [],
      metadataValidations: {},
      usernameExistsErrorValue: '',
      tabLinks: [
        {
          text: 'community.index:modal.tab.link.account',
        },
        {
          text: 'community.index:modal.tab.link.metadata',
        },
        {
          text: 'community.index:modal.tab.link.enrollments',
        },
        {
          text: 'community.index:modal.tab.link.responsible',
        },
      ],
      tabLinkActive: 0,
      isOpenModalEditingUserConfirm: false,
      isPasswordValid: false,
      dropdownMap: [],
      isDownloading: false,
    }
  },
  validations() {
    return {
      formData: {
        account: {
          name: {
            required,
          },
          username: {
            required,
            usernameValidator,
            usernameExistsValidator: withParams({ type: 'usernameExistsValidator' }, (value) => {
              return !(
                this.usernameExists.length > 0 &&
                value.length > 0 &&
                this.usernameExists === value
              )
            }),
          },
          profiles: {
            required,
          },
          language: {
            required,
          },
          email: {
            required,
            email,
            userEmailExists: withParams({ type: 'userEmailExists' }, (value) => {
              if (value === '' || !email(value)) {
                this.emailValidationFetched = false
              }
              return !this.emailValidationFetched ? true : this.wasEmailValidated || this.isEditing
            }),
          },
          branch: {
            required: requiredIf(function () {
              return this.$isEnabledFeature('branching') && !this.isEditing
            }),
          },
          password: {
            required: requiredIf(function () {
              return !this.isEditing && !this.shouldFillForm
            }),
            minLength: minLength(
              this.$isEnabledFeature('password_requirements')
                ? MIN_PASSWORD_SIZE
                : DEFAULT_MIN_PASSWORD_SIZE
            ),
            maxLength: maxLength(DEFAULT_MAX_PASSWORD_SIZE),
            validPassword: withParams({ type: 'validPassword' }, () => {
              return (
                !this.$isEnabledFeature('password_requirements') ||
                this.isPasswordValid ||
                this.isEditing ||
                this.shouldFillForm
              )
            }),
          },
        },
        metadata: this.metadataValidations,
        responsible: {},
      },
      deleteUserModal: {
        username: {
          required,
          sameUsername: sameAs(function () {
            return `${this.users.current.username}`.toUpperCase()
          }),
        },
      },
    }
  },

  computed: {
    ...mapState(['users', 'Account', 'fetching', 'accessibility']),
    isEditing() {
      return this.$route.meta.editing === true
    },
    isAuthFieldsChanged() {
      return this.formData.account.username !== this.users.current.username && this.canWrite('users:username')
    },
    profileOptions() {
      return this.users.profiles.map((obj) => ({
        label: obj.alias === 'agent' ? obj.name : this.$t(`global:${obj.alias}`),
        value: obj.id,
      }))
    },
    shouldFillForm() {
      return Boolean(
        this.$route.params.name && this.$route.params.username && this.$route.params.email
      )
    },
    wasEmailValidated() {
      return this.emailWasValidated
    },
    usernameExists() {
      return this.usernameExistsErrorValue
    },
    canChangePassword() {
      return this.isEditing || !this.shouldFillForm
    },
    isEditingOwnUser() {
      return this.uuid && this.uuid === this.Account.user.uuid
    },

    canDeleteUser() {
      const profiles = this.profilesInfo || []
      const userIsAdmin = profiles.find((profile) => profile.alias === 'admin')
      const userIsOnlyStudent = profiles.length === 1 && profiles[0].alias === 'student'
      return this.isEditing && this.canWrite('users') && !userIsAdmin && userIsOnlyStudent
    },

    disableConfirmDeleteModal() {
      return this.$v.deleteUserModal.$invalid
    },
  },

  created() {
    if (this.shouldFillForm) {
      this.emailWasValidated = true
      this.formData.account.email = this.$route.params.email
      this.formData.account.name = this.$route.params.name
      this.formData.account.username = this.$route.params.username
      this.placeholder = '••••••'
    }

    if (!this.isEditing) {
      this.setUsersCurrent({ branches: [] })
    }

    if (this.isEditing && this.users.current) {
      this.setCurrentBranch()

      let profiles = this.users.current.profiles
        ? this.users.current.profiles.map(({ id }) => String(id))
        : []

      this.placeholder = '••••••'
      this.uuid = this.users.current.uuid
      this.formData.account.email = this.users.current.email
      this.formData.account.name = this.users.current.name
      this.formData.account.username = this.users.current.username
      this.formData.account.profiles = profiles
      this.formData.account.branch = this.users.current.branches
      this.oldProfiles = JSON.parse(JSON.stringify(profiles))
      this.profilesInfo = this.users.current.profiles || []
      this.$v.formData.account.$reset()
      this.setFetching(true)
      let requestPromises = [
        this.attemptGetUserLanguage(this.users.current.uuid || this.$route.params.id),
        this.attemptGetAvailableLanguages(),
      ]
      Promise.all(requestPromises)
        .then(([settings, lang]) => {
          this.formData.account.language = settings.data.language

          this.availableLanguages = lang.data.map((lang) => {
            if (!this.isEditing && lang.default === true) {
              this.formData.account.language = lang.language.alias
            }
            return {
              text: this.$t(`global:locale.${lang.language.alias}`),
              value: lang.language.alias,
              default: lang.default,
            }
          })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t(`community.index:feedback.request.user.data.error`) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    } else {
      this.openModalUser = true
      this.isCreated = true

      this.attemptGetAvailableLanguages().then((lang) => {
        this.availableLanguages = lang.data.map((lang) => {
          if (!this.isEditing && lang.default === true) {
            this.formData.account.language = lang.language.alias
          }
          return {
            text: this.$t(`global:locale.${lang.language.alias}`),
            value: lang.language.alias,
            default: lang.default,
          }
        })
      })
    }
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptUserCreation',
      'attemptUserUpdate',
      'attemptUserDelete',
      'addUsersItems',
      'setUsersCurrent',
      'attemptAccountValidation',
      'attemptUserAccountLinkage',
      'attemptUserMetadataRetrieval',
      'attemptUserMetadataUpdate',
      'attemptGetSessionsResponsibleUsersList',
      'attemptSessionTeamsRetrieval',
      'attemptGetAvailableLanguages',
      'attemptGetUserLanguage',
      'attemptGetCurrentBranchById',
      'logout',
    ]),
    changePassword() {
      this.$router.push({
        name: 'community.users.edit.password',
        params: { id: this.users.current.uuid },
        query: this.$route.query,
      })
    },
    submit() {
      const originalUsername = this.formData.account.username
      
      if (!this.canWrite('users:username') && this.isEditing) {
        this.formData.account.username = 'bypasstouch'
      }
      this.$v.formData.account.$touch()

      this.$nextTick(() => {
        if (!this.canWrite('users:username') && this.isEditing) {
          this.formData.account.username = originalUsername
        }
        this.scrollToInputError(this.$refs.form)
      })

      if ((this.emailWasValidated || this.isEditing) && !this.$v.formData.account.$invalid) {
        if (this.uuid) {
          if (this.isAuthFieldsChanged) {
            this.isOpenModalEditingUserConfirm = true
          } else {
            this.submitUpdate(true)
          }
        } else {
          this.submitCreation()
        }
      } else if (
        !this.isEditing &&
        !this.emailWasValidated &&
        !this.$v.formData.account.email.$invalid
      ) {
        this.setFetching(true)
        this.validateEmail()
      }
    },
    submitCreation() {
      if (this.shouldFillForm) {
        const { email, name, profiles, branch } = this.formData.account

        this.setFetching(true)
        this.attemptUserAccountLinkage({ email, name, profiles, branch })
          .then(({ data }) => {
            this.addUsersItems(data)
            this.setUsersCurrent(data)
            this.setCurrentBranch()
            this.uuid = data.uuid
            this.getUserMetadata()
            this.$router.push({
              name: 'community.users.edit',
              params: { id: data.uuid },
              query: this.$route.query,
            })
            this.setFeedback({ message: this.$t('community.index:feedback.created.success') })
          })
          .catch(({ response }) => {
            this.setFeedback({
              message: this.$t(
                `community.index:feedback.created.error:${response.data.message.replace(/_/g, '.')}`
              ),
              type: 'error',
            })
            this.closeModal()
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else {
        const params = {
          ...this.formData.account,
        }

        this.usernameExistsErrorValue = ''
        this.setFetching(true)
        this.attemptUserCreation(params)
          .then(({ data }) => {
            this.emailWasValidated = false
            this.addUsersItems(data)
            this.setUsersCurrent(data)
            this.setCurrentBranch()
            this.uuid = data.uuid
            this.getUserMetadata().then(() => {
              this.setFetching(false)
            })
            this.$router.push({
              name: 'community.users.edit',
              params: { id: data.uuid },
              query: this.$route.query,
            })
            this.profilesInfo = this.users.current.profiles || []
            this.setFeedback({ message: this.$t('community.index:feedback.created.success') })
          })
          .catch(({ response }) => {
            if (Object.keys(response).length === 0) {
              this.setFeedback({
                message: this.$t('community.index:feedback.created.error'),
                type: 'error',
              })
            } else {
              if (response.data.message === 'username_already_exists') {
                this.usernameExistsErrorValue = this.formData.account.username
              } else {
                let feedbackMessage = ''
                if (
                  response.data.hint.errors &&
                  response.data.hint.errors.password === 'invalid_password'
                ) {
                  feedbackMessage = response.data.hint.errors.password
                } else {
                  feedbackMessage = response.data.message
                }
                this.setFeedback({
                  message: this.$t(
                    `community.index:feedback.created.error:${feedbackMessage.replace(/_/g, '.')}`
                  ),
                  type: 'error',
                })
              }
            }
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    async submitUpdate(close) {
      let params = {
        ...this.formData.account,
        uuid: this.uuid,
        canChangeUsername: this.canWrite('users:username')
      }

      if (params.password) delete params.password
      if (!this.$isEnabledFeature('branching')) delete params.branch

      this.setFetching(true)
      this.userSessionTeams = await this.retrieveUserSessionTeams()
      if (this.userSessionTeams.length > 0) {
        this.openModalConfirm = true
        this.setFetching(false)
      } else {
        try {
          const { data } = await this.attemptUserUpdate(params)
          if (this.isEditingOwnUser && this.isAuthFieldsChanged)
            this.$router.push({ name: 'auth.logout' })
          const newUserData = { ...this.users.current, ...data }
          this.setUsersCurrent(newUserData)
          this.getUserMetadata().then(() => {
            this.setFetching(false)
          })
          this.$v.formData.account.$reset()
          if (close) {
            this.closeModal()
            this.setFeedback({ message: this.$t('community.index:feedback.updated') })
          }
        } catch ({ response }) {
          const errorMessage = response.data.message

          if (errorMessage === 'identity_provider_user_already_exists') {
            this.setFeedback({
              message: this.$t('community.index:feedback.updated.error.user.email.exists'),
              type: 'error',
            })
          } else if (errorMessage === 'email_already_exists') {
            this.setFeedback({
              message: this.$t('community.index:feedback.updated.error.email.exists'),
              type: 'error',
            })
          } else if (errorMessage === 'user_can_not_add_another_user_on_this_branch') {
            this.setFeedback({
              message: this.$t('community.index:feedback.updated.error.cannot.add.user.branch'),
              type: 'error',
            })
          } else if (errorMessage === 'username_already_exists') {
            this.setFeedback({
              message: this.$t('community.index:feedback.updated.error.user.exists'),
              type: 'error',
            })
          } else {
            this.closeModal()
            this.setFeedback({
              message: this.$t('community.index:feedback.updated.error'),
              type: 'error',
            })
          }
        } finally {
          this.setFetching(false)
        }
      }
    },
    retrieveUserSessionTeams() {
      let disassociatedProfiles = this.oldProfiles.filter(
        (profileId) => !this.formData.account.profiles.includes(profileId)
      )
      if (disassociatedProfiles.length > 0) {
        const promises = disassociatedProfiles.map((profile) => {
          return this.attemptSessionTeamsRetrieval({
            profileId: profile,
            userId: this.users.current.id,
          })
        })

        return Promise.all(promises).then((responses) => {
          let response = flatten(responses.map(({ data }) => data))
          response = response.reduce((prev, entry) => {
            if (entry === '') {
              return prev
            }
            const key = entry.session.uuid
            if (!(key in prev)) {
              prev[key] = entry
            }
            return prev
          }, [])
          return Object.values(response)
        })
      }

      return []
    },
    closeModal() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },
    async acceptModalEditingOwnUserConfirm() {
      await this.submitUpdate(true)
      this.isOpenModalEditingUserConfirm = false
    },
    closeModalEditingOwnUserConfirm() {
      this.isOpenModalEditingUserConfirm = false
    },
    validateEmail() {
      this.emailValidationFetched = false
      this.emailWasValidated = false

      this.$v.formData.account.$reset()

      this.attemptAccountValidation(this.formData.account.email)
        .then(() => {
          this.emailValidationFetched = true
          this.emailWasValidated = true
        })
        .catch(({ response }) => {
          switch (response.data.message) {
            case 'user_exists': {
              this.emailValidationFetched = true
              this.lastInvalidEmail = this.formData.account.email
              this.$v.formData.account.email.$touch()
              this.setFeedback({
                message: this.$t('community.index:feedback.created.error.user.exists'),
                type: 'error',
              })
              break
            }
            case 'application_user_not_exists': {
              const { name, username, email } = response.data.hint.account

              this.$router.push({
                name: 'community.users.link',
                params: { name, username, email },
              })
              break
            }
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    checkEmailChange() {
      if (this.emailValidationFetched && this.lastInvalidEmail !== this.formData.account.email) {
        this.emailValidationFetched = false
      }
    },
    changeTab(index) {
      this.tabLinkActive = index
      switch (index) {
        case 0:
          if (
            !this.$v.formData.account.$invalid &&
            (this.$v.formData.account.name.$dirty ||
              this.$v.formData.account.password.$dirty ||
              this.$v.formData.account.profiles.$dirty)
          ) {
            this.submitUpdate(false)
          }
          break
        case 1:
          return this.getUserMetadata()
        case 3:
          return this.listResponsible()
      }
    },
    saveMeta() {
      this.$v.formData.metadata.$touch()
      if (!this.$v.formData.metadata.$invalid) {
        this.setFetching(true)
        this.attemptUserMetadataUpdate({
          userId: this.users.current.id,
          metadata: this.createObjMetadata(),
        })
          .then(() => {
            this.closeModal()
            this.setFeedback({
              message: this.$t('community.index:feedback.metadata.update.success'),
            })
          })
          .catch(() => {
            this.closeModal()
            this.setFeedback({
              message: this.$t('community.index:feedback.metadata.update.error'),
              type: 'error',
            })
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    createObjMetadata() {
      let data = { values: {} }
      this.metadataList.map((item) => {
        data.values[item.alias] = this.formData.metadata[item.alias]
      })
      return data
    },
    getUserMetadata() {
      this.setFetching(true)
      return this.attemptUserMetadataRetrieval(this.users.current.id)
        .then(({ data }) => {
          this.metadataList = data.map((item) => {
            this.$set(this.formData.metadata, item.alias, item.value)
            if (item.required === true) {
              this.metadataValidations[item.alias] = { required }
            }
            if (item.type === 'select' || item.type === 'multiple_select') {
              item.hasHiddenFields = Object.keys(item.options[0].fields).length > 1
              item.hiddenValue = null
              item.options = item.options.map((option) => {
                let fieldNames = Object.keys(option.fields)
                let hiddenValue = fieldNames.length > 1 ? option.fields[fieldNames[1]] : null
                return {
                  text: option.fields[fieldNames[0]],
                  value: option.id,
                  hidden: hiddenValue,
                }
              })
            }
            return item
          })
          this.setFetching(false)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    addHiddenValue(value, item) {
      if (item.hasHiddenFields) {
        item.hiddenValue = item.options.find((option) => option.value === value).hidden
      }
    },
    listResponsible() {
      if (this.formData.responsible.list.length > 0) {
        return
      }
      this.setFetching(true)
      this.attemptGetSessionsResponsibleUsersList(this.users.current.uuid)
        .then(({ data }) => {
          this.formData.responsible.list = data.map((data) => {
            return {
              offering: data.offering_name,
              solution: data.course_name,
              session: data.session_name,
              profile: data.profile_name,
            }
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    closeModalConfirm() {
      this.userSessionTeams = []
      this.openModalConfirm = false
    },

    toggleDeleteModal() {
      this.deleteUserModal.open = !this.deleteUserModal.open
    },

    closeDeleteModal() {
      this.deleteUserModal.open = false
      this.deleteUserModal.username = ''
    },

    confirmDeleteModal() {
      this.setFetching(true)
      this.attemptUserDelete(this.uuid)
        .then(() => {
          this.setFeedback({ message: this.$t('community.users:modal.delete.confirm.message') })

          this.closeDeleteModal()
          this.closeModal()
        })
        .catch(({ response }) => {
          const message = response.data.message

          if (message === 'user_not_exists' || message === 'user_identity_not_found') {
            this.setFeedback({
              message: this.$t('community.users:modal.delete.error.user.not.exists'),
              type: 'error',
            })
            this.closeDeleteModal()
            this.closeModal()
          } else if (message === 'user_is_not_only_student') {
            this.setFeedback({
              message: this.$t('community.users:modal.delete.error.user.is.not.only.student'),
              type: 'error',
            })
          } else if (message === 'user_is_author_in_course_or_topics') {
            this.setFeedback({
              message: this.$t(
                'community.users:modal.delete.error.user.is.author.in.course.or.topics'
              ),
              type: 'error',
            })
          } else {
            this.setFeedback({ message: this.$t('community.users:modal.delete.erro.generic') })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * Users list does not have full branch tree
     * Send a request to get & set user's branch with all parents
     */
    setCurrentBranch() {
      if (!this.$isEnabledFeature('branching')) return

      const [currentBranch] = this.users.current.branches
      if (!currentBranch) return

      this.setFetching(true)
      this.attemptGetCurrentBranchById(currentBranch.id)
        .then(({ data }) => {
          this.currentBranch = data
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div>
    <Modal
      class="add-user-modal"
      :active="!fetching || tabLinkActive === 2"
      is-page
    >
      <div class="modal-form modal-add-user">
        <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
        <h2 class="modal-title text-color">
          {{
            isEditing && users.current ? users.current.name : $t('community.index:modal.title.add')
          }}
        </h2>
        <div class="modal-description text-color">
          <p class="text-color">
            {{
              isEditing
                ? $t('community.index:modal.description.edit')
                : $t('community.index:modal.description.add')
            }}
          </p>
        </div>
        <Tabs
          v-if="isEditing"
          slot="tabs"
          :links="tabLinks"
          :index-active="tabLinkActive"
          dark
          @tabChange="changeTab($event)"
        />
        <template v-if="tabLinkActive === 0">
          <form
            ref="form"
            @submit.prevent="submit()"
          >
            <InputField
              v-model="formData.account.email"
              :label="$t('global:form.email')"
              :disabled="(emailWasValidated && !isEditing) || !canWrite('users')"
              :validation="$v.formData.account.email"
              autocomplete="email"
              dark
              @blur="checkEmailChange"
            />
            <div
              v-if="!emailWasValidated && !isEditing"
              class="text-right"
            >
              <Action
                type="button"
                :text="$t('community.users:modal.validate.email')"
                flat
                dark
                submit
              />
            </div>
            <template v-if="emailWasValidated || shouldFillForm || isEditing">
              <InputField
                v-model="formData.account.name"
                :label="$t('global:form.name')"
                :counter="250"
                :disabled="!canWrite('users')"
                :validation="$v.formData.account.name"
                autocomplete="name"
                dark
              />
              <InputField
                v-model="formData.account.username"
                :label="$t('global:form.username')"
                :disabled="shouldFillForm || !canWrite('users') || (!canWrite('users:username') && isEditing)"
                :validation="$v.formData.account.username"
                :counter="50"
                autocomplete="username"
                dark
              />

              <InputField
                v-if="!isEditing"
                v-model="formData.account.password"
                :label="$t('global:form.password')"
                :validation="$v.formData.account.password"
                :placeholder="placeholder"
                :disabled="!canChangePassword || !canWrite('users')"
                :disabled-visibility="!canChangePassword"
                :hide-error-details="!$v.formData.account.password.$error"
                type="password"
                autocomplete="new-password"
                dark
              />

              <div
                v-if="!isEditing"
                class="password__hint"
              >
                <PasswordForceHint
                  v-model="isPasswordValid"
                  :password="formData.account.password"
                  :user="formData.account"
                  :validated="$v.formData.account.password.$dirty"
                />
              </div>

              <BranchSelector
                v-model="currentBranch"
                class="mb-5"
                :validation="$v.formData.account.branch"
                @change="formData.account.branch = $event"
              />

              <SelectField
                v-model="formData.account.language"
                :items="availableLanguages"
                :label="$t('global:form.select.default.language')"
                :validation="$v.formData.account.language"
                dark
              />
              <Checkbox
                v-model="formData.account.profiles"
                :description="$tc('global:form.profile', 1)"
                :items="profileOptions"
                :validation="$v.formData.account.profiles"
                :disabled="!canWrite('users')"
                force-array
                switch-type
                dark
              />

              <Action
                v-if="isEditing"
                :text="$t('community.users:modal.change.password')"
                type="button"
                flat
                dark
                @click="changePassword"
              />
              <div class="form-submit text-center">
                <Action
                  v-if="canWrite('users')"
                  :text="uuid ? $t('global:form.save') : $t('global:register')"
                  type="button"
                  secondary
                  large
                  submit
                  fixed-width
                />
              </div>

              <div
                v-if="canDeleteUser"
                class="delete-user text-center"
              >
                <Action
                  type="button"
                  :text="$t('community.users:modal.delete.user')"
                  flat
                  dark
                  @click="toggleDeleteModal"
                />
              </div>

              <ModalConfirm
                v-if="canDeleteUser"
                :active="deleteUserModal.open"
                :title="
                  $t('community.users:modal.delete.user.title', {
                    name: users.current.username,
                  })
                "
                :disable-confirm="disableConfirmDeleteModal"
                :confirm-btn-text="$t('community.users:modal.delete.confirm.button')"
                @confirm="confirmDeleteModal"
                @close="closeDeleteModal"
              >
                <slot name="description">
                  <p
                    v-if="users.current.username"
                    v-html="
                      $t('community.users:modal.delete.confirm.description', {
                        username: `${users.current.username}`.toUpperCase(),
                      })
                    "
                  ></p>
                  <InputField
                    v-model="deleteUserModal.username"
                    :label="$t('community.users:modal.delete.confirm.label')"
                    :validation="$v.deleteUserModal.username"
                    :disabled="!canDeleteUser"
                    disable-paste
                  />
                </slot>
              </ModalConfirm>
            </template>
          </form>
        </template>
        <template v-if="tabLinkActive === 1">
          <EmptyMessage v-if="metadataList.length === 0">
            <h2>{{ $t('community.index:metadata.empty.title') }}</h2>
            <p>{{ $t('community.index:metadata.empty.message') }}</p>
          </EmptyMessage>
          <form
            v-if="metadataList.length"
            @submit.prevent="saveMeta()"
          >
            <template v-for="(metadata, index) in metadataList">
              <OptInField
                v-if="metadata.type === 'opt_in'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :validation="$v.formData.metadata[metadata.alias]"
                :config="metadata.parameters.config"
                :disabled="metadata.adminWrite && Account.user.currentProfile !== 'admin'"
                dark
              />
              <Datepicker
                v-if="metadata.type === 'date'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.alias]"
                :disabled="!canWrite('users')"
                dark
                allow-input
              />
              <Datepicker
                v-if="metadata.type === 'datetime'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.alias]"
                :disabled="!canWrite('users')"
                time
                dark
              />
              <TextareaField
                v-if="metadata.type === 'text'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.alias]"
                :disabled="!canWrite('users')"
                auto-grow
                dark
              />
              <InputField
                v-if="metadata.type === 'string'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :is-form-unique="false"
                :label="metadata.name"
                :disabled="!canWrite('users')"
                :validation="$v.formData.metadata[metadata.alias]"
                :mask="metadata.valueFormat.format.format"
                dark
              />
              <InputField
                v-if="metadata.type === 'int'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :is-form-unique="false"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.alias]"
                :disabled="!canWrite('users')"
                type="number"
                dark
              />
              <SelectField
                v-if="metadata.type === 'select'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :is-form-unique="false"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.alias]"
                :items="metadata.options"
                :disabled="!canWrite('users')"
                dark
                @input="addHiddenValue($event, metadata)"
              >
                <template
                  v-if="metadata.hasHiddenFields && metadata.hiddenValue"
                  slot="details"
                >
                  <span
                    class="form-select-hidden-value"
                    v-html="$t('global:form.hidden.value', { value: metadata.hiddenValue })"
                  ></span>
                </template>
              </SelectField>
              <SelectField
                v-if="metadata.type === 'multiple_select'"
                :key="index"
                v-model="formData.metadata[metadata.alias]"
                :is-form-unique="false"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.alias]"
                :items="metadata.options"
                :disabled="!canWrite('users')"
                multiple
                dark
              />
            </template>
            <div class="form-submit text-center">
              <Action
                v-if="canWrite('users')"
                :text="$t('global:form.save')"
                type="button"
                secondary
                large
                submit
                fixed-width
              />
            </div>
          </form>
        </template>
        <template v-if="tabLinkActive === 2">
          <UserEnrollmentsList :user-uuid="users.current.uuid" />
        </template>
        <template v-if="tabLinkActive === 3">
          <EmptyMessage v-if="formData.responsible.list.length === 0">
            <h2 v-html="$t('community.index:modal.responsible.empty.message')"></h2>
          </EmptyMessage>
          <Datatable
            v-if="formData.responsible.list.length"
            :items="formData.responsible.list"
            :light="true"
            dark
          >
            <template
              v-if="!$media.mobile"
              slot="thead"
            >
              <tr class="tr-colspan">
                <th
                  class="th"
                  width="30%"
                >
                  {{ $t('community.index:modal.datatable.header.1') }}
                </th>
                <th
                  class="th"
                  width="30%"
                >
                  {{ $t('community.index:modal.datatable.header.2') }}
                </th>
                <th
                  class="th"
                  width="30%"
                >
                  {{ $t('community.index:modal.datatable.header.3') }}
                </th>
                <th
                  class="th text-center"
                  width="10%"
                >
                  {{ $t('community.index:modal.datatable.header.5') }}
                </th>
              </tr>
            </template>
            <template
              slot="tbody"
              slot-scope="props"
            >
              <tr
                v-if="$media.mobile"
                class="tr-colspan"
              >
                <td
                  class="label-title-name"
                  colspan="3"
                >
                  <span
                    class="td-text bolder"
                    v-html="props.item.solution ? props.item.solution : '-'"
                  ></span>
                </td>
              </tr>
              <tr class="tr-body">
                <td
                  class="td"
                  :width="$media.mobile ? '33%' : ''"
                >
                  <span
                    v-if="$media.mobile"
                    class="td-text-header"
                    >{{ $t('community.index:modal.datatable.header.1') }}</span
                  >
                  <span
                    class="td-text bolder"
                    v-html="props.item.offering ? props.item.offering : '-'"
                  ></span>
                </td>
                <td
                  v-if="!$media.mobile"
                  class="td"
                >
                  <span class="td-text bolder">{{ props.item.solution }}</span>
                </td>
                <td
                  class="td"
                  :width="$media.mobile ? '33%' : ''"
                >
                  <span
                    v-if="$media.mobile"
                    class="td-text-header"
                    >{{ $t('community.index:modal.datatable.header.3') }}</span
                  >
                  <span class="td-text bolder">{{ props.item.session }}</span>
                </td>
                <td
                  class="td text-center"
                  :width="$media.mobile ? '33%' : ''"
                >
                  <span
                    v-if="$media.mobile"
                    class="td-text-header"
                    >{{ $t('community.index:modal.datatable.header.5') }}</span
                  >
                  <span class="td-text bolder">{{ props.item.profile }}</span>
                </td>
              </tr>
            </template>
          </Datatable>
        </template>
      </div>
    </Modal>

    <Modal
      :active="openModalConfirm"
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
          <h3 class="modal-confirm-title">{{ $t('community.users:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p>{{ $t('community.users:modal.confirm.description') }}</p>
          </div>
        </div>
        <Datatable :items="userSessionTeams">
          <template slot="thead">
            <tr>
              <th
                class="th"
                colspan="4"
              >
                {{ $t('community.users:modal.confirm.datatable.header.course') }}
              </th>
              <th
                class="th"
                colspan="4"
              >
                {{ $t('community.users:modal.confirm.datatable.header.session') }}
              </th>
            </tr>
          </template>
          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr class="tr-colspan clickable">
              <td
                class="td"
                colspan="4"
              >
                <span class="td-text bolder">{{ props.item.session.course.name }}</span>
              </td>
              <td
                class="td"
                colspan="4"
              >
                <span class="td-text bolder">{{ props.item.session.name }}</span>
              </td>
            </tr>
          </template>
        </Datatable>
        <div class="modal-confirm-footer">
          <Action
            :text="$t('global:understood')"
            type="button"
            class="btn-right"
            flat
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </Modal>

    <ModalConfirm
      style=""
      :active="isOpenModalEditingUserConfirm"
      :title="$t('community.users:modal.editAuthInfo.confirm.title')"
      @confirm="acceptModalEditingOwnUserConfirm"
      @close="closeModalEditingOwnUserConfirm"
    >
      <slot name="description">
        <p class="text-color">{{ $t('community.users:modal.editAuthInfo.confirm.text') }}</p>
      </slot>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import 'ModalAddUser.scss';
</style>
