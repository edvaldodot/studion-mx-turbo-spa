import i18n from '@/support/i18n'

export const tagsAnnouncementMixin = {
  methods: {
    getTagsAnnouncement() {
      this.setFetching(true)
      this.attemptGetAnnouncementTags()
        .then(({ data }) => {
          this.tags = this.getTagList(data)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    getTagList(value) {
      const tagList = Object.keys(value).map((key) => ({
        value: value[key],
        text: i18n.t(`management:announcement.actions:tag.item:${key.toLowerCase()}`),
      }))

      return tagList
    },
    addTagToTextEditor(tag) {
      this.$refs.textField.addText(tag.value)
    },
    getMinMaxNumber(number) {
      return Math.max(0, Math.min(parseInt(number), 999))
    },
    clampSessionStartDate(text) {
      if (!text) return ''
      const range = this.$refs.textField.getSelection()
      const regex = /{{\s*SESSION_START_DATE_PLUS_(-?[0-9]+)\s*}}/g
      const newText = text.replace(regex, (match, number) => {
        const parsedNumber = this.getMinMaxNumber(number)
        return `{{ SESSION_START_DATE_PLUS_${parsedNumber} }}`
      })
      this.$nextTick(() => {
        this.$refs.textField.setSelection(range)
      })
      return newText
    },
  },
}
