<script>
import { mapActions, mapState } from 'vuex'
import { required, email } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'

import DatatableInstancePermission from './components/DatatableInstancePermission'
import DatatableClassroomPermission from './components/DatatableClassroomPermission'
import DatatableImpersonatePermission from './components/DatatableImpersonatePermission'
import ToggleVisibility from './components/ToggleVisibility'
import DatatableLGPDPermission from './components/DatatableLGPDPermission'

const actionType = {
  WRITE: 'write',
  READ: 'read',
  REMOVE: 'remove',
  EVALUATE: 'evaluate',
}

export default {
  name: 'ModalAddProfile',

  components: {
    Action,
    FormSection,
    InputField,
    ToggleVisibility,
    Modal,
    DatatableInstancePermission,
    DatatableClassroomPermission,
    DatatableImpersonatePermission,
    DatatableLGPDPermission,
  },

  mixins: [formScrollValidationMixin],

  data() {
    return {
      formData: {
        name: null,
        active: 1,
        deniedRoutesContexts: [],
        meta: {
          canProfileImpersonate: [],
          email: null,
        },
        denied_data: []
      },
      routes: [],
      contextsPermissions: [],
      selectedPermissions: [],
      allPermissions: [],
      lgpdPermissions: [],
      blockedByDependency: [],
      deniedData: [],
      dependentContexts: [
        {
          context: 'branches',
          dependencies: ['settings'],
        },
      ],
      isVisibleMyCourses: false,
      isVisibleCommunity: false,
      isVisibleMediationPlan: false,
      isVisibleOtherFeatures: false,
      isVisibleDashboardTools: false,
      isVisibleOtherTools: false,
      instancePermissions: [
        {
          key: 'COURSES',
          label: 'community.profiles:modal.permissions.my.courses',
          isVisible: this.isVisibleMyCourses,
        },
        {
          key: 'COMMUNITY',
          label: 'community.profiles:modal.permissions.community',
          isVisible: this.isVisibleCommunity,
        },
        {
          key: 'MEDIATION_PLAN',
          label: 'community.profiles:modal.permissions.mediation.plan',
          isVisible: this.isVisibleMediationPlan,
        },
        {
          key: 'OTHER_TOOLS',
          label: 'community.profiles:modal.permissions.other.features',
          isVisible: this.isVisibleOtherFeatures,
        },
      ],
      instancePermissionsNotPM: [
        {
          key: 'COURSES',
          label: 'community.profiles:modal.permissions.my.courses',
          isVisible: this.isVisibleMyCourses,
        },
        {
          key: 'COMMUNITY',
          label: 'community.profiles:modal.permissions.community',
          isVisible: this.isVisibleCommunity,
        },
        {
          key: 'OTHER_TOOLS',
          label: 'community.profiles:modal.permissions.other.features',
          isVisible: this.isVisibleOtherFeatures,
        },
      ],
      classroomPermissions: [
        {
          key: 'PANEL',
          label: 'community.profiles:modal.permissions.dashboard.tools',
          isVisible: this.isVisibleDashboardTools,
        },
        {
          key: 'OTHER_TOOLS',
          label: 'community.profiles:modal.permissions.other.tools',
          isVisible: this.isVisibleOtherTools,
        },
      ],
    }
  },

  validations: {
    formData: {
      name: {
        required,
      },
      meta: {
        email: {
          email,
        },
      },
    },
  },

  computed: {
    ...mapState(['profiles', 'Account', 'fetching']),

    isEditing() {
      return this.$route.meta.editing === true
    },

    instanceContexts() {
      const contexts = Object.values(this.getProfilesContexts()).map((context) => {
        const contextNew = Object.entries(context)
        return contextNew.map(([groupKey, groupValue]) => ({
          [groupKey]: Object.keys(groupValue).map((context) => {
            const contextPermission = groupValue[context]
            return contextPermission
          }),
        }))
      })

      const allValues = contexts.flat(2).flatMap((item) => {
        return Object.values(item).flat()
      })

      return allValues.filter((item) => !/^classroom:/.test(item))
    },

    blockedProfiles() {
      return this.formData.name === 'Admin' || this.formData.name === 'Student'
    },
  },

  created() {
    const profiles = this.profiles
    this.attemptGetProfilesLGPDOptions()
      .then(({ data }) => {
        this.lgpdPermissions = data.map(d => { return { context: d, blocked_read: false, blocked_write: false } }) || []
      })
      .finally(() => {
        const deniedContexts = profiles.current.deniedData.map(item => item.context)

        this.formData['denied_data'] = profiles.current.deniedData
          .filter(item => deniedContexts.includes(item.context))
          .map(item => ({ blocked_read: true, blocked_write: true, context: item.context }))

        this.lgpdPermissions = this.lgpdPermissions.map(perm => {
          const isDenied = deniedContexts.includes(perm.context)
          return {
            ...perm,
            blocked_read: isDenied,
            blocked_write: isDenied,
          }
        })
      })
    const availableContexts = Object.entries(this.getProfilesContexts())

    if (this.isEditing && profiles.current) {
      const hasMetaEmail = profiles.current.meta && profiles.current.meta.email

      this.formData.id = profiles.current.id
      this.formData.name = profiles.current.name
      if (hasMetaEmail) this.formData.meta.email = profiles.current.meta.email
      this.formData.deniedRoutesContexts = profiles.current.deniedRoutesContexts.filter((item) =>
        availableContexts.push(item.context)
      )
      this.formData.meta.canProfileImpersonate =
        (profiles.current.meta && profiles.current.meta.canProfileImpersonate) || []
    }

    const hasFormDataId = this.formData && this.formData.id
    if (this.isEditing && !hasFormDataId) {
      this.closeModal()
      return
    }

    this.updateContextPermissions()
    this.contextsPermissions.forEach((context) => {
      Object.values(context).forEach((items) => {
        Object.values(items).forEach((subItems) => {
          Object.values(subItems).forEach((item) => {
            this.updateDeniedContexts(item)
          })
        })
      })
    })
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptProfileCreation',
      'attemptProfileUpdate',
      'addProfilesItems',
      'setProfilesCurrent',
      'setUsersPermissionsDenied',
      'attemptGetProfilesLGPDOptions',
    ]),

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.$nextTick(() => this.scrollToInputError())
        return
      }

      this.setFetching(true)
      this.modalAddProfileActive = false

      if (!this.formData.meta.email) {
        this.formData.meta.email = null
      }

      this.formData.id ? this.submitUpdate() : this.submitCreation()
    },

    submitCreation() {
      this.attemptProfileCreation(this.formData)
        .then(({ data }) => {
          this.addProfilesItems(data)
          this.closeModal()
          this.setFeedback({ message: this.$t('community.profiles:feedback.profile.registered') })
        })
        .catch(({ response }) => {
          const responseMessage = response && response.data && response.data.message
          let message = ''

          if (responseMessage && responseMessage === 'email_is_not_unique') {
            message = this.$t('community.profiles:feedback.updated.error.email_is_not_unique')
          }

          if (response.data.message === 'unconfigured_sending_domain_email') {
            message = this.$t(
              'community.profiles:feedback.updated.error.unconfigured_sending_domain_email'
            )
          }

          if (!message) {
            message = this.$t('community.profiles:feedback.created.error')
          }

          this.setFeedback({ message })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submitUpdate() {
      this.attemptProfileUpdate(this.formData)
        .then(({ data }) => {
          this.setProfilesCurrent(data)
          if (data.id === this.Account.user.currentProfileId) {
            this.setUsersPermissionsDenied(data.deniedRoutesContexts)
          }
          this.closeModal()
          this.setFeedback({ message: this.$t('community.profiles:feedback.profile.registered') })
        })
        .catch(({ response }) => {
          let message = ''

          if (response.data.message === 'name_is_not_unique') {
            message = this.$t('community.profiles:feedback.updated.error.not_uniq')
          }

          if (response.data.message === 'email_is_not_unique') {
            message = this.$t('community.profiles:feedback.updated.error.email_is_not_unique')
          }

          if (response.data.message === 'unconfigured_sending_domain_email') {
            message = this.$t(
              'community.profiles:feedback.updated.error.unconfigured_sending_domain_email'
            )
          }

          if (!message) {
            message = this.$t('global:error')
          }

          this.setFeedback({ message })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    closeModal() {
      this.resetCurrentProfile()
      this.$router.push(this.$route.meta.modalCloseLink)
    },

    resetCurrentProfile() {
      this.setProfilesCurrent(null)
    },

    getProfilesContexts() {
      const profiles = this.profiles
      const contexts = profiles && profiles.contexts
      return contexts || {}
    },

    updateContextPermissions() {
      const consolidatedDeniedRoutesContexts = this.consolidateDeniedRoutesContexts(
        this.formData.deniedRoutesContexts
      )

      this.contextsPermissions = Object.values(this.getProfilesContexts()).map((context) => {
        const contextNew = Object.entries(context)

        return contextNew.map((group) => ({
          [group[0]]: Object.keys(group[1]).map((subGroupItem) => {
            let reversedContextPermission = {
              context: group[1][subGroupItem],
              action: {
                read: this.isEditing || this.instanceContexts.includes(context) === true,
                write: this.isEditing,
              },
            }

            if (['classroom:forum'].includes(reversedContextPermission.context)) {
              reversedContextPermission.action.remove =
                this.isEditing || this.instanceContexts.includes(context) === true
            } else if (['classroom:examination'].includes(reversedContextPermission.context)) {
              reversedContextPermission.action.evaluate =
                this.isEditing || this.instanceContexts.includes(context) === true
            }

            let deniedContext = consolidatedDeniedRoutesContexts.find((deniedContextItem) => {
              return deniedContextItem.context === reversedContextPermission.context
            })

            if (typeof deniedContext !== 'undefined') {
              if (deniedContext.actionType.includes('read')) {
                reversedContextPermission.action.read = false
                reversedContextPermission.action.write = false
                if (reversedContextPermission.context === 'classroom:forum') {
                  reversedContextPermission.action.remove = false
                }
                if (reversedContextPermission.context === 'classroom:examination') {
                  reversedContextPermission.action.evaluate = false
                }
              } else {
                reversedContextPermission.action.read = !deniedContext.actionType.includes('read')
                reversedContextPermission.action.write = !deniedContext.actionType.includes('write')
              }

              if (reversedContextPermission.context === 'classroom:forum') {
                reversedContextPermission.action.remove = deniedContext.actionType.includes(
                  'remove'
                )
                  ? false
                  : reversedContextPermission.action.remove
              } else if (['classroom:examination'].includes(deniedContext.context)) {
                reversedContextPermission.action.evaluate = deniedContext.actionType.includes(
                  'evaluate'
                )
                  ? false
                  : reversedContextPermission.action.evaluate
              }
            } else if (!this.isEditing) {
              consolidatedDeniedRoutesContexts.push({
                actionType: this.instanceContexts.includes(context) ? 'read' : 'write',
                context: reversedContextPermission.context,
              })
            }

            return reversedContextPermission
          }),
        }))
      })

      this.formData.deniedRoutesContexts = consolidatedDeniedRoutesContexts
    },

    consolidateDeniedRoutesContexts(deniedRoutesContexts) {
      const contextMap = {}
      deniedRoutesContexts.forEach((item) => {
        if (!contextMap[item.context]) {
          contextMap[item.context] = { ...item, actionType: [] }
        }
        contextMap[item.context].actionType.push(item.actionType)
      })

      return Object.values(contextMap).map((item) => {
        return {
          ...item,
          actionType: [...new Set(item.actionType)],
        }
      })
    },

    updateDeniedContexts(item) {
      if (item.action.write || item.action.evaluate || item.action.remove) {
        item.action.read = true
      }
      let deniedContextIndex = this.formData.deniedRoutesContexts.findIndex((deniedContext) => {
        return deniedContext.context === item.context
      })
      if (deniedContextIndex === -1) {
        deniedContextIndex =
          this.formData.deniedRoutesContexts.push({ actionType: '', context: item.context }) - 1
      }
      if (item.context === 'classroom:forum' || item.context === 'classroom:examination') {
        this.updateDeniedContextsSubItem(item, deniedContextIndex, item.context)
      } else if (item.action.read && item.action.write) {
        this.formData.deniedRoutesContexts.splice(deniedContextIndex, 1)
        this.checkDependentContexts(item)
      } else if (!item.action.read) {
        this.formData.deniedRoutesContexts[deniedContextIndex].actionType = [actionType.READ]
        this.checkDependentContexts(item, true)
      } else {
        this.formData.deniedRoutesContexts[deniedContextIndex].actionType = [actionType.WRITE]
        this.checkDependentContexts(item)
      }
    },

    updateDeniedContextsSubItem(item, deniedContextIndex, context) {
      let actionContext = context === 'classroom:forum' ? 'remove' : 'evaluate'
      let actionTypeContext = context === 'classroom:forum' ? 'REMOVE' : 'EVALUATE'

      const deniedContext = this.formData.deniedRoutesContexts[deniedContextIndex]

      if (item.action.read && !item.action.write && !item.action[actionContext]) {
        deniedContext.actionType = [actionType.WRITE, actionType[actionTypeContext]]
        this.checkDependentContexts(item)
        return
      }

      if (!item.action.read && !item.action.write && !item.action[actionContext]) {
        deniedContext.actionType = [actionType.READ]
        this.checkDependentContexts(item, true)
        return
      }

      if (item.action.read && item.action.write && item.action[actionContext]) {
        this.formData.deniedRoutesContexts.splice(deniedContextIndex, 1)
        this.checkDependentContexts(item)
        return
      }

      if (!item.action.write || !item.action.actionContext) {
        deniedContext.actionType = !item.action.write
          ? [actionType.WRITE]
          : [actionType[actionTypeContext]]
        this.checkDependentContexts(item, !item.action.write)
      }
    },

    /**
     * Update list of impersonate profiles ids by adding/removing.
     * @param {string|number} id
     */
    updateImpersonateProfilesIds(id) {
      const form = this.formData
      const hasId = form.meta.canProfileImpersonate.includes(id)

      if (!hasId) {
        form.meta.canProfileImpersonate.push(id)
        return
      }

      form.meta.canProfileImpersonate = form.meta.canProfileImpersonate.filter(
        (profileId) => profileId != id
      )
    },

    checkDependentContexts(item, removeBlock = false) {
      this.dependentContexts.forEach((dependent) => {
        if (item.context === dependent.context) {
          this.formData.deniedRoutesContexts.forEach((deniedContext, key) => {
            if (dependent.dependencies.includes(deniedContext.context)) {
              this.formData.deniedRoutesContexts[key].actionType = [actionType.WRITE]
            }
          })
          if (removeBlock) {
            this.blockedByDependency = this.blockedByDependency.filter(
              (blocked) => !dependent.dependencies.includes(blocked)
            )
          } else {
            dependent.dependencies.forEach((dependency) => {
              if (!this.blockedByDependency.includes(dependency)) {
                this.blockedByDependency.push(dependency)
              }
            })
          }
        }
      })
    },


    updateDeniedData(item) {
      let deniedDataIndex = this.formData['denied_data'].findIndex((deniedContext) => {
        return deniedContext.context === item.context
      })
      if (deniedDataIndex === -1) {
        this.formData['denied_data'].push({ blocked_read: true, blocked_write: true, context: item.context })
      }
      if (deniedDataIndex !== -1 && !item.blocked_read) {
        this.formData['denied_data'].splice(deniedDataIndex, 1)
      }
    }
  },
}
</script>

<template>
  <Modal
    :active="!fetching"
    is-page
    @close="resetCurrentProfile"
  >
    <div class="modal-form modal-add-profile">
      <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
      <h2 class="modal-title text-color">
        {{
          formData.id
            ? $t('community.profiles:modal.title.edit')
            : $t('community.profiles:modal.title.add')
        }}
      </h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('community.profiles:modal.description.1') }}</p>
        <p class="text-color">{{ $t('community.profiles:modal.description.2') }}</p>
      </div>
      <form @submit.prevent="submit">
        <div class="input-group">
          <InputField
            v-model="formData.name"
            :label="$t('global:form.name')"
            :validation="$v.formData.name"
            :disabled="!canWrite('profiles') || blockedProfiles"
            dark
          />
          <InputField
            v-model="formData.meta.email"
            :validation="$v.formData.meta.email"
            :hint="$t('community.profiles:modal.email.hint')"
            :label="$t('global:form.email')"
            :disabled="!canWrite('profiles') || blockedProfiles"
            dark
          />
        </div>

        <FormSection :title="$t('community.profiles:modal.permissions')">
          <div class="platform_environment">
            <h3 class="text-color">{{ $t('community.profiles:modal.permissions.platform.environment') }}</h3>

            <div
              v-for="(permission, index) in $isEnabledFeature('pm')
                ? instancePermissions
                : instancePermissionsNotPM"
              :key="index"
            >
              <ToggleVisibility
                v-model="permission.isVisible"
                :label="$t(permission.label)"
              />

              <DatatableInstancePermission
                v-if="permission.isVisible"
                :items="contextsPermissions[0][index][permission.key]"
                :instance-contexts="instanceContexts"
                :blocked-by-dependency="blockedByDependency"
                :blocked-profiles="blockedProfiles"
                @update:denied-contexts="updateDeniedContexts"
              />
            </div>
          </div>

          <div class="classroom_environment">
            <h3>{{ $t('community.profiles:modal.permissions.classroom.environment') }}</h3>

            <div
              v-for="(permission, index) in classroomPermissions"
              :key="index"
            >
              <ToggleVisibility
                v-model="permission.isVisible"
                :label="$t(permission.label)"
              />

              <DatatableClassroomPermission
                v-if="permission.isVisible"
                :items="contextsPermissions[1][index][permission.key]"
                :instance-contexts="instanceContexts"
                :blocked-by-dependency="blockedByDependency"
                :blocked-profiles="blockedProfiles"
                :four-checkboxes="permission.key === 'OTHER_TOOLS' ? true : false"
                @update:denied-contexts="updateDeniedContexts"
              />
            </div>
          </div>

          <DatatableImpersonatePermission
            v-if="$isEnabledFeature('impersonate_read_only') && !blockedProfiles"
            @update:impersonate-permissions="updateImpersonateProfilesIds"
          />

          <DatatableLGPDPermission
            :items="lgpdPermissions"
            @update:denied-contexts="updateDeniedData"
          />
        </FormSection>

        <div class="form-submit text-center">
          <Action
            v-if="canWrite('profiles') && !blockedProfiles"
            :text="$t('global:form.save')"
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
</template>

<style lang="scss">
@import 'ModalAddProfile.scss';
</style>
