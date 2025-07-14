<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Tooltip from '@/components/general/Tooltip'

export default defineComponent({
  name: 'GroupButtons',

  components: {
    Action,
    Tooltip,
  },

  props: {
    hasGroup: {
      type: Boolean,
      default: false,
    },

    isLonely: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    label() {
      return {
        create: this.$t('pre.project.panel.group:create.new.group'),
        alone: this.$t('pre.project.panel.group:do.alone'),
        hint: this.$t(`pre.project.panel.group:btn:disabled.hint${this.isLonely ? ':alone' : ''}`),
      }
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('group__buttons')"
    class="group__buttons"
  >
    <template v-if="hasGroup">
      <div class="group-buttons-pre-project">
        <Tooltip
          :uppercase="false"
          :bold-font="false"
          :width="200"
          vertical-align="top"
        >
          <template #activator="{ on }">
            <Action
              :text="label.create"
              class="btn-add-question"
              type="button"
              primary
              large
              submit
              disabled
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>

          <span>{{ label.hint }}</span>
        </Tooltip>

        <Tooltip
          :uppercase="false"
          :bold-font="false"
          :width="200"
          vertical-align="top"
        >
          <template #activator="{ on }">
            <Action
              :text="label.alone"
              class="btn-add-question"
              type="button"
              primary
              large
              disabled
              @mouseenter.native="on.mouseenter"
              @mouseleave.native="on.mouseleave"
            />
          </template>

          <span>{{ label.hint }}</span>
        </Tooltip>
      </div>
    </template>

    <template v-else>
      <div class="group-buttons-pre-project">
        <Action
          :text="label.create"
          class="btn-add-question"
          type="button"
          secondary
          large
          submit
          @click="$emit('group:create')"
        />
        <Action
          :text="label.alone"
          class="btn-add-question"
          type="button"
          secondary
          large
          submit
          @click="$emit('group:individual')"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.group-buttons-pre-project {
  display: flex;
  gap: 30px;

  .btn {
    width: 345px;
  }
}

@media screen and (max-width: 750px) {
  .group-buttons-pre-project {
    flex-direction: column;
  }
}
</style>
