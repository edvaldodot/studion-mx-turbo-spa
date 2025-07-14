<script>
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import KnowMoreButtonUserBatch from './KnowMoreButtonUserBatch.vue'
import StatusUserBatch from './StatusUserBatch.vue'

export default {
  name: 'UserBatchTable',
  components: {
    KnowMoreButtonUserBatch,
    StatusUserBatch,
    EmptyMessage,
    Datatable
  },
  props: {
    list: {
      type: Array,
      return: () => []
    }
  }
}
</script>

<template>
  <div>
    <EmptyMessage v-if="list.length === 0" class="batch-list">
      <h2>{{ $t('community.users:sent.batches.empty') }}</h2>
      <p v-html="$t('community.users:sent.batches.empty.sub')"></p>
    </EmptyMessage>

    <Datatable v-if="list.length > 0" :items="list">
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th class="th">{{ $t('global:file') }}</th>
          <th class="th" width="180">
            {{ $t('solutions.list:datatable.header.3') }}
          </th>
          <th class="th" width="155"></th>
        </tr>
        <tr v-else>
          <th class="th"></th>
          <th class="th" width="130"></th>
        </tr>
      </template>

      <template slot="tbody" slot-scope="props">
        <tr v-if="!$media.mobile">
          <td class="td bolder">
            <p class="text-base">{{ props.item.fileName }}</p>
          </td>

          <td class="td">
            <StatusUserBatch :item="props.item" />
          </td>

          <td class="td">
            <KnowMoreButtonUserBatch :item="props.item" />
          </td>
        </tr>

        <tr v-else>
          <td class="td bolder">
            <div class="status-column-batch">
              <p class="td-text">{{ props.item.fileName }}</p>
              <StatusUserBatch :item="props.item" />
            </div>
          </td>

          <td class="td">
            <KnowMoreButtonUserBatch :item="props.item" />
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>

<style lang="scss"></style>
