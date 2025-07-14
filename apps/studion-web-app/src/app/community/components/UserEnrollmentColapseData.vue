<script>
import { mapActions } from 'vuex'
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Tooltip from '@/components/general/Tooltip'

import { certificateMixin } from '@/mixins/certificateMixin'

export default defineComponent({
  name: 'UserEnrrollmentColapseData',
  components: {
    Action,
    Datatable,
    Tooltip,
  },
  mixins: [certificateMixin],
  props: {
    sessionId: {
      type: Number,
      default: null,
    },
    canReenroll: {
      type: Boolean,
      default: false,
    },
    enrollmentHistory: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    ...mapActions([
      'attemptMyselfDownloadCertificate',
      'attemptSessionReenrollment',
      'setFetching',
      'setFeedback',
    ]),

    downloadCertificate(certificateHash) {
      this.$emit('start-download')

      this.$downloadCertificate(this.attemptMyselfDownloadCertificate, certificateHash, () => {
        this.$emit('end-download')
      })
    },
    reenrollUser(sessionId) {
      try {
        this.setFetching(true)
        this.attemptSessionReenrollment({ sessionId, userUuid: this.$route.params.id })
        this.setFeedback({ message: this.$t('community.index:success.reenrolled.student') })
        setTimeout(() => {
          this.$emit('reenrolled')
        }, 200)
      } catch (error) {
        this.setFeedback({ message: this.$t('global:error'), type: 'error' })
      } finally {
        this.setFetching(false)
      }
    },
  },
})
</script>

<template>
  <div class="enrollment-colapse-data">
    <div class="enrollment-infos">
      <Datatable
        v-if="enrollmentHistory.length"
        :items="enrollmentHistory"
        dark
      >
        <template slot="thead">
          <tr>
            <th class="th">{{ $t('community.index:modal.datatable.header.7') }}</th>
            <th class="th">{{ $t('community.index:modal.datatable.header.4') }}</th>
            <th class="th" width="55%">{{ $t('community.index:modal.datatable.header.6') }}</th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr>
            <td class="td bb">
              <span class="td-text bolder">{{ formatDate(props.item.statusUpdatedAt) }}</span>
            </td>
            <td class="td bb">
              <span class="td-tag">{{ props.item.statusAlias }}</span>
            </td>
            <td class="td bb">
              <Tooltip
                v-if="props.item.certificate_hash"
                :uppercase="false"
                :bold-font="false"
                :width="232"
                vertical-align="top"
              >
                <template #activator="{ on }">
                  <div v-on="on">
                    <Action
                      flat
                      dark
                      type="button"
                      class="enrollment-colapse-data__action"
                      :text="$t('global:download.certificate')"
                      @click="downloadCertificate(props.item.certificate_hash)"
                    />
                  </div>
                </template>

                <span>{{ $t('global:download.certificate.courses') }}</span>
              </Tooltip>
              <span
                v-else
                class="td-text"
                >{{ $t('global:unavailable') }}</span
              >
            </td>
          </tr>
        </template>
      </Datatable>
    </div>
    <Action
      v-if="canReenroll"
      flat
      dark
      type="button"
      class="enrollment-colapse-data__action"
      :text="$t('community.index:modal.session.reenroll')"
      @click="reenrollUser(sessionId)"
    />
  </div>
</template>
<style lang="scss">
.enrollment-colapse-data {
  .datatable-wrapper {
    width: 100%;
    .td-tag {
      text-transform: capitalize;
    }
    .datatable-inner .datatable tr:last-of-type .td {
      &.bb {
        border-bottom: 2px solid var(--primary-500er);
      }
    }
  }
}
</style>
