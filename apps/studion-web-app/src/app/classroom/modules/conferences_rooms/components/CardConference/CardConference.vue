<script>
import { mapActions, mapState } from 'vuex'
import { format, isBefore, isAfter, parseISO, subMinutes } from 'date-fns'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Icon from '@/components/general/Icon'
import Tooltip from '@/components/general/Tooltip'
import config from '@/config'
import CardMandatory from '@/components/general/CardMandatory'
import ModalConfirm from '@/components/general/ModalConfirm'

const { HIDE_STUDENT_CONFERENCE_RECORD, HIDE_CONFERENCE_RECORD } = config
const Dropdown = () => import('@/components/general/Dropdown')
const DropdownLink = () => import('@/components/general/DropdownLink')

export default {
  name: 'CardConference',
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    Dropdown,
    DropdownLink,
    Icon,
    Tooltip,
    CardMandatory,
    ModalConfirm,
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
    earlyAccess: {
      type: Number,
      default: 0,
    },
    hasAttachments: {
      type: Boolean,
      default: false,
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
    recordingPassword: {
      type: String,
      default: null,
    },
    recordingUrl: {
      type: String,
      default: null,
    },
    lesson: {
      type: Object,
      default: () => {},
    },
    mandatory: {
      type: Boolean,
      default: false,
    },
    showPasswd: {
      type: Boolean,
      default: true,
    },
    multipleSessions: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      mutableBookmark: this.bookmark,
      format: format,
      showMultiModal: 0,
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:conference')
    },
    status() {
      return !this.active
        ? 'inactive'
        : isBefore(new Date(), subMinutes(parseISO(this.startTime), this.earlyAccess || 0))
        ? 'waiting'
        : isAfter(new Date(), parseISO(this.endTime))
        ? 'closed'
        : 'active'
    },
    background() {
      return this.thumbnail ? this.thumbnail : '/assets/images/themes/default/bkg/chat-default.jpg'
    },
    showRecordData() {
      return !(HIDE_STUDENT_CONFERENCE_RECORD && this.equalsProfile('student'))
    },
    hideConferencePassword() {
      return HIDE_CONFERENCE_RECORD
    },
    isEnabledFeatureAutoCreateLesson() {
      return this.$isEnabledFeature('auto_create_conference_lessons')
    },
    isProcessingVideo() {
      return (
        (this.item.generateVideo || this.item.generateLesson) &&
        this.daysSinceDate(this.item.schedulePeriod.end) < 7
      )
    },
    hasVideo() {
      return (this.recordingUrl && !this.item.generateLesson) ||
        (this.item.lesson.id && this.item.generateLesson && this.isEnabledFeatureAutoCreateLesson) ||
        (this.item.video.id && this.item.generateVideo)
    }
  },
  methods: {
    ...mapActions(['setFeedback']),
    isBookmark() {
      return this.mutableBookmark ? 'bookmark' : 'bookmark-outline'
    },
    setBookmark() {
      this.mutableBookmark = !this.mutableBookmark
      this.$emit('bookmark')
    },
    getBackgroundImage() {
      return this.thumbnail ? `url('${this.thumbnail}')` : null
    },
    activate() {
      this.$emit('activate')
    },
    deactivate() {
      this.$emit('deactivate')
    },
    editHandler() {
      if (this.multipleSessions) {
        this.showMultiModal = this.id
        return
      }

      this.edit()
    },
    edit() {
      this.showMultiModal = 0
      this.$emit('edit')
    },
    move() {
      this.$emit('move')
    },
    remove() {
      this.$emit('remove')
    },
    access(id) {
      this.$emit('access', id)
    },
    accessRecorded() {
      this.$emit('access-recorded')
    },
    openParticipants() {
      this.$emit('openParticipants')
    },
    openAttachmentsModal(id) {
      this.$emit('openAttachments', id)
    },
    refreshAction(id) {
      this.$emit('refreshAction', id)
    },
    tooltipContent({ success, message }) {
      const errors = [
        'conference_room_not_found',
        'conference_not_activate',
        'provider_unavailable',
        'course_not_exists',
        'validation_error',
        'recording_unavailable',
      ]
      return this.$t('classroom.conference:lesson.html', {
        title: this.$t('classroom.conference:lesson.title'),
        status: this.$t(`classroom.conference:lesson.${success}`),
        content: this.$t(
          `classroom.conference:lesson.error.${errors.includes(message) ? message : 'default'}`
        ),
        active: !success ? 'active' : '',
      })
    },
    copyLink() {
      const URL =
        window.origin +
        this.$router.resolve({
          name: 'classroom.conference.live',
          params: { id: this.id, session_uuid: this.$route.params.session_uuid },
        }).href

      navigator.clipboard.writeText(URL)

      this.setFeedback({ message: this.$t('global:clipboard.copy') })
    },
  },
}
</script>

