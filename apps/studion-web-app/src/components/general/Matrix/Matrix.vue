<script>
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'Matrix',
  components: {
    Icon,
    ValidationMessage,
  },
  props: {
    questions: {
      type: Array,
      default: () => [],
    },
    answerOptions: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Array,
      default: () => [],
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
  },
  data() {
    return {
      mutableValue: [],
    }
  },
  watch: {
    value(newVal) {
      if (newVal !== this.mutableValue) {
        this.mutableValue = newVal || []
      }
    },
    mutableValue() {
      this.$emit('change', this.mutableValue)
      this.$emit('input', this.mutableValue)
    },
  },
  created() {
    this.mutableValue = this.value || []
  },
  methods: {
    isChecked(index, answer) {
      return (
        this.mutableValue.findIndex(
          (item) => item.question === index && item.answer.id === answer.id
        ) !== -1
      )
    },
    selectAnswer(indexQuestion, answer) {
      if (this.readOnly) return
      const findIndex = this.mutableValue.findIndex((item) => item.question === indexQuestion)
      if (findIndex === -1) {
        this.mutableValue.push({ question: indexQuestion, answer: answer })
      } else {
        if (this.mutableValue[findIndex].answer === answer) {
          this.removeAnswer(indexQuestion)
        } else {
          this.mutableValue[findIndex].answer = answer
        }
      }
    },
    removeAnswer(index) {
      const findIndex = this.mutableValue.findIndex((item) => item.question === index)

      if (index !== -1) {
        this.mutableValue.splice(findIndex, 1)
      }
    },
  },
}
</script>
<template>
  <div class="matrix--container">
    <table class="matrix-table">
      <thead>
        <tr>
          <th class="text-base">{{ $tc('global:topic', (questions && questions.length) || 0) }}</th>
          <th
            v-for="(answerOpt, index) in answerOptions"
            :key="index"
            class="text-color text-sm"
          >
            {{ answerOpt.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(question, index) in questions"
          :key="index"
          class="text-color text-base"
        >
          <td>{{ question.title }}</td>
          <td
            v-for="(answer, answerIndex) in answerOptions"
            :key="answerIndex"
          >
            <a
              v-if="!isChecked(question.id, answer)"
              :disabled="readOnly"
              @click="selectAnswer(question.id, answer)"
            >
              <Icon
                name="radio_button_unchecked"
                @click="selectAnswer(question.id, answer)"
              />
            </a>
            <a
              v-if="isChecked(question.id, answer)"
              :disabled="readOnly"
              @click="selectAnswer(question.id, answer)"
            >
              <Icon name="radio_button_checked" />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-if="Object.keys(validation).length"
      ref="details"
      class="form-input-details"
    >
      <validation-message :validation="validation"></validation-message>
    </div>
  </div>
</template>
<style lang="scss">
@mixin matrix-first-child {
  padding: 10px;
  text-align: left;
  background-color: transparent;
  padding-left: 0;
  border: none;
}

@mixin matrix-table-commons {
  width: 86px;
  padding: 10px;
  text-align: center;
  background-color: var(--black-100);
  font-family: var(--font-family);
}

.matrix--container {
  overflow-x: auto;

  .matrix-table {
    width: 100%;
    border-collapse: collapse;

    th {
      @include matrix-table-commons;
      letter-spacing: 0px;
      border-left: 6px solid var(--black-300);
      &:nth-child(1) {
        @include matrix-first-child;
        width: 45%;
      }
    }

    td {
      @include matrix-table-commons;
      height: 64px;
      letter-spacing: 0.8px;
      border-left: 6px solid var(--black-300);
      &:nth-child(1) {
        @include matrix-first-child;
        width: 86px;
        height: 64px;
      }
    }

    a {
      cursor: pointer;

      &[disabled='disabled'] {
        cursor: unset;
      }
    }
  }
}
</style>
