const imageExists = require('image-exists')
const { meta, link } = require('./headerOptions')

function parseValue(content, values) {
  return Object.keys(values).reduce((prev, varName) => {
    const regex = new RegExp(`<${varName}>`, 'g')

    prev = prev.replace(regex, values[varName])

    return prev
  }, content)
}

export const setAll = (values) => {
  const themeName = values['THEME_NAME']
  values['TIMESTAMP'] = Date.now()

  // set document title
  document.title = values['APP_TITLE']

  // set meta values
  meta.forEach(({ name, content }) => {
    document.head
      .querySelector(`meta[name=${name}]`)
      .setAttribute('content', parseValue(content, values))
  })

  // set link values
  link.forEach(({ rel, type, sizes, href, color }) => {
    const link = document.createElement('link')

    link.rel = rel
    link.type = type
    link.sizes = sizes
    link.color = parseValue(color, values)

    const imageUrl = parseValue(href, values)
    const imageWithoutTimestamp = imageUrl.replace(/\?\d*$/, '')

    imageExists(imageWithoutTimestamp, (exists) => {
      if (!exists) {
        values['THEME_NAME'] = 'default'
      } else {
        values['THEME_NAME'] = themeName
      }
      link.href = parseValue(href, values)
      document.head.appendChild(link)
    })
  })
}