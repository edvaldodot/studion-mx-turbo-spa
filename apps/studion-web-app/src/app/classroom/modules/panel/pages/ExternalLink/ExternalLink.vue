<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import { paginateMixin } from '@/mixins/paginatorMixin'
import EvaluationMixin from '@/mixins/Evaluation'

import Pagination from '@/components/general/Pagination'
import Action from '@/components/general/Action'

import DatatableExternalLink from './components/DatatableExternalLink'

export default defineComponent({
  name: 'ExternalLink',

  components: {
    DatatableExternalLink,
    Pagination,
    Action,
  },

  mixins: [paginateMixin, EvaluationMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      windowX: null,
      tabLinks: [
        {
          text: 'classroom.panel:tab.link.1',
          location: {
            name: 'classroom.panel.dashboard',
          },
        },
        {
          text: 'classroom.panel:tab.link.2',
          location: {
            name: 'classroom.panel.announcements',
          },
        },
        {
          text: 'classroom.panel:tab.link.3',
          location: {
            name: 'classroom.panel.calendar',
          },
        },
      ],
      deleteExternalLink: false,
      item: null,
    }
  },

  computed: {
    ...mapState(['Classroom']),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
    idTool() {
      return this.Classroom.data.externalLink.id
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
    })
    this.setWindowX()
    this.setResizeListener()

    const payload = {
      id: this.idTool,
    }
    this.pgtrInitializePagination('attemptExternalLinkList', null, payload)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptExternalLinkList',
      'setFeedback',
      'attemptDeleteExternalLink',
      'attemptExternalLinkStatus',
    ]),

    setWindowX() {
      this.windowX = window.innerWidth
    },

    setResizeListener() {
      window.removeEventListener('resize', this.setWindowX)
      window.addEventListener('resize', this.setWindowX)
    },

    createLinkExternal() {
      this.$router.push({
        name: 'classroom.panel.modal.create.external.link',
      })
    },

    editExternalLink(linkId) {
      this.$router.push({
        name: 'classroom.panel.modal.create.external.link',
        params: { id: linkId },
      })
    },

    removeExternalLink(item) {
      this.setFetching(true)
      this.attemptDeleteExternalLink({
        idTool: this.idTool,
        idLink: item.linkId,
      })
        .then(() => {
          this.setFeedback({ message: this.$t('tool.external.link.card.remove') })
          this.pgtrRefresh()
          this.$refs.itemDatatableExternalLink.openModalConfirm = false
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('global:error') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    toggleExternalLinkStatus(item) {
      const payload = {
        id: item.linkId,
        params: {
          external_link_id: this.idTool,
        },
      }

      this.setFetching(true)
      this.attemptExternalLinkStatus(payload)
        .then(() => {
          this.setFeedback({
            message: !item.active
              ? this.$t('tool.external.link.card.active')
              : this.$t('tool.external.link.card.deactivate'),
          })
          this.pgtrRefresh()
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('global:error') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <div>
    <div class="p-3">
      <Action
        slot="button"
        :text="$t('classrom.panel.datatable.external.create.btn.add')"
        type="button"
        primary
        large
        fixed-width
        @click="createLinkExternal"
      />
    </div>
    <div class="py-4">
      <DatatableExternalLink
        ref="itemDatatableExternalLink"
        :items="pgtrCurrentData"
        @remove="removeExternalLink"
        @edit="editExternalLink"
        @deactivate="toggleExternalLinkStatus"
        @activate="toggleExternalLinkStatus"
      />
    </div>

    <Pagination
      v-if="pgtrCurrentData.length"
      class="center"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @change-items-per-page="pgtrParams.limit = $event"
    />

    <RouterView />
  </div>
</template>
