import { withParams } from 'vuelidate/lib/validators/common'

export default (
  withParams({ type: 'usernameValidator' }, value => {
    return value === null || value.length === 0 || /^[a-z0-9_.@-]{1,50}$/.test(value)
  })
)
