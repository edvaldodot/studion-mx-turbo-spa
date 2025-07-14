<script>
import { format } from 'date-fns'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HelpHeader',

  props: {
    doubts: {
      type: Object,
      default: () => ({}),
    },
    management: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      format,
    }
  },

  methods: {
    checkStatus(item) {
      if (!this.management) {
        let lastInteraction = item.interactions[item.interactions.length - 1]

        if (item.status === 'closed' && !lastInteraction.useful) {
          return 'classroom.knowledgeBase:help.status.feedback.pending'
        }
        return `classroom.knowledgeBase:help.status.${item.status}`
      }
    },

    convertStatusName(status) {
      const statusMap = {
        pending_feedback: 'classroom.knowledgeBase:help.status.feedback.pending',
        pending_response: 'classroom.knowledgeBase:help.status.pending',
        closed: 'classroom.knowledgeBase:help.status.closed',
      }

      return this.$t(statusMap[status] || '')
    },
  },
})
</script>

<template>
  <div class="help-only-content">
    <div class="help-header-unique">
      <div class="help-header-unique-category">
        <span class="help-item-date">
          {{
            $t('global:date.hours', {
              date: format(new Date(doubts.date), 'dd/MM/yyyy'),
              hour: format(new Date(doubts.date), 'HH:mm'),
            })
          }}
        </span>
        <div v-if="doubts.category">
          <div v-if="doubts.subcategory">
            <span class="help-category-breadcrumb">{{ doubts.category.name }}</span>
            <span class="help-category">&gt; {{ doubts.subcategory.name }}</span>
          </div>
          <div v-else>
            <span class="help-category-only">{{ doubts.category.name }}</span>
          </div>
        </div>
      </div>
      <span class="help-item-subject">{{ doubts.subject }}</span>
    </div>
    <div>
      <span class="help-item-status">
        <span class="help-item-status-label">Status</span>
        <span
          v-if="!management"
          class="help-item-status-value"
          >{{ $t(checkStatus(doubts)) }}</span
        >
        <span
          v-else
          class="help-item-status-value"
          >{{ convertStatusName(doubts.status) }}</span
        >
      </span>
    </div>
  </div>
</template>

<style lang="scss">
.help-header-unique-category {
  display: flex;
  align-items: center;

  .help-category-breadcrumb {
    font-size: 14px;
    margin: 0 5px 0 30px;
  }

  .help-category-breadcrumb,
  .help-category,
  .help-category-only {
    font-size: 14px;
  }

  .help-category {
    font-weight: 500;
  }
  .help-category-only {
    font-weight: 500;
    color: var(--text-color-dark);
    margin-left: 30px;
  }
}
</style>
