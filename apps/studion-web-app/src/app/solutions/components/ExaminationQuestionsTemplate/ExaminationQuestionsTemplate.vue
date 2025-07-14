<script>
/// <reference path="./typedefs.js" />
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TooltipSlot from '@/components/general/TooltipSlot'
import ValidationMessage from '@/components/general/ValidationMessage'

export default defineComponent({
  name: 'ExaminationQuestionsTemplate',

  components: {
    Action,
    Autocomplete,
    InputField,
    SelectField,
    TooltipSlot,
    ValidationMessage,
  },

  props: {
    value: {
      type: Array,
      default: () => [],
    },

    validation: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      autocompleteLoading: false,
      autocompleteItems: [],
      mutableValue: this.value,
      oldItems: this.deepClone(this.value),
      summary: {},
    }
  },

  computed: {
    isEditing() {
      return !!this.$route.params.topicId
    },
  },

  created() {
    this.autocompleteLoading = true
    this.mutableValue = []
    this.attemptGetQuestionTemplateGroupSummary()
      .then((data) => {
        this.summary = data
        this.setSubjectAutocompleteItems(data)
      })
      .finally(() => {
        this.autocompleteLoading = false
        if (this.isEditing) this.setupEdit()
      })

    if (this.isEditing && this.value.length) return
    this.addEmptyTemplate()
  },

  methods: {
    ...mapActions(['attemptGetQuestionTemplateGroupSummary']),

    setupEdit() {
      this.oldItems.forEach((value, index) => {
        this.addEmptyTemplate()

        const currentValue = this.mutableValue[index]
        currentValue.template = [this.autocompleteItems.find((item) => item.id === value.id)]
        this.$nextTick(() => {
          currentValue.levels = value.levels

          currentValue.levelOptions.forEach((levelOption) => {
            const idx = value.levels.findIndex((lvl) => lvl.level === levelOption.value)
            if (idx > -1) currentValue.levelOptions[idx].hide = true
          })
        })
      })
    },

    /**
     * @param {Object[]} options
     */
    setSubjectAutocompleteItems(options = []) {
      this.autocompleteItems = options.map((item) => ({
        ...item,
        hide: false,
        onlySearchable: false,
      }))
    },

    /**
     * @param {Object[]} event
     * @param {QuestionTemplate} template
     */
    onSelectAutocompleteItem(event, template) {
      if (event === null) {
        this.showAutocompleteItem(template.id, false)
        template.id = null
      } else {
        template.id = event[0].id
        this.showAutocompleteItem(template.id, true)
      }

      template.levels = [this.createEmptyLevel()]
      if (!event) return
      this.setupTemplateOptions(event, template)
    },

    /**
     * Setup available items to prevent duplicated templates with the same ID.
     * @param {int} templateId
     * @param {boolean} value
     */
    showAutocompleteItem(templateId, value) {
      this.autocompleteItems.forEach((item) => {
        if (item.id === templateId) {
          item.hide = value
        }
      })
    },

    /**
     * Setup available options for current template selected to be used on Level Select component.
     * @param {QuestionTemplate} template
     */
    setupTemplateOptions(event, template) {
      template.levelOptions = []
      const [selectTemplate] = event

      if (selectTemplate.levels['1']) {
        template.levelOptions.push({
          text: this.$t('global:difficulty.easy'),
          value: 1,
          hide: false,
        })
      }

      if (selectTemplate.levels['3']) {
        template.levelOptions.push({
          text: this.$t('global:difficulty.medium'),
          value: 3,
          hide: false,
        })
      }

      if (selectTemplate.levels['5']) {
        template.levelOptions.push({
          text: this.$t('global:difficulty.hard'),
          value: 5,
          hide: false,
        })
      }
    },

    onSelectLevel(event, template, value) {
      if (!event || !template || !template.levelOptions) return
      template.levelOptions.forEach((option) => {
        if (!template.levels.find((lvl) => option.value === lvl.level)) {
          option.hide = false
        }
        if (event === option.value) {
          option.hide = value
        }
      })

      const currentLevel = template.levels.find((level) => level.level === event)
      if (currentLevel) currentLevel.total = template.template[0].levels[event].totalQuestions
    },

    triggerInputValue(value) {
      this.$emit('input', value)
    },

    addEmptyTemplate() {
      const templates = this.mutableValue
      templates.push({
        id: null,
        template: null,
        levelOptions: [],
        levels: [this.createEmptyLevel()],
      })

      this.triggerInputValue(this.mutableValue)
    },

    removeTemplate(index) {
      const templates = this.mutableValue

      const acItem = this.autocompleteItems.find((item) => item.id === templates[index].id)
      if (acItem) acItem.hide = false
      templates.splice(index, 1)

      this.triggerInputValue(templates)
    },

    /**
     * @returns {Level}
     */
    createEmptyLevel() {
      return {
        level: null,
        questions: null,
        scorePerQuestion: null,
        total: null,
      }
    },

    /**
     * @param {QuestionTemplate} template
     */
    addEmptyQuestionToTemplate(template) {
      if (!this.canWrite('courses')) return
      template.levels.push(this.createEmptyLevel())
      this.triggerInputValue(this.mutableValue)
    },

    /**
     * @param {QuestionTemplate} template
     * @param {number} innerIndex
     */
    removeQuestionFromTemplate(template, innerIndex) {
      if (!this.canWrite('courses')) return
      const [removedLevel] = template.levels.splice(innerIndex, 1)
      this.onSelectLevel(removedLevel.level, template, false)
      this.triggerInputValue(this.mutableValue)
    },
  },
})
</script>
<template>
  <div>
    <div class="modal-form-box examination-questions-template">
      <h3 class="modal-form-box-title text-color">
        {{ $t('solutions:tab.link.questionTemplates') }}
      </h3>

      <div
        v-for="(template, index) in mutableValue"
        :key="template.id"
        class="flex flex-column gap-4 bg-black-100 border-round-xl p-4 mb-3"
      >
        <Action
          v-if="canWrite('courses') && mutableValue.length > 1"
          class="close-outter"
          type="button"
          icon="close"
          dark
          @click="removeTemplate(index)"
        />

        <div>
          <Autocomplete
            v-model="template.template"
            :validation="validation.$each[index].id"
            :label="$t('solutions:tab.link.questionTemplates')"
            :items="autocompleteItems"
            :loading="autocompleteLoading"
            option-property="name"
            clear-on-delete
            dark
            class="mb-4"
            @input="onSelectAutocompleteItem($event, template)"
          />

          <div
            v-for="(question, innerIndex) in template.levels"
            :key="innerIndex"
          >
            <div
              class="flex flex-column gap-4"
              :class="{ 'has-close': template.levels.length > 1 }"
            >
              <SelectField
                v-model="question.level"
                :validation="validation.$each[index].levels.$each[innerIndex].level"
                :items="template.levelOptions"
                :label="$t('global:level')"
                :allow-clear="false"
                :disabled="!canWrite('courses') || !template.template"
                hide-error-details
                dark
                @input="onSelectLevel($event, template, true)"
              />

              <InputField
                v-model="question.questions"
                :validation="validation.$each[index].levels.$each[innerIndex].questions"
                :label="$t('solutions.create.classes:modal.question.quantity')"
                :disabled="!canWrite('courses') || !template.template"
                :min="1"
                type="number"
                hide-error-details
                dark
              />

              <InputField
                v-model="question.scorePerQuestion"
                :validation="validation.$each[index].levels.$each[innerIndex].scorePerQuestion"
                :label="$t('solutions.create.classes:modal.question.points')"
                :disabled="!canWrite('courses') || !template.template"
                :min="0.01"
                :step="0.5"
                :max="10"
                type="number"
                hide-error-details
                dark
              />

              <Action
                v-if="canWrite('courses') && template.levels.length > 1"
                :disabled="!canWrite('courses')"
                class="close-inner"
                type="button"
                icon="close"
                dark
                @click="removeQuestionFromTemplate(template, innerIndex)"
              />
            </div>

            <ValidationMessage
              :validation="validation.$each[index].levels.$each[innerIndex].questions"
              class="mt-2 mb-2"
            />
          </div>
        </div>

        <TooltipSlot
          :disable-content="
            !template.template || !(template.levels.length >= template.levelOptions.length)
          "
          dark
          shadow
        >
          <template #activator>
            <Action
              :text="`${$t('global:add')} ${$t('global:level')}`"
              :disabled="
                !canWrite('courses') ||
                !template.id ||
                template.levels.length >= template.levelOptions.length
              "
              type="button"
              class="mt-2"
              flat
              dark
              @click="addEmptyQuestionToTemplate(template)"
            />
          </template>

          <template #content>
            {{ $t('solutions.create.classes:modal.question.tooltip.level') }}
          </template>
        </TooltipSlot>
      </div>
    </div>

    <TooltipSlot
      :disable-content="!(mutableValue.length >= autocompleteItems.length)"
      dark
      shadow
    >
      <template #activator>
        <Action
          :disabled="!canWrite('courses') || mutableValue.length >= autocompleteItems.length"
          :text="`${$t('global:add')} ${$t('solutions:tab.link.questionTemplates')}`"
          class="btn-add-question text-primary"
          type="button"
          flat
          dark
          @click="addEmptyTemplate"
        />
      </template>

      <template #content>
        {{ $t('solutions.create.classes:modal.question.tooltip.template') }}
      </template>
    </TooltipSlot>
  </div>
</template>

<style lang="scss">
@import './ExaminationQuestionsTemplate.scss';
</style>
