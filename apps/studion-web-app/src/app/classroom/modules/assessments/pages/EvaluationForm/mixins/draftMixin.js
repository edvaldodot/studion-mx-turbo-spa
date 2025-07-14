import { mapActions } from 'vuex'
import { format } from 'date-fns'

export const draftMixin = {
  data() {
    return {
      mx_draftQueue: [],
      mx_showDraftStatus: false,
      mx_showDraftStatusText: false,
      mx_showDraftStatusTimeout: null,
      mx_draftSuccess: true,
      mx_attempt: 0,
      mx_examinationDraft: null,
      mx_enrollmentDraft: null,
      mx_lastSave: { date: null, hour: null },
    }
  },

  computed: {
    mx_draftSaving() {
      return Boolean(this.mx_draftQueue.find((i) => i.fetching))
    },
    mx_enableSubmitDraftButton() {
      return Boolean(this.mx_draftQueue.find((i) => i.value && !i.fetching))
    },
  },

  methods: {
    ...mapActions(['attemptSaveDraftExamination', 'attemptUploadExaminationFiles']),

    mx_clearDraftStatus() {
      this.mx_showDraftStatus = false
      this.mx_showDraftStatusText = false
    },

    mx_getQueueItem(id) {
      return this.mx_draftQueue.find((item) => item.questionId == id) || null
    },

    mx_updateLastSave(date = null) {
      if (!date) this.mx_lastSave = { date: null, hour: null }
      else {
        this.mx_lastSave = { date: format(date, 'dd/MM/yyyy'), hour: format(date, 'HH:mm') }
      }
    },

    _updateData(examination, enrollment, attempt) {
      this.mx_examinationDraft = examination
      this.mx_enrollmentDraft = enrollment
      this.mx_attempt = attempt
    },

    async mx_makeDraftPayload(question) {
      if (!this.mx_examinationDraft) throw new Error('Examination not found.')
      if (!this.mx_enrollmentDraft) throw new Error('Enrollment not found.')

      const { type } = question

      const payload = {
        examination_id: this.mx_examinationDraft.id,
        topic_id: this.mx_examinationDraft.topic.id,
        enrollment_id: this.mx_enrollmentDraft.id,
        attempt: this.mx_attempt,
        user_answer: {
          question_id: question.id,
          user_local_time: new Date(),
          answers: {
            question_id: question.id,
          },
        },
      }

      if (type === 'association') {
        payload.user_answer.answers.association = question.itemsAnswer.map((choice, i) => ({
          choice_id: choice,
          item_id: question.items[i].id,
        }))
      } else if (['multiple_choices', 'true_or_false'].includes(type)) {
        payload.user_answer.answers.choice_id = question.answer.choice.choice_id
      } else if (['multiple_choices_multi_answers'].includes(type)) {
        payload.user_answer.answers.choice_id = question.answer.choice.choice_id.filter(
          (choice) => !!choice
        )
      } else if (type === 'fill_gap') {
        let formated = question.answer.map((answerList, listIndex) => {
          answerList = answerList.map((answer, answerIndex) => ({
            position: answerIndex + 1,
            item_id: question.items[listIndex].id,
            answer,
          }))
          return answerList
        })

        let formatedAnswer = []
        for (const item of formated) {
          formatedAnswer.push(...item)
        }

        payload.user_answer.answers.answer = formatedAnswer
      } else if (type === 'send_file') {
        let files = question.files

        const { fileWithId, filesToUpload } = this._splitFilesArray(files)

        if (filesToUpload.length) {
          const { data } = await this.attemptUploadExaminationFiles({
            files: filesToUpload,
            type: 'answer',
          })

          files = [fileWithId, data].flat()
        }

        question.files = files

        payload.user_answer.answers.send_file = { answer: question.answer.answer, files }
      } else {
        payload.user_answer.answers.answer = question.answer.answer
      }
      return payload
    },

    _splitFilesArray(files) {
      return {
        fileWithId: files.filter((file) => !!file.id),
        filesToUpload: files.filter((file) => !file.id),
      }
    },

    mx_forceDraftSubmit(examination, enrollment, attempt) {
      this._updateData(examination, enrollment, attempt)

      for (const item of this.mx_draftQueue) {
        if (item.fetching || !item.value) continue
        clearTimeout(item.timeout)
        this._submitDraft(item)
      }
    },

    async mx_handleDraft(question, examination, enrollment, attempt) {
      this._updateData(examination, enrollment, attempt)

      if (!this.mx_getQueueItem(question.id)) {
        this.mx_draftQueue.push({
          questionId: question.id,
          timeout: null,
          fetching: false,
          value: null,
          lastValueBackup: null,
        })
      }

      await this.mx_createDraftTimeout(question)
    },

    async _submitDraft(queueItem) {
      try {
        clearTimeout(this.mx_showDraftStatusTimeout)
        queueItem.fetching = true

        this.mx_showDraftStatus = true
        this.mx_showDraftStatusText = true

        const payload = await this.mx_makeDraftPayload(queueItem.value)
        await this.attemptSaveDraftExamination(payload)

        this.mx_updateLastSave(payload.user_answer.user_local_time)
        this.mx_draftSuccess = true

        queueItem.fetching = false
        queueItem.value = null

        if (queueItem.lastValueBackup) {
          this.mx_createDraftTimeout(queueItem.lastValueBackup)
          queueItem.lastValueBackup = null
        }
      } catch (err) {
        this.mx_draftSuccess = false
        queueItem.fetching = false
      } finally {
        this.mx_showDraftStatusTimeout = setTimeout(() => {
          this.mx_showDraftStatusText = false
        }, 5000)
      }
    },

    async mx_createDraftTimeout(question) {
      const queueItem = this.mx_getQueueItem(question.id)

      if (!queueItem) return this.mx_handleDraft({ question })

      if (!queueItem.fetching) {
        queueItem.value = question
        queueItem.lastValueBackup = null
      } else {
        queueItem.lastValueBackup = question
        return
      }

      if (queueItem.timeout) clearTimeout(queueItem.timeout)

      queueItem.timeout = setTimeout(async () => {
        this._submitDraft(queueItem)
      }, 3000)
    },
  },
}