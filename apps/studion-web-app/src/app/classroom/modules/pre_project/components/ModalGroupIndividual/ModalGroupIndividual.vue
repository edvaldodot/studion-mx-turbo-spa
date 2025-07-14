<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import ModalDialog from '@/components/general/ModalDialog'

export default defineComponent({
  name: 'ModalGroupIndividual',

  components: {
    Action,
    ModalDialog,
  },

  data() {
    return {
      show: false,
    }
  },

  computed: {
    ...mapState({
      currentPreProjectConfig: ({ Classroom }) => Classroom.data && Classroom.data.preProject,
      currentEnrollment: ({ Classroom }) => Classroom.data && Classroom.data.enrollment,
    }),
  },

  methods: {
    ...mapActions(['setFetching', 'attemptSavePreProjectGroup']),

    toggleVisualization() {
      this.show = !this.show
    },

    mountPayload() {
      return {
        pre_project_id: this.currentPreProjectConfig.id,
        owner_id: this.currentEnrollment.id,
        lonely: true,
        enrollments: [this.currentEnrollment.id],
      }
    },

    submit() {
      const sessionUuid = this.$route.params['session_uuid']
      const payload = this.mountPayload()

      this.setFetching(true)
      this.attemptSavePreProjectGroup({ sessionUuid, payload })
        .then(() => {
          this.$emit('update:view')
          this.toggleVisualization()
        })
        .finally(() => this.setFetching(false))
    },
  },
})
</script>

<template>
  <ModalDialog
    :data-testid="$testId('modal-group-individual')"
    :active="show"
    class="modal-group-individual"
    @close="toggleVisualization"
  >
    <template #title>
      {{ $t('pre.project.panel.group:do.alone') }}
    </template>

    <template #description>
      <p class="text-color">
        {{ $t('pre.project.panel.group:do.alone:description') }}
      </p>
    </template>

    <template #footer>
      <Action
        :text="$t('global:cancel')"
        type="button"
        flat
        @click="toggleVisualization"
      />

      <Action
        :text="$t('global:continue')"
        type="button"
        flat
        @click="submit"
      />
    </template>
  </ModalDialog>
</template>

<style lang="scss">
.modal-group-individual {
  .modal-confirm-footer {
    display: flex;
    justify-content: space-between;
  }
}
</style>