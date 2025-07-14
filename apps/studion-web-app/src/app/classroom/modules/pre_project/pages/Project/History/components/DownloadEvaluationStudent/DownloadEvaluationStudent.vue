<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { generateTimeStamp } from '@/support/utils/timestamp'

import EvaluationStudent from '../../../../../../assessments/pages/EvaluationStudent/EvaluationStudent.vue'
import html2pdf from 'html2pdf.js'

export default defineComponent({
  name: 'DownloadEvaluationStudent',

  components: {
    EvaluationStudent,
  },

  methods: {
    ...mapActions(['setFeedback']),

    download() {
      try {
        const content = document.querySelector('.examination__container')
        const fileName = document
          .querySelector('.evaluation-title')
          .innerText.substr(0, 15)
          .replaceAll(' ', '_')

        const options = {
          margin: 0,
          filename: `${fileName}-${generateTimeStamp()}.pdf`,
          image: { type: 'png', quality: 0.98 },
          html2canvas: { scale: 1 },
        }

        html2pdf().set(options).from(content).save()
        this.setFeedback({ message: this.$t('global:download.success') })
      } catch (e) {
        this.setFeedback({ message: this.$t('global.request:timeout.message'), type: 'error' })
      }

      this.$router.push({ name: 'classroom.pre.project.details.history' })
    },
  },
})
</script>

<template>
  <EvaluationStudent
    class="download-evaluation-student"
    view-mode
    @loaded="download"
  />
</template>
