<script>
import { mapActions, mapState } from 'vuex'

import Card from '@/components/general/Card'
import Icon from '@/components/general/Icon'

export default {
  name: 'SessionCard',
  components: {
    Card,
    Icon,
  },

  props: {
    linkId: {
      type: Number,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    link: {
      type: String,
      default: null,
    },
  },

  computed: {
    ...mapState(['Classroom']),

    linkDomain() {
      if (!this.link) return ''
      try {
        return new URL(this.link).hostname
      } catch {
        return ''
      }
    },
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptGetOpenExternalLink']),

    async openExternalLink() {
      this.setFetching(true)
      try {
        const response = await this.attemptGetOpenExternalLink({
          idTool: this.Classroom.data.externalLink.id,
          id: this.linkId,
        })

        let link = response.url

        window.open(link, '_blank', 'noopener,noreferrer')
      } catch {
        this.setFeedback({
          message: this.$t('global:error'),
        })
      } finally {
        this.setFetching(false)
      }
    },
  },
}
</script>

<template>
  <Card
    class="card-link-wrapper"
    :title="linkDomain"
    rounded
    dark
    @click="openExternalLink"
  >
    <div class="card-external-link">
      <div class="card-external-link-area-icon">
        <Icon
          class="card-external-link-icon"
          :name="icon"
          pack="material"
          large
        />
      </div>

      <div class="card-external-link-content">
        <h3>{{ title }}</h3>
        <p>
          {{ content }}
        </p>
      </div>
    </div>
  </Card>
</template>

<style lang="scss">
@import './CardExternalLink.scss';
</style>
