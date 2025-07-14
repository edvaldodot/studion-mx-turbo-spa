import { email } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'

export default (
  withParams({type: 'userEmail'}, value => {
    return email(value)
  }))
