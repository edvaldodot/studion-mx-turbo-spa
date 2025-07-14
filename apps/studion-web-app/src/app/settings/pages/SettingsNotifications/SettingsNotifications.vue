<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { settingsMixin } from '@/mixins/settings'
import { parseNotificationsByGroup, ungroupNotifications } from './utils'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import NotificationsGroup from '../../components/NotificationsGroup'
import Upload from '@/components/general/Upload'

export default {
  name: 'settingsNotifications',
  mixins: [settingsMixin],
  components: {
    Action,
    ActionBar,
    Checkbox,
    ContentHeader,
    Datatable,
    Icon,
    NotificationsGroup,
    Upload
  },
  data () {
    return {
      formData: {
        image: null,
        notificationsTypes: {}
      }
    }
  },
  validations: {
    formData: {
      image: {
        required
      }
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'Settings']),
    hasWriteAccess () {
      return this.notEqualsProfile('student') && this.canWrite('settings')
    },
    hasReadAccess () {
      return this.notEqualsProfile('student') && this.canRead('settings')
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptInstanceSettingsRetrieval',
      'attemptUpdateInstanceSettings',
      'attemptNotificationsSettingsRetrieval',
      'attemptBatchUpdateNotificationsTypes',
      'attemptUpdateEmailNotificationHeader'
    ]),
    editOptionMessage (notificationTypeID) {
      this.$router.push({
        name: 'settings.notifications.email.edit',
        params: {
          id: notificationTypeID
        }
      })
    },
    save () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        let requests = [
          this.attemptBatchUpdateNotificationsTypes({
            notifications_types: ungroupNotifications(this.formData.notificationsTypes)
          })
        ]
        if (this.formData.image.type) {
          requests.push(this.attemptUpdateEmailNotificationHeader({ image: this.formData.image }))
        }
        Promise.all(requests)
          .then(([notificationsTypesResponse, emailNotificationHeaderResponse]) => {
            this.setFeedback({message: this.$t('settings.notifications:feedback.save.success')})
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    }
  },
  created () {
    if (!this.hasReadAccess) {
      this.$router.push({name: 'dashboard'})
    }
    this.setFetching(true)
    this.attemptNotificationsSettingsRetrieval()
      .then(() => {
        this.formData.notificationsTypes = parseNotificationsByGroup(this.Settings.notifications.items)
        this.formData.image = this.Settings.email_notification_header
      })
      .finally(() => {
        this.setFetching(false)
      })
  }
}
</script>

<template>
  <div class="main-content settings">
    <ContentHeader
      :title="$t('settings:header.title.3')"
      :description="$t('settings:header.description.2')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>
    <form @submit.prevent="save" class="config-form">
      <div class="form-section">
        <h2 class="config-form-title">{{ $t('settings.notifications:email.title') }}</h2>
        <div class="text-description">
          <p class="text-color">{{ $t('settings.notifications:email.description.1') }}</p>
          <p class="text-color">{{ $t('settings.notifications:email.description.2') }}</p>
        </div>

        <div class="notifications">
          <NotificationsGroup
            v-for="(group, key) in formData.notificationsTypes"
            v-model="formData.notificationsTypes[key]"
            :key="key"
            :groupAlias="key"
          />
        </div>

        <h2 class="config-form-title">{{ $t('settings.notifications:email.title.2') }}</h2>
        <div class="text-description">
          <p class="text-color">{{ $t('settings.notifications:email.description.3') }}</p>
          <p class="text-color">{{ $t('settings.notifications:email.description.4') }}</p>
          <upload
            cropper
            v-model="formData.image"
            :icon="'image-multiple'"
            :label="$t('global:upload.add.image')"
            :width="480"
            :height="62"
            :outerLabel="true"
            :validation="$v.formData.image"
            :dark="accessibility"
            :disabled="!canWrite('settings')"
          >
          </upload>
        </div>
      </div>
      <div class="form-submit text-center" v-if="hasWriteAccess">
        <action :text="$t('global:form.save')" type="button" primary large submit fixed-width></action>
      </div>
    </form>
    <router-view></router-view>
  </div>
</template>

<style lang="scss">@import "~@/app/settings/styles.scss";</style>
