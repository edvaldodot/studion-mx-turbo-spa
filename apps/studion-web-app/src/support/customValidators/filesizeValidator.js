import {withParams} from 'vuelidate'
export default (size) => withParams(
  {type: 'fileSize', size: size},
  value => {
    if (value === null || typeof value === 'string') return true

    if (value.length === undefined) {
      return value.size <= size
    }

    return value[0].size <= size
  }
)
