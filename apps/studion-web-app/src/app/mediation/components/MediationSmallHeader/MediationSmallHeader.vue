<template>
  <div>
    <content-header
      :title="title"
      light-theme
      fixed
    >
      <action
        slot="back"
        class="btn-back text-color"
        icon="keyboard_backspace"
        type="button"
        :text="
          isScheduled
            ? $t('mediation.btn:scheduled.actions')
            : $t('mediation.add:header.back.to.list')
        "
        @click="goBack"
      />
      <action-bar
        slot="actionbar"
        profile
      />
      <template slot="buttons">
        <action
          :disabled="disableSave"
          :text="$t('global:form.save')"
          type="button"
          flat
          @click="submit"
          v-if="canWrite('mediation_plan')"
        />
      </template>
    </content-header>

    <modal
      :active="activeModal"
      :cancel="false"
      v-if="confirmModal"
    >
      <div class="modal-confirm">
        <action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('mediation.modal:confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('mediation.modal:confirm.description') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action
            type="button"
            :text="$t('global:leave')"
            flat
            @click="leave()"
          />
          <action
            type="button"
            :text="$t('global:cancel')"
            flat
            @click="closeModalConfirm()"
          />
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'MediationSmallHeader',
  components: {
    Action,
    ActionBar,
    ContentHeader,
    Modal
  },
  props: {
    disableSave: {
      type: Boolean,
      default: false
    },
    confirmModal: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      activeModal: false
    }
  },
  methods: {
    submit () {
      this.$emit('onSubmit', true)
    },
    goBack() {
      if (this.isScheduled) {
        this.$router.push({ name: this.$route.params.scheduled })
      }
      if (!this.confirmModal) return this.leave()
      this.canWrite('mediation_plan') ? this.activeModal = true : this.leave()
    },
    closeModalConfirm () {
      this.activeModal = false
    },
    leave () {
      this.$router.push({ name: 'mediation.list' })
    }
  }
}
</script>
