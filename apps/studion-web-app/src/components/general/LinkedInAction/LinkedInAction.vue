<script>
import { defineComponent } from 'vue'
import Action from '../Action'
import Tooltip from '../Tooltip'
import Icon from '../Icon'

import config from '@/config'

const { CERTIFICATE_ORGANIZATION_ID, CERTIFICATE_ORGANIZATION, APP_TITLE } = config

export default defineComponent({
  name: 'LinkedInAction',

  components: {
    Action,
    Tooltip,
    Icon,
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Object,
      default: null,
    },
    buttonCustomClass: {
      type: Object,
      default: '',
    },
  },

  methods: {
    openLinkedIn() {
      let params = {
        startTask: 'CERTIFICATION_NAME',
        name: this.name,
        issueYear: 0,
        issueMonth: 0,
      }

      if (CERTIFICATE_ORGANIZATION_ID) {
        params.organizationId = CERTIFICATE_ORGANIZATION_ID
      } else {
        params.organizationName = CERTIFICATE_ORGANIZATION || APP_TITLE
      }

      if (this.date) {
        params = { ...params, ...this.date }
      }

      const url = `https://www.linkedin.com/profile/add?${new URLSearchParams(params)}`

      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'

      document.body.appendChild(link)
      link.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    },
  },
})
</script>

<template>
  <div class="linkedin-action__wrapper">
    <Action
      data-testid="linked-in-action"
      :class="buttonCustomClass"
      :text="$t('global:share')"
      :dark="dark"
      :small="small"
      type="button"
      icon="linkedin"
      flat
      @click="openLinkedIn"
    />
    <tooltip
      v-if="tooltip"
      :uppercase="false"
      :width="280"
      dark
    >
      <template #activator="{ on }">
        <span
          class="linkedin-action__icon"
          v-on="on"
        >
          <icon
            class="share-tooltip"
            name="alert-circle"
            size="small"
          />
        </span>
      </template>
      <span>{{ $t('linkedin.share.action:tootip') }}</span>
    </tooltip>
  </div>
</template>
<style lang="scss">
.linkedin-action__wrapper {
  display: inline-block;
  .icon.share-tooltip {
    height: 20px;
    width: 20px;
    margin-bottom: 4px;
    opacity: 0.8;
    z-index: 5;
  }
  @media only screen and (max-width: 768px) {
    .linkedin-action__icon {
      margin-left: 0px;
      padding: 20px;
    }
  }
}
</style>
