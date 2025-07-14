export const objectToFormData = (obj, cfg, fd, pre) => {
  if (isFormData(cfg)) {
    pre = fd
    fd = cfg
    cfg = null
  }

  cfg = cfg || {}
  cfg.indices = cfg.indices || false
  cfg.forceEmptyArray = cfg.forceEmptyArray || false
  fd = fd || new FormData()

  if (isUndefined(obj)) {
    return fd
  } else if (isArray(obj)) {
    if (obj.length === 0 && cfg.forceEmptyArray === true) {
      fd.append(pre + '[]', [])
      return fd
    }
    obj.forEach(function (value, index) {
      let key = pre + '[' + (cfg.indices ? index : '') + ']'

      objectToFormData(value, cfg, fd, key)
    })
  } else if (isDate(obj)) {
    fd.append(pre, obj.toISOString())
  } else if (isObject(obj) && !isFile(obj) && !isBlob(obj)) {
    Object.keys(obj).forEach(function (prop) {
      let value = obj[prop]

      if (isArray(value)) {
        while (prop.length > 2 && prop.lastIndexOf('[]') === prop.length - 2) {
          prop = prop.substring(0, prop.length - 2)
        }
      }

      let key = pre ? (pre + '[' + prop + ']') : prop

      objectToFormData(value, cfg, fd, key)
    })
  } else if (isBoolean(obj)) {
    fd.append(pre, Number(obj))
  } else {
    fd.append(pre, obj)
  }

  return fd
}

export const isUndefined = (value) => {
  return value === undefined
}

export const isObject = (value) => {
  return value === Object(value)
}

export const isArray = (value) => {
  return Array.isArray(value)
}

export const isDate = (value) => {
  return value instanceof Date
}

export const isBlob = (value) => {
  return value &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.slice === 'function'
}

export const isFile = (value) => {
  return isBlob(value) &&
    (typeof value.lastModifiedDate === 'object' || typeof value.lastModified === 'number') &&
    typeof value.name === 'string'
}

export const isFormData = (value) => {
  return value instanceof FormData
}

export const isBoolean = (value) => {
  return typeof value === 'boolean'
}
