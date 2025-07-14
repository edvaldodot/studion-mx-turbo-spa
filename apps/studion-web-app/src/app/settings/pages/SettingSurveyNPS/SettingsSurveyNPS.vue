<script>
import { mapState, mapActions } from 'vuex'
import { settingsMixin } from '@/mixins/settings'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Checkbox from '@/components/general/Checkbox'
import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Radio from '@/components/general/Radio'

export default {
  name: 'SettingsSurveyNPS',

  components: {
    Radio,
    InputField,
    Action,
    Checkbox,
    ActionBar,
    ContentHeader,
  },

  mixins: [settingsMixin],

  data() {
    return {
      formData: {
        enable_survey: 0,
        trigger_after_login: 0,
        trigger_after_enrollment: 0,
        display_remind_later: 0,
        interval_display_after_delay: 0,
        interval_display_after_answer: 0,
        delay_first_display: 0,
        trigger_enrollment_number: 0,
        trigger_event: null,
      },
      triggerEvents: [
        {
          value: 'trigger_after_login',
          label: this.$t('settings.survey_nps.checkbox.item.1'),
        },
        {
          value: 'trigger_after_enrollment',
          label: this.$t('settings.survey_nps.checkbox.item.2'),
        },
      ],
    }
  },

  computed: {
    ...mapState({
      Account: (state) => state.Account,
      accessibility: (state) => state.accessibility,
    }),
    shouldHideNpsConfigs() {
      return !this.formData.enable_survey
    },
    shouldHideSectionReminderLater() {
      return !this.formData.display_remind_later
    },
  },

  created() {
    if (!(this.notEqualsProfile('student') && this.canRead('settings'))) {
      this.$router.push({ name: '404' })
    }
    this.getSettingsConfigs()
  },

  methods: {
    ...mapActions([
      'fetchAccessMessage',
      'setFetching',
      'setFeedback',
      'attemptSettingsConfigs',
      'attemptUpdateSurveyNPSConfigs',
    ]),
    async getSettingsConfigs() {
      this.setFetching(true)
      this.attemptSettingsConfigs().then(({ data }) => {
        if (data.nps_controls) {
          const npsControls = data.nps_controls

          let newTriggerEvent = 'trigger_after_enrollment'
          if (npsControls.trigger_after_login === 1) {
            newTriggerEvent = 'trigger_after_login'
          }

          this.formData = {
            ...this.formData,
            enable_survey: npsControls.enable_survey === 1,
            display_remind_later: npsControls.display_remind_later === 1,
            trigger_event: newTriggerEvent,
            interval_display_after_answer: npsControls.interval_display_after_answer,
            interval_display_after_delay: npsControls.interval_display_after_delay,
            trigger_enrollment_number: npsControls.trigger_enrollment_number,
            delay_first_display: npsControls.delay_first_display,
          }
        }

        this.setFetching(false)
      })
    },
    mountPayload() {
      const npsData = {
        enable_survey: this.formData.enable_survey ? 1 : 0,
        display_remind_later: this.formData.display_remind_later ? 1 : 0,
        interval_display_after_delay: this.formData.interval_display_after_delay,
        interval_display_after_answer: this.formData.interval_display_after_answer,
        delay_first_display: this.formData.delay_first_display,
        trigger_enrollment_number: this.formData.trigger_enrollment_number,
      }

      const triggerEventSelected = this.formData.trigger_event

      if (triggerEventSelected === 'trigger_after_login') {
        npsData.trigger_after_login = 1
        npsData.trigger_after_enrollment = 0
      } else {
        npsData.trigger_after_login = 0
        npsData.trigger_after_enrollment = 1
      }

      return npsData
    },
    save() {
      this.setFetching(true)

      const apiPayload = { nps_controls: this.mountPayload() }

      this.attemptUpdateSurveyNPSConfigs({
        data: apiPayload,
      })
        .then(() => {
          this.setFeedback({ message: this.$t('settings.survey_nps:edit.success') })
        })
        .catch((error) => {
          this.setFeedback({
            message:
              this.$t('settings.survey_nps:edit.error') +
              (error && error.message ? `: ${error.message}` : ''),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    }
  },
}
</script>

<template>
  <div class="main-content settings">
    <ContentHeader
      :title="$t('settings:header.title.8')"
      :description="$t('settings:header.description.7')"
      :tag="$t('settings:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>
    <div class="nps-card center">
      <form @submit.prevent="save">
        <div class="form-section">
          <div class="content-header">
            <div class="content-survey-nps text-left">
              <h5 class="config-form-title">{{ $t(`settings.survey_nps.form.title.1`) }}</h5>
              <div class="text-description">
                <p v-html="$t(`settings.survey_nps.form.title.description.1`)"></p>
              </div>
            </div>
            <div class="check-enable-nps-item">
              <Checkbox
                v-model="formData.enable_survey"
                :items="[{ value: true }]"
                switch-type
              />
            </div>
          </div>

        </div>

        <div
          class="form-section"
          :class="{ hidden: shouldHideNpsConfigs }"
        >
          <h4 class="config-form-title">{{ $t(`settings.survey_nps.form.title.2`) }}</h4>
          <div class="text-description">
            <p v-html="$t(`settings.survey_nps.form.title.description.2`)"></p>
          </div>

          <div class="nps-controls-row">
            <Radio
              v-model="formData.trigger_event"
              :items="triggerEvents"
              horizontal
              dark
              class="inline-flex gap-5"
            />
            <InputField
              v-if="formData.trigger_event === 'trigger_after_enrollment'"
              v-model="formData.trigger_enrollment_number"
              :min="0"
              type="number"
              dark
              :placeholder="$t(`settings.survey_nps.placeholder.trigger_enrollment_number`)"
              class="form-number-days-nps"
              name="trigger_enrollment_number"
            />
          </div>
          <h4 class="config-form-title">{{ $t(`settings.survey_nps.form.title.3`) }}</h4>
          <div class="text-description">
            <p v-html="$t(`settings.survey_nps.form.title.description.3`)"></p>
            <InputField
              v-model="formData.delay_first_display"
              :min="0"
              type="number"
              dark
              :placeholder="$t(`settings.survey_nps.placeholder.interval.display.after.answer`)"
              class="form-number-days-nps"
              name="delay_first_display"
            />
          </div>
        </div>

        <div
          class="form-section"
          :class="{ hidden: shouldHideNpsConfigs }"
        >
          <h4 class="config-form-title">{{ $t(`settings.survey_nps.form.title.6`) }}</h4>
          <div class="text-description">
            <p v-html="$t(`settings.survey_nps.form.title.description.6`)"></p>
            <InputField
              v-model="formData.interval_display_after_answer"
              :min="0"
              class="form-number-days-nps"
              type="number"
              name="interval_display_after_answer"
              dark
              :placeholder="$t(`settings.survey_nps.placeholder.interval.display.after.answer`)"
            />
          </div>
        </div>

        <div
          class="form-section form-nps-last-section"
          :class="{ hidden: shouldHideNpsConfigs }"
        >
          <div class="content-header">
            <div class="content-survey-nps text-left">
              <h5 class="config-form-title">{{ $t(`settings.survey_nps.form.title.4`) }}</h5>
              <div class="text-description">
                <p v-html="$t(`settings.survey_nps.form.title.description.4`)"></p>
              </div>
            </div>
            <div class="check-enable-nps-item">
              <Checkbox
                v-model="formData.display_remind_later"
                :items="[{ value: true }]"
                switch-type
              />
            </div>
          </div>
          <div :class="{ hidden: shouldHideSectionReminderLater }">
            <h4 class="config-form-title">{{ $t(`settings.survey_nps.form.title.5`) }}</h4>
            <div class="text-description">
              <p v-html="$t(`settings.survey_nps.form.title.description.5`)"></p>
              <InputField
                v-model="formData.interval_display_after_delay"
                :min="0"
                class="form-number-days-nps"
                type="number"
                dark
                :placeholder="$t(`settings.survey_nps.placeholder.interval.display.after.answer`)"
                name="interval_display_after_delay"
              />
            </div>
          </div>
        </div>

        <div class="form-submit text-center">
          <Action
            :text="$t('global:form.save')"
            type="button"
            primary
            large
            submit
            fixed-width
            class="mb-3"
          />
        </div>
      </form>
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss">
@import '~@/app/settings/styles.scss';
@import 'SettingsSurveyNPS.scss';
</style>
