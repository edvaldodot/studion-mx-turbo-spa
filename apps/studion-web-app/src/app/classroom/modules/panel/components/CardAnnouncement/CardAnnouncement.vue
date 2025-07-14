<script>
import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FlagFixed from '@/components/general/FlagFixed'
import TextReduce from '@/components/general/TextReduce'
import Icon from '@/components/general/Icon'

import { cardAnnouncementMixin } from '../../mixins'

export default {
  name: 'CardAnnouncement',

  components: {
    Action,
    Card,
    CardBody,
    Dropdown,
    DropdownLink,
    FlagFixed,
    Icon,
    TextReduce,
  },

  mixins: [cardAnnouncementMixin],

  data() {
    return {
      showReadMore: false,
      flagTitle: 'global:flag.fixed.announcement',
      flagIcon: 'pin',
    }
  },

  computed: {
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('classroom:announcement')
    },
    maxHeight() {
      return this.$media.desktop ? 220 : 300
    },
  },

  mounted() {
    this.handleSetupShowMoreButton()
  },

  updated() {
    this.handleSetupShowMoreButton()
  },

  methods: {
    edit() {
      this.$emit('edit')
    },
    remove() {
      this.$emit('remove')
    },
    open() {
      this.$emit('open')
    },

    /**
     * Checks if description div is greater than allowed height.
     * Then set button's visibility.
     */
    matchHeight() {
      const { cardDescription } = this.$refs

      if (!cardDescription) return

      const descriptionHeight = cardDescription.clientHeight
      this.showReadMore = descriptionHeight >= this.maxHeight
    },

    handleSetupShowMoreButton() {
      const MAX_TRIES = 10
      const TIME_INTERVAL = 200
      let tries = 0

      const interval = setInterval(() => {
        tries++
        this.matchHeight()
        if (this.showReadMore) {
          clearInterval(interval)
        }

        if (tries >= MAX_TRIES) {
          clearInterval(interval)
        }
      }, TIME_INTERVAL)
    },
  },
}
</script>

<template>
  <card
    rounded
    :class="{ 'card-announcement': true }"
  >
    <card-body
      :class="{ 'card-fixed': fixed }"
      class="card-padding-top"
    >
      <FlagFixed
        v-if="fixed"
        :flag-title="flagTitle"
        :flag-icon="flagIcon"
      />

      <div
        v-if="hasWriteAccess && options"
        class="card-announcement__options"
      >
        <dropdown
          icon="dots-vertical"
          right
          class="card-announcement__options-item"
        >
          <dropdown-link
            :text="$t('global:edit')"
            @click="edit()"
          />
          <dropdown-link
            :text="$t('global:remove')"
            @click="remove()"
          />
        </dropdown>
      </div>

      <div class="card-announcement__header user-profile">
        <div class="user-profile">
          <div class="user-profile__image-wrapper">
            <img
              v-if="user.image"
              :src="user.image"
              :alt="user.name"
              class="user-profile__image"
            />
            <icon
              v-else
              name="account_circle"
              class="user-profile__icon user-profile__icon"
            />
          </div>

          <span class="user-profile__position">{{
            user.position === 'Admin'
              ? $t('global:admin')
              : !user.position
              ? $t('classroom.panel.announcements:used.removed')
              : user.position
          }}</span>
          <TextReduce
            :lenght-text="25"
            :text="!user.name ? $t('classroom.panel.announcements:used.removed') : user.name"
            class-style="user-profile__name"
          />
        </div>

        <div
          v-if="Account.user.currentProfile === 'student'"
          class="card-announcement__info"
        >
          <span class="card-announcement__status">{{ date }}</span>
        </div>

        <div
          v-else
          class="card-announcement__info"
        >
          <span
            v-if="!hideStatus"
            class="card-announcement__status"
            >{{ status }}</span
          >
          <span class="card-announcement__date">{{ date }}</span>
        </div>
      </div>

      <div class="card-announcement__content">
        <h2 class="card-featured-text">{{ title }}</h2>
        <div
          v-if="description"
          ref="cardDescription"
          class="card-announcement__description"
          :style="{ 'max-height': maxHeight + 'px', 'min-height': maxHeight / 2 + 'px' }"
        >
          <div v-html="description"></div>
        </div>

        <section
          v-if="showReadMore"
          class="card-announcement__read-more"
        >
          <Action
            :text="$t('classroom.panel.announcements:card.btn.read')"
            :dark="accessibility"
            type="button"
            flat
            @click="open"
          />
        </section>
      </div>
    </card-body>
  </card>
</template>

<style lang="scss">
@import 'CardAnnouncement.scss';
</style>
