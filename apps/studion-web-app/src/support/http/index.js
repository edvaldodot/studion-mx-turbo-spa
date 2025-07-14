import axios from 'axios'
import interceptors from './interceptors'
import config from '@/config'

import { getHeader, clearSessionHeaders } from '@/support/utils/headersHelper'

const { API_URL, PLUTON_API } = config

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    'x-origin': getHeader('x-origin'),
    'x-os': getHeader('x-os'),
    'x-os-version': getHeader('x-os-version'),
    'x-browser': getHeader('x-browser'),
    'x-browser-version': getHeader('x-browser-version'),
  },
})

export const plutonHttp = axios.create({
  baseURL: PLUTON_API,
})

export async function setToken(token, xsuid = false) {
  http.defaults.headers.common.Authorization = `Bearer ${token}`

  let suid = sessionStorage.getItem('x-suid')

  if (!suid && !xsuid) {
    const { data } = await http.get('generate-suid')
    suid = data.suid
    sessionStorage.setItem('x-suid', data.suid)
  }

  http.defaults.headers['x-suid'] = xsuid || suid
}

export function unsetToken() {
  clearSessionHeaders()
  http.defaults.headers['x-suid'] = undefined
  http.defaults.headers.common.Authorization = ''
}

export default function install(Vue, { store, router }) {
  interceptors(http, store, router)
  Object.defineProperty(Vue.prototype, '$http', {
    get() {
      return http
    },
  })
}

/**
 * Faz a chamada para a URL externa com o UUID dinâmico.
 * @param {string} uuid - O UUID dinâmico a ser incluído na URL.
 * @returns {Promise<number>} - Retorna uma promise que resolve com o status HTTP da chamada.
 */

export async function validatorChatbot(code) {
  const url = process.env.VUE_APP_IFRAME_URL_DOT_AI + code

  try {
    await axios.get(url)
    return true
  } catch (error) {
    console.error('Erro na chamada da API:', error)
    return false
  }
}
