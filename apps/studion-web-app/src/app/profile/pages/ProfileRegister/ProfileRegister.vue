<script>
import { mapActions, mapState } from 'vuex'
import { required, minLength } from 'vuelidate/lib/validators'
import config from '@/config'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Datepicker from '@/components/general/Datepicker'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import OptInField from '@/components/general/OptInField'
import Upload from '@/components/general/Upload'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import Tabs from '@/components/general/Tabs'
import Icon from '@/components/general/Icon'

const { USER_INFO_READONLY } = config

export default {
  name: 'ProfileRegister',
  components: {
    Action,
    ActionBar,
    ContentHeader,
    Datepicker,
    FormSection,
    Icon,
    InputField,
    SelectField,
    Tabs,
    TextareaField,
    OptInField,
    Upload,
    Checkbox,
    Datatable,
  },
  mixins: [formScrollValidationMixin],
  data() {
    return {
      hasChangeImage: false,
      availableLanguages: null,
      formData: {
        image: null,
        name: null,
        username: null,
        email: null,
        profile: null,
        userLanguage: null,
        metadata: {},
        settings: [],
      },
      metadataList: [],
      tabLinks: [
        {
          text: 'profile:tab.link.register',
          location: { name: 'profile.register' },
        },
      ],
    }
  },
  validations() {
    let defaultValidate = {
      formData: {
        name: {
          required,
          minLength: minLength(1),
          maxLength: 255,
        },
        userLanguage: {
          required,
        },
        metadata: {},
      },
    }
    this.metadataList.map((item) => {
      let rule = {}
      rule[item.name] = {}
      if (item.required) {
        rule[item.name] = {
          required,
        }
      }
      defaultValidate.formData.metadata = Object.assign(rule, defaultValidate.formData.metadata)
    })
    return defaultValidate
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'Settings']),
    profileImage() {
      return this.Account.user.profile_image
    },
    isUserInfoReadonly() {
      return USER_INFO_READONLY !== undefined && USER_INFO_READONLY
    },
    isImageProfileReadonly() {
      if (
        this.Settings.allow_change_profile_image ||
        this.Settings.allow_change_profile_image === undefined
      )
        return false

      return true
    },
  },
  watch: {
    profileImage() {
      this.formData.image = this.profileImage
    },
  },
  mounted() {
    this.tabLinks = [
      {
        text: 'profile:tab.link.register',
        location: { name: 'profile.register' },
      },
    ]
    if (this.isGamificationEnable()) {
      this.tabLinks.push({
        text: 'profile:tab.link.points',
        location: { name: 'profile.points' },
        disabled: !this.equalsProfile('student'),
      })
    }

    this.formData.image = this.Account.user.profile_image
    this.formData.name = this.Account.user.data.name
    this.formData.username = this.Account.user.data.username
    this.formData.email = this.Account.user.data.email
    this.formData.profile = this.Account.user.profiles
      .map((item) => (item.alias === 'agent' ? item.name : this.$t(`global:${item.alias}`)))
      .join(String.fromCharCode(13, 10))
    this.setFetching(true)
    let requestPromises = [
      this.attemptGetUserMetadata(),
      this.attemptGetUserSettings(),
      this.attemptGetAvailableLanguages(),
    ]
    Promise.all(requestPromises)
      .then(([metas, settings, languages]) => {
        this.availableLanguages = languages.data.map((lang) => {
          return {
            text: this.$t(`global:locale.${lang.language.alias}`),
            value: lang.language.alias,
            default: lang.default,
          }
        })
        this.metadataList = metas.data.map((item) => {
          this.$set(this.formData.metadata, item.name, item.value)
          if (item.type === 'select' || item.type === 'multiple_select') {
            item.options = item.options.map((option) => {
              let propertyName = Object.keys(option.fields)[0]
              return {
                text: option.fields[propertyName],
                value: option.id,
              }
            })
          }
          return item
        })
        this.formData.userLanguage = settings.data.language
        for (let key in settings.data) {
          this.formData.settings.push({ setting: key, value: settings.data[key] })
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptGetUserMetadata',
      'attemptSaveUserMetadata',
      'attemptSaveUserData',
      'attemptSaveUserPhoto',
      'attemptGetUserSettings',
      'attemptSaveUserSettings',
      'attemptGetAvailableLanguages',
      'attemptRemoveProfilePicture',
    ]),
    openModalAlterPassword() {
      this.$router.push({ name: 'profile.register.password' })
    },
    save() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        let requestPromises = [
          this.attemptSaveUserMetadata(this.createObjMetadata()),
          this.attemptSaveUserData({ name: this.formData.name }),
          this.attemptSaveUserSettings({
            receive_email: this.formData.settings[0].value ? 1 : 0,
            receive_sms: this.formData.settings[1].value ? 1 : 0,
            language: this.formData.userLanguage,
          }),
        ]

        if (this.hasChangeImage) {
          requestPromises.push(this.attemptSaveUserPhoto(this.formData.image))
        }

        this.setFetching(true)
        Promise.all(requestPromises)
          .then(() => {
            this.setFeedback({ message: this.$t('profile:feedback.save.success') })
          })
          .finally(() => {
            this.setFetching(false)
          })
      }

      this.$nextTick(() => this.scrollToInputError())
    },
    createObjMetadata() {
      let data = { values: {} }
      this.metadataList.map((item) => {
        data.values[item.alias] = this.formData.metadata[item.name]
      })
      return data
    },
    imageChange() {
      this.hasChangeImage = true
    },
    callImageChange() {
      this.$refs['upload'].$refs['input'].click()
    },
    validateData(value, index) {
      this.formData.metadata[index] = value === '(' ? '' : value
    },
    removeProfileImage() {
      this.setFetching(true)
      this.attemptRemoveProfilePicture()
        .then(() => {
          this.formData.image = null
          this.$refs.upload.removeFile()
          this.setFeedback({ message: this.$t('profile:feedback.save.success') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div class="main-content">
    <content-header
      :title="$t('profile:header.title')"
      :description="$t('profile:header.description')"
      class="header-admin"
    >
      <action-bar slot="actionbar"></action-bar>
      <Tabs
        slot="tabs"
        dark
        :links="tabLinks"
      ></Tabs>
    </content-header>
    <div class="profile-register">
      <form @submit.prevent="save()">
        <div class="profile-register-image-container">
          <span
            v-if="formData.image"
            class="profile-register-image--add-icon"
            @click="callImageChange()"
          >
            <Icon name="add_a_photo" />
          </span>
          <upload
            ref="upload"
            v-model="formData.image"
            class="profile-register-image"
            icon="add_a_photo"
            class-icon="text-white"
            :width="90"
            :height="90"
            :cropper="true"
            :disabled="isImageProfileReadonly"
            @input="imageChange()"
          >
            <Icon
              slot="image"
              class="text-7xl mx-auto mt-2 text-black-600"
              name="account_circle"
              pack="material"
            />

            <template slot="change">
              <div class="uploader-label-change-container">
                <Icon
                  slot="change"
                  class="uploader-label-change-container-icon text-white"
                  name="add_a_photo"
                  pack="material"
                />
              </div>
            </template>
          </upload>
          <Action
            v-if="formData.image"
            type="button"
            class="profile-register-image--remove-btn"
            :text="$t('profile:remove.image')"
            @click="removeProfileImage()"
          />
        </div>
        <input-field
          v-model="formData.name"
          :label="$t('global:form.name')"
          :disabled="isUserInfoReadonly"
          :validation="$v.formData.name"
          :dark="accessibility"
          :counter="255"
        ></input-field>
        <input-field
          v-model="formData.username"
          :label="$t('global:form.username')"
          disabled
          :dark="accessibility"
        ></input-field>
        <input-field
          v-model="formData.email"
          :label="$t('global:form.email')"
          disabled
          :dark="accessibility"
        ></input-field>
        <textarea-field
          v-model="formData.profile"
          :label="$tc('global:form.profile', Account.user.profiles)"
          disabled
          auto-grow
          :dark="accessibility"
        ></textarea-field>
        <select-field
          v-model="formData.userLanguage"
          :label="$t('global:form.select.default.language')"
          :validation="$v.formData.userLanguage"
          :items="availableLanguages"
          :dark="accessibility"
        ></select-field>
        <template v-if="metadataList.length">
          <form-section :title="$t('profile.register:section.metadata')">
            <template v-for="(metadata, index) in metadataList">
              <datepicker
                v-if="metadata.type === 'date'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.name]"
                allow-input
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  isUserInfoReadonly
                "
                :dark="accessibility"
              ></datepicker>
              <datepicker
                v-if="metadata.type === 'datetime'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.name]"
                time
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  isUserInfoReadonly
                "
                :dark="accessibility"
              ></datepicker>
              <textarea-field
                v-if="metadata.type === 'text'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.name]"
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  isUserInfoReadonly
                "
                auto-grow
                :dark="accessibility"
              ></textarea-field>
              <input-field
                v-if="metadata.type === 'string'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.name]"
                :mask="metadata.valueFormat.format.format"
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  isUserInfoReadonly
                "
                :dark="accessibility"
                @input="validateData($event, metadata.name)"
              ></input-field>
              <input-field
                v-if="metadata.type === 'int'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.name]"
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  isUserInfoReadonly
                "
                type="number"
                :dark="accessibility"
              ></input-field>
              <select-field
                v-if="metadata.type === 'select'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.name]"
                :items="metadata.options"
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  isUserInfoReadonly
                "
                :dark="accessibility"
              ></select-field>
              <select-field
                v-if="metadata.type === 'multiple_select'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :label="metadata.name"
                :validation="$v.formData.metadata[metadata.name]"
                :items="metadata.options"
                multiple
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  isUserInfoReadonly
                "
                :dark="accessibility"
              ></select-field>
              <opt-in-field
                v-if="metadata.type === 'opt_in'"
                :key="index"
                v-model="formData.metadata[metadata.name]"
                :validation="$v.formData.metadata[metadata.alias]"
                :config="metadata.parameters.config"
                :dark="accessibility"
                :disabled="
                  (metadata.adminWrite && Account.user.currentProfile !== 'admin') ||
                  blockMetaOptIn()
                "
              ></opt-in-field>
            </template>
          </form-section>
        </template>
        <div class="security-count">
          <span class="text-title">{{ $t('profile.register:security.count') }}</span>
          <action
            type="button"
            class="btn-alter-psw"
            :text="$t('profile.register:security.count.alter.password')"
            flat
            :dark="accessibility"
            @click="openModalAlterPassword()"
          ></action>
          <action
            v-if="false"
            type="button"
            :text="$t('profile.register:security.count.delete')"
            flat
            :dark="accessibility"
            @click="deleteCount()"
          ></action>
        </div>
        <datatable
          :items="formData.settings"
          :dark="accessibility"
          class="notification-register"
        >
          <template slot="thead">
            <tr>
              <th class="th text-title">{{ $t('profile:notification.settings') }}</th>
              <th
                class="th text-title text-center"
                width="140"
              ></th>
            </tr>
          </template>
          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr v-if="props.item.setting === 'receive_email'">
              <td class="td">
                <span class="td-text td-permission-name">{{
                  $t(`profile:notification.settings.${props.item.setting}`)
                }}</span>
              </td>
              <td class="td text-center">
                <checkbox
                  v-model="props.item.value"
                  :items="[{ value: true }]"
                  switch-type
                  :dark="accessibility"
                ></checkbox>
              </td>
            </tr>
            <tr v-if="props.item.setting === 'receive_sms'">
              <td class="td">
                <span class="td-text td-permission-name">{{
                  $t(`profile:notification.settings.${props.item.setting}`)
                }}</span>
              </td>
              <td class="td text-center">
                <checkbox
                  v-model="props.item.value"
                  :items="[{ value: true }]"
                  switch-type
                  :dark="accessibility"
                ></checkbox>
              </td>
            </tr>
          </template>
        </datatable>

        <div class="mt-4 form-submit text-center">
          <Action
            type="button"
            :text="$t('global:form.save')"
            :disabled="isUserInfoReadonly"
            large
            submit
            primary
            fixed-width
            :dark="accessibility"
          ></Action>
        </div>
      </form>
    </div>

    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import '~@/components/general/Profile/Profile.scss';
</style>
