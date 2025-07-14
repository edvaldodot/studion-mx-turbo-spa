import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'

export const createAnnouncement = data => {
  data.fixed = Number(data.fixed)
  data.should_confirm = Number(data.should_confirm)

  return http.post('announcements/entries', parse(data))
}

export const updateAnnouncement = (entryId, data) => {
  data.fixed = Number(data.fixed)
  data.should_confirm = Number(data.should_confirm)

  return http.put(`announcements/entries/${entryId}`, parse(data))
}

export const removeAnnouncement = entryId => {
  return http.delete(`announcements/entries/${entryId}`)
}

export const getAnnouncementTags = () => {
  return http.get(`announcements/tags`)
}
