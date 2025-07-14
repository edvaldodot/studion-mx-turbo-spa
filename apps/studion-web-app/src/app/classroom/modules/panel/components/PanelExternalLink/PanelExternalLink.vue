<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import Action from '@/components/general/Action'
import CardExternalLink from './components/CardExternalLink/CardExternalLink.vue'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'PanelExternalLink',

  components: {
    Action,
    CardExternalLink,
    Icon,
  },

  props: {
    hideIfEmpty: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fetching: false,
      data: [],
    }
  },

  computed: {
    ...mapState(['Classroom']),
  },

  created() {
    this.fetchPanelExternalLink()
  },

  methods: {
    ...mapActions(['attemptExternalLinkList', 'setFeedback']),

    goToModalCreateExternalLink() {
      this.$router.push({
        name: 'classroom.panel.modal.create.external.link',
      })
    },

    goToExternalLinksTable() {
      this.$router.push({
        name: 'classroom.panel.external.link',
        params: {
          session_uuid: this.$route.params.session_uuid,
        },
      })
    },

    async fetchPanelExternalLink() {
      const payload = {
        params: {
          id: this.Classroom.data.externalLink.id,
          limit: 1000,
          filter: {
            active: 1,
          },
        },
      }

      this.fetching = true
      try {
        const response = await this.attemptExternalLinkList(payload)

        this.data = (response.data || []).map((link) => ({
          linkId: link.linkId || '',
          icon: link.icon || 'open_in_new',
          name: link.name || '',
          description: link.description || '',
          link: link.url || '',
        }))
      } catch {
        this.setFeedback({
          message: this.$t('global:error'),
        })
      } finally {
        this.fetching = false
      }
    },
  },
})
</script>

<template>
  <div
    v-if="!hideIfEmpty || (Array.isArray(data) && data.length)"
    class="wrapper-panel-external-link"
  >
    <div class="panel-external-link-header">
      <div class="panel-external-link-flex">
        <Icon
          class="panel-external-link-icon"
          :name="'open_in_new'"
          pack="material"
          size="small"
        />
        <h3>{{ $t('mediation.links.external') }}</h3>
      </div>

      <Action
        v-if="!equalsProfile('student')"
        type="button"
        :text="$t('global:view.all')"
        flat
        @click="goToExternalLinksTable()"
      />
    </div>

    <div class="panel-external-link">
      <div class="area-cards-external-link">
        <CardExternalLink
          v-for="(item, index) in data"
          :key="index"
          :link-id="item.linkId"
          :icon="item.icon"
          :title="item.name"
          :content="item.description"
          :link="item.link"
        />

        <div
          v-if="!data.length"
          class="panel-external-link-flex"
        >
          <p>{{ $t('tool.external.link.without.registration') }}</p>
        </div>
      </div>

      <div class="panel-external-link-flex">
        <Action
          v-if="!equalsProfile('student')"
          class="mt-4"
          type="button"
          :text="$t('tool.external.link.create')"
          fixed-width
          secondary
          @click="goToModalCreateExternalLink()"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'PanelExternalLink.scss';
</style>