<template>
  <Card
    rounded
    class="card-conference"
  >
    <div class="card-conference__header">
      <CardMandatory v-if="mandatory" />
      <span
        v-if="isEnabledFeatureAutoCreateLesson"
        class="td-tag td-tag-fixed card-conference__status"
        :class="[`is-${lesson.success}`]"
      >
        <Tooltip
          v-if="status === 'closed' && lesson.success"
          :uppercase="false"
          :width="120"
          medium-font
          shadow
          dark
        >
          <template #activator="{ on }">
            <Icon
              name="check-all"
              wrapper
              size="medium"
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>
          <span v-html="tooltipContent(lesson)" />
        </Tooltip>

        <Tooltip
          v-if="status === 'closed' && !lesson.success && lesson.message"
          :uppercase="false"
          :width="150"
          medium-font
          shadow
          dark
        >
          <template #activator="{ on }">
            <Icon
              name="close"
              wrapper
              size="small"
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>
          <span v-html="tooltipContent(lesson)" />
        </Tooltip>
      </span>

      <Dropdown
        v-if="hasWriteAccess"
        class="generic-card__options card-conference__options"
        icon="dots-vertical"
        icon-size="medium"
        right
      >
        <DropdownLink
          v-if="!active"
          :text="$t('global:activate')"
          @click="activate()"
        />
        <DropdownLink
          :text="$t('global:edit')"
          @click="editHandler()"
        />
        <DropdownLink
          :text="$t('global:move')"
          @click="move()"
        />
        <DropdownLink
          :text="$t('global:exclude')"
          @click="remove()"
        />
        <DropdownLink
          v-if="multipleSessions"
          :text="$t('global:form.sessions')"
          @click="$router.push({ name: 'classroom.conference.sessions', params: { id } })"
        />
      </Dropdown>

      <CardImage
        :src="background"
        :height="120"
        class="card-conference__header__image"
      />
    </div>
    <div class="card-conference__content__wrapper">
      <CardBody class="card-conference__content">
        <h3
          v-shave="{ height: 38 }"
          class="card-conference__title text-base"
          :title="name"
        >
          {{ name }}
        </h3>
        <div class="card-conference__dates">
          <span class="text-base">
            {{ $t('global:form.start') }}: <strong>{{ formatDate(startTime, 'long') }}</strong>
          </span>
          <span class="text-base">
            {{ $t('global:form.end') }}: <strong>{{ formatDate(endTime, 'long') }}</strong>
          </span>
        </div>
        <a
          v-if="totalParticipants"
          href="#"
          class="card-conference__participants"
          @click.prevent="openParticipants()"
        >
          {{
            $tc('classroom.conference:participants', totalParticipants, { num: totalParticipants })
          }}
        </a>
      </CardBody>

      <CardBody
        v-if="recordingUrl && recordingPassword && showRecordData && !hideConferencePassword && !item.generateLesson"
        class="card-conference__content"
      >
        <span
          class="card-conference__status__text text-base"
          :class="`is-${status}`"
        >
          {{ $t(`classroom.chat:status.${status}`) }}
        </span>
        <div class="card-conference__record">
          <span
            :data-testid="$testId('card-conference-recording-available')"
            class="record__available text-base"
          >
            <strong>{{ $t('classroom.conference:recording.available') }}</strong>
          </span>

          <template v-if="showPasswd">
            <span class="password__label text-base">
              {{ $t('classroom.conference:recording.password') }}
            </span>

            <span
              :data-testid="$testId('card-conference-password-value')"
              class="password__value text-base"
            >
              {{ recordingPassword }}
            </span>
          </template>
        </div>
      </CardBody>
      <CardBody
        v-else
        class="card-conference__content"
      >
        <span
          class="card-conference__status__text text-base"
          :class="`is-${status}`"
        >
          {{ $t(`classroom.chat:status.${status}`) }}
        </span>
      </CardBody>

      <CardActions class="card-conference__footer conference-actions">
        <Action
          v-if="hasVideo && showRecordData"
          class="conference-actions__recording access"
          :text="$t('classroom.conference:recording.access')"
          :dark="accessibility"
          secondary
          type="button"
          @click="accessRecorded"
        />

        <Tooltip
          v-else-if="status === 'closed' && isProcessingVideo"
          :uppercase="false"
          :width="230"
          medium-font
          shadow
        >
          <template #activator="{ on }">
            <Action
              class="conference-actions__recording"
              :text="$t('classroom.conference:recording.access')"
              :dark="accessibility"
              target="_blank"
              type="button"
              secondary
              disabled
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>
          <span v-html="$t('classroom.conference:lesson.error.recording_processing')" />
        </Tooltip>

        <p
          v-else-if="status === 'closed' && !isProcessingVideo"
          class="conference-actions__early-access"
          v-html="$t('classroom.conference:lesson.error.recording_unavailable')"
        ></p>

        <Tooltip
          v-else-if="earlyAccess > 0 && status === 'waiting'"
          :uppercase="false"
          :width="170"
          medium-font
          shadow
        >
          <template #activator="{ on }">
            <Action
              :text="$t('global:participate')"
              :dark="accessibility"
              primary
              disabled
              type="button"
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>
          <span
            v-if="earlyAccess > 0 && status === 'waiting'"
            v-html="
              $tc('classroom.conference:early.access.message', earlyAccess, { num: earlyAccess })
            "
          ></span>
        </Tooltip>


        <Tooltip
          v-else
          :uppercase="false"
          :width="170"
          medium-font
          shadow
        >
          <template #activator="{ on }">
            <Action
              :text="$t('global:participate')"
              :dark="accessibility"
              :disabled="status !== 'active'"
              type="button"
              primary
              @click="access(id)"
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>
          <span
            v-if="status === 'waiting'"
            v-html="$t('classroom.conference:early.access.tooltip')"
          />
        </Tooltip>

        <div class="conference-actions__separator">
          <Tooltip
            v-if="hasAttachments"
            :uppercase="false"
            medium-font
            vertical-align="top"
            shadow
          >
            <template #activator="{ on }">
              <Action
                class="conference-actions__attachments"
                :dark="accessibility"
                flat
                icon="attachment"
                @click="openAttachmentsModal(id)"
                @mouseenter.native="on.mouseenter"
                @mouseleave.native="on.mouseleave"
              />
            </template>
            <span v-html="$t('global:attachments.see')" />
          </Tooltip>

          <Tooltip
            v-if="
              notEqualsProfile('student') &&
              status === 'active' &&
              $isEnabledFeature('embedded_conference')
            "
            :uppercase="false"
            medium-font
            vertical-align="top"
            shadow
          >
            <template #activator="{ on }">
              <Action
                class="conference-actions__copy"
                text
                :dark="accessibility"
                type="button"
                icon="copy"
                @click="copyLink()"
                @mouseenter.native="on.mouseenter"
                @mouseleave.native="on.mouseleave"
              />
            </template>
            <span v-html="$t('global:copy.shareable.link')" />
          </Tooltip>
        </div>
      </CardActions>
    </div>

    <ModalConfirm
      :active="showMultiModal !== 0"
      :title="$t('classroom.conference:multiple.edit.title')"
      @confirm="edit()"
      @close="showMultiModal = 0"
    >
      <p>{{ $t('classroom.conference:multiple.edit.description') }}</p>
    </ModalConfirm>
  </Card>
</template>

<style lang="scss">
@import 'CardConference.scss';
</style>