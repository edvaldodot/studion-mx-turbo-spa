export default {
  props: {
    pageCount: {
      type: Number,
      default: 3,
    },
  },

  methods: {
    $_getRedirectPage(page) {
      if (this.$_pageList.length >= parseInt(page)) return this.$_pageList[page - 1]
      return null
    },
    $_goToPage($e, id) {
      const page = this.$_getRedirectPage($e)
      if (page) this.$router.push({ name: page, params: { id: id || this.$route.params.id } })
    },
  },

  computed: {
    $_pageList() {
      const pageList = ['offerings.update', 'offerings.solutions.edit', 'offerings.sessions.edit']

      return pageList
    },
  },
}
