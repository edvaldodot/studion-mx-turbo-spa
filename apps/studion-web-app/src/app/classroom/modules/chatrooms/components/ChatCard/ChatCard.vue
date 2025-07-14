<script>
import { mapState } from 'vuex'
import { isBefore, isAfter, parseISO, format } from 'date-fns'

export default {
  name: 'ChatCard',
  components: {
    Action: () => import('@/components/general/Action'),
    Card: () => import('@/components/general/Card'),
    CardBody: () => import('@/components/general/CardBody'),
    CardImage: () => import('@/components/general/CardImage'),
    CardActions: () => import('@/components/general/CardActions'),
    Dropdown: () => import('@/components/general/Dropdown'),
    DropdownLink: () => import('@/components/general/DropdownLink'),
    DropdownLinkTooltip: () => import('@/components/shared/DropdownLinkTooltip'),
  },
  props: {
    id: {
      type: Number,
      default: null,
    },
    active: {
      type: Boolean,
      default: false,
    },
    showAction: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
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
    totalParticipants: {
      type: Number,
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
    url: {
      type: String,
      default: null,
    },
    actionJoinVisible: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      mutableBookmark: this.bookmark,
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:chat')
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
    background() {
      return this.thumbnail ? this.thumbnail : '/assets/images/themes/default/bkg/chat-default.jpg'
    },
    today() {
      return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    },
    isChatInitiated() {
      const today = new Date(this.today).getTime()
      const initialTime = new Date(this.startTime).getTime()

      return today > initialTime
    },
  },
  methods: {
    isBookmark() {
      return this.mutableBookmark ? 'bookmark' : 'bookmark-outline'
    },
    setBookmark() {
      this.mutableBookmark = !this.mutableBookmark
      this.$emit('bookmark')
    },
    activate() {
      this.$emit('activate')
    },
    deactivate() {
      this.$emit('deactivate')
    },
    edit() {
      this.$emit('status', this.status)
      this.$emit('edit')
    },
    remove() {
      this.$emit('remove')
    },
    access(id) {
      this.$emit('access', id)
    },
    openParticipants() {
      this.$emit('openParticipants')
    },
  },
}
</script>

<template>
  <Card
    rounded
    class="card-chat"
  >
    <Dropdown
      class="generic-card__options card-chat__options"
      icon="dots-vertical"
      icon-size="medium"
      right
    >
      <DropdownLink
        :text="`${$t('global:edit')} ${$t('classroom.chat:modal.nickname.form:nickname')}`"
        @click="$router.push({ name: 'classroom.chat.nickname' })"
      />

      <template v-if="hasWriteAccess">
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
          :text="$t('global:view.more')"
          @click="$emit('seemore')"
        />
        <DropdownLinkTooltip
          :dropdown-props="{
            text: $t('global:edit'),
            disabled: isChatInitiated,
          }"
          :tooltip="{
            condition: isChatInitiated,
            text: $t('classroom.chat:feedback.edit.error.1'),
            props: { uppercase: false },
          }"
          @click="$emit('edit')"
        />

        <DropdownLink
          :text="$t('global:remove')"
          @click="remove()"
        />
      </template>
    </Dropdown>

    <CardImage
      class="card-chat__header"
      :height="120"
      :src="background"
      overlay
    />

    <CardBody class="card-chat__content">
      <h3
        class="card-chat__title compact-name"
        :title="name"
      >
        {{ name }}
      </h3>

      <div class="card-chat__dates">
        <span
          >{{ $t('global:form.start') }}: <strong>{{ formatDate(startTime, 'long') }}</strong></span
        >
        <span
          >{{ $t('global:form.end') }}: <strong>{{ formatDate(endTime, 'long') }}</strong></span
        >
      </div>

      <span
        class="card-chat__status"
        :class="[`is-${status}`]"
      >
        {{ $t(`classroom.chat:status.${status}`) }}
      </span>

      <a
        v-if="totalParticipants"
        class="card-chat__participants"
        href="#"
        @click.prevent="openParticipants()"
      >
        {{ $tc('classroom.chat:participants', totalParticipants, { num: totalParticipants }) }}
      </a>
    </CardBody>

    <CardActions class="card-chat__footer">
      <Action
        v-if="active && showAction"
        type="button"
        :text="status === 'active' ? $t('global:participate') : $t('global:visualize')"
        :dark="accessibility"
        flat
        @click="access(id)"
      />
    </CardActions>
  </Card>
</template>

<style lang="scss">
@import 'ChatCard.scss';
</style>
