export default {
  props: {
    pageCount: Number,
  },

  methods: {
    $_getRedirectPage(page) {
      if (this.$_pageList.length >= parseInt(page)) return this.$_pageList[page - 1]
      return page || null
    },
    $_goToPage($e, id, day) {
      const page = this.$_getRedirectPage($e)
      if (!page) return

      const navigateObj = {
        name: page,
        params: {
          id: id || this.$route.params.id,
        },
      }

      if (typeof day === 'number') navigateObj.params.day = day

      this.$router.push(navigateObj)
    },
  },

  computed: {
    $_pageList() {
      const pageList = ['mediation.edit', 'mediation.link', 'mediation.actions']

      return pageList
    },
  },
}
