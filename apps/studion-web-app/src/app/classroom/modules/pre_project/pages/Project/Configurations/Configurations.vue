<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { required, minValue, maxValue } from 'vuelidate/lib/validators'

import checkConfig from '../../../mixins/checkConfig'

import InputField from '@/components/general/InputField'
import Action from '@/components/general/Action'
import ModalConfirm from '@/components/general/ModalConfirm'

export default defineComponent({
  name: 'ConfigurationsPreProject',

  components: {
    InputField,
    Action,
    ModalConfirm,
  },

  mixins: [checkConfig],

  data() {
    return {
      minInputValue: 0,
      maxInputValue: 0,

      MIN_STUDENTS_DEFAULT: 2,
      MAX_STUDENTS_DEFAULT: 10,

      showConfirmModal: false,
    }
  },

  validations() {
    return {
      minInputValue: {
        required,
        minValue: minValue(this.MIN_STUDENTS_DEFAULT),
        maxValue: maxValue(this.MAX_STUDENTS_DEFAULT),
      },
      maxInputValue: {
        required,
        minValue: minValue(this.minOfMaxInput),
        maxValue: maxValue(this.MAX_STUDENTS_DEFAULT),
      },
    }
  },

  computed: {
    minOfMaxInput() {
      if (
        this.minInputValue > this.MIN_STUDENTS_DEFAULT &&
        this.minInputValue <= this.MAX_STUDENTS_DEFAULT
      ) {
        return Number(this.minInputValue)
      }

      return this.MIN_STUDENTS_DEFAULT
    },
  },

  created() {
    if (!this.$currentPreProjectConfig) return
    const { min, max } = this.$currentPreProjectConfig.meta
    this.minInputValue = min
    this.maxInputValue = max
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptSavePreProjectConfig']),

    updateMaxInputValue(inputValue) {
      if (inputValue >= this.maxInputValue && inputValue < this.MAX_STUDENTS_DEFAULT + 1)
        this.maxInputValue = Number(inputValue)
    },

    getPayload() {
      const preProjectId = this.$currentPreProjectConfig && this.$currentPreProjectConfig.id
      const form = {
        min: this.minInputValue,
        max: this.maxInputValue,
      }

      return { preProjectId, form }
    },

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.setFetching(true)
      this.attemptSavePreProjectConfig(this.getPayload())
        .then(({ data }) => {
          if (this.$currentPreProjectConfig && this.$currentPreProjectConfig.meta) {
            this.$currentPreProjectConfig.meta.min = data.meta.min
            this.$currentPreProjectConfig.meta.max = data.meta.max
          }
          this.setFeedback({ message: this.$t('pre.project.panel.group:config:success') })
        })
        .finally(() => {
          this.setFetching(false)
          this.showConfirmModal = false
        })
    },

    handleChangeGroups() {
      this.$router.push({
        name: 'classroom.pre.project.management',
      })
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('pre-project')"
    class="inner-content"
  >
    <div class="center">
      <form
        class="pre_project"
        @submit.prevent="submit"
      >
        <h3 class="pre_project__title">{{ $t('pre.project.panel.title') }}</h3>

        <p class="pre_project__description">
          {{ $t('pre.project.panel.description') }}
        </p>

        <div class="pre_project__group">
          <h4 class="group__title">
            {{ $t('pre.project.panel.group.title') }}
          </h4>

          <div class="group__options">
            <InputField
              v-model="minInputValue"
              :label="$t('global:min')"
              :validation="$v.minInputValue"
              :min="MIN_STUDENTS_DEFAULT"
              :step="1"
              :max="MAX_STUDENTS_DEFAULT"
              type="number"
              @input="updateMaxInputValue"
            />

            <InputField
              v-model="maxInputValue"
              :validation="$v.maxInputValue"
              :label="$t('global:max')"
              :min="minOfMaxInput"
              :step="1"
              :max="MAX_STUDENTS_DEFAULT"
              type="number"
            />
          </div>
        </div>

        <div class="group__buttons">
          <Action
            :text="$t('global:save')"
            class="btn-add-question"
            type="button"
            secondary
            fixed-width
            large
            @click="showConfirmModal = true"
          />
        </div>
      </form>
    </div>

    <ModalConfirm
      :active="showConfirmModal"
      :title="$t('pre.project.settings.confirm.title')"
      :confirm-btn-text="$t('pre.project.settings.confirm.btn')"
      @close="showConfirmModal = false"
      @confirm="submit"
    >
      <p>{{ $t('pre.project.settings.confirm.description') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
.pre_project {
  margin-top: 10em;

  &__title {
    padding-bottom: 0.5em;
  }

  &__group {
    margin-top: 1em;

    .group__title {
      padding: 2em 0 0.5em;
      font-family: var(--font-family);
      font-size: 1.6em;
      font-weight: bold;
      text-transform: uppercase;
    }
  }

  .group__options {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0 20px;
    margin-top: 0.5em;

    & > div {
      width: 150px;
    }
  }

  .group__buttons {
    display: flex;
    justify-content: center;
  }
}
</style>
