import {http} from '@/support/http'
import {parse} from '@/support/payloadParser'
import config from '@/config'
import CryptoJS from 'crypto-js'

const {APP_KEY, APP_SECRET} = config

export const postLogin = ({username, password}) => {
  let key = CryptoJS.enc.Hex.parse(APP_SECRET)
  let iv = CryptoJS.enc.Hex.parse(APP_SECRET.substr(0, 16))

  let options = {
    iv: iv
  }

  let usernameCrypt = CryptoJS.AES.encrypt(username, key, options)
  let passwordCrypt = CryptoJS.AES.encrypt(password, key, options)

  const params = {
    _username: usernameCrypt.ciphertext.toString(CryptoJS.enc.Base64),
    _password: passwordCrypt.ciphertext.toString(CryptoJS.enc.Base64),
    client_id: APP_KEY,
    client_secret: APP_SECRET,
    crypt: true
  }

  return http.post('login_check', parse(params))
}

export const postPasswordRecoveryRequest = email => {
  let params = {
    email: email,
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  return http.post('passwordRecovery', parse(params))
}

export const postUsernameRecoveryRequest = email => {
  let params = {
    email: email,
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  return http.post('usernameRecovery', parse(params))
}

export const postPasswordResetRequest = (password, token) => {
  let params = {
    token: token,
    password: password,
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  return http.post('passwordReset', parse(params))
}

export const putActivateAccountRequest = (token) => {
  let params = {
    activation_key: token,
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  return http.put('accounts/active', parse(params))
}

export const putActivationAccountLinkByActivationKeyRequest = (token) => {
  let params = {
    activation_key: token,
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  return http.post('accounts/activation/activation_key/link', parse(params))
}

export const putActivationAccountLinkByEmailRequest = (email) => {
  let params = {
    email: email,
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  return http.post('accounts/activation/email/link', parse(params))
}

export const putActivationAccountLinkByUsernameRequest = (username) => {
  let params = {
    username: username,
    client_id: APP_KEY,
    client_secret: APP_SECRET
  }
  return http.post('accounts/activation/link', parse(params))
}
