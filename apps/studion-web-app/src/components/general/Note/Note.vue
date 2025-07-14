<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'AppNote',

  components: {
    Dropdown,
    DropdownLink,
    Icon,
  },

  props: {
    mode: {
      type: String,
      default: 'options',
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    getOrigin() {
      const { referenceSlug } = this.data

      const translations = {
        topic: this.$t('global:lesson'),
        course: this.$tc('global:notes', 2),
      }

      return translations[referenceSlug] || this.$t(`solutions:tools.${referenceSlug}`)
    },
  },
})
</script>

<template>
  <div
    :class="`--${mode}-mode`"
    class="note"
    @click="$emit('click')"
  >
    <div
      class="note-options"
      @click.stop
    >
      <Icon
        v-if="mode === 'view'"
        name="close"
        wrapper
        @click="$emit('close')"
      />

      <Dropdown
        v-if="mode === 'list'"
        icon="dots-vertical"
        icon-size="small"
        right
      >
        <DropdownLink
          :text="$t('global:edit')"
          @click="$emit('edit')"
        />
        <DropdownLink
          :text="$t('global:download')"
          @click="$emit('download')"
        />
        <DropdownLink
          :text="$t('global:remove')"
          @click="$emit('delete')"
        />
      </Dropdown>
    </div>

    <div class="note-main">
      <div class="origin">{{ getOrigin() }}</div>
      <p class="title">{{ data.title }}</p>
      <p
        class="content"
        :class="{ '--clamp': mode === 'list' }"
        v-html="data.content"
      ></p>
    </div>

    <div
      v-if="!hideFooter"
      class="note-footer"
    >
      <div class="note-footer-info">
        <p class="date">{{ formatDate(data.createdAt, 'long').replace(',', '') }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Note.scss';
</style>
