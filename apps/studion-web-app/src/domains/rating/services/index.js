import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'

export const sendRating = ({ rating, resource, id, comment = null }) => {
  const resources = {
    trail: 'paths',
    session: 'course',
    offering: 'offering'
  }

  const resourcesIdParams = {
    trail: 'id_paths',
    session: 'id_course',
    offering: 'id_offering'
  }

  return http.post(`/rating/${resources[resource]}`, parse({ [resourcesIdParams[resource]]: id, rating, comment }))
}
