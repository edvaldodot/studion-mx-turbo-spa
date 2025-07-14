<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'

import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'

export default {
  name: 'ReasonFields',

  components: {
    InputField,
    SelectField,
  },

  props: {
    value: {
      type: [String, Number],
      default: null,
    },
  },

  data() {
    return {
      reason: this.value,
      newReason: null,
      otherLabel: this.$tc('global:other', 2),
    }
  },

  validations: {
    reason: {
      required,
    },
    newReason: {
      required: requiredIf(function () {
        return this.reason === this.otherLabel
      }),
    },
  },

  computed: {
    ...mapState({
      reasonListState: (state) => state.Sessions.reasonList,
    }),

    reasonList() {
      const reasonListData = this.reasonListState && this.reasonListState.data
      if (!reasonListData) return

      const mappedReasonList = reasonListData.map((reason) => ({
        text: reason.name,
        value: reason.id,
      }))

      return [
        ...mappedReasonList,
        {
          text: this.otherLabel,
          value: this.otherLabel,
        },
      ]
    },
  },

  watch: {
    reason(val) {
      this.$emit('input', val)
    },
  },

  created() {
    this.loadReasons()
  },

  methods: {
    ...mapActions([
      'attemptEnrollmentReasonListRetrieval',
      'attemptEnrollmentReasonAdd',
      'setFetching',
    ]),

    loadReasons() {
      this.setFetching(true)
      this.attemptEnrollmentReasonListRetrieval().finally(() => {
        this.setFetching(false)
      })
    },

    validate() {
      this.$v.$touch()
      return !this.$v.$invalid
    },

    async reasonHandler() {
      if (!this.validate()) return false

      const alreadyCreatedReason = this.reason !== this.otherLabel
      if (!alreadyCreatedReason) await this.createReason()

      return true
    },

    async createReason() {
      this.setFetching(true)

      try {
        const { data } = await this.attemptEnrollmentReasonAdd(this.newReason)
        this.reason = data.id
      } finally {
        this.setFetching(false)
      }
    },
  },
}
</script>

<template>
  <div>
    <SelectField
      v-model="reason"
      :items="reasonList"
      :label="$t('global:reason')"
      :validation="$v.reason"
      dark
    />

    <InputField
      v-if="reason === $tc('global:other', 2)"
      v-model="newReason"
      :label="$t('enrollments.transfer:reason')"
      :validation="$v.newReason"
      type="text"
      dark
    />
  </div>
</template>
