<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import menuMixin from './menuMixin'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Icon from '@/components/general/Icon'
import TagSelector from '@/components/general/TagSelector'
import TextEditor from '@/components/general/TextEditor'

export default defineComponent({
  name: 'TextAITool',

  components: {
    Action,
    Checkbox,
    Icon,
    TagSelector,
    TextEditor,
  },

  mixins: [menuMixin],

  props: {
    aiPrompt: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      prompt: '',
      hoverMenu: null,
      showMenu: false,
      useContext: false,
    }
  },

  computed: {
    ...mapState({
      AiInstructions: (state) => {
        const current = state.Mediation.current
        if (
          current &&
          current.mediationPlan &&
          current.mediationPlan.meta &&
          current.mediationPlan.meta.customInstructions
        )
          return current.mediationPlan.meta.customInstructions
        return {}
      },
      GeneralInstructions: (state) => state.Mediation.customInstructions,
    }),

    getTags() {
      const allTags = [
        ...Object.keys(this.AiInstructions),
        ...this.GeneralInstructions.map((ci) => ci.tag),
      ]
      const allValues = [
        ...Object.keys(this.AiInstructions).map((val) => this.AiInstructions[val]),
        ...this.GeneralInstructions.map((ci) => ci.value),
      ]

      allTags.forEach((tag, index) => {
        const duplicateIdx = allTags.lastIndexOf(tag)
        const isDuplicated = duplicateIdx !== index
        if (isDuplicated) {
          allTags.splice(duplicateIdx, 1)
          allValues.splice(duplicateIdx, 1)
        }
      })

      return [allTags, allValues]
    },

    emptyTagsInUse() {
      if (!this.prompt) return
      const regex = /\{\{\{([^{}]+)\}\}\}/g
      const tags = this.prompt.match(regex)
      if (!tags) return null
      const filteredTags = tags.filter((tag) => this.emptyTags.includes(tag))
      return [...new Set(filteredTags)].toString().replaceAll(',', ', ')
    },

    emptyTags() {
      const emptyTags = []
      this.getTags[1].forEach((tag, index) => {
        if (tag === '') emptyTags.push(this.getTags[0][index])
      })
      return emptyTags
    },

    availableMenuItems() {
      if (this.aiPrompt) return this.menuItems
      return this.menuItems.filter((item) => item.title !== 'mediation.actions:ia.menu.title.write')
    },
  },

  methods: {
    ...mapActions(['addCustomPMTag']),

    closeMenu() {
      this.hoverMenu = null
      this.showMenu = false
    },

    registerTags() {
      const regex = /\{\{\{([^{}]+)\}\}\}/g
      const newTags = this.aiPrompt.match(regex)

      if (!newTags) return

      newTags.forEach((tag) => {
        const generalCi = this.GeneralInstructions.find((ci) => ci.tag === tag)
        if (generalCi) this.addCustomPMTag([generalCi.tag, generalCi.value])
      })
    },

    insertTag(tag) {
      const generalCi = this.GeneralInstructions.find((ci) => ci.tag === tag)
      if (generalCi) this.addCustomPMTag([generalCi.tag, generalCi.value])
      this.$refs.aiInput.addTag(tag)
    },

    clickMenu(item) {
      this.hoverMenu = item.action

      if (item.action === 'GenerateMessage') {
        this.prompt = this.aiPrompt
        this.registerTags()
        return this.emitPrompt({ prompt: this.aiPrompt })
      }

      this.emitPrompt({ operationCustomPromptType: item.action })
    },

    emitPrompt(item) {
      this.$emit('prompt', item)
      this.showMenu = false
    },
  },
})
</script>

<template>
  <div
    v-click-outside="closeMenu"
    :data-testid="$testId('text-editor-ia')"
    class="text-editor-ia"
  >
    <div class="text-editor-ia__input">
      <TextEditor
        ref="aiInput"
        v-model="prompt"
        :placeholder="$t('mediation.actions:ia.field.placeholder') + '...'"
        :formats="['spanEmbed']"
        class="mt-2"
        hide-details
        no-fixed
        @focus="showMenu = true"
      >
        <template #before-tools>
          <TagSelector
            :tags="getTags[0]"
            :tag-values="getTags[1]"
            @tag="insertTag($event)"
          />

          <Icon
            name="settings-outline"
            class="ia-settings"
            size="small"
            wrapper
            @click="$emit('settings', true)"
          />
        </template>

        <template #attachment>
          <Checkbox
            v-model="useContext"
            :items="[{ value: true, label: $t('mediation.actions:ia.checkbox.context') }]"
            class="ml-3 mt-5"
          />
        </template>
      </TextEditor>

      <Action
        :title="$t('global:apply')"
        :class="{ '--active': prompt }"
        :disabled="!prompt"
        type="button"
        icon="keyboard_backspace"
        wrapper
        @click="emitPrompt({ prompt: prompt, context: useContext })"
      />
    </div>

    <div
      v-if="showMenu && !prompt"
      class="text-editor-ia__float-menu"
    >
      <div
        class="float-menu-options"
        @mouseleave="hoverMenu = null"
      >
        <section
          v-for="(section, sectionIndex) in availableMenuItems"
          :key="sectionIndex"
        >
          <h3 v-if="section.title">{{ $t(section.title) }}</h3>
          <ul>
            <li
              v-for="(item, index) in section.items"
              :key="index"
              :class="`ai-${item.action}`"
              @mouseover="hoverMenu = item.action"
              @click="clickMenu(item)"
            >
              <Icon
                :name="item.icon"
                size="small"
                wrapper
              />
              {{ $t(item.text) }}
              <div class="submenu-icon">
                <Icon
                  v-if="item.subitems"
                  name="keyboard_arrow_right"
                  size="small"
                  wrapper
                />
              </div>

              <div
                v-if="item.subitems && hoverMenu === item.action"
                class="float-menu-options__submenu"
              >
                <ul>
                  <li
                    v-for="(subItem, subIndex) in item.subitems"
                    :key="subIndex"
                    @click.stop="clickMenu(subItem)"
                  >
                    {{ $t(subItem.text) }}
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div
      v-if="emptyTagsInUse"
      class="tag-validator mt-3"
    >
      <Icon
        name="alert-circle"
        size="small"
      />
      {{
        $tc('mediation.templates:create.form.ia.tip.validation', emptyTagsInUse.split(',').length, {
          tag: emptyTagsInUse,
        })
      }}
    </div>
  </div>
</template>

<style lang="scss">
@import './TextAITool.scss';
</style>
