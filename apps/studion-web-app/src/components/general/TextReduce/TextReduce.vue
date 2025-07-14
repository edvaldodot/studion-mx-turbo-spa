<script>
import { defineComponent } from 'vue'
import Tooltip from '../Tooltip'

export default defineComponent({
  name: 'TextReduce',
  components: {
    Tooltip,
  },
  props: {
    textType: {
      type: Boolean,
      deafult: false,
    },
    lenghtText: {
      type: Number,
      default: 0,
    },
    text: {
      type: String,
      default: '',
    },
    classStyle: {
      type: String,
      default: null,
    },
  },
})
</script>

<template>
  <Tooltip
    :data-testid="$testId('text-reduce')"
    :uppercase="false"
  >
    <template #activator="{ on }">
      <p
        v-if="textType"
        :class="classStyle"
        v-on="on"
      >
        {{ textLimit(text, lenghtText) }}
      </p>
      <span
        v-else
        :class="classStyle"
        v-on="on"
      >
        {{ textLimit(text, lenghtText) }}
      </span>
    </template>

    <span
      v-if="text.length > lenghtText"
      class="clamp-line"
      >{{ text }}</span
    >
  </Tooltip>
</template>
