<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Action from '@/components/general/Action'
import FileField from '@/components/general/FileField'
import Icon from '@/components/general/Icon'
import TextareaField from '@/components/general/TextareaField'
import TextReduce from '@/components/general/TextReduce'
import SelectField from '@/components/general/SelectField'

export default defineComponent({
  name: 'HelpContent',

  components: {
    Action,
    FileField,
    Icon,
    TextareaField,
    TextReduce,
    SelectField,
  },

  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    itemIndex: {
      type: Number,
      default: 0,
    },
    formDataFeedback: {
      type: Array,
      default: () => [],
    },
    kbIssuesQueryParams: {
      type: Object,
      default: () => ({}),
    },
    isOpenFeedbackForm: {
      type: Array,
      default: () => [],
    },
    validation: {
      type: Object,
      required: true,
    },
    acceptedFormats: {
      type: String,
      default: null,
    },
    management: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    responsibleList: {
      type: Array,
      default: () => [],
    },
    formDataForward: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      visibleForward: false,
      visibleSend: false,
      forward: true,
      mutableResponseList: null,
      selectedCategory: null,
      selectedSubcategory: null,
      subcategoryOptions: [],
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility']),

    userLogin() {
      return this.Account.user.currentProfileId
    },

    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('classroom:knowledgeBase')
    },
    categoryOptions() {
      if (!this.categories) return

      return this.categories.map((category) => ({
        value: category.id,
        text: category.name,
      }))
    },
    filterUsers() {
      const mutableResponseList = this.responsibleList.filter(
        (item) => item.value !== this.userLogin
      )

      return mutableResponseList
    },
  },

  watch: {
    visibleForward: 'emitInputForm',
    visibleSend: 'emitInputForm',
    forward: 'emitInputForm',
    item: {
      handler(newValue) {
        if (newValue.category) {
          this.formDataFeedback[this.itemIndex].category = newValue.category.id
          if (!this.management) {
            this.handleCategoryChange(this.itemIndex)
          }
          if (this.item.subcategory) {
            this.formDataFeedback[this.itemIndex].subcategory = this.item.subcategory.id
          }
        }
      },
      immediate: true,
    },
    categories: {
      handler(newValue) {
        if (newValue) {
          this.handleCategoryChange(this.itemIndex)
          if (this.item.subcategory) {
            this.formDataFeedback[this.itemIndex].subcategory = this.item.subcategory.id
          }
        }
      },
    },
  },

  methods: {
    handleCategoryChange(itemIndex) {
      this.$refs.subcategory.clear()

      const selected = this.categories.find(
        (category) => category.id === this.formDataFeedback[itemIndex].category
      )

      this.subcategoryOptions = selected
        ? selected.issueSubCategories.map((sub) => ({
            value: sub.id,
            text: sub.name,
          }))
        : []

      const isValidSubcategory = selected.issueSubCategories.some(
        (sub) => sub.id === this.formDataFeedback[itemIndex].subcategory
      )

      if (!isValidSubcategory) {
        this.formDataFeedback[itemIndex].subcategory = null
      }
    },

    isSubcategoryDisabled(itemIndex) {
      return !this.formDataFeedback[itemIndex].category
    },

    emitInputForm() {
      this.$nextTick(() => {
        this.$emit('input-form')
      })
    },

    handleVisibleSend() {
      this.visibleSend = true
      this.forward = false
    },

    handleVisibleForward() {
      this.visibleForward = true
      this.forward = false
    },

    cancelForm(prop) {
      if (prop === 'send') {
        this.visibleSend = false
      } else {
        this.visibleForward = false
      }
      this.forward = true
    },

    submitResponse(item, itemIndex) {
      this.$emit('add-answer', item, itemIndex)
    },

    openFormFeedback(itemIndex) {
      this.$emit('open-feedback-form', itemIndex)
      this.visibleSend = true
    },
  },
})
</script>

