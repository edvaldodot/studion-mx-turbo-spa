<script>
import { createTabLinks } from '../../shared.js'

import { mapState } from 'vuex'

import ClassroomCards from '../../components/ClassroomCards'
import PanelAnnouncement from '../../components/PanelAnnouncement'
import PanelMessages from '../../components/PanelMessages'
import PanelHeader from '../../components/PanelHeader'
import PanelEvent from '../../components/PanelEvent'
import PanelExternalLink from '../../components/PanelExternalLink'
import PanelLibrary from '../../components/PanelLibrary'
import PanelQuestions from '../../components/PanelQuestions'

export default {
  name: 'ClassroomPanel',

  components: {
    ClassroomCards,
    PanelAnnouncement,
    PanelMessages,
    PanelHeader,
    PanelEvent,
    PanelExternalLink,
    PanelLibrary,
    PanelQuestions,
  },

  data() {
    return {
      windowX: null,
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

  created() {
    this.$emit('change-header', {
      tabLinks: createTabLinks(this.$hiddenTools, { announcement: !this.Classroom.announcement }),
    })
    this.setWindowX()
    this.setResizeListener()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.setWindowX)
  },

  methods: {
    hasActiveTool(tool) {
      return this.Classroom.toolsTypes.find((t) => t.alias === tool)
    },

    setWindowX() {
      this.windowX = window.innerWidth
    },

    setResizeListener() {
      window.removeEventListener('resize', this.setWindowX)
      window.addEventListener('resize', this.setWindowX)
    },
  },
}
</script>

<template>
  <div class="classroom-panel inner-content mt-5">
    <div class="p-2">
      <PanelHeader />
      <div class="content">
        <template v-if="!$media.mobile">
          <div class="content__left">
            <ClassroomCards />
            <PanelAnnouncement
              v-if="hasActiveTool('announcement') && canRead('classroom:announcement')"
              :hide-if-empty="true"
            />
            <PanelMessages v-if="hasActiveTool('messages')" />
            <PanelQuestions v-if="hasActiveTool('knowledgeBase')" />
          </div>
          <div class="content__right">
            <PanelExternalLink v-if="Classroom.externalLink" />
            <PanelEvent v-if="canRead('classroom:event')" />
            <PanelLibrary v-if="hasActiveTool('sessionLibrary')" />
          </div>
        </template>
        <template v-else>
          <ClassroomCards />
          <PanelAnnouncement
            v-if="hasActiveTool('announcement') && canRead('classroom:announcement')"
            :hide-if-empty="true"
          />
          <PanelEvent
            v-if="canRead('classroom:event')"
            :hide-if-empty="windowX < 765"
          />
          <PanelExternalLink v-if="Classroom.externalLink" />
          <PanelLibrary v-if="hasActiveTool('sessionLibrary')" />
          <PanelMessages v-if="hasActiveTool('messages')" />
          <PanelQuestions v-if="hasActiveTool('knowledgeBase')" />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './../../styles.scss';
</style>
