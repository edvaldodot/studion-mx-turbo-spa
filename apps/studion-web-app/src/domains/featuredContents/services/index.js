import {http} from '@/support/http'
import { parseToFormData } from '@/support/payloadParser'
import qs from 'qs'

export function getFeaturedContent (featuredContentId) {
  return http.get(`featured-contents/${featuredContentId}`)
}

function getFormData (featuredContent) {
  let form = parseToFormData(featuredContent)
  form.delete('file')
  if (typeof featuredContent.file !== 'string') {
    form.append('file', featuredContent.file, featuredContent.file.name)
  }
  return form
}

export function createFeaturedContent (featuredContent) {
  return http.post(`featured-contents`, getFormData(featuredContent), {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function updateFeaturedContent (featuredContent) {
  return http.post(`featured-contents/${featuredContent.id}`, getFormData(featuredContent), {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function listFeaturedContent () {
  return http.get(`featured-contents`)
}

export function deleteFeaturedContent (id) {
  return http.delete(`featured-contents/${id}`)
}

export function updatePositions (featuredContents) {
  // const params = {}
  const params = featuredContents.reduce((acum, current, index) => {
    const content = {}
    const keys = Object.keys(current)

    keys.forEach(key => {
      let newKey
      newKey = key === 'id' ? `featured_content[${index}][featured_content_id]` : `featured_content[${index}][${key}]`
      content[newKey] = current[key]
    })

    return { ...acum, ...content }
  }, {})

  return http.put(`featured-contents/batch`, qs.stringify(params), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}
