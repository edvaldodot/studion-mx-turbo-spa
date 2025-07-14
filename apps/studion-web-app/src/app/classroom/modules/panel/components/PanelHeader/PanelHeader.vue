<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import configControlViewMixin from '@/mixins/configControlView'

import Action from '@/components/general/Action'
import AvatarList from '@/components/general/AvatarList'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'PanelHeader',

  components: {
    Action,
    AvatarList,
    Icon,
  },

  mixins: [configControlViewMixin],

  data() {
    return {
      isHidden: true,
    }
  },

  computed: {
    ...mapState({
      Classroom: (state) => state.Classroom.data,
    }),

    isVisible() {
      return !this.$media.mobile || !this.isHidden
    },
  },

  methods: {
    getDate(date) {
      return this.formatDate(date, 'short')
    },

    getAvailabilityEndDate() {
      const availability = this.Classroom.availability
      const finalDate = availability.extended ? availability.extended : availability.final
      return this.getDate(finalDate)
    },

    getDuration() {
      return this.getDurationText(
        `${this.Classroom.course.duration.value}${this.Classroom.course.duration.type}`
      )
    },

    getWorkload() {
      return this.formatVisualTime(this.Classroom.course.workload)
    },
  },
})
</script>

<template>
  <div
    class="panel-header"
    :class="{ '--is-hidden': isHidden }"
    :data-testid="$testId('panel-header')"
  >
    <Action
      v-show="$media.mobile"
      :icon="isHidden ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
      class="btn__toggle-hidden"
      type="button"
      flat
      @click="isHidden = !isHidden"
    />

    <div class="panel-header__col panel-header__col--session flex-100">
      <div class="panel-header__classroom-info">
        <h3>{{ $t('classroom.panel.dashboard:class') }}</h3>
        <p v-if="isVisible">{{ Classroom.name }}</p>
      </div>
    </div>
    <template v-if="isVisible">
      <div
        v-if="Classroom.availability.initial"
        class="panel-header__col panel-header__col--period panel-header__period"
      >
        <div v-if="Classroom.availability.initial">
          <h3>{{ $t('classroom.panel.dashboard:availability.initial') }}</h3>
          <div>
            <Icon
              class="panel-header__icon"
              name="calendar-range"
            />
            <span class="ml-1">{{ getDate(Classroom.availability.initial) }}</span>
          </div>
        </div>
        <div v-if="Classroom.availability.final">
          <h3>{{ $t('global:end') }}</h3>
          <span>{{ getAvailabilityEndDate() }}</span>
        </div>
      </div>
      <div
        v-if="config_showWorkload"
        class="panel-header__col"
      >
        <div class="panel-header__col--wicon">
          <h3>{{ $t('classroom.panel.dashboard:workload') }}</h3>
          <div>
            <Icon
              class="panel-header__icon"
              name="clock"
            />
            <span class="ml-1">{{ getWorkload() }}</span>
          </div>
        </div>
      </div>
      <div
        v-if="config_showDuration && (config_show_session_duration_on_trails || !Classroom.path)"
        class="panel-header__col duration"
      >
        <div class="panel-header__col--wicon">
          <h3>{{ $t('classroom.panel.dashboard:duration') }}</h3>
          <div>
            <Icon
              class="panel-header__icon"
              name="hourglass"
            />
            <span class="ml-1">{{ getDuration() }}</span>
          </div>
        </div>
      </div>
      <div class="panel-header__col flex-100">
        <div class="panel-header__responsibles">
          <h3>{{ $tc('classroom.panel.dashboard:responsible', Classroom.team.length) }}</h3>
          <AvatarList :users="Classroom.team" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
@import 'PanelHeader.scss';
</style>
