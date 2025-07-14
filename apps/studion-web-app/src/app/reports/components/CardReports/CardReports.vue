<script>
import { mapState } from 'vuex'
import config from '@/config'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

const { POWER_BI_EXTERNAL_LINK } = config

export default {
  name: 'CardReports',

  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    Dropdown,
    DropdownLink,
  },

  props: {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: false,
    },
    hasWriteAccess: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      powerBIExternalLink: POWER_BI_EXTERNAL_LINK,
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility']),
    backgroundImage() {
      return this.thumbnail
        ? this.thumbnail
        : '/assets/images/themes/default/bkg/report-default.jpg'
    },
  },

  methods: {
    edit() {
      this.$emit('edit')
    },
    remove() {
      this.$emit('remove')
    },
    activate() {
      this.$emit('activate')
    },
    deactivate() {
      this.$emit('deactivate')
    },
    redirectToPowerBI() {
      const url =
        'https://app.powerbi.com/singleSignOn?ctid=0f46dbd2-951d-4333-be04-df9d8cf4ce89&ru=https%3A%2F%2Fapp.powerbi.com%2Fgroups%2Fme%2Fapps%2F96fbf704-f706-42f0-b276-ac3d0c761e94%3Fctid%3D0f46dbd2-951d-4333-be04-df9d8cf4ce89%26noSignUpCheck%3D1'
      window.open(url, '_blank')
    },
    open() {
      this.$emit('open')
    },
  },
}
</script>

<template>
  <Card
    class="card-reports"
    :class="{ 'is-active': active }"
    :height="300"
    rounded
  >
    <Dropdown
      v-if="Account.user.currentProfile === 'admin' || hasWriteAccess"
      class="generic-card__options card-reports__options"
      icon="dots-vertical"
      icon-size="medium"
      right
    >
      <DropdownLink
        :text="$t('global:edit')"
        @click="edit()"
      ></DropdownLink>
      <DropdownLink
        :text="$t('global:remove')"
        @click="remove()"
      ></DropdownLink>
      <DropdownLink
        v-if="!active"
        :text="$t('global:activate')"
        @click="activate()"
      ></DropdownLink>
      <DropdownLink
        v-else
        :text="$t('global:deactivate')"
        @click="deactivate()"
      ></DropdownLink>
    </Dropdown>
    <CardImage
      class="card-reports__header"
      :height="120"
      :src="backgroundImage"
    >
      <span
        v-if="active && Account.user.currentProfile === 'admin'"
        class="card-reports__active"
      >
        {{ $t('reports:active') }}
      </span>
    </CardImage>
    <CardBody class="card-reports__content">
      <h3
        v-shave="{ height: 36 }"
        class="card-reports__title"
        :title="title"
      >
        {{ title }}
      </h3>
      <div class="card-reports__description">
        <p
          v-shave="{ height: 48 }"
          :title="description"
        >
          {{ description }}
        </p>
      </div>
    </CardBody>
    <CardActions class="card-reports__footer">
      <Action
        v-if="Account.user.currentProfile !== 'student'"
        type="link"
        flat
        :text="$t('global:access')"
        :dark="accessibility"
        @click="powerBIExternalLink ? redirectToPowerBI() : open()"
      />
    </CardActions>
  </Card>
</template>

<style lang="scss">
@import 'CardReports.scss';
</style>
