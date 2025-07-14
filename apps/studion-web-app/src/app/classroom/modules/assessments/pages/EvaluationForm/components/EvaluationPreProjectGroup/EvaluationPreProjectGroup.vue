<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Tooltip from '@/components/general/Tooltip'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Icon from '@/components/general/Icon'

const ModalGroupCreation = () =>
  import('@/app/classroom/modules/pre_project/components/ModalGroupCreation')

export default defineComponent({
  name: 'EvaluationPreProjectGroup',

  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    Icon,
    ModalGroupCreation,
    Tooltip,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      expand: false,
    }
  },

  computed: {
    ...mapState(['Classroom']),

    reachedGroupMaxQuantityLimit() {
      return this.items.length >= this.Classroom.data.preProject.meta.max
    },

    isGroupOwner() {
      const currentUser = this.Account.user
      const groupOwner = this.items.find((user) => user['is_owner'])

      return groupOwner && groupOwner.uuid === currentUser.uuid
    },
  },

  methods: {
    ...mapActions(['setFetching', 'attemptRetrievePreProjectAvailableStudents']),

    showCreateGroup(typeProp) {
      const sessionUuid = this.$route.params.session_uuid
      const params = { limit: 1000 }

      this.setFetching(true)
      this.attemptRetrievePreProjectAvailableStudents({ sessionUuid, params })
        .then((availableStudents) => {
          this.$refs.modalGroupCreation.openVisualization(availableStudents.data.data, typeProp)
        })
        .finally(() => this.setFetching(false))
    },
    updateGroup() {
      this.$emit('update:view')
      this.expand = false
    },
  },
})
</script>

<template>
  <div
    v-if="items.length"
    class="pre-project-group"
  >
    <section class="nav-pre-project-group">
      <Action
        :text="
          $t(expand ? 'pre.project.panel.group:hide.group' : 'pre.project.panel.group:see.group')
        "
        class="btn-collapse"
        type="button"
        icon="two-persons"
        icon-size="small"
        flat
        @click="expand = !expand"
      />

      <slot name="nav"></slot>
    </section>

    <Datatable
      v-if="expand"
      class="table-pre-project-group"
      :items="[{}]"
    >
      <template slot="tbody">
        <DatatableCollapseRow
          v-if="items.length"
          class="bg-black-50"
          :colspan="2"
          :open="expand"
        >
          <div class="inner-table">
            <template v-if="items.length">
              <Datatable
                :items="items"
                class="details"
              >
                <template
                  slot="tbody"
                  slot-scope="{ item }"
                >
                  <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
                    <td class="td w-1">
                      <div class="datatable-image">
                        <img
                          v-if="item.image"
                          :src="item.image"
                          class="w-2rem border-circle"
                        />

                        <Icon
                          v-else
                          class="text-3xl icon-fill-1"
                          name="account_circle"
                          pack="material"
                        />
                      </div>
                    </td>

                    <td class="td">
                      <span class="td-text bolder clamp-line text-base">{{ item.name }}</span>
                    </td>

                    <td class="td w-2">
                      <span class="td-text clamp-line text-base">{{
                        $t(`global:${item.role}`)
                      }}</span>
                    </td>
                  </tr>
                </template>
              </Datatable>

              <template v-if="isGroupOwner">
                <Tooltip
                  v-if="reachedGroupMaxQuantityLimit || items[0].is_lonely"
                  :uppercase="false"
                  :bold-font="false"
                  :width="232"
                  vertical-align="top"
                >
                  <template #activator="{ on }">
                    <div class="text-center btn-add">
                      <Action
                        :text="$t('pre.project.panel.group:add.to.group')"
                        type="button"
                        disabled
                        flat
                        @click="showCreateGroup('add')"
                        @mouseenter.native="on.mouseenter"
                        @mouseleave.native="on.mouseleave"
                      />
                    </div>
                  </template>

                  <span v-if="items[0].is_lonely">
                    {{
                      $t(
                        'pre.project.panel.group:modal.create.group:btn:create:requirement:isLonely'
                      )
                    }}</span
                  >

                  <span v-else>{{
                    $t('pre.project.panel.group:modal.create.group:btn:create:requirement:max')
                  }}</span>
                </Tooltip>

                <div
                  v-else
                  class="text-center btn-add"
                >
                  <Action
                    :text="$t('pre.project.panel.group:add.to.group')"
                    type="button"
                    flat
                    @click="showCreateGroup('add')"
                  />
                </div>
              </template>
            </template>

            <div
              v-else
              class="text-center btn-group"
            >
              <Action
                :text="$t('pre.project.panel.group:create.new.group')"
                type="button"
                flat
                @click="showCreateGroup"
              />
            </div>
          </div>
        </DatatableCollapseRow>
      </template>
    </Datatable>

    <ModalGroupCreation
      v-if="expand"
      ref="modalGroupCreation"
      :course-name="Classroom.data.course.name"
      :current-group-id="items.length > 0 ? items[0].i_preproject_groups : null"
      :items="items"
      @update:view="updateGroup"
    />
  </div>
</template>

<style lang="scss">
@import './EvaluationPreProjectGroup.scss';
</style>
