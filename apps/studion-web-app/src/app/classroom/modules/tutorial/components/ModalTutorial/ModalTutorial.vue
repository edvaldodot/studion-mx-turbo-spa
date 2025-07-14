<script>
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { getElBoxPosition } from './utils/toolsUtils.js'

import Action from '@/components/general/Action'

const DASHBOARD_ROUTE_NAME = 'classroom.panel.dashboard'

export default defineComponent({
  name: 'ModalTutorial',

  components: {
    Action,
  },

  data() {
    return {
      boxPosition: { x: 0, y: 0 },
      steps: [],
      currentStep: -1,
    }
  },

  computed: {
    ...mapGetters(['isFetching']),
  },

  created() {
    this.currentStep = -1
    this.getSteps()
    this.nextStep()
  },

  methods: {
    ...mapActions(['setOnTutorialClassroom']),

    getSteps() {
      this.steps = [
        {
          action: () => this.goToDashboard(),
          selector: '.menu-classroom-panel',
          title: 'tutorial.title:start',
          description: 'tutorial.description:start',
        },
        ...this.getToolsSteps(),
        {
          action: () => this.goToDashboard(),
          selector: '.menu-classroom-index',
          title: 'tutorial.title:exit',
          description: 'tutorial.description:exit',
        },
        {
          action: () => {},
          selector: '.progress__menu',
          title: 'tutorial.title:progress',
          description: 'tutorial.description:progress',
        },
        {
          action: () => this.close(),
        },
      ]
    },

    getToolsSteps() {
      const toolPrefix = 'classroom'

      const toolList = [
        'lessons-course',
        'sessionLibrary',
        'forum',
        'poll',
        'assessments',
        'chat',
        'conference',
        'messages',
        'knowledgeBase',
      ]

      const selectors = toolList.map((tool) => `.menu-${toolPrefix}-${tool}`)

      const activeTools = selectors.filter((selector) => {
        return !!document.querySelector(selector)
      })

      return activeTools.map((tool, index) => {
        const selector = activeTools[index]

        return {
          action: () => {
            document.querySelector(selector).click()
          },
          selector: selector,
          title: `tutorial.title:tool${selector}`,
          description: `tutorial.description:tool${selector}`,
        }
      })
    },

    goToDashboard() {
      this.$router.push({ name: DASHBOARD_ROUTE_NAME })
    },

    nextStep() {
      this.currentStep++
      const stepCfg = this.steps[this.currentStep]

      stepCfg.action()
      if (stepCfg.selector) {
        this.boxPosition = getElBoxPosition(
          document.querySelector(stepCfg.selector),
          this.$media.mobile
        )
      }
    },

    close() {
      if (this.$route.name !== DASHBOARD_ROUTE_NAME) {
        this.goToDashboard()
      }
      this.$emit('close')
    },
  },
})
</script>

<template>
  <div class="modal-tutorial__wrapper">
    <div class="modal-tutorial__blocker"></div>

    <div
      v-show="!isFetching"
      class="modal-tutorial"
      :style="{
        left: `${boxPosition.x}px`,
        top: `${boxPosition.y}px`,
      }"
    >
      <p class="modal-tutorial__steps">{{ currentStep + 1 }}/{{ steps.length - 1 }}</p>

      <template v-if="currentStep >= 0">
        <h1>{{ $t(`${steps[currentStep].title}`) }}</h1>
        <p class="mt-2">{{ $t(`${steps[currentStep].description}`) }}</p>
      </template>

      <div class="modal-tutorial__actions mt-4">
        <Action
          :text="$t('global:leave')"
          type="button"
          primary
          @click="close"
        />
        <Action
          :text="currentStep + 1 === steps.length - 1 ? $t('global:finish') : $t('global:next')"
          type="button"
          secondary
          @click="nextStep"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './ModalTutorial.scss';
</style>
