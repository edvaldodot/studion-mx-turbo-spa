
<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import GroupUserTable from '@/app/community/components/GroupUserTable'
import Modal from '@/components/general/Modal'

export default {
  components: {
    Action,
    GroupUserTable,
    Modal
  },
  props: {
    id: Number
  },
  computed: {
    ...mapState({ group: state => state.Groups.current })
  },

  created () {
    this.setCurrentGroup(this.id)
  },

  methods: {
    ...mapActions([
      'setCurrentGroup'
    ])
  }
}
</script>

<template>
  <modal :active="true" :back="true" is-page>
    <div id="modal-header">
      <span class="modal-subtitle">{{ group.name }}</span>
      <h2 class="modal-title text-color">{{ $t('community.groups:members.title') }}</h2>
    </div>
    <group-user-table :group-id="id" />
  </modal>
</template>
