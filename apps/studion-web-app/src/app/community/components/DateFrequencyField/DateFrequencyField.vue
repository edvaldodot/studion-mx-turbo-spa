<script>
import { defineComponent } from 'vue'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { format } from 'date-fns'

import SelectField from '@/components/general/SelectField'
import Checkbox from '@/components/general/Checkbox'
import Radio from '@/components/general/Radio'
import Datepicker from '@/components/general/Datepicker'
import InputField from '@/components/general/InputField'
import ValidationMessage from '@/components/general/ValidationMessage'
import HourField from '@/components/general/HourField'
import dataMixin from './dataMixin'

export default defineComponent({
  name: 'DateFrequencyField',

  components: {
    SelectField,
    Checkbox,
    Radio,
    Datepicker,
    InputField,
    ValidationMessage,
    HourField,
  },

  mixins: [dataMixin],

  props: {
    value: {
      type: Object,
      required: true,
      validator: function (value) {
        const requiredKeys = [
          'start_date',
          'start_time_at',
          'end_time_at',
          'frequency',
          'interval',
          'by_day',
          'repeat_ends_at',
        ]
        for (let key of requiredKeys) {
          if (!(key in value)) return false
        }
        return true
      },
    },
  },

  data() {
    return {
      isAllDay: false,
      repeatValue: null,
      enableEnd: false,
      customEnabled: false,
      start_hour: '00:00',
    }
  },

  computed: {
    isWeekly() {
      return this.value.frequency === 'weekly'
    },
    minEndTime() {
      if (!this.value.start_time_at) return '00:00'
      let [hours, minutes] = this.value.start_time_at.split(':').map((val) => Number(val))
      if (minutes === 59) {
        hours = hours + 1
        minutes = 0
      } else {
        minutes += 1
      }
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    },
    today() {
      return format(new Date(), 'yyyy-MM-dd')
    },
    minRepeatEndDate() {
      if (!this.value.end_date_at) return this.today
      const nextEndDateDay = new Date(this.value.end_date_at)
      nextEndDateDay.setDate(nextEndDateDay.getDate() + 1)
      return format(nextEndDateDay, 'yyyy-MM-dd')
    },
  },

  validations: {
    value: {
      start_date: {
        required,
      },
      start_time_at: {
        required,
      },
      end_time_at: {
        required,
        invalidBlockPeriod: function () {
          return this.value.end_time_at > this.value.start_time_at
        },
      },
      repeat_ends_at: {
        required: requiredIf(function () {
          return this.enableEnd
        }),
      },
    },
  },

  created() {
    if (!this.value.id) return
    const startDate = new Date(this.value.start_date_at)
    const endDate = new Date(this.value.end_date_at)

    const isDayStart = startDate.getHours() === 0 && startDate.getMinutes() === 0
    const isDayEnd = endDate.getHours() === 23 && endDate.getMinutes() === 59
    if (startDate.toDateString() === endDate.toDateString() && isDayStart && isDayEnd) {
      this.isAllDay = true
    }
    if (this.value.repeat_ends_at) {
      this.enableEnd = true
    }
  },

  methods: {
    updateCustomFrequency(val) {
      const data = {
        frequency: val,
        by_day: [],
      }
      this.updateObjectValue(data)
    },
    setAllDay() {
      const data = {
        start_time_at: '00:00',
        end_time_at: '23:59',
      }

      this.updateObjectValue(data)
    },
    setCustom(val) {
      const custom = { frequency: 'daily', interval: 1, by_day: [] }
      const notCustom = { frequency: null, interval: null, by_day: [] }
      this.updateObjectValue(val ? custom : notCustom)
    },
    clearEndDate() {
      this.updateFieldValue('repeat_ends_at', null)
    },
    touchField(field) {
      this.$v.value[field].$touch()
    },
    touchRequiredFields() {
      this.$v.value.start_date.$touch()
      this.$v.value.start_time_at.$touch()
      this.$v.value.end_time_at.$touch()
      this.enableEnd && this.$v.value.repeat_ends_at.$touch()
    },
    updateFieldValue(key, value) {
      this.$emit('input', { ...this.value, [key]: value })
    },
    updateObjectValue(newFields) {
      this.$emit('input', { ...this.value, ...newFields })
    },
    resetValidations() {
      this.$v.$reset()
      this.customEnabled = false
      this.setCustom(false)
    },
  },
})
</script>

<template>
  <div>
    <div class="start-selection">
      <Datepicker
        :min="today"
        :validation="$v.value.start_date"
        :label="$t('global:form.start')"
        :value="value.start_date"
        dark
        @input="updateFieldValue('start_date', $event)"
      />
      <div
        class="hour-selection"
        :class="{ '--disabled': isAllDay }"
      >
        <HourField
          class="text-color"
          :value="value.start_time_at"
          @input="updateFieldValue('start_time_at', $event)"
        />

        <span>-</span>

        <HourField
          class="text-color"
          :value="value.end_time_at.substring(0, 5)"
          @input="updateFieldValue('end_time_at', $event)"
        />

        <div class="period-validation">
          <ValidationMessage :validation="$v.value.end_time_at" />
        </div>
      </div>
    </div>

    <Checkbox
      v-model="isAllDay"
      :items="[{ value: true, label: $t('date.frequency.field:all.day') }]"
      dark
      @input="setAllDay"
    />

    <div class="optional">
      <h3 class="form-section-title text-color">{{ $t('date.frequency.field:repeat.custom') }}</h3>

      <Checkbox
        v-model="customEnabled"
        :items="[{ value: true, label: '' }]"
        switch-type
        dark
        @input="setCustom"
      />
    </div>

    <div v-if="customEnabled">
      <div class="grid">
        <div class="col-12">
          <span class="text-color text-base">{{ $t('date.frequency.field:repeat.every') }}</span>
        </div>
        <div class="flex gap-2 col-12">
          <InputField
            :min="1"
            :max="2000"
            :maxlength="5"
            :value="value.interval"
            type="number"
            required
            dark
            @input="updateFieldValue('interval', $event)"
          />

          <SelectField
            :value="value.frequency"
            :items="timeIntervals"
            :allow-clear="false"
            dark
            @input="updateCustomFrequency"
          />
        </div>
      </div>

      <Checkbox
        v-show="isWeekly"
        :value="value.by_day"
        :items="weekDays"
        class="inline-checkbox"
        dark
        @input="updateFieldValue('by_day', $event)"
      />
    </div>

    <div
      v-show="customEnabled"
      class="end-field"
    >
      <p class="text-color">{{ $t('date.frequency.field:ends.at') }}</p>

      <Radio
        v-model="enableEnd"
        dark
        :items="[{ value: false, label: $t('date.frequency.field:finishing.class') }]"
        @input="clearEndDate"
      />

      <div class="grid grid-nogutter">
        <div class="col-12">
          <Radio
            v-model="enableEnd"
            :items="[{ value: true, label: $t('date.frequency.field:at') }]"
            dark
          />
        </div>
        <div class="col-6">
          <Datepicker
            :min="minRepeatEndDate"
            :disabled="!enableEnd"
            :validation="$v.value.repeat_ends_at"
            :label="$t('global:form.end')"
            :value="value.repeat_ends_at"
            dark
            @input="updateFieldValue('repeat_ends_at', $event)"
            @close="touchField('repeat_ends_at')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'DateFrequencyField.scss';
</style>
