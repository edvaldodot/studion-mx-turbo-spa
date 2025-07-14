<script>
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import CardMandatory from '@/components/general/CardMandatory'
import TooltipSlot from '@/components/general/TooltipSlot'

export default {
  name: 'CardMedia',
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    Dropdown,
    DropdownLink,
    Icon,
    CardMandatory,
    TooltipSlot,
  },
  props: {
    id: {
      type: [Number, String],
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    metaType: {
      type: String,
      default: 'file',
    },
    url: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    bookmark: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    openable: {
      type: Boolean,
      default: false,
    },
    downloadable: {
      type: Boolean,
      default: false,
    },
    mandatory: {
      type: Boolean,
      default: false,
    },
    onlyReadBranch: {
      type: Boolean,
      default: false,
    },
    countFiles: {
      type: Number,
      default: 0,
    },
  },

  computed: {
    ...mapState(['Account', 'accessibility']),
    backgroundImage() {
      return this.thumbnail ? `url('${this.thumbnail}')` : ''
    },
    fileTypeIcon() {
      return this.type ? 'file-' + this.type : 'file'
    },
    getIconName() {
      return this.metaType === 'file'
        ? this.fileTypeIcon
        : this.metaType === 'folder'
        ? 'folder'
        : 'external-link'
    },
  },
  methods: {
    deleteFile() {
      this.$emit('delete')
    },
    editFile() {
      this.$emit('edit')
    },
    openFile() {
      this.$emit('open')
    },
    downloadFile() {
      this.$emit('download')
    },
    async accessFolderContent() {
      this.$emit('accessFolder')
    },
  },
}
</script>

<template>
  <Card
    :height="300"
    :class="[`card-type-${metaType}`]"
    class="card-media"
    rounded
  >
    <CardImage
      :src="backgroundImage"
      :height="120"
      class="card-media__header"
    >
      <CardMandatory v-if="mandatory" />
      <Icon
        v-if="!thumbnail"
        :name="getIconName"
        class="card-media__filetype-icon"
        wrapper
      />
    </CardImage>
    <div
      v-if="onlyReadBranch"
      class="card-media__branch-tooltip"
    >
      <TooltipSlot
        :width="460"
        :arrow="!$media.mobile"
        class="tooltip__topic"
        shadow
        dark
      >
        <template #activator>
          <Icon
            class="tip__icon"
            size="small"
            name="help"
            wrapper
          />
        </template>

        <template #content>
          <p class="tooltip__description">
            {{ $t('trails.create.solutions.only.read.branch') }}
          </p>
        </template>
      </TooltipSlot>
    </div>
    <div class="card-media__options">
      <Dropdown
        v-if="!onlyReadBranch"
        icon="dots-vertical"
        icon-size="medium"
        right
      >
        <DropdownLink
          v-if="editable && $listeners.edit"
          :text="$t('global:edit')"
          @click="editFile()"
        />
        <DropdownLink
          v-if="openable"
          :text="$t('global:view.more')"
          @click="openFile()"
        />
        <DropdownLink
          v-if="!isLocked && $listeners.delete"
          :text="$t('global:remove')"
          @click="deleteFile()"
        />
        <DropdownLink
          v-if="downloadable"
          :text="$t('global:download')"
          @click="downloadFile()"
        />
      </Dropdown>
    </div>
    <CardBody>
      <h3
        v-shave="{ height: 36 }"
        :title="title"
        class="card-media__title"
      >
        {{ title }}
      </h3>
      <div
        v-if="description !== null"
        class="card-media__description"
      >
        <p
          v-shave="{ height: 48 }"
          :title="description"
        >
          {{ description }}
        </p>
      </div>
      <div class="card-media-info">
        <span
          v-if="metaType !== 'external_link'"
          class="card-media__size"
        >
          {{ size }}
        </span>
        <span
          v-if="metaType === 'external_link'"
          class="card-media__size"
        >
          {{ $t('global:external.media') }}
        </span>
      </div>
    </CardBody>
    <CardActions class="card-media__footer">
      <Action
        v-if="metaType === 'file'"
        :text="$t('global:download')"
        :dark="accessibility"
        type="button"
        flat
        @click="downloadFile()"
      />
      <Action
        v-if="metaType === 'external_link'"
        :text="$t('global:access')"
        :url="url"
        :dark="accessibility"
        type="link"
        target="_blank"
        flat
      />
      <Action
        v-if="metaType === 'folder'"
        :dark="accessibility"
        :text="$t('global:access')"
        type="link"
        flat
        @click="accessFolderContent()"
      />
    </CardActions>
  </Card>
</template>

<style lang="scss">
@import 'CardMedia.scss';
</style>