<template>
  <div>
    <div
      v-for="(interaction, index) in item.interactions"
      :key="index"
      :class="{ 'is-indent': index > 0 }"
      class="help-item-content"
    >
      <div class="help-item-user">
        <div class="help-item-user-image-wrapper">
          <img
            v-if="interaction.user.image"
            :src="interaction.user.image"
            :alt="interaction.user.name"
            class="help-item-user-image"
          />
          <Icon
            v-else
            name="account_circle"
            class="help-item-user-image-icon"
          />
        </div>
        <div v-if="index == 0">
          <span class="help-item-send-label">
            {{ $t('classroom.knowledgeBase:help.item.sent.label') }}
          </span>
          <TextReduce
            :lenght-text="40"
            :text="interaction.user.name"
            class-style="help-item-user-name"
          />
        </div>

        <div v-else>
          <div class="help-responsible-content">
            <span class="help-item-user-name">
              <span
                v-if="interaction.isStudent"
                class="help-item-send-label"
              >
                {{ $t('classroom.knowledgeBase:help.item.sent.label') }}
              </span>
              <span v-else>
                {{
                  interaction.author.position === 'Admin'
                    ? $t('global:admin')
                    : !interaction.author.position
                    ? $t('global:menu.classroom.help:used.removed')
                    : interaction.author.position
                }}
              </span>
              <strong>
                <TextReduce
                  :lenght-text="40"
                  :text="
                    !interaction.user.name
                      ? $t('global:menu.classroom.help:used.removed')
                      : interaction.user.name
                  "
                />
              </strong>
            </span>

            <span class="help-item-date">
              {{
                $t('global:date.hours', {
                  date: formatDate(
                    item.interactions[index].date.replace(/-\d{2}:\d{2}$/, '+00:00')
                  ),
                  hour: formatDate(
                    item.interactions[index].date.replace(/-\d{2}:\d{2}$/, '+00:00'),
                    'shortTime'
                  ),
                })
              }}
            </span>
          </div>
        </div>
      </div>
      <p class="text-color">{{ interaction.comment }}</p>
      <Action
        v-if="interaction.attachment"
        :text="interaction.attachment.fileName"
        :dark="accessibility"
        icon="download"
        class="btn-download"
        type="button"
        flat
        @click="$emit('download-attachment', interaction)"
      />
    </div>
    <div
      v-if="
        item.status === 'closed' &&
        equalsProfile('student') &&
        !isOpenFeedbackForm[itemIndex] &&
        !item.interactions[item.interactions.length - 1].useful
      "
      class="text-center help-feedback-actions"
    >
      <h3 class="help-feedback-actions-title">
        {{ $t('classroom.knowledgeBase:help.feedback.title') }}
      </h3>
      <div class="help-content-actions">
        <Action
          :text="$t('classroom.knowledgeBase:help.feedback.yes')"
          :dark="accessibility"
          type="button"
          primary
          large
          @click="$emit('set-useful', item, itemIndex)"
        />
        <Action
          :text="$t('classroom.knowledgeBase:help.feedback.no')"
          :dark="accessibility"
          type="button"
          primary
          large
          @click="openFormFeedback(itemIndex)"
        />
      </div>
    </div>

    <div
      v-if="
        (item.status === 'pending' && notEqualsProfile('student') && hasWriteAccess) ||
        (item.status === 'closed' && isStudent() && isOpenFeedbackForm[itemIndex]) ||
        (item.status === 'pending_response' && notEqualsProfile('student') && hasWriteAccess)
      "
      class="help-fedback-forward"
      :class="{ 'management-forward': management }"
    >
      <div
        v-if="forward && !isStudent()"
        class="help-content-forward"
      >
        <span class="help-forward-description">{{
          $t('classroom.knowledgeBase:choice.action.doubts')
        }}</span>
        <div class="action-forward">
          <Action
            :text="$t('classroom.knowledgeBase:action.forward')"
            :dark="accessibility"
            type="button"
            primary
            large
            fixed-width
            @click="handleVisibleForward()"
          />
          <Action
            :text="$t('classroom.knowledgeBase:action.response')"
            :dark="accessibility"
            type="button"
            primary
            large
            fixed-width
            @click="handleVisibleSend()"
          />
        </div>
      </div>

      <div v-if="visibleForward && !isStudent()">
        <form @submit.prevent="$emit('forward', formDataForward.profile_id, item.id)">
          <div class="help-content-forward">
            <span class="help-forward-description">
              {{ $t('classroom.knowledgeBase:to.forward') }}</span
            >

            <SelectField
              v-model="formDataForward.profile_id"
              :items="filterUsers"
              :label="$t('classroom.knowledgeBase:select.responsible.doubts')"
              :show-optional="false"
              :disabled="!filterUsers"
            />
          </div>
          <div class="action-forward-response">
            <Action
              :text="$t('global:cancel')"
              icon-size="small"
              type="button"
              flat
              @click="cancelForm('forward')"
            />
            <Action
              :text="$t('global:form.send')"
              :dark="accessibility"
              type="button"
              :disabled="!formDataForward.profile_id || filterUsers.length < 1"
              primary
              large
              fixed-width
              submit
            />
          </div>
        </form>
      </div>

      <div v-if="visibleSend">
        <div class="help-feedback-form">
          <h3
            v-if="!isStudent()"
            class="help-feedback-form-title"
          >
            {{ $t('classroom.knowledgeBase:help.feedback.form.title:admin') }}
          </h3>
          <h3
            v-else
            class="help-feedback-form-title"
          >
            {{ $t('classroom.knowledgeBase:help.feedback.form.title:student') }}
          </h3>
          <form @submit.prevent="submitResponse(item, itemIndex)">
            <TextareaField
              v-model="formDataFeedback[itemIndex].answer"
              :label="
                Account.user.currentProfile !== 'student'
                  ? $t('classroom.knowledgeBase:help.feedback.form.textarea:admin')
                  : $t('classroom.knowledgeBase:help.feedback.form.textarea:student')
              "
              :validation="validation.formDataFeedback.$each[itemIndex].answer"
              :dark="accessibility"
              auto-grow
              @input="$emit('input-form')"
            />
            <div v-if="categoryOptions">
              <SelectField
                v-if="!isStudent()"
                v-model="formDataFeedback[itemIndex].category"
                :items="categoryOptions"
                :label="$tc('global:category', 1)"
                :show-optional="false"
                @input="handleCategoryChange(itemIndex)"
              />
              <SelectField
                ref="subcategory"
                v-if="!isStudent()"
                v-model="formDataFeedback[itemIndex].subcategory"
                :items="subcategoryOptions"
                :label="$t('global:subcategory')"
                :show-optional="false"
                :disabled="isSubcategoryDisabled(itemIndex)"
              />
            </div>
            <FileField
              v-model="formDataFeedback[itemIndex].file"
              :label="$t('global:form.attach.file')"
              :accept="acceptedFormats"
              :dark="accessibility"
            />
          </form>
        </div>
        <div
          class="action-forward-response"
          :class="{ 'center-button': isStudent() }"
        >
          <Action
            v-if="!isStudent()"
            :text="$t('global:cancel')"
            icon-size="small"
            type="button"
            flat
            @click="cancelForm('send')"
          />
          <Action
            :text="$t('global:form.send')"
            :dark="accessibility"
            type="button"
            primary
            large
            fixed-width
            @click="submitResponse(item, itemIndex)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './styles.scss';
</style>
