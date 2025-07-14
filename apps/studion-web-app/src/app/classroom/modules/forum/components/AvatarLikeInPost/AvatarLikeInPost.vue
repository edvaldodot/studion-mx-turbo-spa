<script>
import { defineComponent } from 'vue'
import Icon from '@/components/general/Icon'
import TooltipSlot from '@/components/general/TooltipSlot'

export default defineComponent({
  name: 'AvatarLikeInPost',

  components: {
    Icon,
    TooltipSlot,
  },

  props: {
    users: {
      type: Array,
      default: () => [],
    },
  },
})
</script>

<template>
  <div
    class="avatar-like-in-post"
    :data-testid="$testId('avatar-like-in-post')"
  >
    <div
      v-for="(user, i) in users.slice(0, 3)"
      :key="user.id"
    >
      <TooltipSlot
        :uppercase="false"
        shadow
        dark
      >
        <template #activator="{ on }">
          <img
            v-if="user.applicationUser.userData.image"
            :style="{ zIndex: 2 + i }"
            :src="user.applicationUser.userData.image"
            v-on="on"
          />
          <Icon
            v-else
            name="account_circle"
          />
        </template>

        <template #content>
          <div class="avatar-list__tooltip">
            <p class="text-color">{{ user.applicationUser.userData.name }}</p>
          </div>
        </template>
      </TooltipSlot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'AvatarLikeInPost.scss';
</style>
