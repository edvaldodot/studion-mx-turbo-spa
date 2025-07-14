<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalListUsersSession',
  components: {
    Datatable,
    EmptyMessage,
    Modal
  },
  data () {
    return {
      formData: {
        name: null,
        active: 1,
        deniedRoutes: []
      },
      routes: [],
      permissionsRoutes: [],
      selectedPermissions: [],
      allPermissions: []
    }
  },
  validations: {
    formData: {
      name: {
        required
      }
    }
  },
  computed: {
    ...mapState(['Sessions', 'fetching'])
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching'
    ])
  }
}
</script>

<template>
  <modal :active="!fetching" is-page>
    <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
    <h2 class="modal-title text-color">{{ Sessions.current.name }}</h2>
    <div class="modal-description text-color">
      <p class="text-color">{{ $t('community.sessions.users.list:modal.description') }}</p>
    </div>
    <div class="center" v-if="Sessions.users.length > 0">
      <datatable :items="Sessions.users" dark>
        <template slot="thead">
          <tr>
            <th class="th">{{ $t('community.session.users.list:datatable.header.1') }}</th>
            <th class="th">{{ $t('community.session.users.list:datatable.header.2') }}</th>
            <th class="th">{{ $t('community.session.users.list:datatable.header.3') }}</th>
            <th></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr class="tr-colspan">
            <td class="td">
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
            <td class="td">
              <span class="td-text bolder">{{ props.item.username }}</span>
            </td>
            <td class="td">
              <span :class="{'td-tag': !$media.mobile, 'td-text': $media.mobile}" >{{ props.item.status }}</span>
            </td>
          </tr>
        </template>
      </datatable>
    </div>
    <empty-message v-else>
      <h2>{{ $t('community.sessions.users.list:modal.title.empty') }}</h2>
      <p class="text-color">{{ $t('community.sessions.users.list:modal.description.empty') }}</p>
    </empty-message>

  </modal>
</template>
