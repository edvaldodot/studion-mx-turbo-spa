import { required, requiredIf } from 'vuelidate/lib/validators'

export const PERIOD_VALIDATIONS = {
  enrollmentType: { required },
  enrollmentStartDate: { required },
  enrollmentEndDate: {
    required: requiredIf(function (validation) {
      return validation.enrollmentType === 'predefined'
    }),
  },
}

export const PERIOD_DATA = {
  enrollmentType: null,
  enrollmentStartDate: null,
  enrollmentEndDate: null,
}
