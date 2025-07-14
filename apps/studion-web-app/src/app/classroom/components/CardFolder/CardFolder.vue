<script>
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'

export default {
  name: 'CardFolder',
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    Dropdown,
    DropdownLink,
    Icon
  },
  props: {
    id: {
      type: Number,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility'])
  },
  methods: {
    deleteFolder () {
      this.$emit('delete')
    },
    editFolder () {
      this.$emit('edit')
    },
    openFolder () {
      this.$emit('open')
    },
    moveFolder () {
      this.$emit('move')
    },
  }
}
</script>

<template>
  <card rounded :height="300" class="card-folder">
    <card-image src="" :height="120" class="card-folder__header">
      <icon name="folder" wrapper class="card-folder__filetype-icon" />
    </card-image>

    <div class="card-folder__options">
      <dropdown icon="dots-vertical" right icon-size="medium" v-if="editable && notEqualsProfile('student')">
        <dropdown-link :text="$t('global:remove')" @click="deleteFolder" v-if="editable && $listeners.delete" />
        <dropdown-link :text="$t('global:move')" @click="moveFolder" v-if="editable && $listeners.delete" />
        <dropdown-link :text="$t('global:edit')" @click="editFolder" v-if="editable && $listeners.edit" />
      </dropdown>
    </div>

    <card-body>
      <h3 class="card-folder__title" v-shave="{ height: 36 }" :title="name">{{ name }}</h3>
      <div class="card-folder__description">
        <p v-shave="{ height: 48 }" :title="description">{{ description }}</p>
      </div>
    </card-body>

    <card-actions class="card-folder__footer">
      <action :text="$t('global:access')" :dark="accessibility" @click="openFolder" type="button" flat />
    </card-actions>
  </card>
</template>

<style lang="scss">@import "CardFolder.scss";</style>
