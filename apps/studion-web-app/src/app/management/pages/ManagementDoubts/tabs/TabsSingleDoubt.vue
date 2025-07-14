<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import HelpAccordion from '@/components/shared/HelpAccordion'
import Action from '@/components/general/Action'
import TopBar from '@/components/general/TopBar'
import doubtsMixin from '@/app/classroom/modules/help/mixins/doubtsMixin.js'

export default defineComponent({
  name: 'TabsSingleDoubt',

  components: {
    HelpAccordion,
    TopBar,
    Action,
  },

  mixins: [doubtsMixin],

  data() {
    return {
      doubt: {},
    }
  },

  created() {
    this.setupMangement()
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'Management/doubts/doubtsOnlyResource']),

    backAction() {
      this.$router.back()
    },
  },
})
</script>

<template>
  <div>
    <TopBar>
      <Action
        icon="keyboard_backspace"
        :text="$t('global:back')"
        icon-size="small"
        type="button"
        flat
        @click="backAction"
      />
    </TopBar>
    <div class="help-unique-content">
      <HelpAccordion
        :doubt="doubt"
        :form-data-feedback="formDataFeedback"
        :kb-issues-query-params="kbIssuesQueryParams"
        :is-open-feedback-form="isOpenFeedbackForm"
        :validation="$v"
        :management="true"
        :categories="categories"
        :responsible-list="forOptions"
        :form-data-forward="formDataForward"
        @download-attachment="downloadAttachment"
        @set-useful="setUseful"
        @add-answer="addAnswer"
        @open-feedback-form="openFeedbackForm"
        @forward="forward"
      />
    </div>
  </div>
</template>

<style lang="scss">
.help-unique-content {
  padding: 40px 30px;
}
</style>
