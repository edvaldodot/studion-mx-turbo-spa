export default {
  props: {
    pageCount: Number,
  },

  methods: {
    getActivePage(value) {
      return this.pageCount === 5 ? ++value : value
    },
    $_getRedirectPage(page) {
      if (this.$_pageList.length >= parseInt(page)) return this.$_pageList[page - 1]
      return null
    },
    $_goToPage($e) {
      const page = this.$_getRedirectPage($e)
      if (page) this.$router.push({ name: page, params: { id: this.$route.params.id } })
    },
  },

  computed: {
    $_pageList() {
      const pageList = [
        'solutions.update',
        'solutions.create.tools',
        'solutions.create.classes',
        'solutions.create.requirements',
      ]

      if (this.pageCount >= 5) pageList.splice(1, 0, 'solutions.metadata.register')

      return pageList
    },
  },
}
