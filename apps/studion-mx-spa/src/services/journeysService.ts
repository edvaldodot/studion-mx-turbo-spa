import { getApi } from '@/support/http/api'
import { handleError } from '@/support/utils'

export const fetchJourneys = async () => {
  try {
    const api = getApi()
    return await api.get('/journeys')
  } catch (error) {
    handleError(error)
  }
}

export const fetchJourneyById = async (journeyId: number) => {
  try {
    const api = getApi()
    return await api.get(`/journeys/${journeyId}`)
  } catch (error) {
    handleError(error)
  }
}

export const fetchSessionsByJourney = async (journeyId: number) => {
  try {
    const api = getApi()
    return await api.get(`/journeys/${journeyId}/sessions`)
  } catch (error) {
    handleError(error)
  }
}

export const fetchClassroomsByJourney = async (journeyId: string, sessionId: string) => {
  try {
    const api = getApi()
    return await api.get(`/journeys/${journeyId}/classrooms/${sessionId}`)
  } catch (error) {
    handleError(error)
  }
}

export const fetchComponentsByClassrooms = async (journeyId: string, sessionId: string) => {
  try {
    const api = getApi()
    return await api.get(`/journeys/${journeyId}/classrooms/${sessionId}/components`)
  } catch (error) {
    handleError(error)
  }
}

export const fetchComponentOpenById = async (
  journeyId: string,
  sessionId: string,
  componentId: string
) => {
  try {
    const api = getApi()
    return await api.get(`/journeys/${journeyId}/classrooms/${sessionId}/components/${componentId}`)
  } catch (error) {
    handleError(error)
  }
}

export const putConsumeContentByID = async (
  journeyId: string,
  sessionId: string,
  consumeId: string,
  data: object
) => {
  try {
    const api = getApi()
    return await api.put(`/journeys/${journeyId}/classrooms/${sessionId}/consumptions/${consumeId}`, data)
  } catch (error) {
    handleError(error)
  }
}
