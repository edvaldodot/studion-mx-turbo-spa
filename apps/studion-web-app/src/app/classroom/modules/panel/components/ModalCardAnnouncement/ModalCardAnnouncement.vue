<script>
import { cardAnnouncementMixin } from '../../mixins'

export default {
  name: 'ModalCardAnnouncement',
  components: {
    Icon: () => import('@/components/general/Icon'),
  },
  mixins: [cardAnnouncementMixin],
}
</script>

<template>
  <div class="modal-card-card-announcement">
    <h2 class="modal-title text-color">{{ title }}</h2>

    <div class="modal-card-card-announcement__header">
      <div class="user-profile">
        <div class="user-profile__image-wrapper">
          <img
            v-if="user.image"
            :src="user.image"
            :alt="user.name"
            class="user-profile__image"
          />
          <Icon
            v-else
            name="account_circle"
            class="user-profile__icon"
          />
        </div>
        <span class="user-profile__position">{{ user.position }}</span>
        <span class="user-profile__name">{{ user.name }}</span>
      </div>

      <div
        v-if="Account.user.currentProfile === 'student'"
        class="modal-card-card-announcement__info"
      >
        <span class="modal-card-card-announcement__status">{{ date }}</span>
      </div>
      <div
        v-else
        class="modal-card-card-announcement__info"
      >
        <span
          v-if="!hideStatus"
          class="modal-card-card-announcement__status"
        >
          {{ status }}
        </span>
        <span class="modal-card-card-announcement__date">{{ date }}</span>
      </div>
    </div>

    <div class="modal-card-card-announcement__content">
      <div v-html="description"></div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'ModalCardAnnouncement.scss';
</style>
