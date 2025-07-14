<script>
import { defineComponent } from 'vue'

import Dropdown from '../Dropdown'
import DropdownLink from '../DropdownLink'
import Icon from '../Icon'

export default defineComponent({
  name: 'TagSelector',

  components: {
    Dropdown,
    DropdownLink,
    Icon,
  },

  props: {
    tags: {
      type: Array,
      required: true,
    },
    onlyTag: {
      type: Boolean,
      default: false,
    },
    tagLabel: {
      type: String,
      default: null,
    },
    tagValues: {
      type: Array,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      inputValues: this.tags.map(() => ''),
    }
  },

  methods: {
    getDropdownText() {
      return this.$media.mobile
        ? this.$t('global:form.tags')
        : this.$t('settings.certificate:modal.tags')
    },
    getTagI18N(tag) {
      return this.$t(`${this.tagLabel}${tag.replace(/[{ }\s]/g, '').toLowerCase()}`)
    },
    handleTagClick(tag, index) {
      if (tag.includes('?')) {
        const inputValue = this.inputValues[index] || '0'
        const newTag = tag.replace('?', inputValue)
        this.$emit('tag', newTag)
        this.$set(this.inputValues, index, '')
      } else {
        this.$emit('tag', tag)
      }
    },
    handleInputChange(index, event) {
      let value = event.target.value

      value = value.replace(/\D/g, '')
      if (value.length > 3) {
        value = value.slice(0, 3)
      }

      this.$set(this.inputValues, index, value)
    },
  },
})
</script>

<template>
  <div
    v-if="tags"
    class="tag-selector"
    :data-testid="$testId('tag-selector')"
  >
    <Dropdown
      :class="{ 'has-title': title }"
      :text="getDropdownText()"
      classes="add-people"
      icon="add"
      right
      stop-propagation
    >
      <div
        v-if="title"
        class="tag-selector__title"
      >
        <p>{{ title }}</p>
      </div>
      <DropdownLink
        v-for="(tag, index) in tags"
        :key="tag + index"
        :text="tagValues ? tagValues[index] : getTagI18N(tag)"
        disable-uppercase
        @click="handleTagClick(tag, index)"
      >
        <template #description>
          <p class="tag-selector__tag">
            <span v-if="tag.includes('?')">
              {{ tag.replace('?', inputValues[index] || '?') }}
              <input
                v-model="inputValues[index]"
                :placeholder="$t('global:form.tags.placeholder')"
                class="numeric-input"
                type="text"
                maxlength="3"
                @input="handleInputChange(index, $event)"
                @click.stop
              />
            </span>
            <span v-else>
              {{ tag }}
            </span>
          </p>
        </template>
        <template #onhover>
          <Icon
            name="add"
            wrapper
          />
        </template>
      </DropdownLink>
    </Dropdown>
  </div>
</template>

<style lang="scss">
@import './TagSelector.scss';
</style>
