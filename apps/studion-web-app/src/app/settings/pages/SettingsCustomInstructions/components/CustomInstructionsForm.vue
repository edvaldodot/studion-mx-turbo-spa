<template>
  <div
    :data-testid="$testId('custom-instructions-form')"
    class="flex flex-column gap-4 custom-instructions-form"
  >
    <form
      class="flex gap-4"
      @submit.prevent="addTag"
    >
      <InputField
        v-model="tagForm.name"
        :label="$t('global:tag.name')"
        :validation="$v.tagForm.name"
        :disabled="isEditMode"
        :counter="24"
      />
      <InputField
        v-model="tagForm.value"
        :label="$t('global:value')"
        :validation="$v.tagForm.value"
        :counter="500"
      />

      <Action
        class="mt-5"
        :text="isEditMode ? $t('global:save') : $t('global:add')"
        :icon="isEditMode ? 'check' : 'add'"
        type="button"
        primary
        submit
        @click="addTag"
      />
    </form>

    <Datatable
      v-if="mutableValue.customInstructions.length"
      :items="mutableValue.customInstructions"
    >
      <template slot="thead">
        <tr>
          <th class="th">{{ $t('global:tag') }}</th>
          <th class="th">{{ $t('global:value') }}</th>
          <th class="th"></th>
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr>
          <td class="td bolder w-5">{{ props.item[0] }}</td>
          <td class="td w-5">
            <span class="clamp-line">{{ props.item[1] }}</span>
          </td>
          <td class="td td-actions w-2">
            <Action
              :title="$t('global:edit')"
              icon="pencil"
              type="button"
              @click="setEditMode(props.index)"
            />
            <Action
              :title="$t('global:remove')"
              icon="close"
              type="button"
              @click="remove(props.index)"
            />
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>

<script>
import Action from '@/components/general/Action/Action'
import InputField from '@/components/general/InputField/InputField'
import Datatable from '@/components/general/Datatable/Datatable'

import { required, requiredIf } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'

export default {
  name: 'CustomInstructionsForm',

  components: {
    Action,
    InputField,
    Datatable,
  },

  props: {
    value: {
      type: Object,
      default: () => ({}),
    },

    onServer: {
      type: Boolean,
      default: false,
    },

    optionalValue: {
      type: Boolean,
      default: false,
    },

    state: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      mutableValue: this.value,
      tagForm: {
        name: '',
        value: '',
      },
      isEditMode: false,
    }
  },

  created() {
    if (this.state) this.mutableValue.customInstructions.push(...Object.entries(this.state))

    const uniqueKeys = new Map()
    this.mutableValue.customInstructions.forEach(([key, value]) => {
      if (!uniqueKeys.has(key)) {
        uniqueKeys.set(key, value)
      }
    })

    this.mutableValue.customInstructions = Array.from(uniqueKeys.entries()).map(([key, value]) => [
      key,
      value,
    ])
  },

  methods: {
    ...mapActions(['setFeedback']),

    addTag() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      const lowerTag = this.getTag()
      const editTag = this.checkIfTagAlreadyExists(lowerTag)

      if (editTag > -1) this.edit(editTag)
      else this.create(lowerTag)

      this.clearForm()
    },

    getTag() {
      return (
        '{{{' +
        this.tagForm.name
          .toLowerCase()
          .replace(/[^\w\s]|_/g, '')
          .replace(/\s+/g, '')
          .replace(/mensagem/g, '') +
        '}}}'
      )
    },

    checkIfTagAlreadyExists(tagName) {
      return this.mutableValue.customInstructions.findIndex(
        (tag) => tag[0].toLowerCase() === tagName
      )
    },

    create(tag) {
      if (this.onServer) return this.$emit('create', { ...this.tagForm, name: tag })

      const value = [tag, this.tagForm.value]

      if (value[0] === '{{{}}}') return this.setFeedback({ message: this.$t('global:tag.invalid') })

      this.mutableValue.customInstructions.push(value)
    },

    edit(tag) {
      if (this.onServer) {
        this.$emit('edit', {
          toEdit: this.mutableValue.customInstructions[tag],
          newValue: this.tagForm.value,
          editMode: this.isEditMode,
        })
        return (this.isEditMode = false)
      }

      this.isEditMode = false
      this.mutableValue.customInstructions[tag][1] = this.tagForm.value
    },

    remove(index) {
      if (this.onServer) return this.$emit('remove', this.mutableValue.customInstructions[index])
      this.mutableValue.customInstructions.splice(index, 1)
    },

    clearForm() {
      this.tagForm = {
        name: '',
        value: '',
      }

      this.$forceNextTick(() => {
        this.$v.$reset()
      })
    },

    scroll(el) {
      el.scroll({
        top: top,
        behavior: 'smooth',
      })
    },

    setEditMode(index) {
      this.isEditMode = true

      const isModal = document.querySelectorAll('.modal-blocker')[0]

      if (isModal) {
        this.scroll(isModal)
      } else {
        this.scroll(window)
      }

      this.tagForm = {
        name: this.mutableValue.customInstructions[index][0],
        value: this.mutableValue.customInstructions[index][1],
      }
    },
  },

  validations() {
    return {
      tagForm: {
        name: { required },
        value: {
          required: requiredIf(function () {
            return !this.optionalValue
          }),
        },
      },
    }
  },
}
</script>

<style lang="scss">
@import './CustomInstructionsForm.scss';
</style>
