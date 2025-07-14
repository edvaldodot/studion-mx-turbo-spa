import 'url-search-params-polyfill'

export const parse = (payload) => {
  const params = new URLSearchParams() // eslint-disable-line no-undef

  if (typeof payload !== 'object') return null

  let keys = Object.keys(payload)
  const length = keys.length

  for (let i = 0; i < length; i += 1) {
    let value = payload[keys[i]]
    let key = keys[i]
    if (value instanceof Array) {
      value.forEach((arrValue) => {
        params.append(key + '[]', arrValue)
      })
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        params.append(`${key}[${childKey}]`, childValue)
      })
    } else {
      value = String(value)

      if (
        value !== null &&
        value !== 'null' &&
        value !== 'undefined' &&
        value !== undefined &&
        value.length
      ) {
        params.append(key, value)
      }
    }
  }

  return params
}

export const parseToFormData = (payload) => {
  const params = new FormData() // eslint-disable-line no-undef

  if (typeof payload !== 'object') return null

  let keys = Object.keys(payload)
  const length = keys.length

  for (let i = 0; i < length; i += 1) {
    let value = payload[keys[i]]
    let key = keys[i]
    value = String(value)

    if (value !== null && value !== 'undefined' && value !== undefined && value.length) {
      params.append(key, value)
    }
  }

  return params
}

export const parseToFormDataWithArray = (payload) => {
  const params = new FormData()
  if (typeof payload !== 'object') return null

  let keys = Object.keys(payload)
  const length = keys.length

  for (let i = 0; i < length; i += 1) {
    let value = payload[keys[i]]
    let key = keys[i]

    if (value !== null && value !== 'undefined' && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          params.append(`${key}[${index}]`, item)
        })
      } else {
        params.append(key, value)
      }
    }
  }

  return params
}
