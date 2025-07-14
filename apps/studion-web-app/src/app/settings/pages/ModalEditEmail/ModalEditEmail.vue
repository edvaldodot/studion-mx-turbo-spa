<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf, minValue } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Accordion from '@/components/general/Accordion'
import AccordionItem from '@/components/general/AccordionItem'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import TextareaField from '@/components/general/TextareaField'

const TagSelector = () => import('@/components/general/TagSelector')
const TextEditor = () => import('@/components/general/TextEditor')

export default {
  name: 'ModalEditEmail',
  components: {
    Action,
    Accordion,
    AccordionItem,
    Checkbox,
    InputField,
    Modal,
    TagSelector,
    TextareaField,
    TextEditor,
  },
  data() {
    return {
      notificationType: null,
      hasRawContent: false,
      title: null,
      notificationTransportName: 'email',
      formData: {
        notification_transport_id: null,
        active: true,
        contents: [],
        settings: {
          time_in_days: null,
          send_header: true,
          attachment: false,
        },
      },
    }
  },
  validations: {
    formData: {
      contents: {
        $each: {
          content: {
            subject: {
              required,
            },
            body: {
              required,
            },
          },
        },
      },
      settings: {
        time_in_days: {
          required: requiredIf(function () {
            return (
              this.notificationType &&
              this.notificationType.transports[0].settings &&
              this.notificationType.transports[0].settings.time_in_days
            )
          }),
          minValue: minValue(1),
        },
      },
    },
  },
  computed: {
    ...mapState(['fetching', 'accessibility', 'Settings']),
    descriptionText() {
      let tagList = ''

      if (!this.notificationType || !this.notificationType.availableTags) {
        return ''
      }

      let list = [...this.notificationType.availableTags]

      if (!this.formData.settings.attachment) {
        list = list.filter((i) => i !== 'validator_certificate')
      }

      list.forEach((item, index) => {
        tagList += `{{${item}}}`

        let spacer = ''
        const itemPosition = index + 1

        if (list.length > 1 && itemPosition < list.length) {
          spacer = list.length - 1 === itemPosition ? ' e ' : ', '
        }

        tagList += spacer
      })

      return this.$t('settings.notifications:modal.email.edit.description', { tagList })
    },
    tagsWithBrackets() {
      if (!this.notificationType || !this.notificationType.availableTags) {
        return []
      }

      return this.notificationType.availableTags.map((tag) => `{{${tag}}}`)
    },
  },
  watch: {
    'item.content.body': {
      handler(newValue) {
        if (this.$refs.emailTextEditor) {
          const newText = this.clampSessionStartDate(newValue)
          this.item.content.body = newText
        }
      },
      immediate: true,
    },
  },
  created() {
    this.loadNotificationType()
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptNotificationTypeRetrieval',
      'attemptUpdateNotificationTransportContent',
    ]),
    closeModal() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },
    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.attemptUpdateNotificationTransportContent({
          notificationTransportId: this.formData.notification_transport_id,
          data: this.formData,
        })
          .then(() => {
            this.setFeedback({ message: this.$t('settings.notifications:feedback.save.success') })
            this.closeModal()
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    loadNotificationType() {
      this.setFetching(true)
      const payload = {
        notificationTypeId: this.$route.params.id,
        notificationTransportName: this.notificationTransportName,
      }
      this.attemptNotificationTypeRetrieval(payload)
        .then(({ data }) => {
          if (!data) {
            this.setFeedback({ message: this.$t('settings.notifications:feedback.inactive') })
            this.closeModal()
            return
          }
          this.notificationType = data

          this.title = this.$t(`settings.notifications:type.${this.notificationType.alias}`)

          this.formData.notification_transport_id = this.notificationType.transports[0].id
          this.formData.active = this.notificationType.transports[0].active
          this.formData.settings = this.notificationType.transports[0].settings

          for (var content in this.notificationType.transports[0].contents) {
            this.formData.contents.push(this.notificationType.transports[0].contents[content])
          }

          this.formData.contents = this.formData.contents.sort((itemA, itemB) => {
            return this.$t('global:locale.' + itemA.language).toUpperCase() >
              this.$t('global:locale.' + itemB.language)
              ? 1
              : -1
          })

          this.hasRawContent = Object.keys(this.formData.settings).indexOf('raw_content') >= 0
          if (this.hasRawContent) {
            this.formData.settings.raw_content = Boolean(this.formData.settings.raw_content)
          }
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('settings.notifications:feedback.error'),
            type: 'error',
          })
          this.closeModal()
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
      :active="!fetching"
      is-page
    >
      <div class="modal-form settings-email">
        <span class="modal-subtitle">{{ $t('settings.notifications:modal.email.edit.subtitle') }}</span>
        <h2 class="modal-title text-color">{{ title }}</h2>
        <form @submit.prevent="submit()">
          <div class="modal-description text-color">
            <p class="text-left">{{ descriptionText }}</p>
          </div>
          <Checkbox
            v-if="formData.settings.only_raw_content !== undefined"
            v-model="formData.settings.only_raw_content"
            :items="[
              {
                value: true,
                label: $t('settings.notifications:modal.email.edit.checkbox.only.content'),
                description: $t('settings.notifications:modal.edit.only.content'),
              },
            ]"
            class="checkbox-sent"
            dark
            switch-type
          />
          <Checkbox
            v-model="formData.settings.send_header"
            :items="[
              {
                value: true,
                label: $t('settings.notifications:modal.email.edit.checkbox.send.header'),
              },
            ]"
            class="checkbox-sent"
            dark
            switch-type
          />
          <Checkbox
            v-if="notificationType && ['student_is_approved'].includes(notificationType.alias)"
            v-model="formData.settings.attachment"
            :items="[
              {
                value: true,
                label: $t('settings.notifications:modal.email.edit.checkbox.send.certificate'),
              },
            ]"
            class="checkbox-sent"
            dark
            switch-type
          />

          <template
            v-if="
              notificationType &&
              notificationType.transports[0].settings &&
              notificationType.transports[0].settings.time_in_days
            "
          >
            <div class="settings-days">
              <h4>{{ $t('settings.notifications:settings.days.title') }}</h4>
              <p class="mt-2 mb-2">{{ $t('settings.notifications:settings.days.subtitle') }}</p>
              <InputField
                v-model="formData.settings.time_in_days"
                type="number"
                :label="$t('global:days')"
                :validation="$v.formData.settings.time_in_days"
                :min="1"
                dark
              />
            </div>
          </template>
          <Accordion
            v-for="(item, index) in formData.contents"
            :key="index"
            :disabled="formData.settings.only_raw_content"
            modal
            multiple
          >
            <AccordionItem :disabled="formData.settings.only_raw_content">
              <h4 slot="header">{{ $t('global:locale.' + item.language) }}</h4>
              <template slot="content">
                <TextareaField
                  v-model="item.content.subject"
                  :counter="250"
                  :label="$t('settings.notifications:modal.email.edit.label.1')"
                  :validation="$v.formData.contents.$each[index].content.subject"
                  auto-grow
                  dark
                />
                <TextEditor
                  :ref="`emailTextEditor${index}`"
                  v-model="item.content.body"
                  :counter="1500"
                  :floating-label="false"
                  :label="$t('settings.notifications:modal.email.edit.label.2')"
                  :max-rows="8"
                  :rows="8"
                  :validation="$v.formData.contents.$each[index].content.body"
                  no-fixed
                >
                  <template #before-tools>
                    <TagSelector
                      v-if="tagsWithBrackets.length > 0"
                      :tags="tagsWithBrackets"
                      :title="$t('text.editor:tag.selector.title')"
                      tag-label="management:announcement.actions:tag.item:"
                      @tag="$refs[`emailTextEditor${index}`][0].addTag($event)"
                    />
                  </template>
                </TextEditor>
              </template>
            </AccordionItem>
          </Accordion>
          <div class="text-center">
            <template v-if="Object.keys(formData.settings).indexOf('raw_content') >= 0">
              <Checkbox
                v-model="formData.settings.raw_content"
                :disabled="formData.settings.only_raw_content"
                :items="[
                  {
                    value: true,
                    label: $t('settings.notifications:modal.email.edit.checkbox.label'),
                  },
                ]"
                class="checkbox-sent"
                dark
                switch-type
              />
            </template>
            <Action
              class="mt-6"
              :text="$t('global:form.save')"
              large
              secondary
              submit
              type="button"
            />
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>
