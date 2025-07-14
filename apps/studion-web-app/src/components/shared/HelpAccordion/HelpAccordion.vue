<script>
import { defineComponent } from 'vue'
import Accordion from '@/components/general/Accordion'
import AccordionItem from '@/components/general/AccordionItem'
import HelpHeader from './components/HelpHeader.vue'
import HelpContent from './components/HelpContent.vue'

export default defineComponent({
  name: 'HelpAccordion',

  components: {
    Accordion,
    AccordionItem,
    HelpHeader,
    HelpContent,
  },

  props: {
    doubts: {
      type: Array,
      default: () => [],
    },
    doubt: {
      type: Object,
      default: () => ({}),
    },
    formDataFeedback: {
      type: Array,
      default: () => [],
    },
    kbIssuesQueryParams: {
      type: Object,
      default: () => ({}),
    },
    isOpenFeedbackForm: {
      type: Array,
      default: () => [],
    },
    validation: {
      type: Object,
      required: true,
    },
    management: {
      type: Boolean,
      default: false,
    },
    acceptedFormats: {
      type: String,
      default: null,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    responsibleList: {
      type: Array,
      default: () => [],
    },
    formDataForward: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    handleDownloadAttachment(interaction) {
      this.$emit('download-attachment', interaction)
    },
  },
})
</script>

<template>
  <div v-if="!management">
    <Accordion
      multiples
      card
      class="accordion-help-content"
    >
      <AccordionItem
        v-for="(item, itemIndex) in doubts"
        ref="item"
        :key="itemIndex"
      >
        <template slot="header">
          <HelpHeader :doubts="item" />
        </template>

        <template slot="content">
          <HelpContent
            :item="item"
            :item-index="itemIndex"
            :form-data-feedback="formDataFeedback"
            :is-open-feedback-form="isOpenFeedbackForm"
            :kb-issues-query-params="kbIssuesQueryParams"
            :validation="validation"
            :accepted-formats="acceptedFormats"
            :categories="categories"
            :responsible-list="responsibleList"
            :form-data-forward="formDataForward"
            @download-attachment="handleDownloadAttachment"
            @set-useful="$emit('set-useful', item, itemIndex)"
            @add-answer="$emit('add-answer', item, itemIndex)"
            @open-feedback-form="$emit('open-feedback-form', itemIndex)"
            @forward="$emit('forward', item.id)"
            @input-form="() => $refs.item[itemIndex].calcSize()"
          />
        </template>
      </AccordionItem>
    </Accordion>
  </div>
  <div
    v-else
    class="accordion-help-content"
  >
    <div class="help-header">
      <HelpHeader
        :doubts="doubt"
        :management="management"
      />
    </div>

    <HelpContent
      :item="doubt"
      :item-index="1"
      :form-data-feedback="formDataFeedback"
      :is-open-feedback-form="isOpenFeedbackForm"
      :kb-issues-query-params="kbIssuesQueryParams"
      :validation="validation"
      :accepted-formats="acceptedFormats"
      :management="management"
      :categories="categories"
      :responsible-list="responsibleList"
      :form-data-forward="formDataForward"
      @download-attachment="handleDownloadAttachment"
      @set-useful="$emit('set-useful', doubt, 1)"
      @add-answer="$emit('add-answer', doubt, 1)"
      @open-feedback-form="$emit('open-feedback-form', 1)"
      @forward="$emit('forward', doubt.id)"
    />
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/help/styles.scss';

.help-header {
  padding-bottom: 40px;
  .help-only-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .help-item-status {
    position: inherit;
  }
}
</style>
