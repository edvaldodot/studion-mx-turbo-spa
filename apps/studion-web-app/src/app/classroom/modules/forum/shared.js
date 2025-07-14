import { requiredIf } from 'vuelidate/lib/validators'

function isMandatory(nestedModel) {
  return nestedModel.mandatory
}

function bothZeroValidator(_, nestedModel) {
  if (!isMandatory(nestedModel)) return true

  if (nestedModel.numPosts == 0 && nestedModel.numComments == 0) {
    return false
  }
  return true
}

export const forumInteractionValidator = () => ({
  operator: {
    required: requiredIf(isMandatory),
  },

  numPosts: {
    required: requiredIf(isMandatory),
    bothZeroValue: bothZeroValidator,
  },

  numComments: {
    required: requiredIf(isMandatory),
    bothZeroValue: bothZeroValidator,
  },
})