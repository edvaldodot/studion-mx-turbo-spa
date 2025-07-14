import { minValue } from 'vuelidate/lib/validators'
import { withParams, ref } from 'vuelidate/lib/validators/common'

export default (min, prop) => {
  return withParams({ type: 'minValueIf', min, prop }, function (value, parentVm) {
    return ref(prop, this, parentVm) ? minValue(min)(value) : true
  })
}
