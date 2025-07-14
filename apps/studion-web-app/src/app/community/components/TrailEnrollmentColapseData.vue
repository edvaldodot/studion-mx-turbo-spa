<script>
import { mapActions } from 'vuex'
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Tooltip from '@/components/general/Tooltip'

import { certificateMixin } from '@/mixins/certificateMixin'

export default defineComponent({
  name: 'TrailEnrollmentColapseData',
  components: {
    Action,
    Datatable,
    Tooltip,
  },
  mixins: [certificateMixin],
  props: {
    enrollmentHistory: {
      type: Array,
      default: () => [],
    },
    sessionEnrollments: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    ...mapActions([
      'attemptMyselfDownloadCertificate',
      'attemptMyselfDownloadPathCertificate',
      'setFetching',
      'setFeedback',
    ]),

    downloadCertificate(certificateHash, history = false) {
      this.$emit('start-download')

      this.$downloadCertificate(
        history ? this.attemptMyselfDownloadPathCertificate : this.attemptMyselfDownloadCertificate,
        certificateHash,
        () => {
          this.$emit('end-download')
        },
        history
      )
    },
  },
})
</script>

<template>
  <div class="enrollment-colapse-data">
    <div class="enrollment-infos">
      <Datatable
        v-if="sessionEnrollments.length"
        :items="sessionEnrollments"
        dark
        class="sessions-table mb-3"
        :class="{ 'has-history': enrollmentHistory.length > 0 }"
      >
        <template slot="thead">
          <tr>
            <th class="th" width="43%">{{ $t('community.index:modal.datatable.header.2') }}</th>
            <th class="th" width="22%"></th>
            <th class="th" width="25%"></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr>
            <td class="td bb">
              <span class="td-text bolder">{{ props.item.course_name }}</span>
            </td>
            <td class="td bb text-center">
              <span class="td-tag">{{ $t(`global:solution.status.${props.item.status_alias}`) }}</span>
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
      <Datatable
        v-if="enrollmentHistory.length"
        class="mb-3"
        :items="enrollmentHistory"
        dark
      >
        <template slot="thead">
          <tr>
            <th class="th" width="43%">{{ $t('community.index:modal.datatable.header.7') }}</th>
            <th class="th" width="22%"></th>
            <th class="th" width="25%"></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr>
            <td class="td bb">
              <span class="td-text bolder">{{ formatDate(props.item.startDateTime) }}</span>
            </td>
            <td class="td bb text-center">
              <span class="td-tag">{{ $t(`global:solution.status.${props.item.status.alias}`) }}</span>
            </td>
            <td class="td bb">
              <Tooltip
                v-if="props.item.certificateHash"
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
                      @click="downloadCertificate(props.item.certificateHash, true)"
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
  </div>
</template>
<style lang="scss">
.enrollment-colapse-data {
  .datatable-wrapper {
    width: 100%;
    &.sessions-table {
      padding-bottom: 0px;
      .datatable-inner .datatable tr:last-of-type .td {
        &.bb {
          border-bottom: 0;
        }
      }
      &.has-history {
        border-bottom: 2px solid var(--primary-500er);
        padding-bottom: 40px;
      }
    }
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
