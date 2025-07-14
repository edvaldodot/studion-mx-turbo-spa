import { requiredIf, maxLength } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'
import sumAllFileSizes from '@/support/customValidators/sumAllFileSizes'
import { validateQuestionFilled } from '../../utils/questionValidation'

export default function EvaluationValidator() {
  // Fallback values for validation
  let DEFAULT_LIMIT_FILES_LENGTH = 2
  let DEFAULT_SIZE_LIMIT_IN_BYTES = 100 * 1024 * 1024

  if (this.QUOTA_LIMIT_FILES_LENGTH) {
    DEFAULT_LIMIT_FILES_LENGTH = this.QUOTA_LIMIT_FILES_LENGTH
  }

  if (this.QUOTA_SIZE_LIMIT_IN_BYTES) {
    DEFAULT_SIZE_LIMIT_IN_BYTES = this.QUOTA_SIZE_LIMIT_IN_BYTES
  }

  const validationObject = {
    questions: {
      $each: {
        answer: {
          required: requiredIf(function (nestedModel) {
            return nestedModel.type === 'discursive'
          }),
          questionFilled: withParams({ type: 'questionFilled' }, (value, question) => {
            if (question.annulled) return true
            if (question.type in validateQuestionFilled) {
              return validateQuestionFilled[question.type](value, question)
            }
            return true
          }),
        },

        items: {
          itemsAnswer: {
            required: requiredIf(function () {
              const filteredItems = this.questions.filter((question) => {
                return (
                  question.type === 'association' &&
                  !question.annulled &&
                  question.itemsAnswer.some((answer) => answer === null)
                )
              })
              return filteredItems.length > 0
            }),
          },
          isUnique: (_, vm) => {
            if (vm.annulled) return true
            if (vm.itemsAnswer) {
              let unique = vm.itemsAnswer.filter(
                (item, index) => vm.itemsAnswer.indexOf(item) === index
              )
              return vm.type === 'association' && unique.length === vm.itemsAnswer.length
            }
            return true
          },
        },

        files: {
          required: requiredIf(function (nestedModel) {
            if (nestedModel.annulled) return false
            return nestedModel.type === 'send_file'
          }),
          maxFilesLength: maxLength(DEFAULT_LIMIT_FILES_LENGTH),
          maxSizeAllowed: sumAllFileSizes(DEFAULT_SIZE_LIMIT_IN_BYTES),
        },
      },
    },
  }

  return validationObject
}