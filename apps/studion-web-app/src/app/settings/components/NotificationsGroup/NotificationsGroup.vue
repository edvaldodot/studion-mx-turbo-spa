<template>
  <div class="notification__group">
    <div
      :class="{'is-open': groupExpanded}"
      @click="toggleExpansion"
      class="group__wrapper"
    >
      <div>
        <Icon v-if="groupExpanded" name="keyboard_arrow_up" class="group__icon" />

        <Icon v-else name="keyboard_arrow_down" class="group__icon" />

        <span class="group__title">{{ $t(`settings.notifications:group.title.${groupAlias}`) }}</span>
      </div>

      <Checkbox
        v-model="groupToggle"
        :items="[{value: true}]"
        @input="toggleGroup"
        switch-type
      />
    </div>
    <div v-show="groupExpanded" class="group__content">
      <div
        v-for="(notification, index) in value"
        :key="`notification-${notification.id}`"
        class="notification__wrapper"
      >
        <div class="notification__title">{{ $t(`settings.notifications:type.${notification.alias}`) }}</div>

        <div class="notification__edit">
          <Action
            @click="editOptionMessage(notification.id)"
            type="button"
            icon="mode_edit"
            flat
          />
        </div>

        <Checkbox
          :items="[{value: true}]"
          :value="notification.active"
          @input="updateNotification(index, $event)"
          switch-type
        />
      </div>
    </div>
  </div>
</template>
<script>
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Icon from '@/components/general/Icon'

export default {
  components: {
    Action,
    Checkbox,
    Icon
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    groupAlias: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      groupToggle: false,
      groupExpanded: false
    }
  },
  created () {
    if (this.value.some(notification => notification.active)) {
      this.groupToggle = true
    }
  },
  methods: {
    /**
     * update one notification of the components v-model
     * @param {Number} index
     * @param {Boolean} active
     */
    updateNotification (index, active) {
      this.$emit('input', this.value.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            active
          }
        }
        return item
      }))
    },
    /**
     * Open the edit page for the notification type
     * @param {Number} notificationTypeID
     */
    editOptionMessage (notificationTypeID) {
      this.$router.push({
        name: 'settings.notifications.email.edit',
        params: {
          id: notificationTypeID
        }
      })
    },
    /**
     * Toggle all notifications of the group
     * @param {Boolean} value
     */
    toggleGroup (value) {
      this.$emit('input', this.value.map((item) => {
        return {
          ...item,
          active: value
        }
      }))
    },
    toggleExpansion () {
      this.groupExpanded = !this.groupExpanded
    }
  }
}
</script>
<style lang="scss">
  @import "NotificationsGroup.scss";
</style>
