import { required, requiredIf, between, maxLength } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'

import minValueIf from '@/support/customValidators/minValueIf'
import sumAllFileSizes from '@/support/customValidators/sumAllFileSizes'
import slugValidator from '@/support/customValidators/slugValidator'
import { removeAccents } from '@/support/utils/text'

export default {
  validations() {
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
      timerHours: {
        validTime: minValueIf(1, function () {
          return this.hasTimer && this.timerMinutes == 0
        }),
        required: requiredIf(function () {
          return this.hasTimer
        }),
      },
      timerMinutes: {
        validTime: minValueIf(1, function () {
          return this.hasTimer && this.timerHours == 0
        }),
        required: requiredIf(function () {
          return this.hasTimer
        }),
      },
      formData: {
        name: {
          required,
        },

        slug: {
          slugValidation: slugValidator,
        },

        tries: {
          between: between(this.enableTriesQuantity ? 1 : 0, 10),
          required: requiredIf(function () {
            return this.formData.tries === '' || this.formData.tries === null
          }),
        },
        minimalGrade: {
          required: requiredIf(function () {
            return (
              this.formData.mandatory &&
              (this.formData.minimalGrade === null || this.formData.minimalGrade === '')
            )
          }),
        },
        questions: {
          $each: {
            statement: {
              required,
            },
            type: {
              required,
            },
            level_difficulty: {
              required: requiredIf(function (nestedModel) {
                return nestedModel.isTemplate === true
              }),
            },
            points: {
              required: requiredIf(function () {
                return !this.ignorePointsForQuestion
              }),
              valueBiggerZero: minValueIf(0.01, function () {
                return true
              }),
            },
            choices: {
              $each: {
                description: {
                  required: requiredIf(function (nestedModel) {
                    return nestedModel.type !== 'fill_gap'
                  }),
                  duplicateDescription: function (newValue, item) {
                    if (!newValue) return true

                    if (
                      ![
                        'multiple_choices',
                        'multiple_choices_multi_answers',
                        'association',
                      ].includes(item.type)
                    ) {
                      return true
                    }

                    const question = this.formData.questions.find(
                      (q) => (q.id || q.temporaryId) === item.questionId
                    )

                    if (question === undefined) return true

                    const equalDesc = question.choices
                      .map((c) => c.description)
                      .filter((q) => q)
                      .filter((d) => removeAccents(d) === removeAccents(newValue))

                    if (equalDesc.length >= 2) {
                      return false
                    }

                    return true
                  },
                },
                itemIndex: {
                  required: requiredIf(function (nestedModel) {
                    return nestedModel.type && nestedModel.type === 'association'
                  }),
                },
              },
            },
            items: {
              $each: {
                right: {
                  required: requiredIf(function (nestedModel) {
                    return nestedModel.type && nestedModel.type === 'true_or_false'
                  }),
                },
                description: {
                  required: requiredIf(function (nestedModel) {
                    return !!(
                      nestedModel.type &&
                      (nestedModel.type === 'true_or_false' ||
                        nestedModel.type === 'association' ||
                        nestedModel.type === 'fill_gap')
                    )
                  }),

                  duplicateDescription: function (newValue, item) {
                    if (!newValue) return true

                    if (
                      ![
                        'multiple_choices',
                        'multiple_choices_multi_answers',
                        'association',
                        'true_or_false',
                      ].includes(item.type)
                    ) {
                      return true
                    }

                    const question = this.formData.questions.find(
                      (q) => (q.id || q.temporaryId) === item.questionId
                    )

                    if (question === undefined || !question.items) return true

                    const equalDesc = question.items
                      .map((c) => c.description)
                      .filter((q) => q)
                      .filter((d) => removeAccents(d) === removeAccents(newValue))

                    if (equalDesc.length >= 2) return false

                    return true
                  },

                  minBlanks: withParams({ type: 'minBlanks' }, (value, object) => {
                    if (!value) return true
                    let reg = /\[.+?\]/g
                    let matchs = [...value.matchAll(reg)]
                    return !!(matchs.length !== 0 || object.type !== 'fill_gap')
                  }),
                  blankSize: withParams({ type: 'blankSize' }, (value, object) => {
                    if (!value) return true
                    let reg = /\[.+?\]/g
                    let matchs = [...value.matchAll(reg)]
                    return !!(
                      !matchs.map((val) => val[0].slice(1, -1)).some((val) => val.length > 30) ||
                      object.type !== 'fill_gap'
                    )
                  }),
                  unfilledBlank: withParams({ type: 'unfilledBlank' }, (value, object) => {
                    if (!value) return true
                    let reg = /\[\]/g
                    let matchs = [...value.matchAll(reg)]
                    return !!(matchs.length === 0 || object.type !== 'fill_gap')
                  }),
                },
              },
            },
            answer: {
              required: requiredIf(function (nestedModel) {
                return (
                  nestedModel.type &&
                  (nestedModel.type === 'multiple_choices' ||
                    nestedModel.type === 'multiple_choices_multi_answers')
                )
              }),
            },
            files: {
              required: requiredIf(function (nestedModel) {
                return nestedModel.type === 'send_file' && nestedModel.allowFile
              }),
              maxFilesLength: maxLength(DEFAULT_LIMIT_FILES_LENGTH),
              maxSizeAllowed: sumAllFileSizes(DEFAULT_SIZE_LIMIT_IN_BYTES),
            },
            rightFeedback: {
              required: requiredIf(function (nestedModel) {
                return (
                  this.formData.feedbackInclude &&
                  ['multiple_choices', 'discursive', 'send_file'].includes(nestedModel.type)
                )
              }),
            },
            wrongFeedback: {
              required: requiredIf(function (nestedModel) {
                return (
                  this.formData.feedbackInclude &&
                  nestedModel.type === 'multiple_choices' &&
                  nestedModel.manualCorrection === false
                )
              }),
            },
          },
        },

        questionTemplateGroupMeta: {
          $each: {
            id: {
              required,
            },

            levels: {
              $each: {
                level: {
                  required,
                },

                questions: {
                  required,
                  maxLimit: function maxLimitValidator(value, nestedModel) {
                    if (value > nestedModel.total) return false
                    return true
                  },
                },

                scorePerQuestion: {
                  required,
                },
              },
            },
          },
        },
      },
    }

    return validationObject
  },

  methods: {
    questionCommonMixin_formatQuestion(question) {
      if (question.choices) {
        question.choices.forEach((choice) => {
          choice.questionId = question.id
        })
      }

      if (question.items) {
        question.items.forEach((item) => {
          item.questionId = question.id
        })
      }

      if (question.type === 'multiple_choices') {
        const answerIndex = question.choices.findIndex((choice) => choice.right)
        this.$set(question, 'answer', answerIndex)
      }
      if (question.type === 'multiple_choices_multi_answers') {
        var answerIndexes = []
        question.choices.forEach((choice, index) => {
          if (choice.right) answerIndexes.push(index)
        })
        this.$set(question, 'answer', answerIndexes)
      }
      if (question.type === 'true_or_false') {
        question.choices.map((choice) => {
          const position = choice.item ? choice.item.position : Number(choice.itemIndex)
          if (choice.description === 'true' && choice.right) {
            question.items[position].right = 1
          } else if (choice.description === 'false' && choice.right) {
            question.items[position].right = 0
          }
        })

        this.$set(question, 'items', question.items)
      }
    },

    questionCommonMixin_setupQuestionItems() {
      this.formData.questions.forEach((question) => {
        question.manual_correction = question.manualCorrection
        delete question.manualCorrection

        if (question.type === 'multiple_choices_multi_answers') {
          return delete question.items
        }

        if (question.type === 'association') {
          question.choices.forEach((choice) => {
            choice.right = 1
          })
          question.items.forEach((item, index) => {
            item.position = index
          })
        }

        if (question.type === 'true_or_false') {
          const choicesAlreadyRegistered = [...question.choices]
          question.choices = []

          /**
           * Flow of creation and editing of the choices of true or false questions.
           * When it is being edited, it is necessary to assign the ID of the choices already recorded in the API
           */
          question.items.forEach((item, itemIndex) => {
            item.position = itemIndex

            const findRegisteredChoiceIdx = (description) =>
              choicesAlreadyRegistered.findIndex(
                (choice) =>
                  ((choice.item && item.id && choice.item.id === item.id) ||
                    (choice.aggregateItemId &&
                      item.aggregateItemId &&
                      choice.aggregateItemId == item.aggregateItemId)) &&
                  choice.description === description
              )

            const makeChoiceAndAddToQuestions = (description, rightItem, choice = null) => {
              const conditional = {}
              if (choice && choice.id) conditional.id = choice.id

              if (choice && choice.aggregateChoiceId) {
                conditional.aggregateChoiceId = choice.aggregateChoiceId
              }

              question.choices.push({
                ...conditional,
                description,
                right: item.right === rightItem,
                itemIndex,
                type: question.type,
              })
            }

            const registeredTrueChoiceIdx = findRegisteredChoiceIdx('true')
            const registeredFalseChoiceIdx = findRegisteredChoiceIdx('false')

            if (registeredFalseChoiceIdx > -1) {
              makeChoiceAndAddToQuestions(
                'false',
                0,
                choicesAlreadyRegistered[registeredFalseChoiceIdx]
              )
            } else makeChoiceAndAddToQuestions('false', 0)

            if (registeredTrueChoiceIdx > -1) {
              makeChoiceAndAddToQuestions(
                'true',
                1,
                choicesAlreadyRegistered[registeredTrueChoiceIdx]
              )
            } else makeChoiceAndAddToQuestions('true', 1)
          })
        }
      })
    },
  },
}
