<script>
import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardActions from '@/components/general/CardActions'
import Icon from '@/components/general/Icon'

export default {
  name: 'CardProjectStudent',
  components: {
    Action,
    Card,
    CardBody,
    CardActions,
    Icon,
  },

  props: {
    topicId: {
      type: Number,
      default: null,
    },
    lastTryId: {
      type: Number,
      default: null,
    },
    topicName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: null,
    },
    schedulePeriodStart: {
      type: String,
      default: null,
    },
    schedulePeriodEnd: {
      type: String,
      default: null,
    },
    startTime: {
      type: String,
      default: null,
    },
    endTime: {
      type: String,
      default: null,
    },
    buttonDisabled: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      item: {
        topicId: this.topicId,
        lastTryId: this.lastTryId,
        status: this.status,
      },
    }
  },
}
</script>

<template>
  <Card
    :height="252"
    class="card-project"
    rounded
  >
    <CardBody>
      <span class="text-base project-data-table-background-status">
        {{ $t(`classroom.assessments.evaluation:status.${status}`) }}
      </span>

      <h3
        :title="title"
        class="text-base my-3"
      >
        {{ topicName }}
      </h3>

      <div class="my-3 text-base">
        <div class="card-project-info">
          <Icon
            class="card-project__comments-icon"
            name="clock"
            size="medium"
            wrapper
          ></Icon>
          <span>{{ $t('classroom.assessments.project:datatable.header.2') }}</span>
        </div>
        <div class="card-project-sub-info pt-1">
          <span class="font-bold">{{
            schedulePeriodStart ? formatDate(schedulePeriodStart, 'long') : '-'
          }}</span>
          <span class="text-color">{{ $t('global:and') }}</span>
          <span class="font-bold">{{
            schedulePeriodEnd ? formatDate(schedulePeriodEnd, 'long') : '-'
          }}</span>
        </div>
      </div>

      <div class="text-base">
        <div class="card-project-info">
          <Icon
            class="card-project__comments-icon"
            name="calendar-range"
            size="medium"
            wrapper
          ></Icon>
          <span>{{ $t('classroom.assessments.project:datatable.header.4') }}</span>
        </div>
        <div class="card-project-sub-info pt-1">
          <span class="font-bold">{{ startTime ? formatDate(startTime, 'long') : '-' }}</span>
          <span class="text-color">{{ $t('global:and') }}</span>
          <span class="font-bold">{{ endTime ? formatDate(endTime, 'long') : '-' }}</span>
        </div>
      </div>
    </CardBody>
    <CardActions class="card-project__footer">
      <Action
        :dark="accessibility"
        :disabled="buttonDisabled"
        :text="
          status === 'not_started'
            ? $t('global:start')
            : $t('classroom.assessments.evaluation:datatable.header.15')
        "
        type="link"
        primary
        @click="$emit('view:attempt', item)"
      />
    </CardActions>
  </Card>
</template>

<style lang="scss">
@import 'CardProjectStudent.scss';
</style>
