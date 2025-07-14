<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import Tooltip from '@/components/general/Tooltip'

export default defineComponent({
  name: 'GroupList',

  components: {
    Action,
    Icon,
    Tooltip,
  },

  props: {
    users: {
      type: Array,
      default: () => [],
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
    isLonely: {
      type: Boolean,
      default: false,
    },
    deadlinePreProject: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    isAlone() {
      return this.users.length === 1 && this.isLonely && this.Account.user.uuid
    },

    disableExit() {
      if (this.isAlone) {
        return true
      }
      if (this.users.length > 1 && this.isOwner) {
        return true
      }
      if (this.deadlinePreProject) {
        return true
      }
      return false
    },
  },

  methods: {
    exitGroup() {
      if (this.disableExit) return
      this.$emit('group:exit')
    },
  },
})
</script>

<template>
  <div class="group__area">
    <h4 class="group__title">{{ $t('pre.project.panel.group:your.group') }}</h4>

    <div class="group__members">
      <div
        v-if="users.length"
        class="group__users"
      >
        <div
          v-for="user in users"
          :key="user.enrollment_id"
          class="user__user"
        >
          <div class="user__photo">
            <img
              v-if="user.image"
              :src="user.image"
            />
            <Icon
              v-else
              name="account_circle"
            />
          </div>

          <div class="user__info">
            <h3 class="user__name">{{ user.name }}</h3>
            <p class="user__role">{{ $t(`global:${user.role}`) }}</p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="members__empty"
      >
        <p class="text-color">{{ $t('pre.project.panel.group:empty') }}</p>
      </div>

      <div
        v-if="!isAlone && (users.length > 0 || (deadlinePreProject && users.length > 0))"
        class="user__buttons"
      >
        <Tooltip
          v-if="disableExit"
          :uppercase="false"
          :bold-font="false"
          :width="200"
          vertical-align="top"
        >
          <template #activator="{ on }">
            <Action
              :text="$t('pre.project.panel.group:exit')"
              class="btn-add-question"
              type="button"
              primary
              large
              disabled
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>

          <span>{{
            deadlinePreProject
              ? $tc('pre.project.panel.group:exit:deadline')
              : $t('pre.project.panel.group:exit:disabled')
          }}</span>
        </Tooltip>

        <Action
          v-else
          :text="$t('pre.project.panel.group:exit')"
          class="btn-add-question"
          type="button"
          primary
          large
          @click="exitGroup"
        />
      </div>

      <div
        v-else-if="isAlone"
        class="user__buttons"
      >
        <span class="user-group-isLonely">{{ $t('pre.project.panel.group:exit:isLonely') }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.user-group-isLonely {
  font-size: 16px;
}
</style>
