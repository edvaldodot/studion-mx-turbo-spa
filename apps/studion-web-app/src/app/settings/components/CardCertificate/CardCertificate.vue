<script>
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Chip from '@/components/general/Chip'

export default {
  name: 'CardCertificate',

  components: {
    Action,
    Dropdown,
    DropdownLink,
    Chip,
  },

  props: {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    styles: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    canRemove: {
      type: Boolean,
      default: false,
    },
    templateAlias: {
      type: String,
      default: 'default',
    },
  },

  data() {
    return {
      mutableBookmark: this.bookmark,
      option: {
        icon: 'dots-vertical',
        links: [
          {
            text: 'Facebook',
            event: 'shareFacebook',
          },
          {
            text: 'Twitter',
            event: 'shareTwitter',
          },
        ],
      },
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility']),
  },

  methods: {
    editItem() {
      this.$emit('edit')
    },
    deleteItem() {
      this.$emit('delete')
    },
    openItem() {
      this.$emit('open')
    },
  },
}
</script>

<template>
  <div class="card-certificate">
    <div class="card-certificate-header">
      <div class="card-certificate-image-wrapper">
        <img
          :src="thumbnail"
          class="card-certificate-image"
        />
        <div
          :class="[templateAlias]"
          class="card-certificate-body"
          v-html="body"
        ></div>
      </div>
      <div class="card-certificate-options">
        <Dropdown
          v-if="editable && !isDefault"
          class="card-media-options-item text-color bg-primary border-circle"
          icon="dots-vertical"
          icon-size="medium"
          right
        >
          <DropdownLink
            v-if="$listeners.edit"
            :text="$t('global:edit')"
            @click="editItem()"
          />
          <DropdownLink
            v-if="$listeners.delete && canRemove"
            :text="$t('global:remove')"
            @click="deleteItem()"
          />
        </Dropdown>
      </div>
    </div>
    <div class="card-certificate-content">
      <Chip
        :text="styles"
        color="success"
      />
      <h3
        v-if="title"
        v-shave="{ height: 60 }"
        class="card-certificate-title"
        :title="title"
      >
        {{ title }}
      </h3>
    </div>
    <div class="card-certificate-footer">
      <Action
        :text="$t('global:visualize')"
        :dark="accessibility"
        type="button"
        flat
        @click="openItem()"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import 'CardCertificate.scss';
</style>
