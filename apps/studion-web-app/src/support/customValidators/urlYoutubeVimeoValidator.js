import { withParams } from 'vuelidate/lib/validators/common'

export default (
  withParams({ type: 'urlYoutubeOrVimeo' }, value => {
    // eslint-disable-next-line no-useless-escape
    return value === null || /^(http:\/\/|https:\/\/)(vimeo\.com|youtu\.be|www\.youtube\.com)\/([\w\/]+)([\?].*)?$/.test(value)
  })
)
