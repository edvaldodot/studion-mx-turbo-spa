import {
  fetchJourneys,
  fetchJourneyById,
  fetchSessionsByJourney,
  fetchClassroomsByJourney,
  fetchComponentsByClassrooms,
  fetchComponentOpenById,
  putConsumeContentByID
} from '@/services/journeysService'
import { getApi } from '@/support/http/api'
import { handleError } from '@/support/utils'
import { describe, it, vi, expect, beforeEach } from 'vitest'

// Mocks
vi.mock('@/support/http/api', () => ({
  getApi: vi.fn()
}))

vi.mock('@/support/utils', () => ({
  handleError: vi.fn()
}))

const mockApi = {
  get: vi.fn(),
  put: vi.fn()
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(getApi as any).mockReturnValue(mockApi)
})

describe('journeysService', () => {
  it('fetchJourneys - sucesso', async () => {
    mockApi.get.mockResolvedValueOnce({ data: ['j1'] })
    const result = await fetchJourneys()
    expect(mockApi.get).toHaveBeenCalledWith('/journeys')
    expect(result).toEqual({ data: ['j1'] })
  })

  it('fetchJourneyById - erro tratado', async () => {
    const error = new Error('Falha')
    mockApi.get.mockRejectedValueOnce(error)
    await fetchJourneyById(123)
    expect(mockApi.get).toHaveBeenCalledWith('/journeys/123')
    expect(handleError).toHaveBeenCalledWith(error)
  })

  it('fetchSessionsByJourney - sucesso', async () => {
    mockApi.get.mockResolvedValueOnce({ data: ['s1'] })
    const result = await fetchSessionsByJourney(5)
    expect(mockApi.get).toHaveBeenCalledWith('/journeys/5/sessions')
    expect(result).toEqual({ data: ['s1'] })
  })

  it('fetchClassroomsByJourney - sucesso', async () => {
    mockApi.get.mockResolvedValueOnce({ data: ['c1'] })
    const result = await fetchClassroomsByJourney('abc', 'sess1')
    expect(mockApi.get).toHaveBeenCalledWith('/journeys/abc/classrooms/sess1')
    expect(result).toEqual({ data: ['c1'] })
  })

  it('fetchComponentsByClassrooms - sucesso', async () => {
    mockApi.get.mockResolvedValueOnce({ data: ['comp1'] })
    const result = await fetchComponentsByClassrooms('abc', 'sess1')
    expect(mockApi.get).toHaveBeenCalledWith('/journeys/abc/classrooms/sess1/components')
    expect(result).toEqual({ data: ['comp1'] })
  })

  it('fetchComponentOpenById - erro tratado', async () => {
    const error = new Error('Falha')
    mockApi.get.mockRejectedValueOnce(error)
    await fetchComponentOpenById('j1', 's1', 'comp99')
    expect(mockApi.get).toHaveBeenCalledWith('/journeys/j1/classrooms/s1/components/comp99')
    expect(handleError).toHaveBeenCalledWith(error)
  })

  it('putConsumeContentByID - sucesso', async () => {
    const data = { seen: true }
    mockApi.put.mockResolvedValueOnce({ status: 204 })
    const result = await putConsumeContentByID('j1', 's1', 'consume1', data)
    expect(mockApi.put).toHaveBeenCalledWith(
      '/journeys/j1/classrooms/s1/consumptions/consume1',
      data
    )
    expect(result).toEqual({ status: 204 })
  })
})
