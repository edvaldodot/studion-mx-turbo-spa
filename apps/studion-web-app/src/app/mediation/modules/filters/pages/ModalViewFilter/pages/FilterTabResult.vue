<script>
import { required } from 'vuelidate/lib/validators'

import FilterTabForm from '../components/FilterTabForm'
import FilterTabResultShow from '../components/FilterTabResultShow'

export default {
  name: 'FilterTabResult',

  components: {
    FilterTabForm,
    FilterTabResultShow
  },

  data () {
    return {
      formData: {
        solution: [],
        session: null
      },
      isSubmit: false,
      parentForm: null
    }
  },

  props: {
    value: {
      type: Object,
      default: () => {}
    }
  },

  created () {
    this.parentForm = this.value
  },

  methods: {
    toggleScreen () {
      this.isSubmit = !this.isSubmit

      if (!this.isSubmit) {
        this.formData = {
          solution: [],
          session: null
        }
      }
    }
  },

  validations: {
    formData: {
      solution: { required },
      session: { required }
    }
  }
}
</script>

<template>
  <div>
    <filter-tab-form
      v-if="!isSubmit"
      :value="formData"
      :validation="$v.formData"
      :data="parentForm"
      @submit="toggleScreen"
    />

    <filter-tab-result-show
      v-else
      @back="toggleScreen"
      :value="formData"
    />
  </div>
</template>
