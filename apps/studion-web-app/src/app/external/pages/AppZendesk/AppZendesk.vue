<script>
import ChatbotAdapter from '@/support/adapters/ChatbotAdapter'
import { mapActions, mapState } from 'vuex/dist/vuex.common.js'

export default {
  computed: {
    ...mapState(['zendeskChatbot']),
  },
  mounted() {
    this.hideFooter()
    this.toggleZendeskChatbotWindow(true)
    ChatbotAdapter.openChat()
  },
  methods: {
    ...mapActions(['hideFooter', 'toggleZendeskChatbotWindow']),
  },
}
</script>

<template>
  <div></div>
</template>
