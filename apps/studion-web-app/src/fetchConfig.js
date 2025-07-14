import axios from 'axios'

const notSupportElement = document.getElementById('notSupported')
const initialLoadingElement = document.getElementById('initial-loading')

const startLoading = () => {
  if (notSupportElement) notSupportElement.remove()
  if (initialLoadingElement) initialLoadingElement.style.display = 'block'
}

const handleConfigError = () => {
  if (initialLoadingElement) initialLoadingElement.remove()
  const errorMesage = document.createTextNode('Unable to retrieve environment settings. Try to reload page!')
  document.body.appendChild(errorMesage)
  throw Error('Unable to retrieve environment settings.')
}

const fetchConfig = async () => {
  startLoading()
  try {
    const response = await axios.get('/config')
    localStorage.setItem('config', Buffer.from(JSON.stringify(response.data.env)).toString('base64'))
  } catch (error) {
    handleConfigError()
  }
}

export default fetchConfig
