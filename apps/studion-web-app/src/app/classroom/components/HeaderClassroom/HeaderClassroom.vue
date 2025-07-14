<script>
import { mapGetters, mapState } from 'vuex'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import ProgressMenu from '@/components/general/ProgressMenu'
import Tabs from '@/components/general/Tabs'

import { progressMixin } from '@/mixins/progressMixin'

export default {
  name: 'HeaderClassroom',
  components: {
    ActionBar,
    ContentHeader,
    Rating: () => import('@/components/general/Rating'),
    ProgressMenu,
    Tabs,
  },

  mixins: [progressMixin],

  props: {
    isThick: {
      type: Boolean,
      default: true,
    },
    hideBottom: {
      type: Boolean,
      default: false,
    },
    tabLinks: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      progressModal: false,
    }
  },

  computed: {
    ...mapGetters(['isFullscreen']),
    ...mapState({
      session: (state) => state.Classroom.data,
      studentProgress: (state) => state.Classroom.studentProgress,
    }),

    filteredTabs() {
      return this.tabLinks.filter((tab) => {
        if (tab.location.name === 'classroom.panel.announcements') {
          return this.canRead('classroom:announcement')
        } else if (tab.location.name === 'classroom.panel.calendar') {
          return this.canRead('classroom:event')
        } else {
          return true
        }
      })
    },
  },
  methods: {
    updateVideoDimension(obj) {
      this.$emit('update-video-dimension', obj)
    },
  },
}
</script>
<template>
  <ContentHeader
    classroom
    fullscreen
    class="header-classroom sm:mt-0 md:mt-0 lg:mt-6 xl:mt-6"
    :thick="false"
    :hide-bottom="hideBottom"
    :class="{ 'no-tabs': !tabLinks.length }"
    :title="session.course.name"
    :begin-retract="$media.mobile"
    @update-dimension-video="updateVideoDimension"
  >
    <action-bar slot="actionbar" class="-mt-6"></action-bar>
    <template slot="progress">
      <div class="course__about">
        <div class="course__type">
          {{ $t(`solutions.type:${session.course.type.alias}`) }}
        </div>
        <div
          class="class"
          v-if="session.name !== 'individual'"
        >
          <span class="class-label">{{ $t('classroom:header.class.label') }}</span>
          <span class="class-name text-color">{{ session.name }}</span>
        </div>
        <rating
          show-quantity
          resource-type="session"
          :id="session.course.id"
          :rating-analysis="session._embedded.rating_analysis"
          :user-rating="session._embedded.user_rating"
        />
      </div>
      <transition
        v-if="equalsProfile('student') && studentProgress"
        name="fade"
      >
        <div
          v-show="!isFullscreen"
          class="progress__area"
        >
          <ProgressMenu
            :status="studentProgress.status"
            :content="$mx_formatToProgressMenuContent(studentProgress)"
            :extra-content="$mx_formatToProgressMenuExtraContent(studentProgress)"
            button-action
            @action="$emit('openProgressModal')"
          />
        </div>
      </transition>
    </template>
    <Tabs
      v-if="tabLinks.length"
      slot="tabs"
      dark
      :links="filteredTabs"
    ></Tabs>
  </ContentHeader>
</template>
