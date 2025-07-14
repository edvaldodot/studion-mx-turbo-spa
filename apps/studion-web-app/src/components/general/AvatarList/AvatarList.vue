<script>
import { defineComponent } from 'vue'
import Icon from '../Icon'
import TooltipSlot from '../TooltipSlot'

export default defineComponent({
  name: 'AvatarList',

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
    class="avatar-list"
    :data-testid="$testId('avatar-list')"
  >
    <div
      v-for="(user, i) in users"
      :key="user.id"
    >
      <TooltipSlot
        :uppercase="false"
        shadow
        dark
      >
        <template #activator="{ on }">
          <img
            v-if="user.applicationUser.image"
            :style="{ zIndex: 2 + i }"
            :src="user.applicationUser.image"
            v-on="on"
          />
          <Icon
            v-else
            name="account_circle"
          />
        </template>

        <template #content>
          <div class="avatar-list__tooltip">
            <h3>{{ user.profile.name === 'Admin' ? $t('global:admin') : user.profile.name }}</h3>
            <p class="text-color">{{ user.applicationUser.name }}</p>
          </div>
        </template>
      </TooltipSlot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'AvatarList.scss';
</style>
