<script>
import { mapState, mapActions } from 'vuex'
import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'
import ProgressList from '@/components/general/ProgressList'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tabs from '@/components/general/Tabs'
import FilterList from '@/components/general/FilterList'
import FilterListTag from '@/components/general/FilterListTag'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListType from '@/components/general/FilterListType'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import HeaderClassroom from '@/app/classroom/components/HeaderClassroom'

export default {
  name: 'ListEvaluationStudent',
  components: {
    ContentHeader,
    ActionBar,
    ProgressList,
    EmptyMessage,
    Tabs,
    FilterList,
    FilterListTag,
    FilterListOrder,
    FilterListType,
    Datatable,
    Dropdown,
    DropdownLink,
    Action,
    Icon,
    HeaderClassroom
  },
  props: {},
  data () {
    return {
      tabLinks: [
        {
          text: 'classroom.assessments.tab.link.1',
          location: {
            name: 'classroom.assessments.evaluation'
          }
        }
      ],
      filterTagOptions: [
        {
          title: 'Tipo',
          name: 'type',
          items: [
            { label: 'Online', value: 0 },
            { label: 'Presencial', value: 1 },
            { label: 'Blended', value: 2 }
          ]
        },
        {
          title: 'Cobrança',
          name: 'charge',
          items: [{ label: 'Gratuito', value: 0 }, { label: 'Pago', value: 1 }]
        },
        {
          title: 'Acquisição',
          name: 'purchase',
          items: [
            { label: 'Comprado', value: 0 },
            { label: 'Não comprado', value: 1 }
          ]
        },
        {
          title: 'Inscrições',
          name: 'registrations',
          items: [
            { label: 'Inscrições abertas', value: 0 },
            { label: 'Encerradas', value: 1 }
          ]
        }
      ],
      listingMode: false,
      evaluations: []
    }
  },
  computed: {
    ...mapState([
      'Classroom',
      'Account',
      'accessibility'
    ]),
    sessionUuid () {
      return this.$route.params.session_uuid
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptListClassroomEvaluationStudent'
    ]),
    changeType (value) {
      this.listingMode = value
    },
    openEvaluationLastTry (topicId) {
      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          session_uuid: this.sessionUuid,
          type: 'examination',
          type_id: topicId
        }
      })
    }
  },
  created () {
    this.$emit('change-header', {
      customClasses: {'evaluation': true}
    })

    this.setFetching(true)
    this.attemptListClassroomEvaluationStudent({sessionUuid: this.sessionUuid})
      .then(({ data }) => {
        this.evaluations = data.map(item => {
          return {
            name: item.examination.topic.name,
            topicId: item.examination.topic.id,
            attempt: item.attempt,
            maxAttempt: item.examination.tries,
            grade: item.grade
          }
        })
      }).finally(() => {
        this.setFetching(false)
      })
  },
  beforeRouteLeave (to, from, next) {
    this.$emit('change-header', {})
    next()
  }
}
</script>

<template>
  <div class="inner-content">

    <filter-list>
      <filter-list-tag slot="tag" :options="filterTagOptions"></filter-list-tag>
      <filter-list-order slot="order" ></filter-list-order>
      <!-- <filter-list-type slot="type" @change="changeType" :icons="['clipboard-text', 'clipboard-account']"></filter-list-type> -->
    </filter-list>

    <empty-message v-if="evaluations.length === 0">
      <h2>{{ $t('classroom.assessments.evaluation.list:empty.title') }}</h2>
      <p class="text-color">{{ $t('classroom.assessments.evaluation.list:empty.message.1') }}</p>
      <p class="text-color">{{ $t('classroom.assessments.evaluation.list:empty.message.2') }}</p>
    </empty-message>

    <div class="center" v-else>
      <datatable :items="evaluations">
        <template slot="thead">
          <tr>
            <th class="th">{{ $t('classroom.assessments.evaluation:datatable.header.1') }}</th>
            <th class="th">{{ $t('classroom.assessments.evaluation:datatable.header.6') }}</th>
            <th class="th text-center">{{ $t('classroom.assessments.evaluation:datatable.header.8') }}</th>
            <th class="th"></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr>
            <td class="td">
              <span class="td-text">{{ props.item.name }}</span>
            </td>
            <td class="td">
              <span class="td-tag" v-if="props.item.maxAttempt">{{ props.item.attempt }} de {{ props.item.maxAttempt }}</span>
              <span class="td-tag" v-else>{{ $t('classroom.assessments.evaluation:unlimited') }}</span>
            </td>
            <td class="td text-center">
              <span class="td-text">{{ props.item.grade ? props.item.grade : $t('classroom.assessments.evaluation:not.corrected') }}</span>
            </td>
            <td class="td">
              <action type="button"
                      :text="$t('classroom.assessments.evaluation:see_last_try')"
                      flat
                      class="btn-schedule"
                      @click="openEvaluationLastTry(props.item.topicId)"
                      :dark="accessibility"></action>
            </td>
          </tr>
        </template>
      </datatable>
    </div>
  </div>
</template>

<style lang="scss">
  @import "~@/app/classroom/modules/assessments/styles.scss";
</style>
