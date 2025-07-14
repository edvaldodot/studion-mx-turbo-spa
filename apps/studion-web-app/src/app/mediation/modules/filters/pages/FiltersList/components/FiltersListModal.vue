<template>
  <modal :active="active" :cancel="false">
    <div class="modal-confirm modal-confirm__filters">
      <action
        type="button"
        icon="close"
        icon-size="medium"
        class="btn-close"
        @click="close()"
      />

      <template>
        <div class="modal-confirm-content" v-if="value.context">
          <h3 class="modal-confirm-title">{{ $tc(`mediation.filter:modal.${value.context}.title`) }}</h3>
          <div class="modal-confirm-description">
            <p v-if="value.data" v-html="$t(`mediation.filter:modal.${value.context}.description`, { name: value.data.name })"></p>
            <p v-else>{{ $t(`mediation.filter:modal.${value.context}.description`) }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer" v-if="value.context === 'delete'">
          <action
            type="button"
            flat
            :text="$t('global:cancel')"
            @click="close()"
          />
          <action
            type="button"
            :text="$t('global:remove')"
            flat
            @click="confirmDelete()"
          />
        </div>
      </template>

    </div>
  </modal>
</template>

<script>
import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'

export default {
  name: 'FiltersListModal',

  props: {
    value: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    active () {
      return Boolean(this.value.context)
    }
  },

  methods: {
    close () {
      this.value.context = null
    },

    confirmDelete () {
      this.$emit('delete', this.value.data.i_filters)
      this.close()
    }
  },

  components: {
    Action,
    Modal
  }
}
</script>
