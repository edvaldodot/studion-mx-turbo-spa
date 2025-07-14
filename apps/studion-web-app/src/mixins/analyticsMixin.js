import config from '@/config'

const { GA4_TOKEN } = config

export const analyticsMixin = {
  computed: {
    $isGA4Enable () {
      return GA4_TOKEN &&
        Array.isArray(GA4_TOKEN) &&
        GA4_TOKEN.length
    },
  }
}
