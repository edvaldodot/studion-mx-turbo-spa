<script>
import { mapState } from 'vuex'
import { format, isBefore, isAfter, parseISO } from 'date-fns'
import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import MandatoryContent from './component/MandatoryContent.vue'
import SlugTooltip from '@/components/general/SlugTooltip'

export default {
  name: 'CardForum',
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    Dropdown,
    DropdownLink,
    Icon,
    MandatoryContent,
    SlugTooltip,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: null,
    },
    totalComments: {
      type: Number,
      default: null,
    },
    startTime: {
      type: String,
      default: null,
    },
    endTime: {
      type: String,
      default: null,
    },
    lastInteraction: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    mandatory: {
      type: Boolean,
      default: false,
    },
    mandatoryInteractions: {
      type: Object,
      default: null,
    },
    isEvaluative: {
      type: Boolean,
      default: false,
    },
    context: {
      type: String,
      default: 'forums',
    },
    slug: {
      type: String,
      default: '',
    },
    isMultiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      format: format,
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite(this.context)
    },
    status() {
      return !this.active
        ? 'inactive'
        : isBefore(new Date(), parseISO(this.startTime))
        ? 'waiting'
        : isAfter(new Date(), parseISO(this.endTime))
        ? 'closed'
        : 'active'
    },
    backgroundImage() {
      return this.thumbnail ? this.thumbnail : '/assets/images/themes/default/bkg/chat-default.jpg'
    },
  },
  methods: {
    activate() {
      this.$emit('activate')
    },
    deactivate() {
      this.$emit('deactivate')
    },
    edit() {
      this.$emit('edit')
    },
    remove() {
      this.$emit('remove')
    },
    access() {
      this.$emit('access')
    },
    evaluation() {
      this.$emit('evaluation')
    },
    sessions() {
      this.$emit('sessions')
    },
  },
}
</script>

<template>
  <card
    rounded
    :height="300"
    class="card-forum"
  >
    <Dropdown
      v-if="hasWriteAccess"
      icon="dots-vertical"
      right
      class="generic-card__options card-forum__options"
      icon-size="medium"
    >
      <DropdownLink
        v-if="!active"
        :text="$t('global:activate')"
        @click="activate()"
      />
      <DropdownLink
        v-if="active"
        :text="$t('global:deactivate')"
        @click="deactivate()"
      />
      <DropdownLink
        :text="$t('global:edit')"
        @click="edit()"
      ></DropdownLink>
      <DropdownLink
        v-if="isUserAllowedInContext('classroom:forum', 'remove')"
        :text="$t('global:remove')"
        @click="remove()"
      />
      <DropdownLink
        v-if="isEvaluative"
        :text="$t('classroom.forum:evaluate.students')"
        @click="evaluation()"
      />
      <DropdownLink
        v-if="isMultiple"
        :text="$t('global:form.sessions')"
        @click="sessions()"
      />
    </Dropdown>

    <card-image
      :src="backgroundImage"
      :height="120"
      class="card-forum__header"
    >
      <span
        v-if="$isEnabledFeature('slug_identity') && slug"
        class="slug__text"
      >
        <SlugTooltip :slug="slug" />
      </span>
    </card-image>

    <card-body class="card-forum__content">
      <div class="card-forum__status-wrapper">
        <span
          class="card-forum__status"
          :class="[`is-${status}`]"
        >
          <strong>
            {{ $t(`classroom.forum:status.${status}`) }}
          </strong>
        </span>

        <div class="card-forum-wrapper__dates">
          <icon
            class="card-forum-icon-calendar"
            name="calendar-range"
            size="medium"
            wrapper
          ></icon>
          <div class="card-forum__dates">
            <span>
              <strong> {{ $t('global:form.start') }}: </strong>
              <strong class="pl-1"> {{ formatDate(startTime, 'long') }}</strong>
            </span>
            <span>
              <strong> {{ $t('global:form.end') }}: </strong>
              <strong class="pl-1"> {{ formatDate(endTime, 'long') }}</strong>
            </span>
          </div>
        </div>
      </div>

      <h3
        class="card-forum__title"
        :title="title"
      >
        {{ title }}
      </h3>

      <div
        v-if="status !== 'waiting'"
        class="card-forum__comments"
      >
        <icon
          class="card-forum__comments-icon"
          name="forum"
          size="medium"
          wrapper
        ></icon>
        <span class="card-forum__comments-text"
          ><strong>{{
            $tc('global:interactions', totalComments, { num: totalComments })
          }}</strong></span
        >
        <span
          v-if="lastInteraction"
          class="card-forum__comments-text pl-1"
        >
          {{ formatDate(lastInteraction, 'long') }}
        </span>
      </div>

      <MandatoryContent
        v-if="mandatoryInteractions.meta.numPosts > 0 || mandatoryInteractions.meta.numComments > 0"
        :num-posts="mandatoryInteractions.meta.numPosts"
        :num-comments="mandatoryInteractions.meta.numComments"
        :check-post="mandatoryInteractions.meta.numPosts <= mandatoryInteractions.numPosts"
        :check-comments="
          mandatoryInteractions.meta.numComments <= mandatoryInteractions.numComments
        "
        :connective-or="mandatoryInteractions.meta.operator === 'or'"
      />
    </card-body>

    <card-actions class="card-forum__footer">
      <action
        v-if="status !== 'waiting' || notEqualsProfile('student')"
        :text="status === 'active' ? $t('global:participate') : $t('global:visualize')"
        :dark="accessibility"
        type="button"
        flat
        @click="access()"
      />
    </card-actions>
  </card>
</template>

<style lang="scss">
@import 'CardForum.scss';
</style>
