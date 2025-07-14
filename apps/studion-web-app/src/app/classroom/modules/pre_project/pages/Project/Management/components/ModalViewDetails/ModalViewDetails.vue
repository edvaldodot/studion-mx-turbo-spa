<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import ModalDialog from '@/components/general/ModalInformation'

import DatatableViewDetails from './components/DatatableViewDetails.vue'

export default defineComponent({
  name: 'ModalGroupCreation',

  components: {
    Action,
    DatatableViewDetails,

    ModalDialog,
  },
  data() {
    return {
      participants: [],
    }
  },

  created() {
    const params = this.$route.params

    this.setFetching(true)
    this.attemptGetPreProjectGroupDetails({
      sessionUuid: params.session_uuid,
      id: params.id,
    })
      .then(({ data }) => {
        this.participants = data.group
      })
      .finally(() => this.setFetching(false))
  },

  methods: {
    ...mapActions(['attemptGetPreProjectGroupDetails', 'setFetching']),

    close() {
      this.$router.push({
        name: 'classroom.pre.project.management',
      })
    },
    handleNavigationEdit() {
      this.$router.push({
        name: 'classroom.pre.project.management.modal.edit',
        params: { id: this.participants[0].i_preproject_groups },
      })
    },
  },
})
</script>

<template>
  <ModalDialog
    class="modal-view-details"
    active
    closable
    is-page
    @close="close"
  >
    <template #pre-content>
      <p class="modal-details-title">{{ $t('pre.project.management.modal.view.details.title') }}</p>
    </template>

    <template #title>
      <p class="modal-details-description">
        {{ $t('pre.project.management.modal.view.details.description') }}
      </p>
    </template>

    <template #content>
      <DatatableViewDetails :students="participants" />
    </template>

    <template #actions>
      <Action
        :text="$t('global:edit')"
        type="button"
        secondary
        large
        fixed-width
        @click="handleNavigationEdit"
      />
    </template>
  </ModalDialog>
</template>

<style lang="scss">
.modal-view-details {
  .modal-details-title {
    font-size: 2.3em;
    color: var(--dark-color-transparent-1);
    font-weight: 700;
    text-transform: none;
  }
  .modal-details-description {
    font-size: 16px;
    font-weight: 400;
  }
  .modal-confirm {
    .modal-confirm-actions {
      justify-content: center;
    }
  }
}
</style>
