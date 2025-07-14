// src/support/http/api.ts
import axios, { type AxiosInstance } from 'axios'
import { getHeader } from '../utils/headersHelper'

let apiInstance: AxiosInstance | null = null

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export function initApi(baseURL: string) {
  const token = getCookie('access_token')
  const suid = getCookie('x-suid')
  const classroomToken = localStorage.getItem('studion.mx-classroom-token')

  apiInstance = axios.create({
    baseURL,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(suid ? { 'x-suid': suid } : {}),
      ...(classroomToken ? { 'studion.mx-classroom-token': classroomToken } : {}),
      'x-origin': getHeader('x-origin'),
      'x-os': getHeader('x-os'),
      'x-os-version': getHeader('x-os-version'),
      'x-browser': getHeader('x-browser'),
      'x-browser-version': getHeader('x-browser-version'),
    },
  })

  apiInstance.interceptors.request.use((config) => {
    const token = getCookie('access_token')
    const suid = getCookie('x-suid')
    const classroomToken = localStorage.getItem('studion.mx-classroom-token')

    if (token) config.headers['Authorization'] = `Bearer ${token}`
    if (suid) config.headers['x-suid'] = suid
    if (classroomToken) config.headers['studion.mx-classroom-token'] = classroomToken

    return config
  })

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status
      if (status === 401 || status === 403) {
        console.warn(`[AXIOS] Erro ${status} recebido, redirecionando...`)
        // window.location.href = 'http://app.studion.local:8080'
      }
      return Promise.reject(error)
    }
  )
}

export function getApi(): AxiosInstance {
  if (!apiInstance) {
    throw new Error('[API] A instância não foi inicializada. Use initApi(baseURL) primeiro.')
  }
  return apiInstance
}

const token = getCookie('access_token')
const suid = getCookie('x-suid')

export const externalApi = axios.create({
  headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(suid ? { 'x-suid': suid } : {}),
    'Content-Type': 'application/json',
  },
})
