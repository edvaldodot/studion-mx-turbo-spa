import { withParams } from 'vuelidate/lib/validators/common'

export default withParams({ type: 'nicknameValidator' }, (value) => {
  return value === null || value.length === 0 || /^[a-zA-Z0-9_.-]{1,100}$/.test(value)
})
