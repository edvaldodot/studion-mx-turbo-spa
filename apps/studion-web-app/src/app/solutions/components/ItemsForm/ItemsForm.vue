<script>
import Action from '@/components/general/Action'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'

export default {
  components: {
    Action,
    SelectField,
    TextareaField
  },
  props: {
    questionType: {
      type: String,
      required: true
    },
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    minItems: {
      type: Number,
      default: 2
    },
    validation: {
      type: Object,
      default: () => {}
    },
    questionIndex: {
      type: Number
    },
    question: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      trueFalseOptions: [{
        text: this.$t('global:false'),
        value: 0
      }, {
        text: this.$t('global:true'),
        value: 1
      }],
      mutableItems: []
    }
  },
  watch: {
    mutableItems: {
      deep: true,
      handler () {
        this.$emit('input', this.mutableItems)
      }
    },
    questionType: function () {
      this.mutableItems = []
      this.setup()
    }
  },

  created() {
    this.mutableItems = []
    this.value.map((item) => {
      this.mutableItems.push({
        ...item,
        right: item.right,
        type: this.questionType,
      })
    })

    if (this.mutableItems.length < this.minItems) {
      this.setup()
    }
  },

  methods: {
    setup () {
      for (let i = 0; i < this.minItems; i++) {
        this.addItem()
      }
    },
    addItem() {
      this.mutableItems.push({
        questionId: this.question.id || this.question.temporaryId,
        description: '',
        position: null,
        right: null,
        type: this.questionType,
      })
    },
    removeItem (index) {
      this.mutableItems.splice(index, 1)
    },
    topicOrResponse () {
      return this.questionType === 'association'
        ? this.$t('global:form.answer')
        : this.$tc('global:topic', 1)
    }
  },
}
</script>
<template>
  <div v-if="mutableItems.length">
    <h3
      v-if="questionType === 'association'"
      class="modal-form-box-title mb-5"
      :class="{ disabled }"
    >
      {{ $t('global:form.answer.presented') }}
    </h3>
    <textarea-field
      v-for="(item, index) in value"
      dark
      auto-grow
      v-model="mutableItems[index].description"
      :disabled="disabled"
      :validation="validation.$each[questionIndex].items.$each[index].description"
      :key="'Desc'+index"
      :show-optional="false"
      :counter="500"
      :label="topicOrResponse() + ' ' + (index + 1)">
      <action
        type="button"
        slot="button"
        icon="close"
        @click="removeItem(index)"
        v-if="!disabled && mutableItems.length > minItems"
      />
    </textarea-field>

    <template v-if="questionType === 'true_or_false'">
      <SelectField
        v-for="(item, index) in value"
        :key="'Pos' + index"
        v-model="mutableItems[index].right"
        :disabled="disabled"
        :validation="validation.$each[questionIndex].items.$each[index].right"
        :show-optional="false"
        :items="trueFalseOptions"
        :label="$t('solutions.create.classes:modal.correct.alternative')"
        dark
      />
    </template>

    <Action
      v-if="!disabled"
      flat
      dark
      type="button"
      :text="$t('global:form.alternative.add')"
      @click="addItem()"
    />
  </div>
</template>